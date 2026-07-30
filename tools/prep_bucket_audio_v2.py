#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
prep_bucket_audio_v2.py — 部署前处理（改进版）。
问题：GitHub 单个 Git tree 节点不能超过 ~800 条，否则 422 超时。
audio/ 顶层扁平 mp3(1660) 与 audio/words/(892) 都超限。
修复：
  1) 用「字符码求和 % 16」做分桶（JS 端可 1:1 复现），把
     - audio/ 扁平 *.mp3 -> audio/b00~b15/
     - audio/words/ *.mp3 -> audio/words/b00~b15/
  2) 改写所有文本文件里的字面量引用：
     audio/<name>.mp3 -> audio/bXX/<name>.mp3
     audio/words/<name>.mp3 -> audio/words/bXX/<name>.mp3
  3) 在 app.js / vocab.js 中增加 abucket() 辅助函数，并把运行时拼接的
     words 路径改为带分桶前缀，确保运行时加载与磁盘一致。
用法: python3 prep_bucket_audio_v2.py <dir>
"""
import sys, os, re, shutil

DIR = sys.argv[1]
AUDIO = os.path.join(DIR, "audio")
WORDS = os.path.join(AUDIO, "words")


def bucket(name):
    s = sum(ord(c) for c in name) % 16
    return "b%02d" % s


ABHELP = "function abucket(n){var s=0;for(var i=0;i<n.length;i++){s+=n.charCodeAt(i);}return 'b'+('0'+(s%16)).slice(-2);}\n"


def move_bucket(src_dir, rel_prefix):
    """把 src_dir 下的直接 *.mp3 移入 src_dir/bXX/。rel_prefix 用于日志。"""
    if not os.path.isdir(src_dir):
        return 0
    files = [f for f in os.listdir(src_dir)
             if os.path.isfile(os.path.join(src_dir, f)) and f.lower().endswith(".mp3")]
    for f in files:
        b = bucket(f)
        d = os.path.join(src_dir, b)
        os.makedirs(d, exist_ok=True)
        shutil.move(os.path.join(src_dir, f), os.path.join(d, f))
    return len(files)


def main():
    n1 = move_bucket(AUDIO, "audio/")
    n2 = move_bucket(WORDS, "audio/words/")
    print(f"分桶移动: audio 扁平 {n1} 个, words {n2} 个", flush=True)

    # 字面量改写
    flat_pat = re.compile(r'audio/([A-Za-z0-9_.\-]+\.mp3)')
    word_pat = re.compile(r'audio/words/([A-Za-z0-9_.\-]+\.mp3)')

    def flat_repl(m):
        return "audio/" + bucket(m.group(1)) + "/" + m.group(1)

    def word_repl(m):
        return "audio/words/" + bucket(m.group(1)) + "/" + m.group(1)

    # 先改写 app.js / vocab.js 运行时拼接路径（注入 abucket），再做字面量改写，
    # 避免字面量正则把 JS 表达式当成文件名误伤。
    patch_app(DIR)
    patch_vocab(DIR)

    text_ext = (".js", ".html", ".css", ".json", ".md", ".txt")
    changed = 0
    for root, dirs, names in os.walk(DIR):
        if ".git" in dirs:
            dirs.remove(".git")
        for nm in names:
            if not nm.lower().endswith(text_ext):
                continue
            fp = os.path.join(root, nm)
            try:
                txt = open(fp, encoding="utf-8").read()
            except Exception:
                continue
            new = word_pat.sub(word_repl, txt)
            new = flat_pat.sub(flat_repl, new)
            if new != txt:
                open(fp, "w", encoding="utf-8").write(new)
                changed += 1
    print(f"字面量改写文件数: {changed}", flush=True)

    # 校验残留
    residual_flat = 0
    residual_word = 0
    for root, dirs, names in os.walk(DIR):
        if ".git" in dirs:
            dirs.remove(".git")
        for nm in names:
            if not nm.lower().endswith(text_ext):
                continue
            try:
                t = open(os.path.join(root, nm), encoding="utf-8").read()
            except Exception:
                continue
            residual_flat += len(flat_pat.findall(t))
            residual_word += len(word_pat.findall(t))
    print(f"校验: 残留扁平引用 {residual_flat}, 残留 words 字面量 {residual_word}", flush=True)
    if residual_flat or residual_word:
        print("⚠ 仍有残留字面量引用，需人工检查", flush=True)
    else:
        print("✅ 字面量引用已全部改为分桶路径", flush=True)


def patch_app(DIR):
    fp = os.path.join(DIR, "js", "app.js")
    t = open(fp, encoding="utf-8").read()
    repls = [
        ("const file = 'audio/words/' + String(en).toLowerCase() + '_' + (kind || 'en') + g + '.mp3?v=' + ASSET_V;",
         "const _fn = String(en).toLowerCase() + '_' + (kind || 'en') + g + '.mp3'; const file = 'audio/words/' + abucket(_fn) + '/' + _fn + '?v=' + ASSET_V;"),
        # 更具体的 if(w.en) 行必须先于独立 return 行，否则子串重复替换会破坏语法
        ("if (w.en) return 'audio/words/' + String(w.en).toLowerCase() + '_en.mp3?v=' + ASSET_V;",
         "if (w.en) { const _fn = String(w.en).toLowerCase() + '_en.mp3'; return 'audio/words/' + abucket(_fn) + '/' + _fn + '?v=' + ASSET_V; }"),
        ("if (w.en) return 'audio/words/' + String(w.en).toLowerCase() + '_zh.mp3?v=' + ASSET_V;",
         "if (w.en) { const _fn = String(w.en).toLowerCase() + '_zh.mp3'; return 'audio/words/' + abucket(_fn) + '/' + _fn + '?v=' + ASSET_V; }"),
        ("return 'audio/words/' + String(w.en).toLowerCase() + '_en.mp3?v=' + ASSET_V;",
         "const _fn = String(w.en).toLowerCase() + '_en.mp3'; return 'audio/words/' + abucket(_fn) + '/' + _fn + '?v=' + ASSET_V;"),
        ("return 'audio/words/' + String(w.en).toLowerCase() + '_zh.mp3?v=' + ASSET_V;",
         "const _fn = String(w.en).toLowerCase() + '_zh.mp3'; return 'audio/words/' + abucket(_fn) + '/' + _fn + '?v=' + ASSET_V;"),
    ]
    for old, new in repls:
        if old not in t:
            print(f"⚠ app.js 未找到待替换片段: {old[:40]}...", flush=True)
        t = t.replace(old, new)
    if "function abucket(" not in t:
        t = ABHELP + t
    open(fp, "w", encoding="utf-8").write(t)
    print("app.js 运行时 words 路径改写完成", flush=True)


def patch_vocab(DIR):
    fp = os.path.join(DIR, "js", "vocab.js")
    t = open(fp, encoding="utf-8").read()
    repls = [
        ("enAudio: w.enAudio || ('audio/words/' + k + '_en.mp3'),",
         "enAudio: w.enAudio || ('audio/words/' + abucket(k + '_en.mp3') + '/' + k + '_en.mp3'),"),
        ("zhAudio: w.zhAudio || ('audio/words/' + k + '_zh.mp3'),",
         "zhAudio: w.zhAudio || ('audio/words/' + abucket(k + '_zh.mp3') + '/' + k + '_zh.mp3'),"),
    ]
    for old, new in repls:
        if old not in t:
            print(f"⚠ vocab.js 未找到待替换片段: {old[:40]}...", flush=True)
        t = t.replace(old, new)
    if "function abucket(" not in t:
        t = ABHELP + t
    open(fp, "w", encoding="utf-8").write(t)
    print("vocab.js 运行时 words 路径改写完成", flush=True)


if __name__ == "__main__":
    main()
