#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
prep_bucket_audio.py — 部署前处理：把 audio/ 下的扁平 mp3 按文件名哈希分到
audio/b00 ~ audio/b15 子目录，并同步改写 data/audio.js 里的引用路径，
使每个目录的文件数降到 ~150，避免 GitHub Git Data API 创建超大 tree 触发 504。
仅改写扁平文件（audio/<name>.mp3）；子目录（common/words/a1l1/...）不动。
用法: python3 prep_bucket_audio.py <dir>
"""
import sys, os, re, hashlib, shutil

DIR = sys.argv[1]
AUDIO = os.path.join(DIR, "audio")


def bucket(name):
    h = int(hashlib.md5(name.encode("utf-8")).hexdigest(), 16)
    return "b%02d" % (h % 16)


def main():
    # 1) 移动扁平 mp3 到分桶子目录
    flat = [f for f in os.listdir(AUDIO)
            if os.path.isfile(os.path.join(AUDIO, f)) and f.lower().endswith(".mp3")]
    print(f"扁平 mp3 数: {len(flat)}", flush=True)
    for f in flat:
        b = bucket(f)
        dst_dir = os.path.join(AUDIO, b)
        os.makedirs(dst_dir, exist_ok=True)
        src = os.path.join(AUDIO, f)
        dst = os.path.join(dst_dir, f)
        if os.path.abspath(src) != os.path.abspath(dst):
            shutil.move(src, dst)
    print("分桶移动完成", flush=True)

    # 2) 改写 audio.js（及其他含扁平引用的静态文件）
    targets = [os.path.join(DIR, "data", "audio.js"),
               os.path.join(DIR, "js", "app.test.js")]
    pat = re.compile(r'audio/([^"/?]+\.mp3)')

    def repl(m):
        name = m.group(1)
        return "audio/" + bucket(name) + "/" + name

    for t in targets:
        if not os.path.exists(t):
            continue
        txt = open(t, encoding="utf-8").read()
        before = len(pat.findall(txt))
        txt2 = pat.sub(repl, txt)
        open(t, "w", encoding="utf-8").write(txt2)
        after = len(pat.findall(txt2))
        print(f"{os.path.relpath(t, DIR)}: 改写前扁平引用 {before} -> 改写后残留 {after}", flush=True)

    # 3) 校验
    left = pat.findall(open(os.path.join(DIR, "data", "audio.js"), encoding="utf-8").read())
    if left:
        print(f"⚠ audio.js 仍有 {len(left)} 处残留扁平引用: {left[:5]}", flush=True)
    else:
        print("✅ audio.js 扁平引用已全部改为分桶路径", flush=True)
    total = 0
    for root, dirs, names in os.walk(AUDIO):
        total += len([n for n in names if n.lower().endswith(".mp3")])
    print(f"audio 总 mp3: {total}", flush=True)


if __name__ == "__main__":
    main()
