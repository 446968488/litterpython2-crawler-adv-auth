#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
tts_adv.py — 爬虫升阶版真人语音生成器（一套干净自包含流水线）

从 data/course.js 提取每课的：
  - lecture   : 讲义 markdown → 去代码/去标记 → 按句切分 → 多段 lec_N.mp3
  - exercises : 每题题干(+选项) → ex<idx>_<sub>.mp3
  - takeaway  : 小结 → takeaway.mp3
  - narrate   : 讲一讲（优先 narration.TALK，否则由 takeaway 生成）
外加：
  - common    : fb_right/fb_wrong/enc_0..3/report_open/report_close（梗王话术）
  - words     : 全部单词 en(英文音)/zh(中文解释)

音色：女声 zh-CN-XiaoxiaoNeural(晓晓) / 男声 zh-CN-YunxiNeural(云希)；仅「幽默·梗王」一档，
性别烤进文件名（女=裸名 / 男=_m）。产物 data/audio.js 含 AUDIO_MAP(f)/AUDIO_MAP_M(m)/
AUDIO_LEARN(f)/AUDIO_LEARN_M(m)。BUILD 与 app.js 的 ASSET_V 保持一致。

用法：
  python tools/tts_adv.py            # 全量生成（已存在则跳过）
  FORCE=1 python tools/tts_adv.py    # 强制覆盖重生成
"""
import os, sys, json, re, asyncio, glob

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
try:
    import pron
except Exception:
    pron = None

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
AUDIO = os.path.join(ROOT, "audio")
DATA = os.path.join(ROOT, "data")
VOICES = {"f": "zh-CN-XiaoxiaoNeural", "m": "zh-CN-YunxiNeural"}
EN_VOICE = "en-US-AriaNeural"          # 单词英文发音用美式女声，更准
BUILD = "20260725a"                    # 与 js/app.js ASSET_V 一致
STYLE = "humor2"
HUMOR_INTRO = "哎哎听好喽，小光给你唠两句——"
HUMOR_OUTRO = "就这？下节更带劲，等着！"

FORCE = os.environ.get("FORCE") == "1"
CONCUR = 4

# ---------- 文本清理 ----------
def fix_pron(text):
    if pron and hasattr(pron, "fix_pron"):
        try:
            return pron.fix_pron(text)
        except Exception:
            return text
    return text

def strip_md(md):
    """把 markdown 讲义转成适合朗读的纯文本（去代码/标记）。"""
    if not md:
        return ""
    # 去 fenced code block
    md = re.sub(r"```.*?```", " ", md, flags=re.S)
    # 去行内代码 `x`
    md = re.sub(r"`([^`]+)`", r"\1", md)
    # 去图片 ![alt](url)
    md = re.sub(r"!\[[^\]]*\]\([^)]*\)", " ", md)
    # 去链接 [text](url) -> text
    md = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", md)
    # 去标题 # 号
    md = re.sub(r"^\s{0,3}#{1,6}\s+", "", md, flags=re.M)
    # 去引用 > 与列表 -/* 标记（保留文字）
    md = re.sub(r"^\s{0,3}>\s?", "", md, flags=re.M)
    md = re.sub(r"^\s{0,3}[-*+]\s+", "", md, flags=re.M)
    md = re.sub(r"^\s{0,3}\d+\.\s+", "", md, flags=re.M)
    # 去强调符号
    md = re.sub(r"\*{1,3}([^*]+)\*{1,3}", r"\1", md)
    md = re.sub(r"_([^_]+)_", r"\1", md)
    # 去 HTML 标签
    md = re.sub(r"<[^>]+>", " ", md)
    # 折叠空白
    md = re.sub(r"[ \t]+", " ", md)
    md = re.sub(r"\n{2,}", "。\n", md)
    md = md.replace("\n", " ")
    return md.strip()

def split_sentences(text, maxlen=70):
    """按中文句末切分，过长则按逗号再切，并合并过短句。"""
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        return []
    raw = re.split(r"(?<=[。！？!?；;])", text)
    out, buf = [], ""
    for seg in raw:
        seg = seg.strip()
        if not seg:
            continue
        buf = (buf + seg).strip()
        if len(buf) >= maxlen:
            out.append(buf)
            buf = ""
    if buf:
        out.append(buf)
    return out

def ex_text(ex):
    """把一道练习转成可朗读文本。"""
    t = ex.get("type")
    q = ex.get("question", "")
    if t == "choice":
        opts = ex.get("options", [])
        s = "选择题：" + q + "。选项："
        s += "；".join("%s %s" % (chr(65 + i), o) for i, o in enumerate(opts))
        return s
    if t == "tap":
        opts = ex.get("options", [])
        s = "多选题：" + q + "。可选项："
        s += "；".join("%s %s" % (chr(65 + i), o) for i, o in enumerate(opts))
        return s
    if t == "fill":
        return "填空题：" + q
    if t == "order":
        steps = ex.get("steps", [])
        s = "排序题：" + q + "。"
        if steps:
            s += "大致顺序是：" + "；".join(steps)
        return s
    if t == "typing":
        words = ex.get("words", [])
        return "跟读练习：" + "，".join(words)
    if t == "open":
        return "开放思考题：" + q
    return q

# ---------- 课程加载 ----------
def load_course():
    src = open(os.path.join(DATA, "course.js"), encoding="utf-8").read()
    s = src[src.index("{"):]
    s = s[: s.rindex("}") + 1]
    return json.loads(s)

def iter_lessons(course):
    for ch in course["chapters"]:
        for les in ch.get("lessons", []):
            yield les

def all_words(course):
    seen = {}
    for les in iter_lessons(course):
        for w in les.get("words", []) or []:
            en = (w.get("en") or "").strip()
            if en and en.lower() not in seen:
                seen[en.lower()] = w
    return list(seen.values())

# ---------- 任务构建 ----------
def build_tasks(course):
    tasks = []
    for les in iter_lessons(course):
        lid = les["id"]
        # lecture
        for i, seg in enumerate(split_sentences(strip_md(les.get("markdown", "")))):
            tasks.append({"lid": lid, "kind": "lecture", "idx": i, "sub": 0,
                          "text": seg, "voice": "zh"})
        # exercises
        for ei, ex in enumerate(les.get("exercises", []) or []):
            txt = ex_text(ex)
            tasks.append({"lid": lid, "kind": "exercise", "idx": ei, "sub": 0,
                          "text": txt, "voice": "zh"})
        # takeaway
        if les.get("takeaway"):
            tasks.append({"lid": lid, "kind": "takeaway", "idx": 0, "sub": 0,
                          "text": les["takeaway"], "voice": "zh"})
        # narrate
        narr = narrate_text(les)
        if narr:
            tasks.append({"lid": lid, "kind": "narrate", "idx": 0, "sub": 0,
                          "text": narr, "voice": "zh"})
    # common
    for nm, txt in COMMON.items():
        tasks.append({"lid": "_common", "kind": "common", "name": nm, "idx": 0, "sub": 0,
                      "text": txt, "voice": "zh"})
    # learn（评价模块话术；每个 name 可有多版本，前端随机抽）
    for nm, txt in LEARN.items():
        items = txt if isinstance(txt, list) else [txt]
        for vi, it in enumerate(items):
            tasks.append({"lid": "_learn", "kind": "learn", "name": nm, "sub": vi,
                          "text": it, "voice": "zh"})
    # words
    for w in all_words(course):
        en = w["en"].lower()
        tasks.append({"lid": "_words", "kind": "word", "name": en, "sub": "en",
                      "text": w["en"], "voice": "en"})
        tasks.append({"lid": "_words", "kind": "word", "name": en, "sub": "zh",
                      "text": w.get("zh", ""), "voice": "zh"})
    return tasks

def narrate_text(les):
    # 优先 narration.TALK
    try:
        import narration as N
        segs = N.TALK.get(les["id"])
        if segs:
            txt = " ".join((s.get("voice") or "") for s in segs).strip()
            if txt:
                return HUMOR_INTRO + " " + txt + " " + HUMOR_OUTRO
    except Exception:
        pass
    # 否则由 takeaway 生成
    if les.get("takeaway"):
        return HUMOR_INTRO + " " + les["takeaway"] + " " + HUMOR_OUTRO
    return ""

COMMON = {
    "fb_right": "哈哈答对啦！你这小脑袋瓜可以的嘛！",
    "fb_wrong": "哎呀翻车啦！没关系，重来重来。",
    "enc_0": "可以可以，有点东西！",
    "enc_1": "学得挺快嘛，藏得挺深！",
    "enc_2": "嚯，小程序员出炉啦！",
    "enc_3": "坚持这么久，我服你！",
    "report_open": "来来来，看看你今天折腾出啥名堂！",
    "report_close": "继续整，别停，下回更猛！",
}

# ---------- 输出路径 ----------
def out_path(t, gender):
    suf = "_m" if gender == "m" else ""
    if t["kind"] in ("lecture", "exercise", "takeaway"):
        lid = t["lid"]
        if t["kind"] == "lecture":
            return os.path.join(AUDIO, "%s_lec_%d%s.mp3" % (lid, t["idx"], suf))
        if t["kind"] == "exercise":
            return os.path.join(AUDIO, "%s_ex%d_%d%s.mp3" % (lid, t["idx"], t["sub"], suf))
        if t["kind"] == "takeaway":
            return os.path.join(AUDIO, "%s_takeaway%s.mp3" % (lid, suf))
    if t["kind"] == "narrate":
        lid = t["lid"]
        return os.path.join(AUDIO, lid, "narrate%s.mp3" % suf)
    if t["kind"] == "common":
        return os.path.join(AUDIO, "common", "%s_%s%s.mp3" % (t["name"], STYLE, suf))
    if t["kind"] == "word":
        return os.path.join(AUDIO, "words", "%s_%s%s.mp3" % (t["name"], t["sub"], suf))
    if t["kind"] == "learn":
        return os.path.join(AUDIO, "common", "learn_%s_%s%s.mp3" % (t["name"], STYLE, suf))
    raise ValueError("unknown kind " + t["kind"])

def rel(p):
    return "audio/" + os.path.relpath(p, AUDIO).replace("\\", "/") + "?v=" + BUILD

# ---------- 合成 ----------
sem = asyncio.Semaphore(CONCUR)
fail = 0
done = 0

async def synth_one(t, gender):
    global fail, done
    out = out_path(t, gender)
    # 已存在且体积正常 → 跳过（FORCE 时强制重烤）
    if not FORCE and os.path.exists(out) and os.path.getsize(out) > 500:
        return
    # 清理上一次的坏文件（0 字节 / 过小的空壳），避免 edge-tts "No audio" 残留
    if os.path.exists(out) and os.path.getsize(out) <= 500:
        try:
            os.remove(out)
        except Exception:
            pass
    os.makedirs(os.path.dirname(out), exist_ok=True)
    voice = EN_VOICE if (t["voice"] == "en" and gender == "f") else (
        EN_VOICE if t["voice"] == "en" else VOICES[gender])
    text = fix_pron(t["text"])
    if not text or not text.strip():
        return
    async with sem:
        for attempt in range(8):
            try:
                import edge_tts
                comm = edge_tts.Communicate(text, voice)
                # 加超时，避免个别连接卡死拖垮整批
                await asyncio.wait_for(comm.save(out), timeout=30)
                if os.path.exists(out) and os.path.getsize(out) > 500:
                    done += 1
                    return
                # 写出空壳 → 删掉重试
                try:
                    os.remove(out)
                except Exception:
                    pass
            except Exception as e:
                sys.stderr.write("retry %d %s: %s\n" % (attempt + 1, out, e))
                await asyncio.sleep(2.0 * (attempt + 1))
    global fail
    fail += 1
    sys.stderr.write("FAIL %s\n" % out)

async def run_all(tasks):
    jobs = []
    for t in tasks:
        for g in ("f", "m"):
            jobs.append(synth_one(t, g))
    await asyncio.gather(*jobs)

# ---------- 写 audio.js ----------
def seg_obj(p):
    return {"src": rel(p), "pause": "short"}

def write_audio_js(course, tasks):
    # 收集每个 gender 的映射
    for gender in ("f", "m"):
        lessons_map = {}
        for t in tasks:
            if t["kind"] in ("lecture", "exercise", "takeaway", "narrate"):
                lid = t["lid"]
                lessons_map.setdefault(lid, {"lecture": [], "exercises": {}, "takeaway": None})
                p = out_path(t, gender)
                if t["kind"] == "lecture":
                    lessons_map[lid]["lecture"].append(seg_obj(p))
                elif t["kind"] == "exercise":
                    lessons_map[lid]["exercises"].setdefault(t["idx"], []).append(seg_obj(p))
                elif t["kind"] == "takeaway":
                    if t["sub"] == 0:
                        lessons_map[lid]["takeaway"] = seg_obj(p)
                elif t["kind"] == "narrate":
                    lessons_map[lid]["narrate"] = seg_obj(p)
        for lid, info in lessons_map.items():
            exs = info["exercises"]
            info["exercises"] = [exs[k] for k in sorted(exs.keys())]
        # learn（评价模块，同 beginner：notDone/allCorrect/wrongMid + wrong1..6）
        learn = {}
        for t in tasks:
            if t.get("kind") == "learn":
                learn.setdefault(t["name"], []).append(seg_obj(out_path(t, gender)))
        lines = []
        var = "AUDIO_MAP" if gender == "f" else "AUDIO_MAP_M"
        lines.append("// 由 tools/tts_adv.py 自动生成（edge-tts 真人声；女=晓晓/男=云希；幽默·梗王一档）")
        lines.append("// 更新后请硬刷新页面（Ctrl/Cmd+Shift+R）加载最新 audio.js")
        lines.append("window.%s = window.%s || {};" % (var, var))
        for lid, info in lessons_map.items():
            lines.append("window.%s['%s'] = {" % (var, lid))
            lines.append("  lecture: " + json.dumps(info["lecture"], ensure_ascii=False) + ",")
            lines.append("  exercises: " + json.dumps(info["exercises"], ensure_ascii=False) + ",")
            lines.append("  takeaway: " + (json.dumps(info["takeaway"], ensure_ascii=False) if info["takeaway"] else "null") + ",")
            lines.append("  narrate: " + (json.dumps(info.get("narrate"), ensure_ascii=False) if info.get("narrate") else "null") + "")
            lines.append("};")
        lvar = "AUDIO_LEARN" if gender == "f" else "AUDIO_LEARN_M"
        wrong = [learn.get("wrong%d" % n, [None])[0] for n in range(1, 7)]
        lines.append("window.%s = {" % lvar)
        lines.append("  notDone: " + json.dumps(learn.get("notDone", []), ensure_ascii=False) + ",")
        lines.append("  allCorrect: " + json.dumps(learn.get("allCorrect", []), ensure_ascii=False) + ",")
        lines.append("  wrongMid: " + json.dumps(learn.get("wrongMid", []), ensure_ascii=False) + ",")
        lines.append("  wrong: " + json.dumps(wrong, ensure_ascii=False))
        lines.append("};")
        with open(os.path.join(DATA, "audio.js"), "w" if gender == "f" else "a", encoding="utf-8") as f:
            f.write("\n".join(lines) + "\n")
        print("已写入 data/audio.js (%s)，课程数 %d" % (var, len(lessons_map)))

LEARN = {
    "notDone": ["哎哟，这节题都还没碰呢，先去刷几道，再来听我给你颁奖。",
                "嘿，题都没做就想听成果？快去把题做了再来。"],
    "allCorrect": ["而且今天全一次过，行啊你，运气不错！",
                   "好家伙，这几道题一次都没错，今天状态在线啊！"],
    "wrongMid": ["不过嘛，有题头回翻车了，回去给它抓出来改改。",
                 "有几题第一次没过，别急，回去再战一把就赢啦。"],
    "wrong1": "第1题头回没过。", "wrong2": "第2题头回没过。", "wrong3": "第3题头回没过。",
    "wrong4": "第4题头回没过。", "wrong5": "第5题头回没过。", "wrong6": "第6题头回没过。",
}

def write_talk_js():
    """由 narration.TALK 生成 data/talk.js（讲一讲字幕，window.LESSON_TALK）。"""
    try:
        import narration as N
        TALK = getattr(N, "TALK", {}) or {}
    except Exception:
        TALK = {}
    data = {}
    for lid, segs in TALK.items():
        if not isinstance(segs, list):
            continue
        voices = [s.get("voice", "") for s in segs if isinstance(s, dict) and s.get("voice")]
        if voices:
            data[lid] = voices
    lines = []
    lines.append("// 由 tools/narration.py 的 TALK 自动生成（升阶版·小光讲一讲字幕）")
    lines.append("// 更新后请硬刷新页面（Ctrl/Cmd+Shift+R）加载最新 talk.js")
    lines.append("window.LESSON_TALK = {")
    items = []
    for lid, voices in data.items():
        items.append("  " + json.dumps(lid, ensure_ascii=False) + ": " + json.dumps(voices, ensure_ascii=False))
    lines.append(",\n".join(items))
    lines.append("};")
    with open(os.path.join(DATA, "talk.js"), "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    print("已写入 data/talk.js，字幕课数 %d" % len(data))


def main():
    course = load_course()
    tasks = build_tasks(course)
    print("任务总数(含男女两版):", len(tasks) * 2, " 课程课时:", sum(len(c["lessons"]) for c in course["chapters"]))
    asyncio.run(run_all(tasks))
    print("合成结束：成功 %d，失败 %d" % (done, fail))
    write_audio_js(course, tasks)
    write_talk_js()
    print("DONE tts_adv")

if __name__ == "__main__":
    main()
