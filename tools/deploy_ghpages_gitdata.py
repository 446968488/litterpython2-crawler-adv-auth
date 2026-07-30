#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
deploy_ghpages_gitdata.py — 用 GitHub Git Data API 部署（避免逐文件提交冲突 409）
流程：1) 并发创建所有 blob；2) 一次性建 tree；3) 建 commit；4) 更新 main 引用。
全程只产生 1 个 commit，彻底规避 Contents API 并发提交冲突导致的 409 文件缺失。
保留仓库里本地没有的文件（如 README.md）。
用法：python3 deploy_ghpages_gitdata.py <token> <user> <repo> <local_dir> [并发数]
"""
import sys, os, base64, json, time, threading
import urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor

TOKEN = sys.argv[1]
USER = sys.argv[2]
REPO = sys.argv[3]
DIR = sys.argv[4]
NWORK = int(sys.argv[5]) if len(sys.argv) > 5 else 8
BASE = f"https://api.github.com/repos/{USER}/{REPO}"
H = {"Authorization": f"token {TOKEN}", "Content-Type": "application/json"}


def api(method, path, data=None, retry=6):
    url = f"{BASE}{path}"
    last = (0, {})
    for i in range(retry):
        try:
            body = json.dumps(data).encode() if data is not None else None
            req = urllib.request.Request(url, data=body, headers=H, method=method)
            resp = urllib.request.urlopen(req, timeout=60)
            return resp.getcode(), json.loads(resp.read().decode())
        except urllib.error.HTTPError as e:
            try:
                b = json.loads(e.read().decode())
            except Exception:
                b = {"message": str(e)}
            if e.code in (409, 429) or 500 <= e.code < 600:
                time.sleep(15 * (i + 1))
                last = (e.code, b)
                continue
            if e.code == 401:
                return 401, b
            return e.code, b
        except Exception as ex:
            time.sleep(8 * (i + 1))
            last = (0, {"message": str(ex)})
            continue
    return last


def get_main():
    code, j = api("GET", "/git/refs/heads/main")
    if code == 200:
        return j["object"]["sha"]
    code, j = api("GET", "/git/commits/main")
    if code == 200:
        return j["sha"]
    raise RuntimeError(f"无法获取 main: {code} {j}")


def main():
    files = []
    for root, dirs, names in os.walk(DIR):
        if ".git" in dirs:
            dirs.remove(".git")
        for n in names:
            fp = os.path.join(root, n)
            rel = os.path.relpath(fp, DIR).replace(os.sep, "/")
            files.append((rel, fp))
    total = len(files)
    print(f"文件数 {total} 并发 {NWORK}", flush=True)

    # 1) 并发建 blob
    shas = {}
    lock = threading.Lock()
    cnt = [0]

    def mk(rel, fp):
        try:
            b64 = base64.b64encode(open(fp, "rb").read()).decode()
        except Exception as e:
            with lock:
                cnt[0] += 1
            return (rel, -1, f"读失败:{e}")
        code, j = api("POST", "/git/blobs", {"content": b64, "encoding": "base64"})
        if code == 201 and "sha" in j:
            with lock:
                shas[rel] = j["sha"]
                cnt[0] += 1
                if cnt[0] % 50 == 0:
                    print(f"  blob {cnt[0]}/{total}", flush=True)
            return None
        return (rel, code, j.get("message"))

    fails = []
    with ThreadPoolExecutor(max_workers=NWORK) as ex:
        for r in ex.map(lambda x: mk(*x), files):
            if r:
                fails.append(r)
    print(f"blob 完成 {len(shas)} 失败 {len(fails)}", flush=True)

    # 失败重试（串行）
    for rel, code, msg in list(fails):
        fp = dict(files)[rel]
        r = mk(rel, fp)
        if r:
            print(f"  blob 仍失败 {rel}: {code} {msg}", flush=True)
        else:
            fails = [f for f in fails if f[0] != rel]
    if fails:
        print(f"⚠ 仍有 {len(fails)} blob 失败，终止", flush=True)
        return

    # 保留仓库里本地没有的文件（README 等）
    parent = get_main()
    code, ptree = api("GET", f"/git/trees/{parent}?recursive=1")
    entries = [{"path": rel, "mode": "100644", "type": "blob", "sha": shas[rel]} for rel in shas]
    if code == 200:
        for e in ptree.get("tree", []):
            if e["type"] == "blob" and e["path"] not in shas:
                entries.append({"path": e["path"], "mode": e["mode"], "type": "blob", "sha": e["sha"]})
                print(f"  保留仓库原有文件: {e['path']}", flush=True)

    # 2) tree
    code, j = api("POST", "/git/trees", {"tree": entries})
    if code != 201:
        print(f"tree 失败 {code} {j}", flush=True)
        return
    tree_sha = j["sha"]
    print(f"tree 创建 {tree_sha}（{len(entries)} 节点）", flush=True)

    # 3) commit
    code, j = api("POST", "/git/commits", {"message": "deploy course", "tree": tree_sha, "parents": [parent]})
    if code != 201:
        print(f"commit 失败 {code} {j}", flush=True)
        return
    commit_sha = j["sha"]

    # 4) ref
    code, j = api("PATCH", "/git/refs/heads/main", {"sha": commit_sha, "force": True})
    if code not in (200, 201):
        print(f"ref 更新失败 {code} {j}", flush=True)
        return
    print("✅ 完成：已用单个 commit 更新 main", flush=True)


if __name__ == "__main__":
    if len(sys.argv) < 5:
        print(__doc__)
        sys.exit(1)
    main()
