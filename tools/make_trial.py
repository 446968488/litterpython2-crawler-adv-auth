#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
make_trial.py — 生成「升阶版·体验版」（限内容引流版）
范围：前 3 章（异步爬虫基础 / httpx / XPath，共 14 节含阶段考①）+ 毕业项目预览(gradA/gradB)
不含：Playwright / JS逆向 / 分布式 / ES / 验证码 / App抓包 等深水区；不含家长课
产出：
  - 网课工具_升阶版_体验版/  （免激活部署目录，audio 只含子集）
  - 发布包/升阶版_体验版_免激活.zip
"""
import json, os, shutil, glob, zipfile

SRC = "/Users/xiaoguang/WorkBuddy/电脑使用技巧/python爬虫升阶/网课工具_升阶版"
ROOT = "/Users/xiaoguang/WorkBuddy/电脑使用技巧/python爬虫升阶"
OUT_DIR = os.path.join(ROOT, "网课工具_升阶版_体验版")
ZIP = os.path.join(ROOT, "发布包", "升阶版_体验版_免激活.zip")


def main():
    # 1. 读 course.js
    src_text = open(os.path.join(SRC, "data", "course.js"), encoding="utf-8").read()
    s = src_text[src_text.index("{"):]
    s = s[: s.rindex("}") + 1]
    d = json.loads(s)

    # 2. 裁剪：前 3 章 + 毕业项目预览
    new_chapters = [dict(ch) for ch in d["chapters"][:3]]
    grad = []
    for ch in d["chapters"]:
        for l in ch.get("lessons", []):
            if l["id"] in ("gradA", "gradB"):
                grad.append(dict(l))
    new_chapters.append({"title": "毕业项目预览（学完能做这些）", "lessons": grad})
    # 保险：过滤家长课
    for ch in new_chapters:
        ch["lessons"] = [l for l in ch["lessons"] if not l.get("forParent")]
    new_d = {"title": d.get("title", ""), "chapters": new_chapters}
    new_course_text = "window.COURSE_DATA = " + json.dumps(new_d, ensure_ascii=False, indent=2) + ";"

    ids = [l["id"] for ch in new_chapters for l in ch["lessons"]]

    # 3. 复制目录（排除 audio / tools / .git 等）
    if os.path.exists(OUT_DIR):
        shutil.rmtree(OUT_DIR)
    shutil.copytree(
        SRC, OUT_DIR,
        ignore=shutil.ignore_patterns(".git", "__pycache__", "tools", "node_modules", ".workbuddy", ".DS_Store", "*.pyc", "audio"),
    )
    open(os.path.join(OUT_DIR, "data", "course.js"), "w", encoding="utf-8").write(new_course_text)

    # 4. 复制 audio 子集
    os.makedirs(os.path.join(OUT_DIR, "audio"), exist_ok=True)
    copied = 0
    for lid in ids:
        for pat in (f"{lid}_lec_*", f"{lid}_ex*", f"{lid}_takeaway*"):
            for f in glob.glob(os.path.join(SRC, "audio", pat)):
                shutil.copy(f, os.path.join(OUT_DIR, "audio", os.path.basename(f)))
                copied += 1
        sub = os.path.join(SRC, "audio", lid)
        if os.path.isdir(sub):
            shutil.copytree(sub, os.path.join(OUT_DIR, "audio", lid))
            copied += len(os.listdir(sub))
    print("audio 子集复制文件数:", copied)

    # 5. 免激活
    appjs = os.path.join(OUT_DIR, "js", "app.js")
    t = open(appjs, encoding="utf-8").read()
    assert "const SKIP_ACTIVATION = false;" in t
    t = t.replace("const SKIP_ACTIVATION = false;", "const SKIP_ACTIVATION = true;")
    open(appjs, "w", encoding="utf-8").write(t)

    # 6. 打包 zip
    open(os.path.join(OUT_DIR, ".nojekyll"), "w").close()
    if os.path.exists(ZIP):
        os.remove(ZIP)
    n = 0
    with zipfile.ZipFile(ZIP, "w", zipfile.ZIP_DEFLATED) as z:
        for root, dirs, files in os.walk(OUT_DIR):
            dirs[:] = [x for x in dirs if x not in {".git", "__pycache__"}]
            for f in files:
                if f in {".DS_Store"} or f.endswith(".pyc"):
                    continue
                fp = os.path.join(root, f)
                rel = os.path.relpath(fp, OUT_DIR)
                z.write(fp, rel)
                n += 1
    print("体验版 zip:", ZIP)
    print("  文件数", n, "大小", os.path.getsize(ZIP) // 1024 // 1024, "MB")
    print("体验版 lessons:", ids)


if __name__ == "__main__":
    main()
