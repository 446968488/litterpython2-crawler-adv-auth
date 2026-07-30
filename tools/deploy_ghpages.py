#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
deploy_ghpages.py — 纯 GitHub API 部署（不依赖 git 协议）
沙箱连不上 github.com:443，故不走 git push，只用 api.github.com 的 Contents API。
多线程并发上传，单进程避免被沙箱长进程误杀；已存在文件(422)自动跳过，可断点续传。
前置：仓库需已存在且有默认分支（建仓时勾 Add a README file）。
用法：python3 deploy_ghpages.py <token> <user> <repo> <local_dir> [并发数]
"""
import sys, os, base64, json, time, threading
import urllib.request, urllib.error
from concurrent.futures import ThreadPoolExecutor, as_completed

TOKEN = sys.argv[1]
USER = sys.argv[2]
REPO = sys.argv[3]
DIR = sys.argv[4]
NWORK = int(sys.argv[5]) if len(sys.argv) > 5 else 8
API = f"https://api.github.com/repos/{USER}/{REPO}/contents"
HEADERS = {"Authorization": f"token {TOKEN}", "Content-Type": "application/json"}

lock = threading.Lock()
stats = {"ok": 0, "skip": 0, "fail": 0, "done": 0}
abort = threading.Event()
fail_samples = []


def put_one(rel, fpath):
    if abort.is_set():
        return ("abort", rel)
    try:
        with open(fpath, "rb") as f:
            b64 = base64.b64encode(f.read()).decode()
    except Exception as e:
        return ("fail", rel, f"读失败:{e}")
    payload = json.dumps({"message": f"add {rel}", "content": b64}).encode()
    req = urllib.request.Request(f"{API}/{rel}", data=payload, headers=HEADERS, method="PUT")
    for attempt in range(5):
        try:
            resp = urllib.request.urlopen(req, timeout=60)
            code = resp.getcode()
            if 200 <= code < 300:
                return ("ok", rel)
            return ("fail", rel, f"HTTP {code}")
        except urllib.error.HTTPError as e:
            if e.code == 422:
                return ("skip", rel)  # 已存在，跳过（续传）
            if e.code == 401:
                abort.set()
                return ("abort", rel)
            if e.code == 404:
                return ("fail", rel, "404 仓库/权限")
            if e.code == 429 or 500 <= e.code < 600:
                time.sleep(15 * (attempt + 1))
                continue
            return ("fail", rel, f"HTTP {e.code}")
        except Exception as e:
            time.sleep(8 * (attempt + 1))
            continue
    return ("fail", rel, "maxretry")


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
    print(f"共 {total} 文件，并发 {NWORK}", flush=True)
    with ThreadPoolExecutor(max_workers=NWORK) as ex:
        futs = {ex.submit(put_one, rel, fp): rel for rel, fp in files}
        for fut in as_completed(futs):
            res = fut.result()
            kind = res[0]
            with lock:
                stats[kind] = stats.get(kind, 0) + 1
                stats["done"] += 1
                if kind == "fail":
                    if len(fail_samples) < 6:
                        fail_samples.append(res)
                d = stats["done"]
                if d % 25 == 0 or d == total:
                    print(f"  进度 {d}/{total} 新增={stats['ok']} 跳过={stats['skip']} 失败={stats['fail']}",
                          flush=True)
            if kind == "abort":
                print("令牌失效，终止全部", flush=True)
                ex.shutdown(wait=False, cancel_futures=True)
                break
    print(f"\n✅ {REPO} 完成: 新增 {stats['ok']}, 跳过已存在 {stats['skip']}, 失败 {stats['fail']}, 共 {total}",
          flush=True)
    for s in fail_samples:
        print("  失败样例:", s, flush=True)


if __name__ == "__main__":
    if len(sys.argv) < 5:
        print(__doc__)
        sys.exit(1)
    main()
