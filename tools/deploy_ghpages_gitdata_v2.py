#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
deploy_ghpages_gitdata_v2.py — 分层 tree 部署，避免超大 tree 触发 GitHub 504。
流程：
  1) 并发创建所有 blob（失败自动串行重试，直到全部成功）；
  2) 在内存构建目录树，自底向上为每个目录单独创建一个 Git tree（每个 tree 节点数很小）；
  3) 合并仓库原有顶层文件（如 README.md），不丢失；
  4) 创建单个 commit 并更新 main 引用（全程仅 1 个 commit，无并发冲突）。
用法: python3 deploy_ghpages_gitdata_v2.py <token> <user> <repo> <local_dir> [并发数]
"""
import sys, os, base64, json, time, threading
import urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor

TOKEN = sys.argv[1]
USER = sys.argv[2]
REPO = sys.argv[3]
DIR = sys.argv[4]
NWORK = int(sys.argv[5]) if len(sys.argv) > 5 else 6
BASE = f"https://api.github.com/repos/{USER}/{REPO}"
H = {"Authorization": f"token {TOKEN}", "Content-Type": "application/json", "Accept": "application/vnd.github+json"}


def api(method, path, data=None, retry=8, timeout=120):
    url = f"{BASE}{path}"
    last = (0, {})
    for i in range(retry):
        try:
            body = json.dumps(data).encode() if data is not None else None
            req = urllib.request.Request(url, data=body, headers=H, method=method)
            resp = urllib.request.urlopen(req, timeout=timeout)
            return resp.getcode(), json.loads(resp.read().decode())
        except urllib.error.HTTPError as e:
            try:
                b = json.loads(e.read().decode())
            except Exception:
                b = {"message": str(e)}
            if e.code in (409, 429) or 500 <= e.code < 600:
                time.sleep(12 * (i + 1))
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

    # ---------- 1) 并发建 blob ----------
    shas = {}
    lock = threading.Lock()
    cnt = [0]
    fails = []

    def mk(rel, fp):
        try:
            raw = open(fp, "rb").read()
        except Exception as e:
            return (rel, -1, f"读失败:{e}")
        b64 = base64.b64encode(raw).decode()
        code, j = api("POST", "/git/blobs", {"content": b64, "encoding": "base64"}, timeout=90)
        if code == 201 and "sha" in j:
            return (rel, j["sha"], None)
        return (rel, None, f"{code}:{j.get('message')}")

    with ThreadPoolExecutor(max_workers=NWORK) as ex:
        for rel, sha, err in ex.map(lambda x: mk(*x), files):
            if err is None:
                with lock:
                    shas[rel] = sha
                    cnt[0] += 1
                    if cnt[0] % 200 == 0:
                        print(f"  blob {cnt[0]}/{total}", flush=True)
            else:
                fails.append((rel, err))

    # 串行重试失败的 blob
    attempt = 0
    while fails and attempt < 15:
        attempt += 1
        print(f"  重试 blob ({attempt}) 剩余 {len(fails)}", flush=True)
        nf = []
        for rel, _ in fails:
            fp = dict(files)[rel]
            r, sha, err = mk(rel, fp)
            if err is None:
                shas[rel] = sha
            else:
                nf.append((rel, err))
        fails = nf
        time.sleep(3)
    if fails:
        print(f"⚠ 仍有 {len(fails)} blob 失败，终止: {fails[:5]}", flush=True)
        return
    print(f"✅ blob 全部完成 {len(shas)}", flush=True)

    # ---------- 2) 构建目录树 ----------
    root = {"files": {}, "dirs": {}}

    def ensure(path_parts):
        cur = root
        for p in path_parts:
            cur = cur["dirs"].setdefault(p, {"files": {}, "dirs": {}})
        return cur

    for rel, sha in shas.items():
        parts = rel.split("/")
        node = ensure(parts[:-1])
        node["files"][parts[-1]] = sha

    # 合并仓库原有顶层文件（README 等）
    parent = get_main()
    code, ptree = api("GET", f"/git/trees/{parent}?recursive=0")
    if code == 200:
        for e in ptree.get("tree", []):
            if e["path"] not in root["files"] and e["path"] not in root["dirs"]:
                if e["type"] == "blob":
                    root["files"][e["path"]] = e["sha"]
                elif e["type"] == "tree":
                    root["dirs"][e["path"]] = {"files": {}, "dirs": {}}
                print(f"  保留仓库原有顶层: {e['path']}", flush=True)

    # 自底向上创建 tree
    def create_tree(node):
        entries = []
        for name, sha in node["files"].items():
            entries.append({"path": name, "mode": "100644", "type": "blob", "sha": sha})
        for name, sub in node["dirs"].items():
            sub_sha = create_tree(sub)
            entries.append({"path": name, "mode": "040000", "type": "tree", "sha": sub_sha})
        code, j = api("POST", "/git/trees", {"tree": entries}, timeout=120)
        if code != 201:
            raise RuntimeError(f"tree 失败 {code} {j} (节点数 {len(entries)})")
        return j["sha"]

    tree_sha = create_tree(root)
    print(f"✅ root tree {tree_sha}", flush=True)

    # ---------- 3) commit + ref ----------
    code, j = api("POST", "/git/commits",
                  {"message": "deploy course (bucketed audio)", "tree": tree_sha, "parents": [parent]},
                  timeout=120)
    if code != 201:
        print(f"commit 失败 {code} {j}", flush=True)
        return
    commit_sha = j["sha"]
    code, j = api("PATCH", "/git/refs/heads/main", {"sha": commit_sha, "force": True}, timeout=120)
    if code not in (200, 201):
        print(f"ref 失败 {code} {j}", flush=True)
        return
    print("✅ 完成：单个 commit 更新 main", flush=True)


if __name__ == "__main__":
    if len(sys.argv) < 5:
        print(__doc__)
        sys.exit(1)
    main()
