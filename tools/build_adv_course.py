# -*- coding: utf-8 -*-
"""爬虫升阶版课程生成器：产出 data/course.js（window.COURSE_DATA）。
内容口径：幽默·梗王语气 + 多方式讲解（比喻/示意图/代码/结果）+ 针对性练习。
figures 引用 figures_adv.js 的 adv_* key，以及爬虫专用基础 key。
运行：python3 tools/build_adv_course.py
"""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'data', 'course.js')

# ---------- 助手函数 ----------
def les(id, title, icon, color, md, take, figs, words, exs, tasks, forParent=False, code=None, codeCopyOnly=False):
    d = {"id": id, "title": title, "icon": icon, "markdown": md, "takeaway": take,
         "figures": figs, "words": words, "exercises": exs, "tasks": tasks, "color": color}
    if forParent:
        d["forParent"] = True
    if code is not None:
        d["code"] = code
        if codeCopyOnly:
            d["codeCopyOnly"] = True
    return d

def ch(title, icon, color, lessons):
    return {"title": title, "icon": icon, "color": color, "lessons": lessons}

def exam(id, title, icon, color, md, take, exs):
    return {"id": id, "title": title, "icon": icon, "type": "exam", "color": color,
            "markdown": md, "takeaway": take, "words": [], "tasks": [], "exercises": exs}

# 练习构造
def choice(q, opts, ans, exp):
    return {"type": "choice", "question": q, "options": opts, "answer": ans, "explain": exp}

def fill(q, ans, exp):
    return {"type": "fill", "question": q, "answer": ans, "explain": exp}

def order(q, steps, exp):
    return {"type": "order", "question": q, "steps": steps, "explain": exp}

def typing(q, words):
    return {"type": "typing", "question": q, "words": words}

def openq(q, ans):
    return {"type": "open", "question": q, "answer": ans}

def tap(q, opts, ans, exp):
    return {"type": "tap", "question": q, "options": opts, "answer": ans, "explain": exp, "multi": True}

def word(en, zh, pron):
    return {"en": en, "zh": zh, "pron": pron}

def fig(key, cap):
    return {"key": key, "caption": cap}

PALETTE = ["#5b8fc4", "#3a9d5d", "#e6b84d", "#c0659e", "#6a8fd4", "#4bb3a3",
           "#d9774b", "#8e7bd6", "#5aa9e6", "#cf6f6f", "#58b368", "#b08948"]

# ============================ 课程数据 ============================
GRAD_A_CODE = r'''# 毕业项目 A：高并发异步采集器（完整可运行示例）
# 安装依赖：pip install aiohttp
# 合规提醒：只抓你有权抓的公开站点，控制并发、尊重 robots、加延时。
import asyncio, aiohttp, csv, time

TARGETS = [
    "https://example.com/page/1",
    "https://example.com/page/2",
    # 换成你有权抓的「列表页 -> 详情页」URL
]
CONCURRENCY = 8      # 同时并发数（信号量控制）
TIMEOUT = 15
OUT = "result.csv"

semaphore = asyncio.Semaphore(CONCURRENCY)
rows = []
sess = None

async def fetch(url):
    async with semaphore:                      # 限流：别冲垮对方
        for attempt in range(3):               # 失败重试
            try:
                async with sess.get(url, timeout=TIMEOUT) as r:
                    if r.status == 429:         # 被限流 -> 退避后重试
                        await asyncio.sleep(2 ** attempt + 1)
                        continue
                    r.raise_for_status()
                    return await r.text()
            except Exception as e:
                await asyncio.sleep(1.5 * (attempt + 1))
    return None

def parse(html):
    # 用 parsel / lxml / bs4 / re 解析出你要的字段
    return {"len": len(html) if html else 0}

async def worker(url):
    html = await fetch(url)
    if html:
        rows.append(parse(html))

async def main():
    global sess
    async with aiohttp.ClientSession() as sess:
        t0 = time.time()
        await asyncio.gather(*(worker(u) for u in TARGETS))
        print(f"抓了 {len(rows)} 页，用时 {time.time()-t0:.1f}s")
    with open(OUT, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["len"])
        w.writeheader(); w.writerows(rows)

if __name__ == "__main__":
    asyncio.run(main())
'''

GRAD_B_CODE = r'''# 毕业项目 B：分布式采集 + ES 入库（生产架构骨架）
# 安装依赖：pip install redis elasticsearch simhash requests
# 说明：需本地先起 Redis 与 Elasticsearch；下面演示
#       「Redis 中央队列 + 多进程 worker + SimHash 近似去重 + 写 ES」。
import redis, requests, multiprocessing as mp
from elasticsearch import Elasticsearch
from simhash import Simhash

r = redis.Redis(host="127.0.0.1", port=6379, db=0)
es = Elasticsearch("http://127.0.0.1:9200")
QUEUE = "crawl:tasks"
SEEN = "crawl:simhash"

def push_urls(urls):
    r.lpush(QUEUE, *urls)               # 种子 URL 进中央队列（多机共享）

def fetch_sync(url):
    return requests.get(url, timeout=15).text

def sim_dup(text):
    h = Simhash(text).value
    for old in r.sscan_iter(SEEN):      # 汉明距离 < 3 视为近似重复
        if bin(h ^ int(old)).count("1") < 3:
            return True
    r.sadd(SEEN, str(h))
    return False

def worker():
    while True:
        url = r.rpop(QUEUE)
        if not url: break
        html = fetch_sync(url)
        if html and not sim_dup(html):
            es.index(index="docs", document={"url": url, "text": html[:10000]})

if __name__ == "__main__":
    push_urls(["https://example.com/a", "https://example.com/b"])
    procs = [mp.Process(target=worker) for _ in range(4)]   # 4 个进程协作
    for p in procs: p.start()
    for p in procs: p.join()
'''

COURSE = {
    "title": "小光陪你写爬虫 · 进阶深水区",
    "chapters": [
        # ===================== 第1章 异步爬虫基础 =====================
        ch("异步爬虫基础", "🌀", "#5b8fc4", [
            les("a1l1", "同步为何慢：I/O 等待与 GIL 的误会", "🐌", "#5b8fc4",
                '''## 同步爬虫：一个一个来，慢在哪

同步代码像排队打饭：**发一个请求 → 干等服务器回数据 → 收到才发下一个**。等的时候你的程序被「阻塞」住，啥也干不了。

### 慢的根因：I/O 等待
爬虫 90% 时间在等网络（I/O），不是算数据。同步模式下，等的时候线程被卡死，100 个网址就要等 100 次往返。

### GIL 背不背锅？
很多人以为慢是 Python 的 GIL（全局锁）。**其实不是**——GIL 限制的是 CPU 计算并行，而爬虫瓶颈是 I/O 等待。这锅 GIL 不背。

### 对比一眼懂
| 模式 | 等第 1 个时 | 100 个网址耗时 |
|---|---|---|
| 同步 | 卡住干等 | ≈ 100 × 单程 |
| 异步 | 去发第 2、3…个 | ≈ 接近 1 次单程 |

> 💡 异步不是「算得更快」，而是「等的时候不闲着」。''',
                "同步慢在「等网络时线程被卡住干等」，不是 GIL 的锅（GIL 只限 CPU 并行）。异步精髓：等的时候不闲着，去发下一个请求，100 个网址并发≈一次单程。",
                [fig("adv_sync_vs_async", "🐌 同步排队干等 vs 异步边等边发：瓶颈在 I/O 等待，不在算力")],
                [word("ASYNC", "异步：不等结果、先去干别的事的执行方式", "əˈsɪŋk"),
                 word("BLOCK", "阻塞：程序卡在某一步动不了，直到这步完成", "blɑːk"),
                 word("IO", "I/O：输入/输出，这里指网络收发等等待型操作", "aɪ ˈoʊ")],
                [choice("同步爬虫慢，最主要的原因是？",
                        ["等网络 I/O 时线程被阻塞、干等着", "Python 算数据太慢", "GIL 把 CPU 锁死了"],
                        0, "爬虫瓶颈是网络等待，线程在等响应时被卡住，而不是算力不够。"),
                 fill("异步的核心思想不是「算得更快」，而是「___ 的时候去干别的事」。（填两个字：等/算）",
                      "等", "异步的价值在 I/O 等待期间不空转，去发起别的请求。"),
                 tap("下列哪些属于 I/O 等待？（多选）",
                     ["等服务器回 HTTP 响应", "等磁盘读文件", "做一道数学题", "等数据库返回结果"],
                     [0, 1, 3], "做数学题是 CPU 计算，不是 I/O 等待；其余都是等外部设备/网络。"),
                 choice("关于 GIL，下列说法正确的是？",
                        ["GIL 是爬虫慢的元凶", "GIL 限制 CPU 并行，但不背 I/O 等待的锅", "GIL 让 Python 根本写不了爬虫"],
                        1, "GIL 影响的是多核 CPU 并行计算，爬虫慢在等网络，两者不是一回事。"),
                 openq("用你自己的话说说：为什么异步能让抓 100 个网址比同步快那么多？",
                       "因为异步在等某个网址响应时不空转，趁机去发其他请求，100 个请求几乎同时飞出去，总耗时接近一次单程而不是 100 次累加。")],
                ["用 time 测一下：同步抓 5 个网址用多久？记下数字，学完异步再测一次对比。",
                 "在纸上画两幅小人图：同步=排队干等；异步=边等边发下一个。",
                 "想一个生活里「等的时候可以并行做」的例子（如烧水时顺便刷牙）。"]),

            les("a1l2", "asyncio 三件套：事件循环·协程·任务", "🔁", "#5b8fc4",
                '''## asyncio 三件套，记住这三个词

### 1. 事件循环（Event Loop）= 调度员
它是个死循环，手里攥着一堆「待办」，哪个能跑了就调度哪个。你不用管它怎么转，只要把活交给它。

### 2. 协程（Coroutine）= 能暂停的函数
用 `async def` 定义的函数，遇到 `await` 就**主动让出**控制权，等结果好了再回来接着跑。它像「会打瞌睡的员工」，睡的时候把工位让给别人。

### 3. 任务（Task）= 被排进循环的具体工单
`asyncio.create_task(协程())` 把协程包成任务丢进循环，循环才真正开始并发跑它。

### 最小骨架
```python
import asyncio

async def job(n):
    print(f"任务{n}开工")
    await asyncio.sleep(1)   # 模拟等网络，这里让出控制权
    print(f"任务{n}完工")

async def main():
    await asyncio.gather(job(1), job(2), job(3))  # 三个一起跑

asyncio.run(main())
```
`gather` 把多个协程打包并发；`await` 是「这儿要等，先去忙别的」的标记。

> ⚠️ 易错：`await` 只能写在 `async def` 里；普通函数里写 `await` 直接报语法错。''',
                "事件循环=调度员，协程=用 async def 写、遇 await 会让出控制权的函数，任务=丢进循环的具体工单。asyncio.run 启动循环，gather 并发多个协程。记住：await 只能在 async 函数里用。",
                [fig("adv_event_loop", "🔁 事件循环当调度员：协程遇到 await 让出工位，循环去跑别的协程，回来再续上")],
                [word("COROUTINE", "协程：用 async def 定义、能中途让出的函数", "ˈkɔːruːtiːn"),
                 word("AWAIT", "await：标记「这里要等，先去忙别的」", "əˈweɪt"),
                 word("GATHER", "gather：把多个协程打包一起并发跑", "ˈɡæðər")],
                [choice("事件循环（Event Loop）扮演什么角色？",
                        ["调度员，决定哪个协程能跑", "一个具体要抓的网址", "一种数据库"],
                        0, "事件循环负责调度所有协程，是 asyncio 的发动机。"),
                 fill("用 `async def` 定义的函数叫______（填两个字：协/线/进）。",
                      "协程", "async def 定义的是协程（coroutine）。"),
                 order("把 asyncio 跑起来的正常顺序排一排：",
                       ["定义 async def 协程函数", "在 main 里用 gather/create_task 组织协程",
                        "调用 asyncio.run(main()) 启动事件循环", "协程内用 await 标记等待点"],
                       "顺序：先写协程函数→在组织处排活→run 启动循环；await 写在协程内部。"),
                 choice("下面哪句会直接语法报错？",
                        ["在 async def 里写 await", "在普通 def 里写 await", "用 asyncio.run 启动"],
                        1, "await 只能出现在 async 函数内部，普通函数里写会语法错误。"),
                 openq("用一句话比喻「协程遇到 await 让出控制权」这件事，让别人一听就懂。",
                       "像打瞌睡的员工：活干到要等别人的时候，把工位让给同事先干，等自己那份好了再回来接着干。")],
                ["打开 Python，把上面的三件套骨架敲一遍，看三个任务是不是「几乎同时」完工。",
                 "故意在普通 def 里写一句 await，看报错长什么样，记住这个坑。",
                 "把「事件循环=调度员」画成一张小图贴在显示器边。"]),

            les("a1l3", "aiohttp 并发抓取：把 asyncio 用在网络上", "🌐", "#5b8fc4",
                '''## aiohttp：异步版的 requests

`requests` 是同步的，会阻塞；`aiohttp` 是异步的，配合 `async with` + `await` 才能并发抓。

### 单发 vs 并发
```python
import aiohttp, asyncio

async def fetch(session, url):
    async with session.get(url) as resp:
        return await resp.text()   # await：等响应时不空转

async def main():
    urls = ["https://example.com"] * 5
    async with aiohttp.ClientSession() as session:
        tasks = [fetch(session, u) for u in urls]
        htmls = await asyncio.gather(*tasks)   # 5 个并发飞出
    print(len(htmls))

asyncio.run(main())
```
关键点：**一个 `ClientSession` 复用**；`fetch` 里两处 `await`（等连接、等正文）都是让出点。

### 为什么快
5 个网址同时飞出去，总耗时≈最慢那一个的单程，而不是 5 个相加。这正是异步的爽点。

> ⚠️ 易错：别在 `async with session.get()` 里漏了 `await`；`resp.text()` 也要 `await`，否则拿到的是协程对象不是字符串。''',
                "aiohttp 是异步版 requests：用 async with session.get(url) 发请求，await resp.text() 拿正文。一个 ClientSession 复用，gather 把多个 fetch 并发。两处都要 await，漏了就拿到协程而非字符串。",
                [fig("adv_sync_vs_async", "🌐 用 aiohttp + gather：多个请求同时飞出，总耗时≈最慢一个而非相加")],
                [word("AIOHTTP", "aiohttp：支持异步的 HTTP 客户端库", "eɪ aɪ oʊ ˈeɪtʃˈtiˈtiˈpi"),
                 word("SESSION", "ClientSession：可复用的会话，管连接池", "ˈsɛʃən"),
                 word("CLIENT", "Client：客户端，这里指发请求的一方", "ˈklaɪənt")],
                [choice("下面哪段才能正确异步拿到网页正文？",
                        ["html = session.get(url).text", "async with session.get(url) as r: html = await r.text()", "html = await session.get(url)"],
                        1, "必须 await 响应对象，再 await r.text() 取正文；漏 await 拿不到字符串。"),
                 fill("多个协程要一起并发，常用 `asyncio.______(*tasks)` 打包。（填一个词）",
                      "gather", "asyncio.gather 把多个协程并发执行并收集结果。"),
                 tap("用 aiohttp 抓一个网址，哪些地方必须 await？（多选）",
                     ["session.get(url) 拿到响应", "resp.text() 取正文", "创建任务列表", "import aiohttp"],
                     [0, 1], "get 拿到响应、text 取正文都是等待点需 await；建列表和 import 不需。"),
                 choice("复用哪个对象能省下反复建连接的开销？",
                        ["每次新建 requests", "一个 ClientSession 复用", "每请求 new 一个 socket"],
                        1, "ClientSession 带连接池，复用它比每次新建高效得多。"),
                 openq("为什么说 aiohttp 并发抓 5 个网址的总耗时≈最慢那一个，而不是 5 个相加？",
                       "因为 5 个请求在事件循环里几乎是同时发出的，各自在等自己响应时让出控制权，彼此不排队，所以总时间由最慢的那个决定。")],
                ["装 aiohttp：`pip install aiohttp`，把上面的并发骨架跑通，对比同步版计时。",
                 "把 urls 换成 3 个不同网站，看并发是否真的「同时」返回。",
                 "故意漏掉一个 await 运行，观察报错信息并记住。"]),

            les("a1l4", "信号量限速：并发不是无穷大", "🚦", "#5b8fc4",
                '''## 信号量（Semaphore）：给并发拧个水龙头

并发越多越快？**错**。一次性甩 10000 个请求会把对方服务器冲垮，也可能把自己 IP 搞封，还可能把本机内存撑爆。

### 信号量 = 同时最多跑 N 个
`asyncio.Semaphore(5)` 表示同一时刻最多 5 个协程在跑，其余排队。

```python
sem = asyncio.Semaphore(5)

async def fetch(session, url):
    async with sem:                      # 占一个名额，用完归还
        async with session.get(url) as r:
            return await r.text()
```
`async with sem` 像进洗手间占坑位：坑满了就在门外等，出来一个进一个。

### 限速三件套
1. **Semaphore** 限制同时并发数
2. **delay** 每次请求间随机睡一小会儿
3. **限总 QPS**（每秒请求数）更稳

> 💡 重点：**信号量限制的是「同时跑几个」，不是「跑得多快」**。它防的是把对方冲垮，不是提速。很多人误会它能加速，其实恰恰相反——它是主动踩刹车。''',
                "信号量 Semaphore(N) 限制同一时刻最多 N 个协程并发，像占坑位，满了就排队。它是主动限速、防冲垮服务器/防封 IP，不是提速。配合随机延迟和限 QPS 更稳。",
                [fig("adv_semaphore", "🚦 Semaphore(5)：5 个坑位，满了排队；限制的是同时并发数，是踩刹车不是加油门")],
                [word("SEMAPHORE", "信号量：限制同时运行的协程数量", "ˈsɛməfɔːr"),
                 word("CONCURRENT", "并发：同一时段多个任务都在推进", "kənˈkʌrənt"),
                 word("THROTTLE", "限速：主动控制速度，别冲垮对方", "ˈθrɑːtl")],
                [choice("Semaphore(5) 是什么意思？",
                        ["最多同时跑 5 个协程", "总共只能发 5 个请求", "每个请求限速 5 秒"],
                        0, "信号量限制并发度，不是总次数也不是单请求耗时。"),
                 choice("信号量主要作用是？",
                        ["让爬虫跑得更快", "主动限速、防止冲垮服务器或封 IP", "把结果排好序"],
                        1, "它是踩刹车，限制同时并发，保护对方也保护自己。"),
                 fill("`async with ______` 能在进入时占一个名额、退出时归还，用来做并发限速。（填英文名）",
                      "sem", "async with sem 用信号量占位/归还，实现并发上限。"),
                 tap("下列哪些是稳妥的限速手段？（多选）",
                     ["用 Semaphore 限制并发数", "每次请求间随机 sleep 一小会儿", "一次性甩 10000 个请求", "限制每秒请求数 QPS"],
                     [0, 1, 3], "一次性狂发会冲垮服务器/被封；其余都是稳妥限速。"),
                 openq("为什么说「并发不是越大越好」？举一个后果。",
                       "并发过大可能瞬间冲垮目标服务器触发封 IP，也可能耗尽本机内存或打满本地端口，反而全崩。信号量是主动刹车。")],
                ["把上节的并发例子加上 Semaphore(3)，抓 10 个网址，观察是否最多 3 个同时在跑。",
                 "在 fetch 里加一行 `await asyncio.sleep(random.uniform(0.1,0.3))`，体会随机延迟。",
                 "记住一句话写下来：信号量限制同时几个，不是提速。"]),

            les("a1l5", "异步异常处理与超时：别让一个挂了全崩", "⏱️", "#5b8fc4",
                '''## 单个请求挂了，凭什么连累全场？

并发抓 100 个网址，第 50 个超时，**如果不用 try 包住**，整个 `gather` 可能直接抛异常，剩下 50 个白抓。所以每个 `fetch` 都要自己兜底。

### try/except 包住单个任务
```python
async def fetch(session, url):
    try:
        async with session.get(url, timeout=10) as r:
            return await r.text()
    except Exception as e:
        print(f"{url} 翻车：{e}")
        return None
```
`timeout=10` 表示等 10 秒没响应就放弃，不无限干等。

### gather 的两种脾气
- `asyncio.gather(*tasks)`：**一个抛异常，全部报错**（默认）。
- `asyncio.gather(*tasks, return_exceptions=True)`：**单个失败只返回异常对象，其余照常**。✅ 推荐。

### 超时三板斧
1. `client.get(timeout=10)` 单请求超时
2. `asyncio.wait_for(coro, 10)` 给任意协程加时限
3. 外层再包 try，确保返回值可处理

> ⚠️ 易错：`timeout` 参数在 aiohttp 里是 `aiohttp.ClientTimeout` 或简写秒数，写错位置会不生效。''',
                "每个 fetch 用 try/except 兜底，单请求设 timeout=10 防无限等。gather 加 return_exceptions=True，让一个失败不影响其余。超时可用 client 的 timeout 或 asyncio.wait_for。核心：别让一个挂了拖垮全场。",
                [fig("adv_retry_429", "⏱️ 单请求 try 兜底 + 超时：一个翻车返回 None，其余继续，全场不崩")],
                [word("TIMEOUT", "超时：等这么久还没响应就放弃", "ˈtaɪmaʊt"),
                 word("EXCEPT", "except：捕获异常、防止程序崩溃", "ɪkˈsɛpt"),
                 word("RETURN_EX", "return_exceptions：让单个失败不影响其余", "rɪˈtɜːrn ɪkˈsɛpʃənz")],
                [choice("gather 默认（不加 return_exceptions）时，一个任务抛异常会？",
                        ["只那个任务失败，其余照常", "整个 gather 报错，其余也拿不到", "自动重试那个任务"],
                        1, "默认情况下一个异常会冒泡，导致整个 gather 失败。"),
                 fill("给单个请求加 `timeout=__`，等待超过这个数就放弃，避免无限干等。（填数字示例）",
                      "10", "timeout=10 表示等 10 秒无响应就放弃。"),
                 choice("想让「一个失败不影响其余」，该怎么写？",
                        ["gather(*t)", "gather(*t, return_exceptions=True)", "try 包住 gather"],
                        1, "return_exceptions=True 让失败任务只返回异常对象，其余正常。"),
                 tap("下列哪些能防止「一个请求卡死拖垮全场」？（多选）",
                     ["每个 fetch 用 try/except 兜底", "给请求设 timeout", "gather 用 return_exceptions=True", "把所有请求写在一个函数里"],
                     [0, 1, 2], "单独兜底+超时+return_exceptions 三件套防雪崩；堆一个函数没用。"),
                 openq("为什么并发爬虫里「每个任务自己 try 兜底」比「外层一个 try 包全部」更稳？",
                       "因为外层一个 try 一旦捕获异常就会中断整批，已发的其余请求结果也丢了；每个任务内部兜底能让失败的单挑出局、其余照常拿到结果。")],
                ["把 fetch 故意指向一个不存在的网址，分别试「不加兜底」和「加 try+return_exceptions」，对比结果。",
                 "给请求设 timeout=2，抓一个超慢的网址，看是否按时放弃。",
                 "写一条规则：凡 gather 必带 return_exceptions=True。"]),
        ]),
        # ===================== 第2章 httpx 与现代客户端 =====================
        ch("httpx 与现代客户端", "🚀", "#3a9d5d", [
            les("a2l1", "httpx：一个库，同步异步一体", "🔀", "#3a9d5d",
                '''## httpx：一个库，两种活法

`requests` 只能同步；`aiohttp` 只能异步。httpx 两者通吃——**同一个 API，加个 `async` 就能异步**，迁移成本极低。

### 同步写法（和 requests 几乎一样）
```python
import httpx
r = httpx.get("https://example.com")
print(r.status_code, len(r.text))
```
### 异步写法（加 async/await）
```python
import httpx, asyncio
async def main():
    async with httpx.AsyncClient() as c:
        r = await c.get("https://example.com")
        print(r.status_code)
asyncio.run(main())
```
> 注意：同步用 `httpx.get`；异步用 `httpx.AsyncClient()` + `await c.get`。**别混**：异步函数里调同步 `httpx.get` 会阻塞事件循环，前功尽弃。

### 速记
| 场景 | 用 |
|---|---|
| 简单脚本、懒得改 | 同步 httpx.get |
| 高并发抓取 | AsyncClient + await |''',
                "httpx 一个库通吃同步/异步：同步 httpx.get；异步 httpx.AsyncClient()+await c.get。千万别在 async 里用同步 get，会阻塞事件循环拖垮并发。",
                [fig("request_response", "🔀 httpx 同步 httpx.get vs 异步 AsyncClient+await：同一套 API，加 async 即可并发")],
                [word("HTTPX", "httpx：同时支持同步与异步的 HTTP 客户端库", "eɪtʃˈtiˈtiˈpi ɛks"),
                 word("ASYNCCLIENT", "AsyncClient：httpx 的异步客户端", "əˈsɪŋk ˈklaɪənt"),
                 word("MIGRATE", "迁移：从 requests 换过来几乎不改写法", "ˈmaɪɡreɪt")],
                [choice("下列哪个库既能同步又能异步？",
                        ["requests", "aiohttp", "httpx"], 2, "httpx 一套 API 同时支持同步和异步。"),
                 fill("异步要用 `httpx.______()` 而不是 `httpx.get`。（填类名）",
                      "AsyncClient", "异步用 httpx.AsyncClient() 上下文管理器。"),
                 tap("异步 httpx 的正确姿势有哪些？（多选）",
                     ["用 AsyncClient", "用 await c.get", "写在 async def 里", "在 async 里用同步 httpx.get 也行"],
                     [0, 1, 2], "异步必须 AsyncClient+await 且写在 async 函数内；混用同步 get 会阻塞循环。"),
                 choice("在 async 函数里误用同步 httpx.get 会怎样？",
                        ["完全没问题", "阻塞事件循环、拖垮并发", "自动变成异步"],
                        1, "同步调用会卡住单线程事件循环，并发优势全没。"),
                 openq("为什么说从 requests 迁移到 httpx 比换 aiohttp 成本低？",
                       "因为 httpx 同步写法和 requests 几乎一样，只想异步时加 AsyncClient 和 await 即可，不用重写整套请求逻辑。")],
                ["装 httpx，分别跑同步版和异步版抓同一网址，对比代码差异。",
                 "故意在 async 函数里用同步 httpx.get，观察是否一下子变慢。",
                 "记一句口诀：异步必用 AsyncClient 配 await。"]),

            les("a2l2", "连接池复用：别每次都握手", "🔗", "#3a9d5d",
                '''## 连接池：省掉重复握手

每次发请求都要 TCP 三次握手 + TLS 加密握手，挺费时。**连接池**把建好的连接缓存复用，下次直接发数据。

### httpx 默认就带池
```python
async with httpx.AsyncClient() as c:   # 内部维护连接池
    for u in urls:
        r = await c.get(u)             # 复用连接，不每次重握
```
一个 `AsyncClient` 生命周期内，连同一主机自动复用连接。

### 手动拧池大小
```python
limits = httpx.Limits(max_connections=100, max_keepalive_connections=20)
async with httpx.AsyncClient(limits=limits) as c:
    ...
```
- `max_connections`：最多同时开多少连接
- `max_keepalive_connections`：池里留多少个保活

> 💡 池太小→并发上不去；池太大→打爆对方或本机端口耗尽。配合信号量一起调。''',
                "连接池缓存已建连接、省掉重复握手；httpx 的 AsyncClient 默认带池。Limits 调 max_connections 与 max_keepalive；太大可能打爆对方或耗光端口，要配合信号量。",
                [fig("adv_httpx_pool", "🔗 连接池复用：建好的 TCP/TLS 连接缓存起来，下次直接发数据，省掉握手")],
                [word("LIMITS", "Limits：httpx 里控制连接池大小的配置", "ˈlɪmɪts"),
                 word("KEEPALIVE", "保活连接：池里留着、随时能用的连接", "ˈkiːp əˈlaɪv"),
                 word("POOL", "连接池：复用连接的缓冲", "puːl")],
                [choice("连接池主要省掉什么开销？",
                        ["握手建连的开销", "解析 HTML", "写磁盘"], 0, "池复用已建立的连接，避免每次重复 TCP/TLS 握手。"),
                 fill("AsyncClient 内部自带______池（填两字：连接/线程/进程）。",
                      "连接", "httpx 客户端默认维护连接池。"),
                 choice("关于池大小，正确的是？",
                        ["越大越好", "太小并发上不去、太大可能打爆对方", "和并发完全无关"],
                        1, "池要适中：太小限并发，太大有打爆对端或耗尽本机端口的风险。"),
                 tap("下列哪些是 httpx.Limits 的参数？（多选）",
                     ["max_connections", "max_keepalive_connections", "timeout", "retries"],
                     [0, 1], "Limits 管连接数；timeout/retries 不是 Limits 字段。"),
                 openq("为什么「连接池太大」反而有风险？举个具体后果。",
                       "池太大意味着同时开大量连接，可能瞬间压垮目标服务器触发封禁，也可能耗尽本机端口或文件描述符导致程序报错。")],
                ["把上节并发例子改成复用同一个 AsyncClient，看是否更快更稳定。",
                 "设一个很小的 max_connections=2，抓 10 个网址感受并发受限。",
                 "记住：池大小要配合信号量一起调。"]),

            les("a2l3", "异步解析并行抠数据", "⚡", "#3a9d5d",
                '''## 抓和解析，都能并行

很多人以为「异步只管发请求」。其实**解析（抠数据）也能并发**——抓回来一堆 HTML，用 asyncio 把解析也并行掉，CPU 不闲着。

### 抓+解析流水线
```python
from lxml import html as lxml_html
async def parse_one(raw):
    doc = lxml_html.fromstring(raw)
    return doc.xpath("//h1/text()")   # 解析也能是协程里的活

async def main():
    htmls = await asyncio.gather(*[fetch(u) for u in urls])
    results = await asyncio.gather(*[parse_one(h) for h in htmls])
```
`gather` 第二次把「解析」也并发了，N 个页面同时抠。

### 真正的坑：CPU 密集会卡循环
解析、正则、算哈希都是 **CPU 活**。asyncio 是单线程，一个协程狂算会卡住事件循环，别人等不了。解法：丢给线程池 `await asyncio.to_thread(重活)`。

> ⚠️ 易错：把超重的 CPU 解析直接写在协程里，会拖累全部并发。重活用 `asyncio.to_thread(...)` 挪到别的线程。''',
                "抓和解析都能用 gather 并发；但 CPU 重的解析会卡单线程事件循环，要用 asyncio.to_thread 挪到别的线程，否则拖累全场并发。",
                [fig("adv_event_loop", "⚡ 事件循环调度「抓」和「解析」：两者都能并发进循环，重 CPU 活用 to_thread 挪走")],
                [word("PARSE", "解析：从 HTML 里抠出结构化数据", "pɑːrs"),
                 word("TOTHREAD", "to_thread：把重活丢到别的线程跑", "tə ˈθrɛd"),
                 word("PIPELINE", "流水线：抓→解析→存，一环接一环", "ˈpaɪplaɪn")],
                [choice("解析（抠数据）能放进 asyncio 并发吗？",
                        ["不能，只能同步", "能，用 gather 把解析也并发", "必须用多进程"],
                        1, "解析本身可以是协程里的步骤，用 gather 并发多个页面解析。"),
                 fill("超重的 CPU 解析活要挪到别的线程，用 `await asyncio.______(重活)`。",
                      "to_thread", "asyncio.to_thread 把阻塞/CPU 重活移到线程池，不卡事件循环。"),
                 choice("单线程 asyncio 里一个协程狂算哈希会怎样？",
                        ["不影响别人", "卡住事件循环、拖累全部并发", "自动开新核并行"],
                        1, "单线程下重 CPU 活会占住循环，其他协程等不了。"),
                 tap("下列哪些环节可以并发（多选）",
                     ["并发发请求", "并发解析 HTML", "并发写数据库", "串行干等网络"],
                     [0, 1, 2], "抓、解析、写库都能并发；串行等网络恰恰是要避免的。"),
                 openq("为什么「抓和解析都并发」比「先全抓完再一个个解析」快？",
                       "后者解析阶段是串行的，N 个页面要一个个抠；前者用 gather 把解析也并发，多个页面同时抠，整体耗时大幅下降。")],
                ["把 fetch 和 parse 串成两段 gather，跑 5 个页面看总耗时。",
                 "故意把一段重正则写在协程里狂跑，观察是否拖累别的请求。",
                 "记住口诀：CPU 重活 to_thread。"]),

            les("a2l4", "指数退避应对 429", "🔁", "#3a9d5d",
                '''## 429 = 你太快了，歇会儿

服务器回 `429 Too Many Requests`，意思是「你请求太频繁」。硬重试会越撞越封。**指数退避**：第一次等 1s，再失败等 2s、4s、8s……翻倍增长，给服务器喘口气。

### 退避模板
```python
import asyncio, httpx
async def get_with_retry(c, url, max_tries=5):
    wait = 1
    for i in range(max_tries):
        r = await c.get(url)
        if r.status_code == 200:
            return r.text
        if r.status_code == 429:
            await asyncio.sleep(wait)   # 退避
            wait *= 2                    # 翻倍
            continue
        return None
    return None
```
### 加抖动更稳
纯翻倍可能和别的客户端「同频」撞车，加一点随机 `wait *= (0.5 + random.random())` 错峰。

> ⚠️ 易错：退避只对「可重试」错误（429/5xx 超时）有意义；404 这种永久错误重试没用，直接放弃。''',
                "429=请求太频繁。指数退避：等 1s→2s→4s 翻倍，并加随机抖动错峰；只对 429/5xx 等可重试错误有意义，404 直接放弃。",
                [fig("adv_retry_429", "🔁 指数退避：1s→2s→4s 翻倍等，429 时给服务器喘口气，避免越撞越封")],
                [word("BACKOFF", "退避：失败后等一会再试，且越等越久", "ˈbækɔːf"),
                 word("RETRY", "重试：失败了再发一次", "ˈriːtraɪ"),
                 word("JITTER", "抖动：加随机量错峰，避免同频撞车", "ˈdʒɪtər")],
                [choice("429 状态码表示？",
                        ["页面不存在", "请求太频繁、请慢点", "服务器崩了"],
                        1, "429 Too Many Requests = 频率过高。"),
                 fill("指数退避是等待时间逐次______（填两字：翻倍/减半/随机）。",
                      "翻倍", "指数退避每次等待乘以 2。"),
                 choice("下面哪种错误重试通常没意义？",
                        ["429", "500 超时", "404 页面不存在"],
                        2, "404 是永久不存在，重试也不会变出页面。"),
                 tap("让退避更稳的做法有哪些？（多选）",
                     ["等待时间翻倍", "加随机抖动错峰", "对 404 也死命重试", "设最大重试次数"],
                     [0, 1, 3], "404 不该重试；翻倍+抖动+上限才是稳妥退避。"),
                 openq("为什么「加随机抖动」能避免和别的爬虫同频撞车？",
                       "如果所有客户端都用同样的 1-2-4-8 节奏，会在同一时刻集体重试 again 撞击服务器；加随机让大家的 retry 时间错开，峰值被削平。")],
                ["写个 get_with_retry，故意请求一个会限频的接口，看退避是否生效。",
                 "给退避加随机抖动，对比纯翻倍的节奏。",
                 "记一句：404 不重试，429/5xx 才退避。"]),
        ]),
        # ===================== 第3章 高效解析 XPath =====================
        ch("高效解析 XPath", "🧭", "#6a8fd4", [
            les("a3l1", "lxml 与 XPath：用路径点名元素", "🎯", "#6a8fd4",
                '''## XPath：用路径精确点名网页元素

BeautifulSoup 用 .find 慢慢找；XPath 像「文件系统路径」，`/html/body/div[1]/h1` 一步直达。lxml 是跑得最快的 XPath 引擎。

### 最小例子
```python
from lxml import html
doc = html.fromstring(html_text)
titles = doc.xpath("//h1/text()")          # 所有 h1 的文字
links = doc.xpath("//a/@href")             # 所有 a 的链接
```
- `//` 表示「任意层级往下找」
- `/text()` 取文字，`/@href` 取属性

### 对比 BS4
| | 写法 | 速度 |
|---|---|---|
| BS4 find | 一步步导航 | 较慢 |
| XPath | 一条路径直达 | 快很多 |

> 💡 XPath 用「路径 + 条件」定位，适合层层嵌套、规则固定的页面；正则适合非结构文本。''',
                "XPath 用路径精确点名元素，// 任意层级、/text() 取文字、/@href 取属性。lxml 是速度最快的 XPath 引擎，适合嵌套深、规则固定的页面。",
                [fig("adv_xpath_tree", "🎯 XPath 像文件路径：//h1/text() 一步直达，lxml 引擎最快")],
                [word("XPATH", "XPath：用路径语法在 XML/HTML 里定位节点", "ɛks pɑːθ"),
                 word("LXML", "lxml：高效的 XML/HTML 解析库，支持 XPath", "ɛl ɛks ɛm ɛl"),
                 word("NODE", "节点：HTML 树里的一个元素/文字", "noʊd")],
                [choice("XPath 里 `//` 表示？",
                        ["只找直接子节点", "任意层级往下找", "找属性"],
                        1, "// 表示跨任意层级 descendant。"),
                 fill("`doc.xpath(\"//a/@____\")` 才能拿到链接地址（填属性名）。",
                      "href", "//a/@href 取 a 标签的 href 属性。"),
                 choice("关于 lxml 与 BeautifulSoup，正确的是？",
                        ["lxml 用 XPath 且更快", "BS4 永远更快", "两者不能共存"],
                        0, "lxml+XPath 通常比 BS4 的纯 Python 导航更快。"),
                 tap("下列哪些是 XPath 常见用法（多选）",
                     ["//h1/text() 取文字", "//a/@href 取链接", "//div[1] 第一个 div", ".find 慢慢找"],
                     [0, 1, 2], "前三个是 XPath；.find 是 BS4 风格。"),
                 openq("什么场景下 XPath 比 BS4 的 find 更顺手？",
                       "当页面嵌套很深、要按「第几个」「某个属性」精确定位时，一条 XPath 直达比层层 find 更短更快。")],
                ["装 lxml，用 XPath 抠一个真实页面的标题和所有链接。",
                 "对比同样需求用 BS4 find 写出来的代码行数。",
                 "记一句：// 任意层级，/@属性 取属性。"]),

            les("a3l2", "轴与函数精准定位", "🧩", "#6a8fd4",
                '''## 轴（axis）与函数：在 XPath 里「找邻居」

光用标签路径不够。XPath 的「轴」能按**位置关系**找元素：父、子、兄弟、祖先。

### 常用轴
- `parent::` 父节点
- `following-sibling::` 后面的兄弟
- `ancestor::` 祖先

```python
doc.xpath("//span[@class='price']/parent::div")     # 价格的父 div
doc.xpath("//h2/following-sibling::p")               # h2 后面的 p
```
### 函数精准筛选
- `contains(@class,'item')` 类名包含 item
- `text()='确定'` 文字精确等于
- `last()` 最后一个；`position()=1` 第一个

> ⚠️ 易错：`//div[@class='a b']` 要求 class **完全等于** "a b"（顺序敏感）。多半该用 `contains(@class,'a')` 才稳。''',
                "XPath 轴按关系定位：parent（父）、following-sibling（后兄弟）、ancestor（祖先）。函数 contains(@class,'x') 比精确等于更稳，因为 class 多值顺序敏感。",
                [fig("adv_xpath_tree", "🧩 轴按关系找：parent 父 / following-sibling 后兄弟 / ancestor 祖先，contains 模糊匹配更稳")],
                [word("AXIS", "轴：按节点间关系（父/子/兄弟）定位", "ˈæksɪs"),
                 word("SIBLING", "兄弟节点：同级的前后元素", "ˈsɪblɪŋ"),
                 word("CONTAINS", "contains：判断包含某子串", "kənˈteɪnz")],
                [choice("`following-sibling::` 表示？",
                        ["父节点", "后面的兄弟节点", "祖先"],
                        1, "following-sibling 选中同级的后续兄弟。"),
                 fill("想匹配「类名包含 item」，用 `______(@class,'item')` 函数。",
                      "contains", "contains(@class,'x') 做子串匹配，不受多 class 顺序影响。"),
                 choice("`//div[@class='a b']` 为什么常匹配不到？",
                        ["顺序敏感要求完全相等", "div 不能用", "语法错误"],
                        0, "class 多值时顺序敏感，精确相等很难命中。"),
                 tap("下列哪些是 XPath 轴/函数（多选）",
                     ["parent::", "following-sibling::", "contains()", "position()"],
                     [0, 1, 2, 3], "四个都是 XPath 的轴或定位函数。"),
                 openq("什么情况你必须用「轴」而不是单纯标签路径？举一个。",
                       "比如要「取某个价格后面的说明文字」，用标签路径很难表达，但 //span[@class='price']/following-sibling::p 一句话就定位到兄弟节点。")],
                ["用轴写出「某新闻标题后面那段正文」的 XPath。",
                 "把 `[@class='x y']` 改成 contains 重写，对比命中率。",
                 "记一句：class 多值用 contains，别精确等于。"]),

            les("a3l3", "大规模解析性能优化", "🚀", "#6a8fd4",
                '''## 抓得快，解析也得跟得上

页面成千上万，解析慢会反成瓶颈。几条实战优化：

### 1. 编译 XPath
反复用同一条 XPath，先编译再跑，省重复解析表达式：
```python
from lxml import etree
xp = etree.XPath("//h1/text()")
xp(doc)   # 直接调，快
```
### 2. 别反复 fromstring
尽量一次解析、多次 xpath；大文件用 `iterparse` 边读边解，省内存。
### 3. 只取要的
XPath 直接定位到目标节点，别先抓整页再 Python 里筛。

> 💡 经验：解析占道时，先用 `cProfile` 看瓶颈；多数情况是「每条 XPath 没编译」或「在 Python 里做本可 XPath 完成的过滤」。''',
                "大规模解析优化：编译 XPath 复用、iterparse 流式省内存、XPath 直接定位目标而非整页抓回再筛。先用 cProfile 定位瓶颈。",
                [fig("adv_xpath_tree", "🚀 性能优化：编译 XPath 复用 + iterparse 流式 + 直接定位，别整页抓回再筛")],
                [word("COMPILE", "编译：把 XPath 表达式预编译复用", "kəmˈpaɪl"),
                 word("ITERPARSE", "iterparse：边读文件边解析，省内存", "ˈɪtər pɑːrs"),
                 word("PROFILE", "cProfile：给代码计时找瓶颈", "ˈproʊfaɪl")],
                [choice("反复用同一条 XPath，怎么提速？",
                        ["每次重新写", "先 etree.XPath 编译再调用", "改用正则"],
                        1, "编译后复用避免重复解析表达式。"),
                 fill("超大文件用 `______` 边读边解析，省内存。（填函数名）",
                      "iterparse", "iterparse 流式解析，不会整文件载入内存。"),
                 choice("解析成瓶颈时，第一步该？",
                        ["瞎改", "cProfile 看瓶颈在哪", "直接加机器"],
                        1, "先量化瓶颈，再针对性优化。"),
                 tap("下列哪些能提升解析性能（多选）",
                     ["编译 XPath", "用 iterparse 流式解析", "XPath 直接定位目标", "每次 fromstring 整页"],
                     [0, 1, 2], "前三个提速；每次整页 fromstring 反而浪费。"),
                 openq("为什么「在 Python 里筛」比「XPath 直接定位」慢？",
                       "XPath 在 C 层（lxml）直接定位目标节点，只返回要的数据；在 Python 里先取整页再过滤，多了序列化/循环开销，量大时差距明显。")],
                ["把一条常用 XPath 用 etree.XPath 编译，跑 1 万次对比耗时。",
                 "用 iterparse 解析一个大 XML，观察内存占用。",
                 "记住：瓶颈先 cProfile 再动手。"]),

            les("a3l4", "parsel：Scrapy 同款解析器", "🛠️", "#6a8fd4",
                '''## parsel：Scrapy 同款解析器

Scrapy 内部用的就是 **parsel**（底层也是 lxml）。它把 XPath 和 CSS 选择器包成一套顺手的 API，写爬虫极舒服。

### 两种选择器都能用
```python
from parsel import Selector
sel = Selector(text=html_text)
sel.xpath("//h1/text()").get()        # 取第一个
sel.xpath("//h1/text()").getall()     # 取全部
sel.css("h1::text").get()             # CSS 也能用
```
- `.get()` 取一个，`.getall()` 取全部
- 既能 XPath 又能 CSS，随意切

> 💡 学到 Scrapy 那章你会发现：`response.xpath(...)` 几乎是同一个味道——因为底层就是 parsel。''',
                "parsel 是 Scrapy 同款解析器（底层 lxml），同时支持 XPath 与 CSS，.get() 取一个、.getall() 取全部。学了它，Scrapy 的 response.xpath 无缝衔接。",
                [fig("adv_xpath_tree", "🛠️ parsel 同款：XPath 与 CSS 通吃，.get() 取一 .getall() 取全，Scrapy 底层就用它")],
                [word("PARSEL", "parsel：Scrapy 内置的解析库", "ˈpɑːrsəl"),
                 word("SELECTOR", "Selector：parsel 的选择器对象", "sɪˈlɛktər"),
                 word("GETALL", "getall：取所有匹配结果", "ɡɛt ɔːl")],
                [choice("parsel 底层基于？",
                        ["regex", "lxml", "BeautifulSoup"],
                        1, "parsel 构建于 lxml 之上。"),
                 fill("取全部匹配用 `.______()`，取第一个用 `.get()`。",
                      "getall", "getall 返回列表，get 返回单个。"),
                 choice("parsel 同时支持？",
                        ["只 XPath", "只 CSS", "XPath 和 CSS 都行"],
                        2, "parsel 两套选择器都支持。"),
                 tap("下列哪些是 parsel 用法（多选）",
                     ["Selector(text=...)", ".xpath().get()", ".css().getall()", "response 里也能用"],
                     [0, 1, 2, 3], "四个都是 parsel/Scrapy 的常见用法。"),
                 openq("为什么说「先学 parsel，Scrapy 上手零成本」？",
                       "因为 Scrapy 的 response 对象直接提供 .xpath/.css/.get/.getall，和 parsel 完全一致，提前练熟到 Scrapy 章节直接无缝衔接。")],
                ["装 parsel，用 XPath 和 CSS 两种方式抠同一个页面的标题。",
                 "对比 .get() 和 .getall() 的返回差异。",
                 "记一句：parsel = Scrapy 的亲儿子。"]),
        ]),
        # ===================== 第4章 Playwright 进阶 =====================
        # ===================== 阶段考①（覆盖 ch1-3） =====================
        exam("exam1", "阶段考①：异步·httpx·XPath", "📝", "#e0922f",
            '''## 阶段考①：异步 · httpx · XPath

这一考覆盖 **异步爬虫基础 / httpx 与现代客户端 / 高效解析 XPath** 三章。

**规则**：8 题，首次作答正确率 ≥ 80%（至少 7 题首次即对）才能过关，获得「阶段考①过关」勋章。没过关可以回去复习、重新挑战，不限次数。

把异步和解析的底层逻辑踩实，后面才跑得稳！''',
            "阶段考①过关 = 你真懂了 I/O 等待为何慢、asyncio 怎么并发、信号量限的是并发不是速度、httpx 连接池复用、XPath 轴与函数精准抠数据。底层稳了。",
            [choice("爬虫慢的主因是？",
                    ["CPU 算力不够", "I/O 等待（等网络）", "Python 太慢"],
                    1, "90% 时间在等网络，不是算。"),
             choice("GIL 背不背爬虫慢的锅？",
                    ["背，GIL 限了 I/O", "不背，GIL 限 CPU 并行，爬虫瓶颈是 I/O", "完全无关"],
                    1, "GIL 卡的是计算并行，爬虫卡的是等待。"),
             fill("异步函数里，真正会挂起等待的关键字是______。（填 await/async）",
                  "await", "await 才挂起等结果；async 只是声明协程。"),
             choice("在 asyncio 事件循环里调用同步阻塞函数（如 time.sleep）会？",
                    ["没事", "卡住整个事件循环，其他协程也动不了", "自动变异步"],
                    1, "同步阻塞会占住线程，协程全卡。"),
             choice("信号量(Semaphore)的作用是？",
                    ["让爬虫更快", "限制同时并发数（限流防封）", "去重"],
                    1, "信号量=限并发，不是提速。"),
             choice("httpx 相比 requests 的独特优势是？",
                    ["只能同步", "同步异步一体 + 连接池复用", "不支持异步"],
                    1, "httpx 一套代码同步异步都能跑。"),
             choice("遇到 429（请求过多），正确做法是？",
                    ["立刻猛刷", "指数退避后重试", "放弃"],
                    1, "429 要退避，猛刷只会被封更久。"),
             fill("XPath 中 `//div[@class='a']/text()` 的 `/text()` 用来取______。（填 文本/属性）",
                  "文本", "/text() 取标签内文字。"),
             choice("想取某节点「父节点」，XPath 用？",
                    ["//child", "parent:: 或 /..", "//sibling"],
                    1, "parent:: 或 .. 取父。"),
             choice("parsel 和 Scrapy 的关系是？",
                    ["毫无关系", "parsel 是 Scrapy 同款解析库", "parsel 是数据库"],
                    1, "parsel 就是 Scrapy 用的解析库，XPath/CSS 都行。")]),

        ch("Playwright 进阶", "🎭", "#c0659e", [
            les("a4l1", "为何比 Selenium 快：自动等待+原生通道", "⚡", "#c0659e",
                '''## Playwright 为什么比 Selenium 快

Selenium 每次操作走「WebDriver 协议 → 浏览器」，且**默认不等地等元素**，容易卡。Playwright 是微软出品，直接和多浏览器通信，关键差异：

### 1. 自动等待（Auto-Waiting）
Playwright 点元素前会**自动等它可见、可点**，不用手写 time.sleep。少等=快。
### 2. 协议更近
Selenium 多一层 WebDriver 中转；Playwright 用浏览器原生 CDP 通道，命令直达。
### 3. 轻量上下文并发
`browser.new_context()` 轻量隔离，并发开多个页比 Selenium 开多个浏览器进程省资源。

```python
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page()
    pg.goto("https://example.com")
    pg.click("text=更多")        # 自动等"更多"可点
    print(pg.title())
    b.close()
```
> 💡 但记住：能直接抓接口/HTML 就别上浏览器。Playwright 再快也比纯 requests 慢一个量级，它是「对付 JS 渲染」的利器，不是默认选择。''',
                "Playwright 快在自动等待+浏览器原生通道+轻量上下文；但它是对付 JS 渲染的利器，能直接抓接口/HTML 就别上浏览器，纯 requests 快一个量级。",
                [fig("selenium_dynamic", "⚡ Playwright 自动等待+CDP 直达 vs Selenium 多一层 WebDriver 中转：少等=快")],
                [word("PLAYWRIGHT", "Playwright：微软出的浏览器自动化库", "ˈpleɪraɪt"),
                 word("AUTO_WAIT", "自动等待：操作前自动等元素就绪", "ˈɔːtoʊ weɪt"),
                 word("CONTEXT", "上下文：轻量隔离的浏览器会话", "ˈkɑːntekst")],
                [choice("Playwright 比 Selenium 快的关键之一是？",
                        ["操作前自动等元素可点", "用更多 sleep", "不连浏览器"],
                        0, "自动等待省掉盲等，是快的重要原因。"),
                 fill("Playwright 点元素前会______等待，省掉手写 sleep。",
                      "自动", "Playwright 内置 auto-waiting。"),
                 choice("关于「什么时候用 Playwright」，正确的是？",
                        ["所有网站都该用", "能直接抓接口就别上浏览器", "它比 requests 还快"],
                        1, "浏览器开销大，能直接抓就别开浏览器。"),
                 tap("Playwright 相比 Selenium 的优势有哪些（多选）",
                     ["自动等待", "用浏览器原生通道更快", "轻量上下文并发", "必须装 WebDriver 中转"],
                     [0, 1, 2], "前三个是优势；WebDriver 中转是 Selenium 的特点。"),
                 openq("为什么说「Playwright 再快也比纯 requests 慢一个量级」？",
                       "因为开浏览器、渲染页面、跑 JS 本身开销巨大；纯 requests 只收发文本，量级上差很多。浏览器只用来对付 JS 渲染页面。")],
                ["装 playwright 并 `playwright install chromium`，跑上面的例子。",
                 "用 Selenium 写同样逻辑对比代码量和速度。",
                 "记一句：能直接抓就不开浏览器。"]),

            les("a4l2", "自动等待与选择器：少写 sleep", "🎯", "#c0659e",
                '''## 选择器与自动等待：少写 sleep

Playwright 选择器支持 text/CSS/XPath，且**任何操作前自动等元素就绪**。

### 常用选择器
```python
pg.click("text=登录")                 # 按可见文字
pg.click("#submit")                   # CSS id
pg.click("//button[@class='go']")     # XPath（加前缀）
pg.fill("input[name='user']", "xiaoming")
```
### 等待策略
```python
pg.wait_for_selector("#list", state="visible")
pg.wait_for_load_state("networkidle")   # 等网络安静
```
- `state="visible"` 等可见；`"attached"` 等挂上 DOM
- 别再用 `time.sleep(3)` 盲等，容易不稳

> ⚠️ 易错：用 `time.sleep` 盲等既慢又容易漏（网慢时 3 秒不够）。优先 `wait_for_selector` 等具体条件。''',
                "Playwright 支持 text/CSS/XPath 选择器且操作前自动等就绪；用 wait_for_selector 等具体条件，少用 time.sleep 盲等（慢且不稳）。",
                [fig("selenium_dynamic", "🎯 选择器：text/CSS/XPath 通吃；wait_for_selector 等具体条件而非盲等")],
                [word("SELECTOR", "选择器：定位页面元素的表达式", "sɪˈlɛktər"),
                 word("WAIT_FOR", "wait_for：等某个条件达成", "weɪt fɔːr"),
                 word("VISIBLE", "visible：元素可见状态", "ˈvɪzəbəl")],
                [choice("Playwright 点元素前会？",
                        ["直接点可能报错", "自动等元素可点再点", "先 sleep 5 秒"],
                        1, "auto-waiting 在操作前等元素可交互。"),
                 fill("按可见文字点按钮用 `pg.click(\"______=登录\")`。",
                      "text", "text= 按可见文字定位。"),
                 choice("为什么少用 time.sleep(3) 盲等？",
                        ["写起来太长", "慢且网慢时可能不够稳", "Playwright 不支持"],
                        1, "盲等既拖慢又容易在弱网下漏等。"),
                 tap("下列哪些是 Playwright 选择器写法（多选）",
                     ["text=登录", "#submit", "//button", "wait_for_selector"],
                     [0, 1, 2], "前三个是选择器；wait_for_selector 是等待 API 不是选择器。"),
                 openq("什么场景下「等网络安静 networkidle」比「等某个元素」更合适？",
                       "当数据由多个接口陆续返回、你不确定哪个元素先出现时，等 networkidle 比等单个元素更稳，能确保该加载的都加载完。")],
                ["用 text= 和 CSS 两种方式点同一个按钮，对比可读性。",
                 "把代码里的 sleep 全换成 wait_for_selector，看是否更稳。",
                 "记一句：盲等 sleep 是坏味道。"]),

            les("a4l3", "拦截网络请求直接抓接口", "🕸️", "#c0659e",
                '''## 不解析 HTML，直接截接口

很多页面数据其实是从接口（XHR/fetch）返回的 JSON。与其用 Playwright 渲染完再抠 DOM，**不如拦截网络请求，直接拿到接口返回**——又快又干净。

### 监听 + 抓取响应
```python
from playwright.sync_api import sync_playwright
def on_response(resp):
    if "/api/list" in resp.url:
        print(resp.json())          # 直接拿 JSON

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page()
    pg.on("response", on_response)   # 挂监听器
    pg.goto("https://example.com")
    b.close()
```
### 还能改请求
`pg.route("**/api/*", handler)` 能拦截并改写请求/返回，甚至**免登录伪造**。

> 💡 思路升级：先用 DevTools 的 Network 面板找到那个接口，再用 requests/aiohttp **直接打接口**，连浏览器都不用开——这是进阶最常用的一招。''',
                "拦截响应直接拿 JSON 比抠 DOM 快且干净；pg.on('response') 监听、pg.route 改写请求。找到接口后常用 requests/aiohttp 直接打，连浏览器都不开。",
                [fig("adv_pw_intercept", "🕸️ 拦截响应：直接拿接口 JSON，省掉渲染+抠 DOM；找到接口后可换 requests 直打")],
                [word("INTERCEPT", "拦截：截获网络请求/响应", "ˈɪntərsept"),
                 word("ROUTE", "route：拦截并改写请求", "ruːt"),
                 word("XHR", "XHR/fetch：前端发接口的两种方式", "ɛks eɪtʃ ɑːr")],
                [choice("拦截网络请求抓数据，相比解析 DOM 的优势是？",
                        ["更慢", "直接拿结构化 JSON 更快更干净", "必须完整渲染"],
                        1, "接口直接返回 JSON，省去渲染和 DOM 解析。"),
                 fill("监听响应用 `pg.______(\"response\", 回调)`。",
                      "on", "pg.on('response', cb) 注册响应监听。"),
                 choice("找到接口后，进阶常用做法是？",
                        ["继续用浏览器跑", "用 requests/aiohttp 直接打接口", "放弃不抓"],
                        1, "接口稳定后直接用 HTTP 库打，省浏览器开销。"),
                 tap("Playwright 网络相关能力有哪些（多选）",
                     ["on('response') 监听", "route 改写请求", "直接拿 resp.json()", "只能解析 DOM"],
                     [0, 1, 2], "前三个都是网络能力；解析 DOM 不是唯一手段。"),
                 openq("为什么说「先找接口再用 requests 直接打」是进阶爬虫的常用招？",
                       "浏览器只是为了「看见」接口地址和参数；一旦摸清，用轻量 HTTP 库直接打接口，速度快、资源省、还能并发，是性价比最高的做法。")],
                ["用 on('response') 抓一个页面的所有接口 URL 打印出来。",
                 "在 Network 面板找到某个 XHR，用 requests 单独打它验证。",
                 "记一句：浏览器是探路器，不是生产工具。"]),

            les("a4l4", "Cookie 持久化登录", "🍪", "#c0659e",
                '''## Cookie 持久化：登录一次，复用多次

很多站点要登录才能看数据。用 Playwright 登录一次，把 **Cookie 存下来**，之后用同一批 Cookie 直接进，不用每次重登。

### 存 Cookie
```python
pg.goto("https://site.com/login")
pg.fill("#user", "xiaoming"); pg.fill("#pwd", "123")
pg.click("text=登录")
storage = pg.context.storage_state()     # 含 Cookie + localStorage
import json; json.dump(storage, open("state.json","w"))
```
### 用 Cookie 复用
```python
context = b.new_context(storage_state="state.json")
pg = context.new_page()
pg.goto("https://site.com/inside")       # 直接是登录态
```
> ⚠️ 易错：Cookie 有时效，过期要重新登录；且多账号别混用同一份 state，否则串号。''',
                "登录一次用 storage_state 存 Cookie+localStorage，之后 new_context(storage_state=...) 直接进登录态。Cookie 有时效会过期，多账号要隔离别混用。",
                [fig("session_cookie", "🍪 Cookie 持久化：登录一次存 storage_state，后续复用直接进登录态")],
                [word("COOKIE", "Cookie：服务器发的身份凭证", "ˈkʊki"),
                 word("STORAGE_STATE", "storage_state：Playwright 存的登录态", "ˈstɔːrɪdʒ steɪt"),
                 word("PERSIST", "持久化：存下来下次直接用", "pərˈsɪst")],
                [choice("storage_state 里主要存了什么？",
                        ["只有 HTML", "Cookie + localStorage", "图片"],
                        1, "storage_state 保存登录态相关的 Cookie 和本地存储。"),
                 fill("复用登录态用 `b.new_context(storage_state=\"______\")`。",
                      "state.json", "传入存好的状态文件即可恢复登录。"),
                 choice("关于 Cookie 复用，正确的是？",
                        ["永不过期", "有时效、会过期需重登", "多账号可混用同一份"],
                        1, "Cookie 会过期，且多账号混用会串号。"),
                 tap("持久化登录的好处有哪些（多选）",
                     ["登录一次复用多次", "免每次输密码", "省去重复登录等待", "适合多账号隔离使用"],
                     [0, 1, 2], "前三个是好处；多账号还应隔离而非混用。"),
                 openq("为什么「多账号别混用同一份 state」？",
                       "同一份 state 只对应一个账号的登录凭证，混用会导致请求以错误身份发出，轻则数据串号，重则触发风控。")],
                ["用 Playwright 登录一个测试站，存 state.json 再复用。",
                 "故意用过期 state 访问，看是否跳回登录页。",
                 "记一句：Cookie 有时效，多账号要隔离。"]),

            les("a4l5", "反检测 stealth：隐藏指纹破绽", "🕵️", "#c0659e",
                '''## stealth：别让网站认出你是机器人

网站会收集「浏览器指纹」——UA、分辨率、字体、WebDriver 标记等。普通 Playwright 带着 `navigator.webdriver=true` 这种破绽，一眼机器人。

### 常见破绽与修补
- `navigator.webdriver` 应为 undefined（Playwright 默认 true）
- UA、platform 要像真浏览器
- 字体/插件列表别是空的

### 思路（不直接给绕过代码）
Playwright 可通过 `context.add_init_script()` 在每页加载前注入 JS，把 `webdriver` 等标记抹掉；或用社区 stealth 脚本。但**这属于攻防灰色地带**，只在你有权抓的站点、做合规测试时用。

> ⚠️ 红线：伪造指纹去突破人家明确禁止的防护 = 违法风险。第 13 章合规会细讲边界。''',
                "网站靠浏览器指纹（webdriver 标记/UA/字体）识别机器人；可用 add_init_script 抹掉 webdriver 等破绽，但属灰色地带，只在你有权抓、合规测试时用，突破明确禁止的防护有违法风险。",
                [fig("adv_pw_stealth", "🕵️ stealth：抹掉 navigator.webdriver 等指纹破绽；灰色地带，合规范围内才用")],
                [word("FINGERPRINT", "指纹：浏览器暴露的一堆特征集合", "ˈfɪŋɡərprɪnt"),
                 word("STEALTH", "隐身：隐藏自动化痕迹", "stɛlθ"),
                 word("WEBDRIVER", "webdriver：自动化标记，真浏览器为 undefined", "ˈwɛbdraɪvər")],
                [choice("网站靠什么认出你是机器人？",
                        ["只看 IP", "浏览器指纹(webdriver标记/UA等)", "看心情"],
                        1, "指纹是主要识别手段。"),
                 fill("Playwright 默认 `navigator.______=true` 是个明显破绽。",
                      "webdriver", "真实浏览器该字段为 undefined。"),
                 choice("关于 stealth 隐藏指纹，正确的是？",
                        ["随便用没关系", "属攻防灰色地带、只在合规范围用", "一定能骗过所有检测"],
                        1, "灰色地带，且检测在持续升级，没有万能。"),
                 tap("常见指纹破绽有哪些（多选）",
                     ["navigator.webdriver=true", "UA 不像真浏览器", "字体列表为空", "屏幕分辨率正常"],
                     [0, 1, 2], "前三个是典型破绽；正常分辨率反而像真人。"),
                 openq("为什么「伪造指纹突破明确禁止的防护」有法律风险？",
                       "那等于主动规避对方的技术防护措施去获取受限数据，可能触犯反不正当竞争或计算机相关法规，超出合规爬虫边界。")],
                ["了解 navigator.webdriver 等字段，知道自己「露怯」在哪。",
                 "读第 13 章合规边界，明确哪些不能碰。",
                 "记一句：指纹对抗是灰色地带，合规优先。"]),
        ]),
        # ===================== 第5章 JS 逆向·参数签名 =====================
        ch("JS 逆向·参数签名", "🔑", "#6a8fd4", [
            les("a5l1", "sign/token 从哪来：前端现算的防伪签名", "🔏", "#6a8fd4",
                '''## sign / token：请求里的「防伪签名」

很多接口不是裸奔的：发请求时带一个 `sign` 或 `token` 参数，服务器用同样算法验算，对得上才返数据。这叫**参数签名**，目的是防爬、防篡改。

### 它从哪来
签名通常由前端 JS 在点击/加载时用固定算法现算：
```
原始参数 k1=v1&k2=v2 + 密钥 salt → hash 算法 → sign=xxxx
```
你直接抄上次抓到的 sign 没用——它往往绑定时间戳，**过期就废**。

### 逆向要干的事
1. 在 DevTools 里找到「算 sign 的那段 JS」
2. 看懂它用了什么算法（md5/sha256/aes…）和密钥
3. 用 Python 复现同一算法，自己算 sign

> 💡 心态：签名不是密码学高墙，多半是「固定算法 + 固定盐」，只是藏得深。逆向=找算法+复现。''',
                "sign/token 是前端 JS 现算的防伪签名，常绑时间戳会过期，不能直接复用。逆向三步走：找算签名的 JS → 看懂算法和盐 → Python 复现。",
                [fig("adv_js_trace", "🔏 sign 由前端 JS 现算：参数+盐→hash→sign，绑时间戳会过期")],
                [word("SIGN", "签名：请求里防伪造的参数", "saɪn"),
                 word("TOKEN", "令牌：身份/权限的凭证串", "ˈtoʊkən"),
                 word("SALT", "盐：拼在参数里的固定密钥片段", "sɔːlt")],
                [choice("接口带的 sign 参数主要作用是？",
                        ["装饰", "防伪/防爬的签名", "分页"],
                        1, "sign 用于服务端校验请求合法性。"),
                 fill("sign 通常由前端 JS 用固定算法______算出来（填两字：现/预）。",
                      "现", "签名是运行时现算的，不是写死的。"),
                 choice("直接复用上次抓到的 sign 通常？",
                        ["永远有效", "因绑定时间戳等会过期", "服务器不校验"],
                        1, "带时间戳/随机数的签名复用即失效。"),
                 tap("逆向签名一般要做哪些（多选）",
                     ["找到算 sign 的 JS", "看懂算法和密钥", "用 Python 复现", "放弃不抓"],
                     [0, 1, 2], "前三步是标准逆向流程。"),
                 openq("为什么说「签名多半是固定算法+固定盐，只是藏得深」？",
                       "因为它本质还是确定性的哈希/加密运算，没有真正的随机密钥协商，只是代码被压缩混淆藏在 webpack 里，找到算法和盐就能复现。")],
                ["在 DevTools 里找一个带 sign 的接口，观察它长什么样。",
                 "思考：如果去掉 sign 直接请求会怎样？验证你的猜想。",
                 "记一句：逆向=找算法+复现。"]),

            les("a5l2", "用 DevTools 追密钥", "🔬", "#6a8fd4",
                '''## DevTools：逆向的第一现场

Chrome DevTools 的 **Sources（源码）** 和 **Network（网络）** 面板是追签名的主战场。

### 标准流程
1. Network 里点开那个接口，看 Request 的 Query/Body 里有没有 sign、timestamp
2. 在 Sources → XHR/fetch Breakpoints 对接口 URL 下断点
3. 刷新页面，断住后看**调用栈（Call Stack）**，一层层往上找「算 sign 的函数」
4. 在算 sign 的函数里下断点，看它读了哪些变量（盐、密钥）

### 小技巧
- 「格式化」按钮 `{}` 把压缩代码展开
- 搜索 `sign=` / `md5(` / `sha256(` 关键字定位

> ⚠️ 易错：断点下太粗会断一堆无关请求。先确定是哪个接口、哪个参数，再精准下断。''',
                "用 DevTools 的 Network 看请求里的 sign、Sources 下 XHR 断点+看调用栈找算签名的函数；压缩代码点 {} 格式化，搜 sign=/md5( 定位。断点要精准别太粗。",
                [fig("adv_js_trace", "🔬 DevTools：Network 看 sign → XHR 断点 → Call Stack 一层层追到算签名的函数")],
                [word("DEVTOOLS", "浏览器开发者工具", "dɛv tuːlz"),
                 word("BREAKPOINT", "断点：程序运行到此处暂停", "ˈbreɪkpɔɪnt"),
                 word("CALLSTACK", "调用栈：函数一层层调用的记录", "kɔːl stæk")],
                [choice("追签名最该用 DevTools 的哪两个面板？",
                        ["Console 和 Performance", "Sources 和 Network", "Elements 和 Lighthouse"],
                        1, "Sources 看代码、Network 看请求，是正主。"),
                 fill("在算 sign 的函数里下______点，能看清它读了哪些变量。",
                      "断", "断点让执行暂停，方便观察变量。"),
                 choice("压缩代码看不懂时，先点哪个按钮？",
                        ["{}", "🔍", "⏯"],
                        0, "{} 是格式化/美化代码按钮。"),
                 tap("追密钥的标准动作有哪些（多选）",
                     ["Network 看请求里的 sign", "XHR 断点", "看 Call Stack 调用栈", "搜 md5(/sha256( 关键字"],
                     [0, 1, 2, 3], "四个都是定位签名算法的常用手段。"),
                 openq("为什么「断点下太粗」会让你追得很痛苦？",
                       "粗断点会在每个无关请求上都暂停，你要在海量暂停里翻找真正算签名的那次，效率极低；精准下在目标接口/函数上才能直击要害。")],
                ["对一个真实接口练习：下 XHR 断点→看调用栈→定位算法函数。",
                 "用 {} 格式化一段压缩 JS，感受可读性变化。",
                 "记一句：先定接口再下断，别撒网。"]),

            les("a5l3", "Python 复现 md5/hash 签名", "🐍", "#6a8fd4",
                '''## Python 复现：把 JS 算法翻译成 Python

找到算法后，用 Python 的 `hashlib` 复现，自己算 sign。最常见是 md5/sha256 + 拼接固定盐。

### 复现示例（md5）
```python
import hashlib, time
def make_sign(params: dict, salt: str):
    s = "&".join(f"{k}={params[k]}" for k in sorted(params))  # 按 key 排序
    s += salt                                                   # 拼盐
    return hashlib.md5(s.encode()).hexdigest()                 # md5
params = {"page": 1, "t": int(time.time())}
print(make_sign(params, salt="abc123"))
```
### 对齐要点
- 排序方式（按 key？按出现顺序？）
- 盐在前面还是后面、是否拼时间戳
- 是否要转大写/去特定字符

> ⚠️ 易错：JS 里字符串可能是 UTF-8 也可能不是；中文参数编码方式要和 JS 完全一致，否则算出的 sign 对不上。''',
                "用 hashlib 复现：参数按 key 排序拼接 + 拼盐 + md5/sha256。对齐排序方式、盐位置、时间戳、UTF-8 编码；中文编码不一致是 sign 对不上的头号元凶。",
                [fig("adv_js_trace", "🐍 Python hashlib 复现：排序拼接+盐+md5，和 JS 逐字节对齐")],
                [word("HASHLIB", "hashlib：Python 哈希模块", "hæʃ lɪb"),
                 word("HEXDIGEST", "hexdigest：输出十六进制摘要", "hɛks ˈdaɪdʒɛst"),
                 word("SALT", "盐：拼在参数里的固定密钥", "sɔːlt")],
                [choice("Python 里算 md5 用哪个模块？",
                        ["hashlib", "base64", "json"],
                        0, "hashlib 提供 md5/sha 系列。"),
                 fill("参数通常要按 key ______后再拼接，才和 JS 一致。",
                      "排序", "排序保证拼接顺序确定。"),
                 choice("复现 sign 对不上，最该先查？",
                        ["网络", "中文参数的编码方式", "显示器"],
                        1, "编码不一致是 sign 对不上的头号原因。"),
                 tap("复现时要注意哪些（多选）",
                     ["参数排序方式", "盐的前后位置", "时间戳是否参与", "UTF-8 编码一致"],
                     [0, 1, 2, 3], "四个都是对齐要点。"),
                 openq("为什么「中文参数的编码」不一致会导致 sign 对不上？",
                       "md5/sha 是对字节算的，同一汉字在 UTF-8 和 GBK 下字节不同，哈希结果就不同；必须和 JS 用同一种编码。")],
                ["把上面的 make_sign 跑通，改 salt 看输出是否变化。",
                 "故意把排序改成不排序，对比 sign 差异。",
                 "记一句：编码不一致=sign 对不上。"]),

            les("a5l4", "读懂 webpack 打包", "📦", "#6a8fd4",
                '''## webpack：代码被打成了一团毛线

现代前端常用 webpack 把 JS 打包成一个大文件，函数被塞进一个超大数组/对象里，靠数字下标调用。逆向时你会发现：「算 sign 的函数」躲在 `modules[123]` 里，名字都没了。

### 典型长相
```js
var modules = [function(){...}, function(){...} /* 算 sign 的在这 */];
function __webpack_require__(i){ return modules[i](); }
```
### 怎么下手
1. 在 DevTools 里给 `__webpack_require__` 或目标模块下断点
2. 用「Conditional Breakpoint」只断你关心的模块号
3. 把那个模块的函数体**整体复制**出来，补上它依赖的小函数，在 Node 里跑通

> 💡 webpack 不是加密，只是「混淆+打包」。耐心一层层剥，总能找到算签名的那一块。''',
                "webpack 把函数塞进大数组靠下标调用、名字丢失，但没加密。逆向：给 __webpack_require__ 下断点、用条件断点定位目标模块、复制函数体到 Node 跑通。耐心剥层即可。",
                [fig("adv_webpack", "📦 webpack：函数塞进 modules 大数组靠下标调用，名字丢失但没加密")],
                [word("WEBPACK", "webpack：前端打包工具", "ˈwɛbpæk"),
                 word("MODULE", "模块：被打包进数组的一个代码块", "ˈmɑːdʒuːl"),
                 word("REQUIRE", "require：模块加载调用", "rɪˈkwaɪər")],
                [choice("webpack 打包后，函数通常？",
                        ["保留原名", "塞进大数组靠下标调用、名字丢失", "被加密无法读"],
                        1, "webpack 用数字下标引用模块，原函数名丢失。"),
                 fill("模块靠 `_______require__(下标)` 这种方式被调出来。",
                      "webpack", "__webpack_require 是 webpack 的模块加载器。"),
                 choice("关于 webpack，正确的是？",
                        ["是加密算法", "只是混淆+打包，可逆向", "完全无法读"],
                        1, "没加密，只是打包混淆。"),
                 tap("逆向 webpack 的手法有哪些（多选）",
                     ["给 __webpack_require__ 下断点", "用条件断点只断目标模块", "复制目标模块函数体到 Node 跑", "直接放弃"],
                     [0, 1, 2], "前三步是标准手法。"),
                 openq("为什么说「webpack 不是加密，只是打包混淆」？",
                       "它只是把代码重组、改名、合并，逻辑依然以明文 JS 存在，可被 DevTools 断点和复制出来执行，远未到加密不可读的程度。")],
                ["找一段 webpack 打包的代码，用 {} 格式化后观察 modules 结构。",
                 "练习用条件断点只断某个模块号。",
                 "记一句：webpack=毛线团，耐心剥。"]),

            les("a5l5", "实战模拟生成签名（AES/RSA 思路）", "🧪", "#6a8fd4",
                '''## 实战：模拟一个签名生成

综合前几节，我们手搓一个「前端算 sign」的最小模型，并用 Python 复现。这里用 **AES** 思路示意（RSA 见下）。

### 场景：参数 + 时间戳 → AES 加密当 token
```python
from Crypto.Cipher import AES
import time, base64, json
def make_token(data: dict, key: bytes):
    body = json.dumps(data, separators=(",",":")).encode()
    pad = body + b"\\x00" * ((16 - len(body) % 16) % 16)   # 补到 16 倍数
    c = AES.new(key, AES.MODE_ECB).encrypt(pad)
    return base64.b64encode(c).decode()
token = make_token({"uid": 7, "t": int(time.time())}, b"16byteskey!!!!!!")
```
### 思路对照
- **对称 AES**：同一把 key 加解密，快，key 泄露即崩 → 常用于前端
- **非对称 RSA**：公钥加密、私钥解密，私钥藏服务端，前端拿不到 → 更安全但前端难复现

> ⚠️ 易错：AES 密钥长度必须是 16/24/32 字节，明文要补齐到块倍数，否则报错——这正是逆向时 JS 里那段「补位逻辑」要抄对的地方。''',
                "实战用 AES 把参数+时间戳加密当 token：密钥须 16/24/32 字节、明文补到块倍数。AES 对称快但 key 泄露即崩；RSA 私钥在服务端前端拿不到、更安全但难复现。补位逻辑要和 JS 抄一致。",
                [fig("adv_js_trace", "🧪 AES 对称 vs RSA 非对称：前端多用 AES（key 易泄露），RSA 私钥在服务端难复现")],
                [word("AES", "AES：对称加密算法", "eɪ iː ɛs"),
                 word("RSA", "RSA：非对称加密算法", "ɑːr ɛs eɪ"),
                 word("PADDING", "补位：把明文补齐到块倍数", "ˈpædɪŋ")],
                [choice("AES 属于哪类加密？",
                        ["对称(同钥匙加解密)", "非对称(公私钥)", "哈希"],
                        0, "AES 用同一把密钥加解密。"),
                 fill("AES 密钥长度必须是 16/24/______ 字节之一。",
                      "32", "AES-128/192/256 对应 16/24/32 字节。"),
                 choice("RSA 为什么前端难复现？",
                        ["算法太难", "私钥在服务端前端拿不到", "不支持 Python"],
                        1, "私钥不下发前端，缺私钥就无法完成对应运算。"),
                 tap("关于 AES 补位，正确的是（多选）",
                     ["明文要补齐到块倍数", "密钥长度受限", "直接加密任意长度也不会错", "补位逻辑要和 JS 一致"],
                     [0, 1, 3], "补位是必须的，且与 JS 对齐才能复现。"),
                 openq("对称 AES 和非对称 RSA，在「爬虫逆向」场景下各有什么利弊？",
                       "AES 对称、快、前端易集成但密钥易泄露，逆向者拿到 key 就能复现；RSA 私钥在服务端，前端只有公钥，难以完整复现服务端校验侧的运算，更安全。")],
                ["装 pycryptodome，把上面的 make_token 跑通。",
                 "故意用错密钥长度，看报什么错。",
                 "记一句：AES 密钥 16/24/32，明文要补位。"]),
        ]),
        # ===================== 第6章 字体·CSS 反爬与 OCR =====================
        ch("字体·CSS 反爬与 OCR", "🔤", "#e6b84d", [
            les("a6l1", "字体反爬原理：显示层与数据层不一致", "🔡", "#e6b84d",
                '''## 字体反爬：字是假的，映射是真的

有些网站把页面上的文字（价格、数字）换成**自定义字体**（woff/ttf）。你看到的「③」在 HTML 里可能是个「□」，真正显示成几，由字体文件里的**字形→编码映射**决定。直接抠 HTML 文字会拿到乱码。

### 原理
- 每个字符在字体里有一个「glyph（字形）」
- 网站随机把「字形」重新分配到不同「编码」
- 你看到 "8"，HTML 里其实是某个随机码，靠字体文件才显示成 8

### 破解思路
下载它的 woff，看「哪个编码对应哪个真实字形」，建一张「编码→真实字符」的映射表，再还原文本。

> 💡 这是「显示层」和「数据层」不一致的经典把戏。你抠的是数据层（乱码），要看字体文件才知真值。''',
                "字体反爬把文字换成自定义 woff/ttf，HTML 直接抠是乱码；真实字符由字体里字形→编码映射决定。破解：下 woff 建「编码→真实字符」映射表还原。",
                [fig("adv_font_map", "🔡 字体反爬：HTML 里是乱码，靠 woff 里 glyph→编码映射才显示真值")],
                [word("GLYPH", "字形：字体里一个字符的轮廓形状", "ɡlɪf"),
                 word("WOFF", "woff/ttf：网页自定义字体文件格式", "wɔːf"),
                 word("FONT_MAP", "字体映射：编码→真实字符的对照表", "fɑːnt mæp")],
                [choice("字体反爬里，HTML 文本直接抠会怎样？",
                        ["拿到真实文字", "拿到乱码/错字符", "拿到图片"],
                        1, "字形被重映射，直接读 HTML 是错码。"),
                 fill("真实字符由字体文件里的「字形→______」映射决定。（填两字：编码/颜色）",
                      "编码", "字形到编码的映射决定显示成哪个字符。"),
                 choice("破解字体反爬要？",
                        ["不管", "下 woff 建「编码→真实字符」映射表", "用正则硬抠"],
                        1, "必须借助字体文件还原映射。"),
                 tap("字体反爬的关键概念有哪些（多选）",
                     ["glyph 字形", "woff/ttf 字体文件", "字形到编码的重映射", "直接抠 HTML 即得真值"],
                     [0, 1, 2], "前三个是核心；直接抠 HTML 拿不到真值。"),
                 openq("为什么说这是「显示层和数据层不一致」的把戏？",
                       "浏览器用字体文件把随机编码渲染成正确字符（显示层正常），但 HTML 源码里仍是乱码（数据层错乱），两者靠字体映射才统一。")],
                ["找一个用自定义字体的页面，看 HTML 源码里数字是否乱码。",
                 "下载它的 woff 用字体查看器打开，体会字形与编码。",
                 "记一句：乱码别慌，看字体映射。"]),

            les("a6l2", "fontTools 解析还原映射", "🛠️", "#e6b84d",
                '''## fontTools：把字体文件读成映射表

`fontTools` 能把 woff/ttf 打开，拿到「每个字形长什么样」和「它对应哪个编码/名字」。配合**人工标注一次**，就能自动还原。

### 思路
```python
from fontTools.ttLib import TTFont
font = TTFont("site.woff")
cmap = font.getBestCmap()        # 编码 -> 字形名
print(cmap)
```
### 还原套路
1. 字体往往「字形形状固定、编码随机变」
2. 用**首次人工对照**（截图里 "8" 对应哪个字形）建立「字形轮廓 → 真实字符」
3. 之后每次抓，比对字形轮廓/名字，映射到真实字符

> ⚠️ 易错：网站常**每次刷新换一套编码**（字形不变、编码变）。所以别记「编码→字符」，要记「字形轮廓→字符」，否则下次全错。''',
                "fontTools 读 woff 拿 cmap（编码→字形名）；但网站常刷新换编码，所以要记「字形轮廓→真实字符」，之后比对轮廓还原，而非死记编码。",
                [fig("adv_font_map", "🛠️ fontTools 读 cmap：编码→字形名；但记字形轮廓才防刷新换码")],
                [word("TTFONT", "TTFont：fontTools 打开字体文件", "ti ti ɛf ɔːnt"),
                 word("CMAP", "cmap：字符编码到字形名的映射表", "siː mæp"),
                 word("GLYPH_NAME", "字形名：字体内部给每个轮廓的编号", "ɡlɪf neɪm")],
                [choice("fontTools 能做什么？",
                        ["发请求", "读 woff/ttf 拿字形与编码映射", "解析 HTML"],
                        1, "fontTools 专攻字体文件。"),
                 fill("`font.getBestCmap()` 返回「编码 → ______名」的映射。（填两字：字形/颜色）",
                      "字形", "cmap 把编码映射到字形名。"),
                 choice("网站每次刷新换编码，正确做法是？",
                        ["记死编码→字符", "记「字形轮廓→字符」", "放弃不抓"],
                        1, "字形不变编码变，按轮廓认才稳。"),
                 tap("还原字体反爬的步骤有哪些（多选）",
                     ["下 woff", "fontTools 读 cmap", "人工标注字形→真值", "之后比字形轮廓还原"],
                     [0, 1, 2, 3], "四步组成完整还原流程。"),
                 openq("为什么「记字形轮廓→字符」比「记编码→字符」更稳？",
                       "因为网站常只换编码、不动字形形状；按字形轮廓认，换码也不怕，按编码记则下次全乱。")],
                ["装 fontTools，打开一个 woff 打印 cmap 看看。",
                 "对比两次刷新同一页面的编码是否变化。",
                 "记一句：按轮廓认，不记死编码。"]),

            les("a6l3", "图片反爬 OCR 入门（ddddocr）", "👁️", "#e6b84d",
                '''## 图片验证码：用 OCR 自动认

图形验证码（歪歪扭扭的字母数字）本质是图片。传统做法人工识别，进阶用 **OCR（光学字符识别）** 自动读。

### ddddocr：一行搞定
```python
import ddddocr
ocr = ddddocr.DdddOcr()
with open("cap.png", "rb") as f:
    img = f.read()
print(ocr.classification(img))     # 输出识别出的文字
```
### 提升识别率
- 先**预处理**：转灰度、二值化、去干扰线，再喂给 OCR
- 简单验证码 ddddocr 很准；复杂扭曲/粘连的需要更狠的预处理或打码平台

> ⚠️ 易错：别一上来就把原图丢进去。干扰线、噪点会严重拉低准确率，先做图像预处理往往立竿见影。''',
                "图形验证码用 OCR 自动认，ddddocr.classification(img) 一行出结果；但先灰度/二值化/去噪预处理能大幅提准确率，别直接丢原图。",
                [fig("adv_ocr", "👁️ OCR 流程：原图→灰度/二值化去噪→ddddocr 识别文字")],
                [word("OCR", "光学字符识别：把图片文字读成文本", "oʊ siː ɑːr"),
                 word("DDDDOCR", "ddddocr：开源验证码识别库", "diː diː diː ˈɔːkr"),
                 word("BINARY", "二值化：把图变成纯黑白便于识别", "ˈbaɪnəri")],
                [choice("OCR 是做什么的？",
                        ["发请求", "把图片里的文字识别出来", "解析 JSON"],
                        1, "OCR 认图里字。"),
                 fill("ddddocr 用 `ocr.______(img)` 得到识别文字。（填方法名）",
                      "classification", "classification 接收图片字节返回文字。"),
                 choice("识别率低时第一步该？",
                        ["换库", "先做灰度/二值化去噪预处理", "直接放弃"],
                        1, "预处理常立竿见影。"),
                 tap("提升 OCR 准确率的做法有哪些（多选）",
                     ["转灰度", "二值化", "去干扰线", "直接丢原图"],
                     [0, 1, 2], "前三个提准确率；原图直丢反而低。"),
                 openq("为什么「预处理（去噪/二值化）」能立竿见影地提升识别率？",
                       "干扰线和噪点会被 OCR 当成笔画误认；灰度+二值化把前景背景拉开、去掉杂色，字符轮廓干净，识别率自然高。")],
                ["装 ddddocr，对自己生成一个简单验证码图识别试试。",
                 "对比「原图直识别」和「先二值化再识别」的准确率。",
                 "记一句：预处理先行，再喂 OCR。"]),

            les("a6l4", "雪碧图与 CSS 坐标偏移还原", "🧩", "#e6b84d",
                '''## 雪碧图：一张大图切着用

雪碧图（CSS Sprite）把很多小图标拼成**一张大图**，再用 CSS 的 `background-position` 偏移「只露」其中一块。有的网站拿这招藏数字/手机号，直接看 HTML 看不到真值。

### 怎么还原
```python
# HTML: <div class="num" style="background-position:-20px 0">
# CSS: .num 对应一张雪碧图，每个数字占 20px 宽
# 偏移 -20px 表示露出第 2 个数字
```
思路：
1. 下载雪碧图
2. 数出每个「格子」宽高（如每数字 20px）
3. 用 `background-position` 的偏移算出「露的是第几个」，拼回完整数字

> 💡 同理还有「CSS 位移混淆」：HTML 里字符顺序是乱的，靠 `left` 偏移摆正。还原 = 按偏移量重新排序字符。''',
                "雪碧图把小图拼成大图，用 background-position 偏移露出一块；还原=下载大图、算每格宽高、用偏移算第几个拼回。CSS 位移混淆同理：按偏移重新排序字符。",
                [fig("adv_sprite", "🧩 雪碧图：一张大图按 background-position 偏移露出一块；算格子宽高还原数字")],
                [word("SPRITE", "雪碧图：多小图拼成一张大图", "spraɪt"),
                 word("BACKGROUND_POS", "background-position：控制露出大图哪块", "ˈbækɡraʊnd pəˈzɪʃən"),
                 word("OFFSET", "偏移：位移量，决定露第几个", "ˈɔːfset")],
                [choice("雪碧图（CSS Sprite）是？",
                        ["一张大图切着用", "多个独立小图", "一段视频"],
                        0, "Sprite 是拼合大图。"),
                 fill("用 CSS 的 `background-______` 偏移决定露出哪一块。（填单词）",
                      "position", "background-position 控制背景偏移。"),
                 choice("还原雪碧图数字要知道？",
                        ["每个格子的宽高", "图片颜色", "字体名称"],
                        0, "格子宽高才能算第几个。"),
                 tap("雪碧图/CSS 混淆还原要点（多选）",
                     ["下载大图", "算每格宽高", "用偏移算第几个", "直接读 HTML 文字"],
                     [0, 1, 2], "前三个是还原步骤；HTML 直读拿不到真值。"),
                 openq("「CSS 位移混淆」为什么字符顺序在 HTML 里是乱的，却显示正常？",
                       "HTML 里字符按乱序排列，但每个字符用 left 偏移摆到正确视觉位置，人眼看是正常顺序，机器直读则是乱的，需按偏移重排。")],
                ["找一个用 background-position 的页面，数格子宽高还原一个数字。",
                 "思考 CSS 位移混淆怎么按 left 重排字符。",
                 "记一句：偏移=第几个，拼回去。"]),

            les("a6l5", "综合混合反爬题拆解", "🧅", "#e6b84d",
                '''## 混合反爬：一层层剥洋葱

真实站点常**好几招叠加**：字体加密 + 雪碧图 + 接口签名 + 频率限制。别慌，按「数据从哪来」逐层拆。

### 拆解 checklist
1. **先看数据在哪**：是 HTML 文字？接口 JSON？还是图片？
2. **HTML 文字乱码** → 字体反爬（下 woff 建映射）
3. **HTML 没数字、只有图** → 雪碧图/CSS 偏移（算偏移还原）
4. **接口要 sign** → JS 逆向（DevTools 追算法）
5. **频繁就 429** → 加退避 + 代理 + 限速

### 方法论
> 永远先「定位数据源头」，再「针对那一层」选武器。混合反爬没有新魔法，只是几层老招叠一起。''',
                "混合反爬按「数据从哪来」逐层拆：HTML乱码→字体映射；没数字只有图→雪碧图偏移；接口要sign→JS逆向；频繁429→退避限速。先定位源头再选武器。",
                [fig("adv_font_map", "🧅 混合反爬逐层剥：定位数据源→对层选武器，无新魔法只是老招叠加")],
                [word("LAYERED", "分层：多层防护叠加", "ˈleɪərd"),
                 word("CHECKLIST", "清单：按顺序排查的步骤", "ˈtʃɛklɪst"),
                 word("SOURCE", "数据源：数据真正出现的位置", "sɔːrs")],
                [choice("遇到混合反爬，第一步该？",
                        ["瞎试", "先定位数据从哪来", "直接上代理"],
                        1, "先定位再动手。"),
                 fill("HTML 文字乱码，多半是______反爬。（填两字：字体/Cookie）",
                      "字体", "乱码是字体映射错位典型表现。"),
                 choice("接口要 sign 说明要？",
                        ["换 IP", "JS 逆向追算法", "放弃"],
                        1, "sign 需逆向复现。"),
                 tap("拆解混合反爬的武器有哪些（多选）",
                     ["字体映射还原", "雪碧图偏移还原", "JS 逆向 sign", "退避+限速"],
                     [0, 1, 2, 3], "四招对应四层。"),
                 openq("为什么说「混合反爬没有新魔法，只是几层老招叠一起」？",
                       "它只是把字体、雪碧图、签名、限频等单点技术组合使用，每一层都有成熟解法，难点在定位而非新原理。")],
                ["挑一个你已知的多层防护页面，按 checklist 在纸上逐层写拆解方案。",
                 "练习「先问数据在哪」再选武器的思考习惯。",
                 "记一句：混合反爬=老招叠加，逐层剥。"]),
        ]),
        # ===================== 第7章 验证码与登录池 =====================
        ch("验证码与登录池", "🧩", "#c0659e", [
            les("a7l1", "图形验证码与打码平台", "🤖", "#c0659e",
                '''## 打码平台：人肉/OCR 都不行就外包

简单验证码 OCR 能认；但扭曲、粘连、中文成语、点选请等复杂验证码，OCR 准确率暴跌。这时可接**打码平台**：你把图片发过去，平台用「人工+AI」秒回结果，按量付费。

### 流程
```
你的程序 → 上传验证码图片 → 打码平台 → 返回文字/坐标 → 你填进表单
```
### 取舍
- 优点：复杂验证码也能过
- 缺点：**要花钱、有延迟、且仍属「突破防护」的灰色地带**

> ⚠️ 合规提醒：打码平台帮你绕过验证码，性质上是在突破人家的人机校验。只在你**有权**抓、且对方允许的范围内用；公开付费接口/明确禁止的别碰。''',
                "打码平台把复杂验证码图发过去，人工+AI 秒回结果；但花钱、有延迟，且属突破人机校验的灰色地带，只在有权抓且对方允许时用。",
                [fig("adv_ocr", "🤖 打码平台：上传复杂验证码→平台人工+AI 回结果；灰色地带合规优先")],
                [word("CAPTCHA", "验证码：区分人机的挑战", "ˈkæptʃə"),
                 word("HUMAN", "人工：平台背后真人识别", "ˈhjuːmən"),
                 word("THIRD_PARTY", "第三方：外包给打码平台", "θɜːrd ˈpɑːrti")],
                [choice("打码平台的作用是？",
                        ["发请求", "把复杂验证码图发给平台认出结果", "解析 HTML"],
                        1, "平台帮你认复杂码。"),
                 fill("打码平台本质是「人工+AI」帮你______人机校验。（填两字：绕过|突破）",
                      "绕过|突破", "打码平台帮你跨过验证码这道人机校验。"),
                 choice("关于打码平台，正确的是？",
                        ["免费无限", "花钱有延迟且属灰色地带", "一定能 100% 识别"],
                        1, "有成本、有延迟、有合规风险。"),
                 tap("打码平台的利弊有哪些（多选）",
                     ["复杂验证码能过", "要花钱", "有延迟", "完全合法无风险"],
                     [0, 1, 2], "前三个是事实；合规风险存在。"),
                 openq("为什么用打码平台「突破验证码」有合规风险？",
                       "验证码是人家设置的人机校验门槛，绕过它等于在未通过校验的情况下获取数据，可能违反对方服务条款甚至相关法规，属灰色地带。")],
                ["了解打码平台的接入流程（只看文档，不违规使用）。",
                 "复习第 13 章合规边界，明确哪些不能碰。",
                 "记一句：突破验证码是灰色地带，合规优先。"]),

            les("a7l2", "滑块轨迹模拟：像人一样滑", "🎚️", "#c0659e",
                '''## 滑块验证：不是滑过去就行

滑块验证（拼图/拖动）会检测你的**轨迹**。真人拖动是「先快后慢、带点抖、有加速度」的曲线；程序若「瞬间直线到位」会被一眼识破。

### 生成「像人」的轨迹
```python
import random
def human_track(distance):
    tracks = []; cur = 0
    while cur < distance:
        step = random.randint(1, 4)          # 每步 1~4 像素
        cur += step; tracks.append(step)
    return tracks                            # 越往后越慢可再加衰减
```
要点：步长**先大后小**（模拟减速）、加随机抖动、总时间别太整。

> ⚠️ 易错：很多人「匀速直线」滑，缺加速度和抖动，风控直接判机器人。轨迹才是滑块验证的灵魂。''',
                "滑块验证检测轨迹是否像人：真人先快后慢带抖有加速度，程序匀速直线会被识破。生成轨迹要步长先大后小、加抖动、别太整。",
                [fig("adv_slider", "🎚️ 滑块人类轨迹：步长先大后小+抖动+加速度，匀速直线会被识破")],
                [word("TRACK", "轨迹：拖动过程的位移序列", "træk"),
                 word("ACCELERATE", "加速度：速度由快到慢的变化", "əkˈsɛləreɪt"),
                 word("SLIDER", "滑块：拖动拼图式验证", "ˈslaɪdər")],
                [choice("滑块验证主要检测什么？",
                        ["滑动距离", "拖动轨迹是否像人", "颜色"],
                        1, "轨迹是判定核心。"),
                 fill("人类轨迹通常步长「先大后______」。（填两字：小/快）",
                      "小", "真人减速，步长逐渐变小。"),
                 choice("程序「匀速直线」滑会被？",
                        ["判真人", "一眼识破为机器人", "无所谓"],
                        1, "缺加速度和抖动必被识破。"),
                 tap("拟人轨迹要点有哪些（多选）",
                     ["步长先大后小", "加随机抖动", "有加速度", "瞬间直线到位"],
                     [0, 1, 2], "前三个拟人；直线是机器人特征。"),
                 openq("为什么「加速度和抖动」是滑块验证判定真人的关键？",
                       "真人肌肉控制有加减速和细微抖动，机器匀速无抖过于完美，风控靠这种生物特征差异区分。")],
                ["写 human_track 生成轨迹，打印步长看是否先大后小。",
                 "故意生成匀速轨迹对比，体会差别。",
                 "记一句：轨迹像人，别直线。"]),

            les("a7l3", "行为验证与 token", "🪪", "#c0659e",
                '''## 行为验证：你的一举一动都在被记分

新一代验证（滑动拼图、点选、无感验证）后台会采集**鼠标轨迹、停留时长、设备指纹**，算一个「信任分」，通过才发 `token` 给你后续请求用。

### token 从哪来
```
你完成验证 → 后台算分通过 → 返回 token（常藏在 Cookie 或回调）
→ 之后请求带这个 token = "我已通过验证"
```
### 逆向思路
- 无感验证：往往靠**设备指纹 + 历史行为**打分，没显式滑块
- 想自动化：要么复现「拿 token 的接口」（看它怎么算分），要么用真实浏览器带着正常行为跑

> ⚠️ 易错：别以为「过了一次滑块就永远有 token」——token 常有时效，且和设备/会话绑定，换环境要重来。''',
                "行为验证采集鼠标轨迹/停留/设备指纹算信任分，通过才发 token；token 常有时效、绑设备，换环境要重来。无感验证无显式滑块，靠指纹+行为打分更难自动化。",
                [fig("adv_slider", "🪪 行为验证：采集轨迹/指纹算信任分→通过发 token；token 绑设备有时效")],
                [word("BEHAVIOR", "行为：鼠标轨迹/停留等交互特征", "bɪˈheɪvjər"),
                 word("TRUST_SCORE", "信任分：风控算出的可信度", "trʌst skɔːr"),
                 word("TOKEN", "token：通过验证后发的凭证", "ˈtoʊkən")],
                [choice("行为验证后台会采集什么来打分？",
                        ["只采集 IP", "鼠标轨迹/停留/设备指纹", "只看验证码对错"],
                        1, "多维行为特征综合打分。"),
                 fill("通过验证后，后台发一个______给后续请求当凭证。（填单词）",
                      "token", "token 是验证通过的凭证。"),
                 choice("关于 token，正确的是？",
                        ["永不过期", "常有时效且绑设备/会话", "换环境仍有效"],
                        1, "token 受限且有生命周期。"),
                 tap("行为验证特点有哪些（多选）",
                     ["采集鼠标轨迹", "算信任分", "通过后发 token", "只看验证码对错不看行为"],
                     [0, 1, 2], "前三个正确；行为也是评分依据。"),
                 openq("为什么「无感验证」反而更难自动化？",
                       "它没有显式滑块让你模拟，而是靠设备指纹和历史行为在后台静默打分，缺少可模仿的交互界面，自动化难以伪造可信行为。")],
                ["了解行为验证的采集维度（文档层面）。",
                 "思考 token 时效和绑定对自动化的限制。",
                 "记一句：token 绑设备有时效。"]),

            les("a7l4", "多账号 Cookie 池", "🍪", "#c0659e",
                '''## Cookie 池：多账号轮着用

单账号频繁抓容易触发风控/限频。进阶做法是养**一批账号**，把它们的 Cookie 存成「池」，每次随机抽一个用，分散风险。

### 池的结构
```python
cookies = [
  {"name":"sessionid","value":"aaa...","domain":".site.com"},
  {"name":"sessionid","value":"bbb...","domain":".site.com"},
]
import random
c = random.choice(cookies)     # 随机挑一个账号
```
### 维护要点
- **健康度**：定期检测哪个 Cookie 过期/被封，移出池
- **隔离**：每个账号独立，别串
- **量级**：池越大越稳，但养号成本也高

> 💡 和代理 IP 池搭配（第 15 章）是「账号 + IP 双分散」的经典组合，抗封能力翻倍。''',
                "Cookie 池存多账号凭证随机轮换，分散风控；要定期剔过期/被封、账号隔离。和代理 IP 池搭配=账号+IP 双分散，抗封翻倍。",
                [fig("adv_cookie_pool", "🍪 Cookie 池：多账号凭证随机抽，定期剔无效，和代理 IP 池搭配双分散")],
                [word("COOKIE_POOL", "Cookie 池：多账号凭证集合", "ˈkʊki puːl"),
                 word("HEALTH", "健康度：Cookie 是否有效可用", "hɛlθ"),
                 word("ISOLATE", "隔离：账号间互不影响", "ˈaɪsəleɪt")],
                [choice("Cookie 池的主要作用是？",
                        ["省钱", "多账号轮换分散风控风险", "提速"],
                        1, "轮换分散降低单账号被封概率。"),
                 fill("每次请求从池里______挑一个账号的 Cookie 用。（填两字：随机/固定）",
                      "随机", "随机轮换才分散风险。"),
                 choice("关于 Cookie 池维护，正确的是？",
                        ["不管过期", "定期剔除过期/被封的", "所有账号混用"],
                        1, "要持续维护健康度。"),
                 tap("Cookie 池要点有哪些（多选）",
                     ["随机轮换", "检测健康度剔无效", "账号隔离", "和代理 IP 池搭配更稳"],
                     [0, 1, 2, 3], "四条都是要点。"),
                 openq("为什么说「Cookie 池 + 代理 IP 池」是抗封的经典组合？",
                       "单靠换账号但 IP 不变，风控仍能关联；单靠换 IP 但账号不变同理。账号+IP 双随机，让每次请求都像不同用户在异地访问，关联难度翻倍。")],
                ["用列表+random.choice 模拟一个 Cookie 池随机抽。",
                 "写个函数检测某个 Cookie 是否还能访问需登录页。",
                 "记一句：账号+IP 双分散。"]),
        ]),
        # ===================== 第8章 Scrapy 框架深入 =====================
        # ===================== 阶段考②（覆盖 ch4-7） =====================
        exam("exam2", "阶段考②：Playwright·JS逆向·字体OCR·验证码", "📝", "#e0922f",
            '''## 阶段考②：Playwright · JS 逆向 · 字体OCR · 验证码

覆盖 **Playwright 进阶 / JS 逆向 / 字体·CSS 反爬与 OCR / 验证码与登录池** 四章。

**规则**：8 题，首次正确率 ≥ 80% 过关，得「阶段考②过关」勋章，可重复挑战。

这一考是「硬骨头区」——逆向和验证码的套路，踩熟了才不慌。''',
            "阶段考②过关 = 你会用 Playwright 拦截接口偷数据、读懂 sign/token 怎么来、用 fontTools 还原字体映射、用 ddddocr 打 OCR、模拟滑块轨迹。硬骨头啃下来了。",
            [choice("Playwright 比 Selenium 快的关键原因是？",
                    ["更漂亮", "自动等待 + 原生协议通道（不经 WebDriver 中转）", "用更多内存"],
                    1, "原生通道直连浏览器，少中转。"),
             choice("Playwright 的「自动等待」指？",
                    ["等你手写 sleep", "内置等元素可见/可点再操作", "不等待"],
                    1, "自动等元素就绪，少写 sleep。"),
             choice("拦截网络请求直接抓接口，主要为了？",
                    ["好看", "拿到页面背后的真实 API 数据，免去解析 DOM", "拖慢页面"],
                    1, "截接口=直接拿结构化数据，最香。"),
             fill("前端 sign/token 通常是「请求时______算出来的防伪签名」。（填 现/预先）",
                  "现", "签名是前端每次请求现场算的。"),
             choice("复现 JS 签名的第一步通常是？",
                    ["猜", "用 DevTools 在发送前断点追密钥/算法", "放弃"],
                    1, "DevTools 追到算签名的函数。"),
             choice("字体反爬靠的是？",
                    ["加密图片", "显示字形与底层编码映射被故意打乱（woff/ttf）", "改 IP"],
                    1, "字形↔编码映射被换，你看到的和拿到的一致。"),
             choice("用 fontTools 还原字体映射，目的是？",
                    ["画字体", "把乱码字形映射回真实文字", "压缩"],
                    1, "把字形映射回真字。"),
             choice("ddddocr 常用于？",
                    ["生成验证码", "识别简单图形验证码/文字", "写爬虫"],
                    1, "ddddocr 是 OCR 识别库。"),
             choice("雪碧图(CSS Sprite)反爬的破解关键是？",
                    ["放大图片", "还原 CSS 背景坐标偏移，拼回真实位置", "忽略"],
                    1, "算坐标偏移还原位置。"),
             choice("滑块验证码轨迹模拟，哪种更像人？",
                    ["匀速直线", "慢-快-慢带抖动的加速曲线", "瞬间到位"],
                    1, "人滑动是加速曲线+微抖。")]),

        ch("Scrapy 框架深入", "🕷️", "#8e7bd6", [
            les("a8l1", "架构：引擎·调度·下载·管道", "⚙️", "#8e7bd6",
                '''## Scrapy 架构：一条流水线

Scrapy 不是「写个循环抓」，而是一套**组件流水线**，各司其职：

### 五大件
- **Engine 引擎**：总指挥，串起所有人
- **Scheduler 调度器**：存待抓 URL 队列
- **Downloader 下载器**：真正发请求收响应
- **Spider 蜘蛛**：你写的解析逻辑
- **Pipeline 管道**：清洗/入库

### 数据流
```
Spider 产出 Request → Scheduler 排队
→ Engine 交给 Downloader 发请求
→ 响应回到 Spider 解析出 Item/新 Request
→ Item 进 Pipeline 清洗入库
```
> 💡 Scrapy 帮你把「发请求/调度/重试/限速」都管了，你只写「解析」和「存」。比手写 asyncio 省心，但灵活度低一点。''',
                "Scrapy 是流水线：Engine 调度、Scheduler 排队、Downloader 发请求、Spider 解析、Pipeline 清洗入库。框架管发请求/调度/重试/限速，你只写解析和存。",
                [fig("adv_scrapy_engine", "⚙️ Scrapy 五大件数据流：Spider→Scheduler→Downloader→Spider→Pipeline")],
                [word("ENGINE", "引擎：Scrapy 总指挥", "ˈɛndʒɪn"),
                 word("SCHEDULER", "调度器：存待抓 URL 队列", "ˈskɛdʒuːlər"),
                 word("DOWNLOADER", "下载器：真正发请求收响应", "daʊnˈloʊdər")],
                [choice("Scrapy 里「总指挥、串起各组件」的是？",
                        ["Spider", "Engine 引擎", "Pipeline"],
                        1, "Engine 负责调度整个流程。"),
                 fill("存「待抓 URL 队列」的组件叫______（调度器）。",
                      "Scheduler", "Scheduler 管理请求队列。"),
                 choice("关于 Scrapy，正确的是？",
                        ["你只写解析和存，其余框架管", "啥都要自己写", "不能限速"],
                        0, "框架接管请求/调度/重试/限速。"),
                 tap("下列属于 Scrapy 五大件的有（多选）",
                     ["Engine", "Scheduler", "Downloader", "Pipeline"],
                     [0, 1, 2, 3], "四件加 Spider 即五大件。"),
                 openq("为什么说「用 Scrapy 比手写 asyncio 循环省心」？",
                       "Scrapy 内置了调度、重试、限速、去重、并发，你只需写 parse 解析和 Pipeline 存数据，不用自己用 asyncio 拼整套基础设施。")],
                ["跑通 Scrapy 官方第一个例子，感受「只写 parse」。",
                 "在纸上画出五大件的数据流箭头图。",
                 "记一句：你只写解析和存。"]),

            les("a8l2", "Spider 与 ItemLoader", "📦", "#8e7bd6",
                '''## Spider 与 ItemLoader：把解析结构化

Spider 是你写的「解析类」，核心是 `parse` 方法；Item 是「数据容器」，像一张表的字段；ItemLoader 帮你**规整地填**这些字段。

### Spider 最小骨架
```python
import scrapy
class BookSpider(scrapy.Spider):
    name = "book"
    start_urls = ["https://example.com/books"]
    def parse(self, resp):
        for b in resp.css(".book"):
            yield {
                "title": b.css("h2::text").get(),
                "price": b.css(".price::text").get(),
            }
```
### ItemLoader 更稳
```python
from scrapy.loader import ItemLoader
l = ItemLoader(item=BookItem(), selector=b)
l.add_css("title", "h2::text")
l.add_css("price", ".price::text")
yield l.load_item()      # 自动清洗、去空白
```
> 💡 `yield` 出的字典/Item 会自动流进 Pipeline。Scrapy 用「生成器」边抓边吐，内存友好。''',
                "Spider 的 parse 写解析、yield 出字典/Item 自动进 Pipeline；ItemLoader 用 add_css 规整填字段并自动清洗。生成器边抓边吐，内存友好。",
                [fig("adv_scrapy_engine", "📦 Spider yield 出的 Item 自动流进 Pipeline；ItemLoader 规整填字段")],
                [word("SPIDER", "Spider：写解析逻辑的爬虫类", "ˈspaɪdər"),
                 word("ITEMLOADER", "ItemLoader：规整填充 Item 字段", "ˈaɪtəm ˈloʊdər"),
                 word("YIELD", "yield：生成器边抓边吐数据", "jiːld")],
                [choice("Spider 里负责解析响应的是哪个方法？",
                        ["start_requests", "parse", "close"],
                        1, "parse 是默认回调。"),
                 fill("用 `l.add_css(\"title\", \"h2::text\")` 的 Loader 叫______（填类名）。",
                      "ItemLoader", "ItemLoader 用 add_css/add_xpath 填字段。"),
                 choice("yield 出的数据会流向？",
                        ["丢弃", "自动进 Pipeline", "只打印屏幕"],
                        1, "yield 的 Item 进入管道。"),
                 tap("Scrapy 数据结构相关（多选）",
                     ["Spider 写解析", "Item 像表字段", "ItemLoader 规整填字段", "yield 边抓边吐"],
                     [0, 1, 2, 3], "四条都对。"),
                 openq("为什么用 ItemLoader 比手动拼字典更稳？",
                       "ItemLoader 统一了字段提取与清洗（去空白、转类型、默认值），避免在每个 Spider 里重复散落的处理逻辑，字段结构也更清晰。")],
                ["写一个 Spider，用 yield 字典抓列表数据。",
                 "把它改成 ItemLoader 版本，对比代码。",
                 "记一句：yield 流进 Pipeline。"]),

            les("a8l3", "Downloader Middleware：请求中途加工站", "🔧", "#8e7bd6",
                '''## Downloader Middleware：请求的中途加工站

Middleware（中间件）是夹在「Engine → Downloader」之间的钩子，每个请求/响应经过时都能加工：**加代理、换 UA、处理重试、记日志**。

### 典型用途
- 给每个请求自动加 `User-Agent`、`Cookie`
- 按规则换代理 IP（接第 15 章代理池）
- 捕获特定响应做特殊处理

### 写一个（示意）
```python
class UAMiddleware:
    def process_request(self, request, spider):
        request.headers["User-Agent"] = "Mozilla/5.0"
```
在 `settings.py` 里 `DOWNLOADER_MIDDLEWARES` 注册启用。

> ⚠️ 易错：中间件里**别做重活/阻塞 IO**（如下载大文件），会拖慢整个下载器；重活在 Pipeline 或单独协程做。''',
                "Downloader Middleware 夹在 Engine 与 Downloader 之间，process_request 加工每个请求（加 UA/换代理/重试）。别在里头做阻塞重活，会拖慢整个下载器。",
                [fig("adv_scrapy_engine", "🔧 Middleware 夹在 Engine 与 Downloader 之间，process_request 加工每个请求")],
                [word("MIDDLEWARE", "中间件：请求/响应的中途钩子", "ˈmɪdlwer"),
                 word("PROCESS_REQUEST", "process_request：加工单个请求", "ˈprɑːsɛs rɪˈkwɛst"),
                 word("HOOK", "钩子：在特定时机插入的逻辑", "hʊk")],
                [choice("Downloader Middleware 夹在哪两者之间？",
                        ["Spider 和 Pipeline", "Engine 和 Downloader", "Scheduler 和 Spider"],
                        1, "位于引擎与下载器之间。"),
                 fill("中间件里加工单个请求的方法叫 `_______request`。（填 process）",
                      "process", "process_request 在发请求前加工。"),
                 choice("中间件里不该做？",
                        ["加 UA", "换代理", "下载大文件这种重活/阻塞 IO"],
                        2, "阻塞 IO 会卡住下载器。"),
                 tap("Middleware 常见用途（多选）",
                     ["自动加 UA/Cookie", "换代理 IP", "处理重试", "解析 HTML"],
                     [0, 1, 2], "前三项是典型用途；解析在 Spider。"),
                 openq("为什么「中间件里别做阻塞 IO」？",
                       "下载器是并发处理请求的，中间件在关键路径上，一旦阻塞就会卡住整个下载器的吞吐，拖累全局速度。")],
                ["写一个 UA Middleware 并注册。",
                 "理解中间件在请求生命周期的位置。",
                 "记一句：中间件别做重活。"]),

            les("a8l4", "Pipeline 清洗入库", "💾", "#8e7bd6",
                '''## Pipeline：数据出厂前的最后一道关

Item 从 Spider yield 出来，会依次流经你定义的 Pipeline，在这里**清洗、去重、入库**（写数据库/文件）。

### 写一个 Pipeline
```python
class CleanPipeline:
    def process_item(self, item, spider):
        item["price"] = item["price"].replace("¥", "").strip()
        return item          # 必须 return，才流向下一个

class SavePipeline:
    def process_item(self, item, spider):
        db.insert(item)      # 伪代码：存库
        return item
```
在 `settings.py` 的 `ITEM_PIPELINES` 里按顺序注册多个。

> 💡 多个 Pipeline 像流水线工位：清洗→校验→入库。某个 Pipeline 想「丢弃」就 `raise DropItem`。''',
                "Pipeline 的 process_item 清洗/校验/入库，必须 return 才流向下一个；raise DropItem 丢弃。顺序由 settings 注册决定。清洗放 Pipeline 让 Spider 专注解析、逻辑分层。",
                [fig("data_store", "💾 Pipeline：清洗→校验→入库，像流水线工位；raise DropItem 丢弃")],
                [word("PIPELINE", "管道：Item 流经的清洗/入库环节", "ˈpaɪplaɪn"),
                 word("DROPITEM", "DropItem：丢弃某个 Item 的异常", "drɑːp ˈaɪtəm"),
                 word("PROCESS_ITEM", "process_item：处理单个 Item", "ˈprɑːsɛs ˈaɪtəm")],
                [choice("Pipeline 处理单个 Item 的方法叫？",
                        ["parse", "process_item", "open_spider"],
                        1, "process_item 处理每个 Item。"),
                 fill("想丢弃某 Item，用 `raise ______`（填类名）。",
                      "DropItem", "raise DropItem 让该 Item 不出厂。"),
                 choice("多个 Pipeline 的顺序由什么决定？",
                        ["随机", "settings 里注册的顺序", "文件名"],
                        1, "靠 ITEM_PIPELINES 的顺序号。"),
                 tap("Pipeline 常见用途（多选）",
                     ["清洗字段", "去重", "入库写库", "发请求"],
                     [0, 1, 2], "前三项是职责；发请求在 Spider。"),
                 openq("为什么「清洗放在 Pipeline 而不是 Spider 里」更合理？",
                       "分层让 Spider 只关心「怎么解析」，清洗/校验/入库等数据质量逻辑集中在 Pipeline，可复用、可组合、易测试。")],
                ["写两个 Pipeline：一个清洗价格、一个存库，按顺序注册。",
                 "试一次 raise DropItem 看 Item 是否被正确丢弃。",
                 "记一句：清洗出厂前最后一道关。"]),

            les("a8l5", "配置调优：并发·限速·重试", "🎚️", "#8e7bd6",
                '''## 配置调优：并发·限速·重试

Scrapy 默认偏保守（怕你被封）。真要提速，调 `settings.py`：

### 关键旋钮
```python
CONCURRENT_REQUESTS = 32                # 全局并发
CONCURRENT_REQUESTS_PER_DOMAIN = 16     # 单域名并发
DOWNLOAD_DELAY = 0.5                    # 请求间隔（秒）
AUTOTHROTTLE_ENABLED = True             # 自动限速，按对方响应调
RETRY_TIMES = 3                         # 失败重试次数
```
- `DOWNLOAD_DELAY` + `RANDOMIZE_DOWNLOAD_DELAY` 随机化更稳
- `AUTOTHROTTLE` 让 Scrapy 自己看对方负载调速度，比写死更聪明

> ⚠️ 易错：并发拉太高 + 没延迟 = 把人家冲垮被封。调优是「在礼貌前提下尽量快」，不是无脑拉满。''',
                "调优旋钮：CONCURRENT_REQUESTS 并发、DOWNLOAD_DELAY 间隔、AUTOTHROTTLE 自动限速、RETRY_TIMES 重试。核心是「礼貌前提下尽量快」，并发拉满零延迟必被封。",
                [fig("adv_scrapy_engine", "🎚️ 调优旋钮：并发/延迟/自动限速/重试，礼貌前提下尽量快")],
                [word("CONCURRENT", "并发：同时进行的请求数", "kənˈkʌrənt"),
                 word("AUTOTHROTTLE", "自动限速：按对方负载自适应", "ˈɔːtoʊ ˈθrɑːtl"),
                 word("RETRY", "重试：失败再试几次", "ˈriːtraɪ")],
                [choice("控制全局并发的配置是？",
                        ["DOWNLOAD_DELAY", "CONCURRENT_REQUESTS", "RETRY_TIMES"],
                        1, "CONCURRENT_REQUESTS 管全局并发。"),
                 fill("`_______ENABLED=True` 让 Scrapy 按对方负载自动限速。（填 AUTO）",
                      "AUTOTHROTTLE", "AUTOTHROTTLE 自适应限速。"),
                 choice("关于调优，正确的是？",
                        ["并发越高越好", "在礼貌前提下尽量快", "完全不用延迟"],
                        1, "调优是平衡，不是拉满。"),
                 tap("提速同时保安全的做法（多选）",
                     ["设 DOWNLOAD_DELAY", "开 AUTOTHROTTLE", "RANDOMIZE 延迟", "并发无脑拉满"],
                     [0, 1, 2], "前三项稳妥；拉满零延迟易封。"),
                 openq("为什么「并发拉满+零延迟」最容易把自己作封？",
                       "对方服务器会瞬间收到远超承受能力的请求，触发风控/限频直接封 IP；礼貌的延迟和自动限速才能长久。")],
                ["在 settings 里调 CONCURRENT_REQUESTS 和 DOWNLOAD_DELAY 跑同一站对比速度。",
                 "打开 AUTOTHROTTLE 观察速度是否自适应。",
                 "记一句：礼貌前提下尽量快。"]),
        ]),
        # ===================== 第9章 分布式·去重·管道 =====================
        ch("分布式·去重·管道", "🕸️", "#5b8fc4", [
            les("a9l1", "单机限速与 set 去重", "🖥️", "#5b8fc4",
                '''## 单机限速：先别把自己作死

在搞分布式前，先把**单机**的礼貌与限速做对。Scrapy 的 `DOWNLOAD_DELAY`/`AUTOTHROTTLE` 就是单机限速；用 asyncio 时靠 Semaphore + 随机延迟。

### 为什么限
- 不礼貌→被封 IP
- 太猛→本机端口/内存爆
- 对方服务器被冲垮→你也被牵连

### 单机去重（内存版）
```python
seen = set()
def dedup(urls):
    new = [u for u in urls if u not in seen]
    seen.update(new)
    return new
```
> 💡 单机用 `set` 去重够用；但**进程重启 set 就没了**。要持久化→用 Redis（下节）。''',
                "单机先做好限速（DOWNLOAD_DELAY/AUTOTHROTTLE/Semaphore+随机延迟）和 set 去重；但 set 不持久，重启即丢，要持久化得上 Redis。",
                [fig("adv_semaphore", "🖥️ 单机限速：Semaphore+随机延迟；set 去重但不持久，重启即丢")],
                [word("THROTTLE", "限速：主动控制请求速度", "ˈθrɑːtl"),
                 word("DEDUP", "去重：去掉重复 URL/数据", "diː ˈdʌp"),
                 word("SEEN", "seen：已见集合，记录抓过的", "siːn")],
                [choice("单机用 set 去重的缺点是？",
                        ["太慢", "进程重启就没了", "不能去重"],
                        1, "set 在内存，重启清空。"),
                 fill("单机限速常用 `DOWNLOAD_DELAY` 或______（自动限速）。",
                      "AUTOTHROTTLE", "AUTOTHROTTLE 自动限速。"),
                 choice("为什么单机也要限速？",
                        ["没必要", "防封IP/防爆资源/不冲垮对方", "只为好看"],
                        1, "限速是基本礼貌与自保。"),
                 tap("单机限速手段（多选）",
                     ["DOWNLOAD_DELAY", "Semaphore", "随机延迟", "并发拉满"],
                     [0, 1, 2], "前三项限速；拉满相反。"),
                 openq("为什么「进程重启 set 就没了」会是个问题？",
                       "重启后 seen 清空，已抓的 URL 会重复抓取，浪费资源还可能因重复请求被对方风控；持久化才能跨重启去重。")],
                ["用 set 给一个 URL 列表去重，重启程序观察重复。",
                 "体会为什么需要把 seen 存到文件/Redis。",
                 "记一句：set 不持久，要持久化上 Redis。"]),

            les("a9l2", "Redis 中央调度队列", "🧠", "#5b8fc4",
                '''## Redis：把队列搬出单机

当一台机器不够、要多台一起抓时，需要**中央队列**——所有机器从同一个地方取 URL、上报结果。Redis 是最常用的选择（内存级、超快）。

### 角色
- **中央调度**：待抓 URL 放 Redis 队列，多机 `pop` 取任务
- **共享去重**：已抓 URL 放 Redis `set`，全局判重
- **结果收集**：抓回的数据也丢 Redis，统一消费

```python
import redis
r = redis.Redis()
r.lpush("urls", "https://a.com")      # 入队
url = r.rpop("urls")                  # 取一个
r.sadd("seen", url)                   # 标记已抓
```
> 💡 Redis 让「多机」像「一台大机器」：状态集中，机器可随时加减，挂一台不影响整体。''',
                "Redis 做中央队列：多机从同一处 pop 任务、共享 seen set 去重、收集结果。状态集中让集群可弹性扩缩、单机故障不影响全局。",
                [fig("adv_redis_queue", "🧠 Redis 中央队列：多机 pop 任务 + 共享 seen set 去重 + 收集结果")],
                [word("REDIS", "Redis：内存级键值数据库，常用作中央队列", "ˈrɛdɪs"),
                 word("LPUSH", "lpush：从左侧入队", "ɛl pʊʃ"),
                 word("RPOP", "rpop：从右侧取一个", "ɑːr pɑːp")],
                [choice("多机协作时，中央队列的作用是？",
                        ["装饰", "让多机从同一处取任务/共享状态", "提速单请求"],
                        1, "中央队列统一调度。"),
                 fill("URL 入队用 `r.______(\"urls\", url)`。（填 lpush/rpop）",
                      "lpush", "lpush 入队、rpop 出队。"),
                 choice("共享去重常把已抓 URL 放 Redis 的？",
                        ["list", "set（自动去重）", "string"],
                        1, "set 天然去重。"),
                 tap("Redis 在分布式里的角色（多选）",
                     ["中央调度队列", "共享去重 set", "结果收集", "只做缓存图片"],
                     [0, 1, 2], "前三项；缓存图片不是主用。"),
                 openq("为什么「状态集中到 Redis」能让机器随意加减、挂一台不影响整体？",
                       "因为任务队列和去重状态都在 Redis，单机只是「 worker」，挂了任务还在队列里等别的机器取，新机器加入也只是多一个消费者，整体无状态可弹性。")],
                ["起一个本地 Redis，用 lpush/rpop 模拟多机取任务。",
                 "用 sadd 做全局去重，开两个「机器」抢同一批 URL 看是否重复。",
                 "记一句：状态集中，机器无状态。"]),

            les("a9l3", "scrapy-redis：给 Scrapy 装分布式", "🔌", "#5b8fc4",
                '''## scrapy-redis：给 Scrapy 装上分布式

手写 Redis 队列很爽但重复造轮子。`scrapy-redis` 把 Scrapy 的调度器和去重改成**基于 Redis**，你几乎不改 Spider 就能多机跑。

### 怎么用
```python
# settings.py
SCHEDULER = "scrapy_redis.scheduler.Scheduler"
DUPEFILTER_CLASS = "scrapy_redis.dupefilter.RFPDupeFilter"
REDIS_URL = "redis://localhost:6379"
# Spider 继承 RedisSpider
from scrapy_redis import RedisSpider
class BookSpider(RedisSpider):
    name = "book"
    redis_key = "book:start_urls"   # 起始 URL 从 Redis 读
```
### 好处
- 调度/去重全自动走 Redis
- 起多个 Scrapy 进程=多机协作
- 断点续跑（Redis 里状态不丢）

> ⚠️ 易错：忘了起 Redis 服务，scrapy-redis 会连不上直接报错。先 `redis-server` 再跑。''',
                "scrapy-redis 把 Scrapy 调度器和去重改基于 Redis，Spider 继承 RedisSpider、配 redis_key；多进程即多机协作、支持断点续跑。别忘了先起 Redis 服务。",
                [fig("adv_redis_queue", "🔌 scrapy-redis：调度器+去重走 Redis，多进程即多机协作、断点续跑")],
                [word("SCRAPY_REDIS", "scrapy-redis：Scrapy 的 Redis 分布式扩展", "skreɪpi ˈrɛdɪs"),
                 word("REDIS_SPIDER", "RedisSpider：从 Redis 读起始 URL 的 Spider", "ˈrɛdɪs ˈspaɪdər"),
                 word("DUPEFILTER", "去重过滤器：判断 URL 是否抓过", "ˈduːp ˈfɪltər")],
                [choice("scrapy-redis 把什么改成了基于 Redis？",
                        ["Spider 解析", "调度器和去重", "Pipeline"],
                        1, "调度与去重走 Redis。"),
                 fill("起始 URL 从 Redis 读的 key 配 `redis_______`。（填 key）",
                      "key", "redis_key 指定起始 URL 的 Redis key。"),
                 choice("跑 scrapy-redis 前必须先？",
                        ["装数据库", "起 Redis 服务", "关网络"],
                        1, "连不上 Redis 直接报错。"),
                 tap("scrapy-redis 好处（多选）",
                     ["调度/去重走 Redis", "多进程即多机协作", "支持断点续跑", "要手写队列"],
                     [0, 1, 2], "前三项；队列已封装好。"),
                 openq("为什么「起多个 Scrapy 进程」就等于多机协作？",
                       "因为每个进程的调度器和去重都指向同一个 Redis，任务从同一队列分配、去重状态共享，多个进程天然协作，像多机一样。")],
                ["装 scrapy-redis，把之前的 Spider 改成 RedisSpider 跑两个进程。",
                 "确认两个进程不重复抓同一 URL（去重生效）。",
                 "记一句：先起 Redis 再跑。"]),

            les("a9l4", "布隆过滤器去重", "🌫️", "#5b8fc4",
                '''## 布隆过滤器：用极少内存判「见没见过」

URL/数据量巨大时，普通 `set` 存全量太占内存。布隆过滤器（Bloom Filter）用**位数组 + 多个哈希**判断「一定没见过 / 可能见过」。

### 特点（关键！）
- **有误判（假阳性）：说见过，可能其实没见过**
- **绝不漏判：说没见过，就一定没见过**
- 内存极小（对比 set）

```python
from pybloom_live import BloomFilter
bf = BloomFilter(capacity=1000000, error_rate=0.001)
if url in bf:
    pass        # 可能见过（有误判）
else:
    bf.add(url) # 一定没见过，加入
```
> 💡 爬虫去重正好需要「宁可误判漏抓几条，也不能重复抓爆」。布隆的「有误判无漏判」完美契合。''',
                "布隆过滤器用位数组+多哈希：说没见过=一定没见过（无漏判），说见过=可能误判。内存极小，适合海量去重；爬虫宁可误判漏几条也不重复抓爆，正合它。",
                [fig("adv_bloom", "🌫️ 布隆：位数组+多哈希；说没见过=一定没见过（无漏判），说见过=可能误判")],
                [word("BLOOM", "布隆过滤器：省内存的概率去重结构", "bluːm"),
                 word("FALSE_POSITIVE", "误判：假阳性，说见过其实没", "fɔːls ˈpɑːzətɪv"),
                 word("BITARRAY", "位数组：布隆底层存储", "bɪt əˈreɪ")],
                [choice("布隆过滤器说「没见过」时，结论是？",
                        ["可能见过", "一定没见过", "随机"],
                        1, "无漏判是布隆核心保证。"),
                 fill("布隆「说见过」可能是______（填两字：误判|漏判），但不漏判。",
                      "误判", "布隆只误判不漏判。"),
                 choice("布隆相比 set 的最大优势是？",
                        ["更准确", "内存极小", "不会误判"],
                        1, "用极小内存换极低误判率。"),
                 tap("布隆特性（多选）",
                     ["有误判无漏判", "内存极小", "适合海量去重", "永远 100% 准确"],
                     [0, 1, 2], "前三项；不是 100% 准确。"),
                 openq("为什么爬虫去重「宁可误判漏抓几条，也不能重复抓」正好适合布隆？",
                       "重复抓取会浪费带宽、冲击对方、污染数据，危害大；而误判导致偶尔漏抓几条无害。布隆以极小误判率换取海量内存节省，正好匹配这种取舍。")],
                ["装 pybloom_live，用布隆对 100 万 URL 去重，看内存占用。",
                 "验证「说没见过一定没见过」：先 add 再查。",
                 "记一句：有误判无漏判，爬虫正需要。"]),

            les("a9l5", "SimHash·MinHash 文本近似去重", "📐", "#5b8fc4",
                '''## 文本近似去重：内容一样但写法不同

URL 去重用布隆就够；但**同一篇文章被不同站点微改**（换词、加空格），URL 不同、正文相似。这时要「语义/结构近似」去重。

### SimHash：把文章压成指纹
- 对文本分词→加权→哈希→压缩成一个 64 位「指纹」
- 两文指纹**汉明距离**小=内容高度相似
```python
if hamming(a_hash, b_hash) <= 3:
    print("近似重复")
```
### MinHash：快速估算两集合相似度（Jaccard）
用于「两段文本/两个集合像不像」，适合大规模近重复检测。

> 💡 URL 去重管「同一个链接」，SimHash/MinHash 管「内容雷同」。两者互补：先 URL 去重，再文本近似去重。''',
                "SimHash 把文章压成短指纹，汉明距离小=内容雷同；MinHash 估算集合相似度。URL 去重管同链接，文本近似去重管内容雷同，两层互补。",
                [fig("adv_simhash", "📐 SimHash 把文章压成指纹；两指纹汉明距离小=内容近似重复")],
                [word("SIMHASH", "SimHash：文本指纹算法", "sɪm hæʃ"),
                 word("HAMMING", "汉明距离：两指纹不同位数", "ˈhæmɪŋ"),
                 word("MINHASH", "MinHash：估算集合相似度", "mɪn hæʃ")],
                [choice("SimHash 把文章压成什么？",
                        ["原文字", "一个短指纹(如64位)", "图片"],
                        1, "指纹用于快速比对。"),
                 fill("两文 SimHash 指纹的「______距离」小=内容相似。（填算法名：汉明）",
                      "汉明", "汉明距离衡量指纹差异位数。"),
                 choice("为什么 URL 去重不够、还要文本近似去重？",
                        ["URL 不同但内容雷同", "太慢", "没必要"],
                        0, "同文不同链需内容层去重。"),
                 tap("文本近似去重手段（多选）",
                     ["SimHash 指纹", "MinHash 估算相似度", "汉明距离判近重复", "只看 URL"],
                     [0, 1, 2], "前三项；只看 URL 不够。"),
                 openq("为什么「先 URL 去重，再文本近似去重」是互补的两层？",
                       "URL 去重高效剔除完全相同的链接，文本近似去重补上「链接不同但内容雷同」的漏网之鱼，两层结合才能既快又准地避免重复。")],
                ["用 simhash 库对两篇「同义改写」文章算指纹，看汉明距离。",
                 "理解为什么 URL 不同但内容雷同需要文本层去重。",
                 "记一句：URL 去重 + 文本近似，两层互补。"]),

            les("a9l6", "增量爬取：只抓新的", "🌊", "#5b8fc4",
                '''## 增量爬取：只抓新的，不重复劳动

很多站点**每天只新增几条**。全量重抓浪费资源。增量爬取=**记住「上次抓到哪」，这次只抓比它新的**。

### 做法
1. 记录「最新一条的标识」（如最大 id / 最新时间戳）
2. 下次请求只拉 `id > 上次最大` 的部分
3. 更新记录

```python
last_id = load_last()                      # 上次最大 id
for item in fetch_new(last_id):
    save(item)
    last_id = max(last_id, item.id)        # 推进水位
save_last(last_id)
```
### 配合
- 用 Redis/数据库存「水位」
- 和断点续爬（第 12 章）配合更稳

> 💡 增量=「水位线」思想：只处理水位之上的新数据，老的不碰。''',
                "增量爬取=水位线思想：记录上次最大 id/时间戳，只抓更新的部分并更新水位。配合 Redis/库持久化，避免全量重抓浪费资源。",
                [fig("adv_redis_queue", "🌊 增量爬取：记录水位线，只抓水位之上的新数据，老的不再碰")],
                [word("INCREMENTAL", "增量：只处理新增部分", "ˈɪnkrəməntəl"),
                 word("WATERMARK", "水位线：上次处理到的位置标记", "ˈwɔːtərmɑːrk"),
                 word("DELTA", "增量数据：相对上次的差异部分", "ˈdɛltə")],
                [choice("增量爬取的核心思想是？",
                        ["全量重抓", "只抓比上次新的(水位线)", "不抓"],
                        1, "增量=只处理新数据。"),
                 fill("记录「上次最大 id / 最新时间戳」叫记录______（水位）。",
                      "水位", "水位线标记处理进度。"),
                 choice("水位线一般存在？",
                        ["只能内存", "Redis/数据库等持久化处", "不存"],
                        1, "持久化才能跨次生效。"),
                 tap("增量爬取要点（多选）",
                     ["记录上次水位", "只拉新增部分", "更新水位", "每次全量重抓"],
                     [0, 1, 2], "前三项；全量重抓相反。"),
                 openq("为什么「增量爬取」能大幅省资源？",
                       "大部分站点新增量远小于存量，只抓增量避免了反复下载和处理已抓过的老数据，带宽、算力、存储都省。")],
                ["写一个增量抓取脚本，用 last_id 水位只拉新数据。",
                 "把水位存文件，第二次跑验证只抓新增。",
                 "记一句：水位线之上才处理。"]),

            les("a9l7", "消息队列 Kafka·RabbitMQ 采集管道", "🚰", "#5b8fc4",
                '''## 消息队列：让「抓取」和「处理」解耦

当抓取量巨大，单机处理不过来，用**消息队列（MQ）**把「生产者（爬虫）」和「消费者（清洗/入库/分析）」隔开，各自按节奏跑。

### 常见 MQ
- **Kafka**：高吞吐、适合日志/海量事件流
- **RabbitMQ**：可靠投递、适合任务分发

### 形态
```
爬虫 → 发消息到 Topic/Queue → 多个消费者并发处理
```
```python
producer.send("raw_pages", page_html)   # 生产者（伪代码）
# 消费者并发消费、互不阻塞
```
### 好处
- 抓取峰值被 MQ 削峰填谷
- 消费者可水平扩展（加机器）
- 某消费者挂了，消息还在，不丢

> 💡 和 Redis 队列的区别：Redis 简单轻量；Kafka/RabbitMQ 更专业（持久化、分区、确认机制），适合企业级管道。''',
                "MQ（Kafka 高吞吐/RabbitMQ 可靠）解耦生产者(爬虫)与消费者(清洗入库)，削峰填谷、可水平扩展、消费者挂了消息不丢。比 Redis 队列更企业级。",
                [fig("adv_kafka", "🚰 消息队列：爬虫(生产者)→Topic/Queue→多消费者并发处理，解耦削峰")],
                [word("KAFKA", "Kafka：高吞吐分布式消息流平台", "ˈkɑːfkə"),
                 word("RABBITMQ", "RabbitMQ：可靠消息队列", "ˈræbɪt ɛm kjuː"),
                 word("CONSUMER", "消费者：从队列取数据处理", "kənˈsuːmər")],
                [choice("消息队列主要解决？",
                        ["抓取慢", "生产者与消费者解耦、削峰", "解析难"],
                        1, "MQ 解耦并削峰填谷。"),
                 fill("Kafka 适合______吞吐的事件流，RabbitMQ 适合可靠任务分发。（填两字：高/低）",
                      "高", "Kafka 主打高吞吐。"),
                 choice("MQ 相比 Redis 队列的优势是？",
                        ["更轻量", "持久化/分区/确认更专业", "更简单"],
                        1, "MQ 企业级特性更全。"),
                 tap("MQ 好处（多选）",
                     ["削峰填谷", "消费者水平扩展", "消费者挂了消息不丢", "必须单机"],
                     [0, 1, 2], "前三项；MQ 本就为分布式。"),
                 openq("为什么「消费者挂了，消息还在」很重要？",
                       "抓取和处理解耦后，消费者故障不应导致数据丢失；消息留在队列，恢复后继续消费，保证数据不丢、处理可重放。")],
                ["理解 Kafka 与 RabbitMQ 的适用差异（文档层面）。",
                 "画一张「爬虫→MQ→多消费者」的架构草图。",
                 "记一句：MQ 解耦抓取与处理。"]),
        ]),
        # ===================== 第10章 存储进阶 =====================
        ch("存储进阶", "🗄️", "#4bb3a3", [
            les("a10l1", "MongoDB 文档库：存不规整的数据", "🍃", "#4bb3a3",
                '''## MongoDB：存「不规整」的数据

关系数据库（MySQL）要建表、定字段；爬虫抓回来的数据常常**字段不齐、结构多变**（有的商品有颜色，有的没有）。MongoDB 是**文档库**，一条数据就是一个 JSON 文档，字段随意加。

### 特点
- 存 BSON（类 JSON），无需固定表结构
- 适合「半结构化」爬虫数据
- 查询灵活，按任意字段搜

```python
from pymongo import MongoClient
c = MongoClient()
col = c["spider"]["books"]
col.insert_one({"title": "Python", "price": 39, "tags": ["编程"]})
for d in col.find({"price": {"$gt": 30}}):
    print(d)
```
> 💡 和 MySQL 比：MySQL 像「固定表格」，MongoDB 像「活页夹，每页写啥都行」。爬虫数据杂，文档库更顺手。''',
                "MongoDB 是文档库，一条数据=一个 JSON 文档，字段随意加，适合字段不齐的半结构化爬虫数据；pymongo 增删查改，比固定表结构的 MySQL 灵活。",
                [fig("adv_mongo_es", "🍃 MongoDB：一条数据=一个 JSON 文档，字段随意加，适合半结构化爬虫数据")],
                [word("MONGODB", "MongoDB：文档型 NoSQL 数据库", "ˈmɒŋɡoʊ diː biː"),
                 word("DOCUMENT", "文档：MongoDB 里的一条 JSON 记录", "ˈdɑːkjəmənt"),
                 word("BSON", "BSON：MongoDB 的二进制 JSON 格式", "biː sɑːn")],
                [choice("MongoDB 适合存？",
                        ["固定表格", "字段不齐/结构多变的半结构化数据", "只有数字"],
                        1, "文档库对结构变化友好。"),
                 fill("一条 MongoDB 数据是一个类______文档（填 JSON）。",
                      "JSON", "MongoDB 文档类似 JSON。"),
                 choice("和 MySQL 比，MongoDB 的优势在？",
                        ["必须建表", "字段可随意加、结构灵活", "不支持查询"],
                        1, "无需固定 schema。"),
                 tap("MongoDB 特点（多选）",
                     ["存 BSON 类 JSON", "无需固定表结构", "按任意字段查", "适合半结构化爬虫数据"],
                     [0, 1, 2, 3], "四条都准。"),
                 openq("为什么「字段不齐的爬虫数据」用文档库比关系库省心？",
                       "关系库要求先定死表结构，缺字段要改表；文档库每条自带结构，抓到啥存啥，无需迁移 schema，迭代快。")],
                ["装 MongoDB（或本地起容器），用 pymongo 插入并查询。",
                 "对比同样数据在 MySQL 要建表多麻烦。",
                 "记一句：杂数据用文档库。"]),

            les("a10l2", "Elasticsearch 建索引：为搜索而生", "🔎", "#4bb3a3",
                '''## Elasticsearch：为「搜索」而生

抓回来海量文本（文章/商品），要**全文检索、按相关度排序**，用 MySQL LIKE 慢且弱。Elasticsearch（ES）是搜索引擎，专为「建索引、秒级搜」设计。

### 核心概念
- **索引（Index）**≈ 一张表
- **文档（Doc）**≈ 一行
- 写入时分词建**倒排索引**，搜起来飞快

```python
from elasticsearch import Elasticsearch
es = Elasticsearch()
es.index(index="news", id=1, document={"title": "爬虫进阶", "body": "..."})
print(es.search(index="news", query={"match": {"body": "异步"}}))
```
> 💡 什么时候用 ES？当你要「搜关键词、按相关度排、千万级文本」时用；只是存下来偶尔取，MongoDB 足够。''',
                "ES 是搜索引擎，建倒排索引支持全文检索和相关度排序，适合千万级文本按关键词搜；索引≈表、文档≈行。只在需要搜索时才上 ES，单纯存储 MongoDB 够。",
                [fig("adv_mongo_es", "🔎 Elasticsearch：分词建倒排索引，按相关度秒级全文检索")],
                [word("ELASTICSEARCH", "Elasticsearch：分布式搜索引擎", "ɪˈlæstɪk ˈsɜːrtʃ"),
                 word("INDEX", "索引：ES 里类比表的逻辑容器", "ˈɪndɛks"),
                 word("INVERTED", "倒排索引：按词找文档的索引结构", "ɪnˈvɜːrtɪd")],
                [choice("ES 主要为解决？",
                        ["事务", "全文检索/相关度排序", "图片存储"],
                        1, "ES 为搜索设计。"),
                 fill("ES 里「索引 Index」约等于关系库的______（填：表/行）。",
                      "表", "Index 类比表，Doc 类比行。"),
                 choice("为什么 ES 搜得快？",
                        ["全表扫", "建了倒排索引", "数据少"],
                        1, "倒排索引让关键词查找极快。"),
                 tap("ES 特点（多选）",
                     ["为搜索设计", "倒排索引", "按相关度排序", "适合海量文本检索"],
                     [0, 1, 2, 3], "四条都对。"),
                 openq("什么时候该用 ES 而不是 MongoDB？",
                       "当你需要对海量文本做关键词全文检索、按相关度排序、高并发查询时选 ES；如果只是按 id/字段取存，MongoDB 足够且更轻。")],
                ["本地起 ES（或容器），索引一批文章并搜关键词。",
                 "对比 MySQL LIKE 在大数据量下的速度。",
                 "记一句：要搜索才上 ES。"]),

            les("a10l3", "清洗去重入库：数据出厂质检", "🧼", "#4bb3a3",
                '''## 清洗去重再入库：数据出厂质检

抓回来的数据常有脏东西：价格带「¥」、空格、重复项、缺失字段。入库前要做**清洗 + 去重 + 校验**。

### 清洗套路
```python
def clean(item):
    item["price"] = float(item["price"].replace("¥","").strip())
    item["title"] = item["title"].strip()
    return item
```
### 去重三层
1. **抓取时**：URL/指纹去重（布隆/SimHash，见第 9 章）
2. **入库前**：按唯一键（如商品 id）判重
3. **库内**：加唯一索引，重复插入自动忽略

> 💡 入库不是终点，是「质检线」。脏数据进库，后面分析全歪。Pipeline（第 8 章）正是干这个的地方。''',
                "入库前清洗（去符号/空格/补全）与去重（抓取去重+入库前唯一键+库内唯一索引三层）；Pipeline 正是质检线，脏数据进库会污染后续分析。",
                [fig("data_store", "🧼 清洗→去重→校验→入库：数据出厂前的质检流水线")],
                [word("CLEAN", "清洗：修掉脏数据（符号/空格/缺失）", "kliːn"),
                 word("VALIDATE", "校验：检查字段是否合法完整", "ˈvælɪdeɪt"),
                 word("UNIQUE", "唯一键：判重的依据，如商品 id", "juːˈniːk")],
                [choice("入库前清洗主要处理？",
                        ["加密", "价格符号/空格/缺失等脏数据", "发请求"],
                        1, "清洗针对脏数据。"),
                 fill("按商品______（如 id）判重，可加唯一索引防重复插入。",
                      "id", "唯一键（如 id）用来判重。"),
                 choice("去重的「第三层」是？",
                        ["抓取时", "入库前按唯一键", "库内唯一索引"],
                        2, "库内唯一索引兜底。"),
                 tap("数据质检三层（多选）",
                     ["抓取时去重", "入库前按唯一键判重", "库内唯一索引", "直接裸存不处理"],
                     [0, 1, 2], "前三层；裸存会脏。"),
                 openq("为什么「脏数据进库，后面分析全歪」？",
                       "后续统计、建模、展示都基于库内数据，单价带了 ¥ 符号无法求平均、重复项虚增计数，一个脏字段会连锁污染整条分析链路。")],
                ["写一个 clean 函数处理一组脏价格/标题。",
                 "给一张表加唯一索引，试重复插入看是否被忽略。",
                 "记一句：入库是质检线。"]),

            les("a10l4", "图片大文件对象存储", "📦", "#4bb3a3",
                '''## 图片/大文件：别塞数据库

抓下来的图片、视频、PDF 动辄几 MB，塞进 MongoDB/MySQL 既慢又贵。正确做法：**对象存储**（如 S3/OSS/COS），数据库只存「文件的 URL/key」。

### 思路
```python
data = requests.get(img_url).content          # 下载图片字节
url = oss.upload("books/cover1.jpg", data)    # 上传到对象存储
col.insert_one({"title": "Python", "cover": url})  # 库只存 url
```
### 好处
- 存储和计算分离，数据库轻
- 对象存储天生为海量文件设计，带 CDN 加速

> ⚠️ 易错：把大文件直接 base64 塞进数据库字段，体积暴涨、查询卡死。存 URL，文件交给我们对象存储。''',
                "图片/大文件用对象存储（S3/OSS/COS），数据库只存 URL/key；避免 base64 塞库导致体积暴涨查询卡死。存储计算分离、天然适合海量文件且带 CDN。",
                [fig("adv_obj_store", "📦 大文件存对象存储，数据库只存 URL/key，存储计算分离")],
                [word("OBJECT_STORE", "对象存储：海量文件存储服务", "ˈɑːbdʒɛkt stɔːr"),
                 word("CDN", "CDN：内容分发网络，加速文件访问", "siː diː ɛn"),
                 word("BINARY", "二进制：图片/视频的原始字节", "ˈbaɪnəri")],
                [choice("图片/大文件应该怎么存？",
                        ["直接塞数据库字段", "对象存储+数据库存URL", "base64 塞进库"],
                        1, "对象存储更合适。"),
                 fill("对象存储里数据库只存文件的______或 key。（填 URL）",
                      "URL", "库只存引用，文件在对象存储。"),
                 choice("把大文件 base64 塞数据库会？",
                        ["更快", "体积暴涨查询卡死", "更省空间"],
                        1, "base64 膨胀且拖慢查询。"),
                 tap("对象存储好处（多选）",
                     ["存储计算分离", "为海量文件设计", "带 CDN 加速", "适合存大文件"],
                     [0, 1, 2, 3], "四条都对。"),
                 openq("为什么「数据库只存 URL、文件交对象存储」更合理？",
                       "数据库擅长结构化检索而非存大块二进制；对象存储为海量文件优化且配 CDN 加速访问，各司其职，数据库也轻、备份快。")],
                ["用对象存储 SDK 上传一张图拿回 URL，再存库。",
                 "对比「base64 塞库」和「存 URL」的库大小。",
                 "记一句：大文件存对象存储，库只存 URL。"]),
        ]),
        # ===================== 第11章 App 抓包与移动端 =====================
        ch("App 抓包与移动端", "📱", "#d9774b", [
            les("a11l1", "mitmproxy 抓 HTTPS", "📡", "#d9774b",
                '''## mitmproxy：拦下 App 的 HTTPS

App 的数据也走 HTTPS，和网页一样。用 **mitmproxy** 在手机和服务器之间当「中间人」，能看到 App 发的每个请求和返回的 JSON。

### 三步
1. 电脑跑 `mitmproxy`，手机 Wi-Fi 设代理指向电脑
2. 手机装 mitmproxy 的 **CA 证书**（否则 HTTPS 校验失败）
3. 打开 App，请求全在 mitmproxy 面板里

### 拿到什么
- 接口 URL、参数、Header（常含签名/ token）
- 返回 JSON —— 往往比网页版还干净

> ⚠️ 合规红线：只对你**自己/授权**的 App 或学习用自己账号抓；抓别人 App 的私密接口、绕过付费=违法风险。第 13 章细讲。''',
                "mitmproxy 当中间人代理拦 App 的 HTTPS：电脑跑代理、手机设代理+装 CA 证书、打开 App 看请求/JSON。只对自己/授权 App 或学习用自己账号抓，别碰别人私密接口。",
                [fig("adv_mitmproxy", "📡 mitmproxy 中间人代理：手机→代理→服务器，拦截 App 的 HTTPS 请求与 JSON")],
                [word("MITMPROXY", "mitmproxy：HTTP/HTTPS 抓包代理", "mɪt ɛm ˈprɑːksi"),
                 word("CA_CERT", "CA 证书：解密 HTTPS 需手机信任的根证书", "siː eɪ sɜːrt"),
                 word("PROXY", "代理：中转流量的中间服务器", "ˈprɑːksi")],
                [choice("mitmproxy 在手机和服务器之间扮演？",
                        ["路由器", "中间人代理", "数据库"],
                        1, "它是中间人代理。"),
                 fill("抓 HTTPS 需在手机装 mitmproxy 的______证书（填 CA）。",
                      "CA", "需信任其 CA 才能解密 HTTPS。"),
                 choice("关于 App 抓包合规，正确的是？",
                        ["随便抓别人 App", "只对自己/授权App或学习用自己账号", "绕过付费没事"],
                        1, "合规是底线。"),
                 tap("mitmproxy 抓包步骤（多选）",
                     ["电脑跑 mitmproxy", "手机设代理指向电脑", "手机装 CA 证书", "打开App看请求"],
                     [0, 1, 2, 3], "四步齐全。"),
                 openq("为什么「抓 App 接口」常比抓网页更香（数据更干净）？",
                       "很多 App 直接返回结构化的 JSON 接口，没有网页那么多 DOM 噪声和渲染逻辑，数据更规整好抠。")],
                ["在本机跑 mitmproxy，用浏览器设代理抓一个请求理解原理。",
                 "读第 13 章合规边界，明确手机抓包能碰的线。",
                 "记一句：只抓自己/授权的 App。"]),

            les("a11l2", "分析 App 接口与签名", "🔐", "#d9774b",
                '''## App 接口与签名：和网页逆向一脉相承

抓到 App 的请求后，你会发现它和网页接口很像：URL + 参数 + 一个 `sign`/`token`。分析套路和 JS 逆向（第 5 章）相通。

### 常见差异
- App 常把签名逻辑写进**原生代码（Java/Kotlin/Swift）**或 **so 库**，不在 JS 里
- 参数可能走 **protobuf/msgpack** 等二进制协议，不是纯 JSON
- Header 里常带设备指纹（deviceId、机型）

### 思路
1. 先用 mitmproxy 看明文接口（很多 App 偷懒直接 JSON）
2. 若参数是二进制协议，需配合反编译（jadx，下节）看结构
3. 复现签名：要么逆出算法（难），要么用真机/模拟器带着正常环境发请求

> 💡 App 签名常绑**设备指纹**，纯 Python 复现比网页更难——因为缺真机环境。有时「用模拟器带着 App 跑」比硬逆更现实。''',
                "App 接口类似网页但签名常在原生/so 库、参数可能二进制协议、带设备指纹；纯 Python 复现难（缺真机环境）。先看明文 JSON，二进制配合 jadx，必要时用模拟器带 App 跑。",
                [fig("adv_mitmproxy", "🔐 App 接口=网页接口+二进制协议+设备指纹；签名常在原生/so 库")],
                [word("PROTOBUF", "protobuf：Google 的二进制序列化协议", "proʊtəˌbʌf"),
                 word("DEVICE_ID", "设备指纹：标识一台设备的唯一信息", "dɪˈvaɪs aɪ diː"),
                 word("SIGNATURE", "签名：App 请求里的防伪参数", "ˈsɪɡnətʃər")],
                [choice("App 签名逻辑常写在？",
                        ["只在 JS", "原生代码/so库", "只在 CSS"],
                        1, "App 签名多在原生层。"),
                 fill("App 参数可能走 protobuf/______等二进制协议而非纯 JSON。（填 msgpack）",
                      "msgpack", "msgpack 也是常见二进制协议。"),
                 choice("App 签名常绑什么导致纯Python复现更难？",
                        ["时间戳", "设备指纹(真机环境)", "颜色"],
                        1, "设备指纹绑定真机。"),
                 tap("App 接口与网页的差异（多选）",
                     ["签名在原生/so", "可能二进制协议", "带设备指纹", "完全一样无差异"],
                     [0, 1, 2], "前三项；并非完全一样。"),
                 openq("为什么「用模拟器带着 App 跑」有时比硬逆签名更现实？",
                       "因为 App 签名往往依赖设备指纹、系统调用等真机环境，纯 Python 复现要重建整套环境极难；而模拟器里 App 自己算好签名发出，我们只需转发请求。")],
                ["用 mitmproxy 看一个 App 的明文接口，对比网页接口异同。",
                 "思考哪些签名依赖真机环境、难以复现。",
                 "记一句：App 签名绑设备，复现难。"]),

            les("a11l3", "jadx 反编译入门", "🔬", "#d9774b",
                '''## jadx：把 Apk 还原成 Java 源码

Android 的 Apk 是编译后的产物。用 **jadx** 能把它**反编译**回近似 Java 源码，方便找签名算法、接口地址。

### 用法
```bash
jadx -d out app-release.apk    # 反编译到 out 目录
```
打开 `out/` 里的 `.java` 文件，搜 `sign`、`md5(`、`SharedPreferences` 等关键字定位逻辑。

### 能看什么
- 接口域名/路径（常明文写在代码里）
- 签名/加密的 Java 实现
- 硬编码的 key（有的开发者把盐写死在代码里😅）

> ⚠️ 易错：很多 App 会**混淆**（类名变 a/b/c），读起来像天书。配合「搜索关键字」+「看调用关系」慢慢剥；加壳的还要先脱壳。''',
                "jadx 把 Apk 反编译回近似 Java，搜 sign/md5/域名定位签名与接口；但常混淆（类名 a/b/c）需耐心剥，加壳要先脱壳。注意：逆向只用于学习/授权范围。",
                [fig("adv_js_trace", "🔬 jadx 反编译 Apk→Java，搜 sign/md5/域名定位逻辑；混淆后耐心剥")],
                [word("JADX", "jadx：Android Apk 反编译工具", "dʒeɪ dɪks"),
                 word("DECOMPILE", "反编译：把编译产物还原成源码", "diːkəmˈpaɪl"),
                 word("OBFUSCATE", "混淆：把代码改名打乱增加阅读难度", "ˈɑːbfəskeɪt")],
                [choice("jadx 能做什么？",
                        ["抓包", "把 Apk 反编译回近似 Java 源码", "发请求"],
                        1, "jadx 是反编译工具。"),
                 fill("反编译常用 `jadx -d out ______`（填 apk 文件名）。",
                      "app-release.apk", "jadx 接 apk 路径。"),
                 choice("为什么反编译后代码像天书？",
                        ["Java 难", "常被混淆(类名变a/b/c)", "反编译失败"],
                        1, "混淆让类名无意义。"),
                 tap("jadx 能帮你看（多选）",
                     ["接口域名", "签名算法Java实现", "硬编码的key", "运行时内存"],
                     [0, 1, 2], "前三项是静态可见；运行时内存靠 frida。"),
                 openq("为什么「搜关键字（sign/md5）」是读混淆代码的高效入口？",
                       "混淆只改类名/方法名，关键字符串如 'sign'、'md5'、域名常保留；从关键字反查调用链，比从杂乱的 a/b/c 类盲读高效得多。")],
                ["用 jadx 反编译一个自己的/开源 Apk，搜 sign 看结构。",
                 "体会混淆代码怎么读（搜关键字而非顺读）。",
                 "记一句：逆向只用于学习/授权。"]),

            les("a11l4", "frida hook 入门（思路）", "🪝", "#d9774b",
                '''## frida：运行时「hook」改数据

jadx 看的是「静态代码」；**frida** 能在 App **运行时**注入 JS，拦截某个函数、改它的参数或返回值——不用改 Apk、不用重编译。

### 思路示意
```js
Java.perform(function () {
  var Utils = Java.use("com.xxx.SignUtils");
  Utils.makeSign.implementation = function (a) {
    console.log("原参数:", a);
    return this.makeSign(a);   // 可在此改返回值
  };
});
```
### 用来干嘛
- **看**某个签名函数到底收了啥参数（比静态读快）
- **改**返回值绕过校验（灰色地带，谨慎）
- 配合 mitmproxy，动静结合

> ⚠️ 红线：frida 改返回值绕过人家防护 = 违法风险高发区。学习用自己的 App、做安全研究要在合法授权范围内。''',
                "frida 在 App 运行时注入 JS hook 函数，看参数/改返回值，无需重编译；jadx 看静态代码，两者动静结合。但改返回值绕过防护是违法高发区，仅限合法授权范围。",
                [fig("adv_frida", "🪝 frida 运行时注入 JS hook 函数：看参数/改返回值，无需重编译")],
                [word("FRIDA", "frida：动态插桩/运行时 hook 框架", "ˈfriːdə"),
                 word("HOOK", "hook：拦截并改写函数行为", "hʊk"),
                 word("INJECT", "注入：把代码塞进运行中的进程", "ɪnˈdʒɛkt")],
                [choice("frida 和 jadx 的最大区别是？",
                        ["都一样", "frida 在运行时hook改数据", "jadx 更快"],
                        1, "动静之分。"),
                 fill("frida 注入的是______脚本（填 JS）来拦截函数。",
                      "JS", "frida 用 JS 写 hook 逻辑。"),
                 choice("关于 frida 改返回值绕过校验，正确的是？",
                        ["随便用", "违法风险高发区、仅合法授权范围", "一定合法"],
                        1, "绕过防护风险高。"),
                 tap("frida 能做的（多选）",
                     ["运行时看签名函数参数", "改返回值", "不用重编译Apk", "静态读源码"],
                     [0, 1, 2], "前三项是动态能力；静态读靠 jadx。"),
                 openq("为什么说「frida 动静结合 + mitmproxy」是 App 逆向的黄金组合？",
                       "mitmproxy 看网络层明文请求，frida 看代码层函数参数与返回值，jadx 看静态实现；三层互证，既知请求长啥样、又知签名怎么算，定位极快。")],
                ["了解 frida 的基本 hook 写法（文档/自己授权 App）。",
                 "理解动静结合的定位思路。",
                 "记一句：改返回值绕过=高风险，合法授权才碰。"]),
        ]),
        # ===================== 第12章 调度·部署·监控 =====================
        # ===================== 阶段考③（覆盖 ch8-11） =====================
        exam("exam3", "阶段考③：Scrapy·分布式·存储·App抓包", "📝", "#e0922f",
            '''## 阶段考③：Scrapy · 分布式 · 存储 · App 抓包

覆盖 **Scrapy 框架深入 / 分布式·去重·管道 / 存储进阶 / App 抓包与移动端** 四章。

**规则**：8 题，首次正确率 ≥ 80% 过关，得「阶段考③过关」勋章，可重复挑战。

工程化爬取的硬实力，这一考见真章。''',
            "阶段考③过关 = 你懂 Scrapy 引擎流水线、中间件与管道分工、Redis 中央调度、布隆「有误判无漏判」、SimHash 近似去重、MongoDB/ES 入库、mitmproxy/jadx/frida 抓 App。工程化稳了。",
            [choice("Scrapy 引擎的核心作用是？",
                    ["画界面", "协调调度/下载/解析/管道的数据流", "写数据库"],
                    1, "引擎是总调度。"),
             choice("Downloader Middleware 主要干预？",
                    ["解析 HTML", "请求发出前/响应回来后的处理（如加代理/换 UA）", "存数据"],
                    1, "中间件在请求响应之间做手脚。"),
             choice("Pipeline 的典型职责是？",
                    ["发请求", "清洗 + 入库（去重/存库）", "算签名"],
                    1, "管道管清洗和落地。"),
             choice("scrapy-redis 解决的核心问题是？",
                    ["美化日志", "多机共享请求队列，做分布式爬虫", "加密"],
                    1, "Redis 当中央队列，多机协同。"),
             choice("布隆过滤器(Bloom Filter)去重的特点是？",
                    ["零误判", "有误判（可能误以为见过的没见过）但绝不漏判", "慢"],
                    1, "布隆：有误判、无漏判、省内存。"),
             choice("SimHash 用来做？",
                    ["图片压缩", "文本近似去重（相似网页判重）", "加密"],
                    1, "SimHash 算指纹做近似去重。"),
             choice("MongoDB 适合存？",
                    ["强一致事务表", "结构不规整/嵌套的文档数据", "只能数字"],
                    1, "MongoDB 存半结构文档很香。"),
             choice("Elasticsearch 的主要用途是？",
                    ["当消息队列", "全文检索 + 建索引", "画图表"],
                    1, "ES 是搜索引擎，查得快。"),
             choice("mitmproxy 抓 App HTTPS 的前提是？",
                    ["随便抓", "手机装并信任它的 CA 证书，流量过代理", "不用证书"],
                    1, "要装 CA 证书才能解 HTTPS。"),
             choice("frida 主要用于？",
                    ["写爬虫", "运行时 hook App 函数、篡改/读取参数（逆向思路）", "做表格"],
                    1, "frida 是动态 hook 框架。")]),

        ch("调度·部署·监控", "⚙️", "#8e7bd6", [
            les("a12l1", "APScheduler/cron 定时跑", "⏰", "#8e7bd6",
                '''## 定时跑：别手动按

爬虫要**每天定时抓**（如早 8 点更新榜单）。两种主流：服务器 `cron` 和 Python 的 `APScheduler`。

### cron（系统级）
```bash
# 每天 8:00 跑
0 8 * * * cd /app && python crawl.py >> log.txt
```
### APScheduler（代码级）
```python
from apscheduler.schedulers.blocking import BlockingScheduler
s = BlockingScheduler()
@s.scheduled_job("cron", hour=8)
def job():
    print("开抓")
s.start()
```
> 💡 cron 适合「脚本丢服务器定时跑」；APScheduler 适合把调度写进 Python 服务里。两者都能「到点自动跑」。''',
                "定时跑用系统 cron（0 8 * * *）或 Python APScheduler；cron 系统级、APScheduler 代码级，都能到点自动跑，适合生产常态采集。",
                [fig("adv_redis_queue", "⏰ 定时调度：cron 系统级 / APScheduler 代码级，到点自动跑爬虫")],
                [word("APSCHEDULER", "APScheduler：Python 定时任务库", "eɪ piː ˈskɛdʒuːlər"),
                 word("CRON", "cron：Linux 系统定时任务", "krɑːn"),
                 word("SCHEDULE", "调度：按时间自动触发", "ˈskɛdʒuːl")],
                [choice("每天 8 点定时跑爬虫，用？",
                        ["cron/APScheduler", "手动点", "input 等待"],
                        0, "两者都能定时。"),
                 fill("`0 8 * * *` 中第一个 `0` 表示______（填：分钟/小时）。",
                      "分钟", "cron 五段：分 时 日 月 周。"),
                 choice("cron 与 APScheduler 区别是？",
                        ["一个系统级一个代码级", "完全一样", "都不能定时"],
                        0, "层级不同，能力相似。"),
                 tap("定时方案（多选）",
                     ["系统 cron", "Python APScheduler", "到点自动跑", "必须人工点"],
                     [0, 1, 2], "前三项；人工点不算定时。"),
                 openq("为什么「定时爬取」比「想起来手动跑」更适合生产？",
                       "生产数据采集要求稳定持续，定时让更新自动化、不依赖人，且可在低峰期跑减轻对方压力，还能保证数据时效。")],
                ["写一个 cron 表达式让脚本每天凌晨 2 点跑。",
                 "用 APScheduler 写个每小时间隔的示例。",
                 "记一句：到点自动跑，别手动。"]),

            les("a12l2", "断点续爬与重试", "🔁", "#8e7bd6",
                '''## 断点续爬：别一断就重来

抓 100 万条，跑到 50 万程序崩了——重头再来太亏。**断点续爬**=记住「抓到哪」，重启从断点继续。

### 做法
- 用 Redis/数据库记「已抓进度/水位」（见第 9 章增量）
- 失败的任务**重试**而非丢弃：网络抖一下不该丢数据
```python
from tenacity import retry, stop_after_attempt
@retry(stop=stop_after_attempt(3))
def fetch(url):
    return requests.get(url, timeout=10)
```
### 关键点
- 任务粒度要小（一条 URL 一个任务），崩了只丢当前这条
- 幂等：重试同一任务结果一致，不重复写

> ⚠️ 易错：任务粒度太大（一次抓 1 万条），崩了重来还是丢 1 万。粒度小，断点才精准。''',
                "断点续爬=记进度从断点继续；失败重试（如 tenacity）而非丢；任务粒度要小、操作幂等，崩了只丢当前小任务。",
                [fig("adv_dist_arch", "🔁 断点续爬：记进度/水位，崩了从断点继续；任务粒度小、操作幂等")],
                [word("RESUME", "续爬：从断点继续而非重头", "rɪˈzuːm"),
                 word("IDEMPOTENT", "幂等：重试结果一致不重复", "aɪˈdɛmpətənt"),
                 word("TENACITY", "tenacity：Python 重试装饰器库", "təˈnæsəti")],
                [choice("断点续爬的核心是？",
                        ["重头再来", "记住进度从断点继续", "不存进度"],
                        1, "记进度才能续。"),
                 fill("用______/数据库记「已抓进度」实现续爬。（填 Redis）",
                      "Redis", "Redis 常做进度中枢。"),
                 choice("关于任务粒度，正确的是？",
                        ["越大越好", "越小断点越精准", "无所谓"],
                        1, "粒度小断点准。"),
                 tap("续爬要点（多选）",
                     ["记进度/水位", "失败重试而非丢", "任务粒度小", "幂等可重入"],
                     [0, 1, 2, 3], "四条齐全。"),
                 openq("为什么「幂等」对重试很重要？",
                       "网络抖动触发重试时，若操作不幂等（如重复插入），会产生重复数据或副作用；幂等保证重试多次和一次结果一致，数据才干净。")],
                ["用 tenacity 给一个会随机失败的函数加重试，观察是否自动恢复。",
                 "把一个大任务拆成小任务，模拟崩溃看断点续爬。",
                 "记一句：粒度小，断点才精准。"]),

            les("a12l3", "日志监控报警", "📟", "#8e7bd6",
                '''## 日志与监控：爬虫得会「喊疼」

爬虫常跑在服务器后台，你不在现场。**日志（log）**记录每一步，**监控+报警**在异常时通知你。

### 日志
```python
import logging
logging.basicConfig(filename="crawl.log", level=logging.INFO)
logging.info("抓到 %d 条", n)
logging.error("请求失败: %s", url)
```
### 监控报警
- 统计：今日抓取量、失败率、耗时
- 报警：失败率突增 / 连续报错 → 发邮件/钉钉/微信
- 看板：用 Grafana 等把指标画出来

> 💡 没有日志的爬虫像黑盒：出了问题你只能干瞪眼。好爬虫「平时记日志，出事会报警」。''',
                "后台爬虫靠 logging 记步骤、监控统计+报警（失败率突增即通知）、看板可视化；无日志如黑盒，出问题无法定位。",
                [fig("debug_wheel", "📟 日志+监控+报警：爬虫后台「喊疼」，出事即通知，看板可视化")],
                [word("LOGGING", "日志：记录程序运行的每一步", "ˈlɔːɡɪŋ"),
                 word("ALERT", "报警：异常时主动通知", "əˈlɜːrt"),
                 word("DASHBOARD", "看板：指标可视化面板", "ˈdæʃbɔːrd")],
                [choice("后台爬虫靠什么让你知道状态？",
                        ["凭感觉", "日志+监控报警", "不管"],
                        1, "日志监控是眼睛。"),
                 fill("用 `logging.______(\"抓到 %d 条\", n)` 记录信息。（填 info）",
                      "info", "logging.info 记普通信息。"),
                 choice("报警触发条件通常是？",
                        ["每天固定", "失败率突增/连续报错", "从不"],
                        1, "异常才报警。"),
                 tap("监控报警要素（多选）",
                     ["统计抓取量/失败率", "异常发通知", "看板可视化", "完全不看"],
                     [0, 1, 2], "前三项；不看等于没监控。"),
                 openq("为什么「没有日志的爬虫像黑盒」很危险？",
                       "后台运行无人盯，一旦失败或数据异常，没有日志就无从定位是哪里、何时、什么原因，只能推倒重来，排查成本极高。")],
                ["给爬虫加 logging，故意制造一个错误看日志输出。",
                 "画一张「抓取量/失败率」看板草图。",
                 "记一句：好爬虫会喊疼。"]),

            les("a12l4", "Docker 容器化", "🐳", "#8e7bd6",
                '''## Docker：把爬虫打包成「集装箱」

爬虫依赖一堆库（Python 版本、scrapy、redis 客户端…）。换台机器跑，环境不对就崩。**Docker** 把「代码+依赖+环境」打包成镜像，到处运行一致。

### 最小 Dockerfile
```dockerfile
FROM python:3.11
COPY . /app
WORKDIR /app
RUN pip install -r requirements.txt
CMD ["python", "crawl.py"]
```
### 好处
- **环境一致**：本地能跑，服务器也能跑
- **隔离**：互不影响，一台机跑多个爬虫
- **易扩**：配合编排（K8s）一键起多份

> 💡 Docker 不是虚拟化整机，是「进程级隔离」，轻量。它让「在我机器上能跑」终于不等于「在你机器上崩」。''',
                "Docker 把代码+依赖+环境打包成镜像，进程级隔离、轻量，环境一致、易扩展；解决「换机依赖不对就崩」的痛点。",
                [fig("adv_docker", "🐳 Docker：代码+依赖+环境打包成镜像，进程级隔离，到处一致运行")],
                [word("DOCKER", "Docker：容器化打包工具", "ˈdɑːkər"),
                 word("IMAGE", "镜像：打包好的运行环境模板", "ˈɪmɪdʒ"),
                 word("CONTAINER", "容器：镜像运行起来的实例", "kənˈteɪnər")],
                [choice("Docker 主要解决？",
                        ["网速", "环境不一致(依赖/版本)", "解析难"],
                        1, "解决环境漂移。"),
                 fill("把代码+依赖打包成______（填镜像/容器）。",
                      "镜像", "镜像是静态模板，容器是运行实例。"),
                 choice("关于 Docker 隔离，正确的是？",
                        ["重", "轻量进程级隔离", "必须整机虚拟"],
                        1, "Docker 很轻。"),
                 tap("Docker 好处（多选）",
                     ["环境一致", "隔离互不影响", "易扩展", "换机必崩"],
                     [0, 1, 2], "前三项；换机不崩才是卖点。"),
                 openq("为什么「在我机器上能跑」用 Docker 后就不再等于「在你机器上崩」？",
                       "因为 Docker 把精确的运行环境（系统库、Python 版本、依赖版本）一并打包，目标机只跑容器，环境完全一致，不再受目标机已有环境干扰。")],
                ["写一个最小 Dockerfile 构建镜像并跑通。",
                 "体会「本地能跑、服务器也能跑」的一致性。",
                 "记一句：Docker 是集装箱。"]),

            les("a12l5", "Scrapyd·Gerapy 管理平台", "🖥️", "#8e7bd6",
                '''## Scrapyd + Gerapy：爬虫也能「后台管理」

写完 Scrapy 项目，怎么在服务器上**统一启停、看状态、定时调度**？Scrapyd 是 Scrapy 的**部署服务**，Gerapy 是给它做的**可视化后台**。

### Scrapyd 干什么
- 接收你 `scrapyd-deploy` 上传的项目
- 提供 HTTP API 启停爬虫、查状态
- 多项目集中管理

### Gerapy 干什么
- 网页界面：点几下就启停爬虫
- 可视化编辑调度、看运行日志
- 不用记命令行

```bash
pip install scrapyd gerapy
gerapy runserver 0.0.0.0:8000   # 打开网页管理
```
> 💡 个人小脚本用不到；但当爬虫变多、要常驻服务器，Scrapyd+Gerapy 让你「像管服务一样管爬虫」。''',
                "Scrapyd 是 Scrapy 部署服务（API 启停/查状态），Gerapy 是可视化后台（点按钮管理、看日志）。爬虫变多常驻服务器时值得上，个人小脚本用不到。",
                [fig("adv_scrapyd", "🖥️ Scrapyd 部署服务 + Gerapy 可视化后台：网页点按钮启停/看日志/集中管多项目")],
                [word("SCRAPYD", "Scrapyd：Scrapy 部署运行服务", "skreɪpi diː"),
                 word("GERAPY", "Gerapy：Scrapyd 的可视化后台", "dʒəˈreɪpi"),
                 word("DEPLOY", "部署：把项目发布到服务器", "dɪˈplɔɪ")],
                [choice("Scrapyd 是？",
                        ["解析库", "Scrapy 的部署/管理服务", "数据库"],
                        1, "Scrapyd 管部署运行。"),
                 fill("Gerapy 给 Scrapyd 做了______（填：可视化后台/命令行）。",
                      "可视化后台", "Gerapy 是网页界面。"),
                 choice("关于 Scrapyd+Gerapy，正确的是？",
                        ["个人小脚本必备", "爬虫变多常驻服务器时好用", "只能命令行"],
                        1, "规模上来才值。"),
                 tap("它们能做的（多选）",
                     ["HTTP API 启停爬虫", "网页点按钮管理", "看运行日志", "集中管理多项目"],
                     [0, 1, 2, 3], "四条齐全。"),
                 openq("什么时候值得上 Scrapyd+Gerapy，而不是手动跑脚本？",
                       "当爬虫项目变多、需要常驻服务器、要统一启停/定时/看状态/多人协作时，管理平台省去大量手工运维；零散一两个脚本没必要。")],
                ["了解 Scrapyd+Gerapy 的部署流程（文档）。",
                 "对比「手动 nohup 跑」和「平台管理」的运维差异。",
                 "记一句：爬虫多了才上平台。"]),
        ]),
        # ===================== 第13章 合规深水区 =====================
        ch("合规深水区", "⚖️", "#e6b84d", [
            les("a13l1", "个人信息保护法与边界", "🚧", "#e6b84d",
                '''## 合规红线：能抓 ≠ 该抓

技术上讲啥都能抓，但**法律画了线**。重点几类绝对谨慎：

### 高危数据
- **个人信息**：姓名、电话、身份证、人脸、行踪——受《个人信息保护法》严管，乱抓乱用违法
- **商业秘密/付费内容**：人家明确不让抓的
- **国家禁止爬取的对象**

### 三条自检
1. 数据是不是**个人信息/敏感信息**？
2. 对方 `robots.txt` / 服务条款**让不让抓**？
3. 抓取会不会**给人家服务器造成过重负担**或**突破技术防护措施**？

> ⚠️ 铁律：技术能力 ≠ 法律许可。爬之前先想这三条，拿不准就别碰。''',
                "合规红线：个人信息/敏感信息、商业秘密/付费内容、对方禁止抓的都谨慎；爬前自检三问（是否个人信息、对方让不让、是否过重负担/突破防护）。技术≠法律许可。",
                [fig("adv_compliance", "🚧 合规红线：个人信息/敏感信息、禁止抓的、突破防护都谨慎")],
                [word("PIPL", "个人信息保护法：管个人信息处理的法规", "piː aɪ piː ɛl"),
                 word("PERSONAL_INFO", "个人信息：可识别自然人的各种信息", "ˈpɜːrsənl ɪnˈfɔː"),
                 word("BOUNDARY", "边界：法律允许的抓取范围", "ˈbaʊndri")],
                [choice("《个人信息保护法》严管的是？",
                        ["公开新闻", "个人信息/敏感信息(电话/人脸等)", "自己的博客"],
                        1, "敏感个人信息受严管。"),
                 fill("爬之前先问：数据是不是______信息？（填 个人/敏感）",
                      "个人", "个人/敏感信息是红线。"),
                 choice("关于「能抓≠该抓」，正确的是？",
                        ["技术能抓就随便", "法律画了红线要守", "无所谓"],
                        1, "守法是底线。"),
                 tap("高危需谨慎的数据（多选）",
                     ["个人信息/人脸/行踪", "商业秘密/付费内容", "对方禁止抓的", "公开天气预报"],
                     [0, 1, 2], "前三项高危；公开天气可抓。"),
                 openq("为什么「给服务器造成过重负担」也可能违法/违规？",
                       "高频抓取拖垮对方服务器属于干扰正常经营，既违反服务条款，严重时可构成对计算机信息系统正常功能的破坏或不正当竞争，同样有法律风险。")],
                ["读一遍目标网站的 robots.txt 和服务条款，判断哪些能碰。",
                 "把「爬前三自检」抄在鼠标垫上。",
                 "记一句：技术≠许可，拿不准就别碰。"]),

            les("a13l2", "灰色地带案例与自检清单", "🟡", "#e6b84d",
                '''## 灰色地带：这些「擦边」别碰

有些行为游走在边缘，一不小心就越界。举几个典型：

### 擦边案例
- **伪造指纹/突破防护**：用 stealth 绕过人家明确的技术防护（第 4/13 章提过）
- **打码平台绕过验证码**：突破人家的人机校验（第 7 章）
- **绕过付费/登录墙**：拿本不该免费看的内容
- **爬竞品核心数据做不正当竞争**

### 自检清单（每条 Yes 都要警惕）
- [ ] 我抓的是别人明确禁止的吗？
- [ ] 我在突破人家技术防护吗？
- [ ] 涉及真实个人敏感信息吗？
- [ ] 会给对方造成实质损害吗？

> 💡 判断标准：是否「尊重对方意愿 + 不造成损害 + 不碰敏感/禁止」。有任一条中招，收手。''',
                "灰色地带：伪造指纹突破防护、打码绕过验证码、绕过付费墙、爬竞品核心数据都高危。自检清单任一 Yes 即警惕；标准是尊重意愿+不造成损害+不碰敏感/禁止。",
                [fig("adv_compliance", "🟡 灰色地带自检：突破防护/绕过验证码/绕过付费墙/爬竞品核心数据均高危")],
                [word("GREY", "灰色地带：游走在合规边缘的行为", "ɡreɪ"),
                 word("CHECKLIST", "自检清单：判断是否越界的提问", "ˈtʃɛklɪst"),
                 word("FAIR_USE", "合理使用：在授权/合规范围内的使用", "fɛr juːs")],
                [choice("下列哪种偏「擦边/高危」？",
                        ["抓自己博客", "用打码平台突破人家验证码", "抓公开天气"],
                        1, "突破人机校验高危。"),
                 fill("自检清单里「是否在突破人家______防护」要警惕。（填 技术）",
                      "技术", "突破技术防护是红线。"),
                 choice("判断能否爬的核心标准是？",
                        ["只要快", "尊重对方意愿+不造成损害+不碰敏感禁止", "看心情"],
                        1, "三条齐备才稳妥。"),
                 tap("灰色地带行为（多选）",
                     ["伪造指纹突破防护", "打码绕过验证码", "绕过付费墙", "抓公开新闻"],
                     [0, 1, 2], "前三项高危；公开新闻可。"),
                 openq("为什么「不正当竞争」（爬竞品核心数据）也可能惹官司？",
                       "爬取竞争对手核心经营数据用于自身竞争，可能构成侵犯商业秘密或不正当竞争，对方可依法索赔，是不少爬虫官司的真实案由。")],
                ["把自检清单记下来，以后每个爬虫项目先过一遍。",
                 "回顾前面章节里提到的灰色手段，标注其风险等级。",
                 "记一句：尊重意愿+不造成损害+不碰敏感禁止。"]),

            les("a13l3", "爬虫工程师职业路径", "🧭", "#e6b84d",
                '''## 当爬虫工程师：你能走多远

合规地写爬虫，是一份正经技术活。企业需要的是「**能稳定、合规、高效**拿到数据」的人。

### 能力地图
- 基础：requests/异步/解析（前 13 章）
- 进阶：逆向/分布式/存储/部署（本升阶课）
- 工程：调度/监控/容器/合规意识（第 12/13 章）
- 加分：数据清洗、反爬对抗经验、大数据栈

### 职业方向
- **数据采集工程师**：为企业合规建数据仓库
- **反爬/安全方向**：帮企业保护自己（正向）
- **数据分析上游**：供给干净数据

> 💡 这行越往后越吃「工程素养 + 合规意识」。技术强但无视红线，走不远；合规+稳定+高效，才是真本事。''',
                "合规爬虫是正经技术活；能力=基础+进阶+工程+合规意识，方向有数据采集/安全正向/数据上游。技术强+合规+稳定高效才走得远。",
                [fig("roadmap", "🧭 职业路径能力地图：基础→进阶→工程→合规，方向有数据采集/安全/数据上游")],
                [word("CAREER", "职业：以爬虫为生的技术路线", "kəˈrɪr"),
                 word("DATA_ENG", "数据采集工程师：合规建数据仓库", "ˈdeɪtə ɛndʒɪnɪr"),
                 word("ETHICS", "职业伦理：合规底线意识", "ˈɛθɪks")],
                [choice("企业最需要的爬虫人才特点是？",
                        ["越快越好不管合规", "稳定/合规/高效拿数据", "只会写死循环"],
                        1, "稳定合规高效是刚需。"),
                 fill("爬虫工程师的核心素养除了技术，还要有______意识。（填 合规）",
                      "合规", "合规意识是职业底线。"),
                 choice("关于职业方向，正确的是？",
                        ["只有黑产", "也有合规数据采集/安全正向方向", "没前途"],
                        1, "合规方向正当且需求大。"),
                 tap("爬虫工程师能力地图（多选）",
                     ["基础请求/解析", "逆向/分布式/存储", "调度/监控/容器", "合规意识"],
                     [0, 1, 2, 3], "四条都要。"),
                 openq("为什么「技术强但无视红线，走不远」？",
                       "无视合规轻则项目被封被诉、重则触犯法律，职业声誉和前途都会断；企业也只敢用既懂技术又守底线的工程师，红线意识决定能走多高多远。")],
                ["把自己的能力对照能力地图，标出还缺哪块。",
                 "了解一个「合规数据采集工程师」的招聘要求。",
                 "记一句：合规+稳定+高效才是真本事。"]),
        ]),
        # ===================== 第14章 毕业综合 + 家长课 =====================
        ch("毕业综合 + 家长课", "🎓", "#58b368", [
            les("gradA", "毕业项目 A：高并发异步采集", "🚀", "#58b368",
                '''## 毕业项目 A：高并发异步采集系统

把前 13 章串起来，做一个**能并发抓成千上万个页面**的异步采集器。目标：用 asyncio + aiohttp + 信号量 + 退避，稳定高效。

### 你要做
1. 选一个**你有权抓**的公开站点（如某公开榜单/文档站）
2. 设计 URL 生成器（列表页 → 详情页）
3. 用 aiohttp + Semaphore 并发抓，429 退避
4. 用 lxml/parsel 解析，落 MongoDB 或 CSV
5. 加日志、断点续爬、限速

### 验收点
| 能力 | 对应章节 |
|---|---|
| 异步并发 | ch1-2 |
| 解析 | ch3 |
| 限速/退避 | ch2/ch9 |
| 存储 | ch10 |
| 工程化 | ch12 |

> 💡 这个项目考的是「组合能力」：单点你都会，难点在把它们稳稳拼起来、不崩、不封。''',
                "毕业项目A=用 asyncio+aiohttp+Semaphore+退避 搭建高并发异步采集器，串起并发/解析/限速/存储/工程化；难点在稳稳组合、不崩不封。",
                [fig("adv_grad_arch", "🚀 毕业项目A：异步并发采集架构 asyncio+aiohttp+信号量+退避→解析→存储")],
                [word("PROJECT", "项目：综合运用的毕业实战", "ˈprɑːdʒɛkt"),
                 word("CONCURRENT_CRAWL", "高并发采集：同时抓大量页面", "kənˈkʌrənt krɔːl"),
                 word("ACCEPTANCE", "验收：项目达标的检查点", "əkˈsɛptəns")],
                [choice("毕业项目 A 的核心技术是？",
                        ["Selenium 点点点", "asyncio+aiohttp+信号量", "手工复制"],
                        1, "异步并发是 A 的主题。"),
                 fill("高并发采集用______控制同时并发数防冲垮。（填 信号量/Semaphore）",
                      "信号量|Semaphore", "Semaphore 限制并发。"),
                 choice("关于项目 A 的验收，正确的是？",
                        ["只看速度", "稳定+不封+能存", "不管合规"],
                        1, "稳定合规可存才是合格。"),
                 tap("项目 A 要用到的能力（多选）",
                     ["异步并发", "解析", "限速退避", "存储落库"],
                     [0, 1, 2, 3], "五章能力综合。"),
                 openq("为什么「组合能力」比「单点会」更难也更重要？",
                       "单点技术各自独立好掌握，但真实项目要并发、解析、限速、存储、工程化一起跑且互不拖垮，任何一环不稳整体就崩，组合才是工程能力的分水岭。")],
                ["选一个你有权抓的公开站，列出「列表页→详情页」的 URL 规律。",
                 "用 asyncio+aiohttp+Semaphore 写出并发骨架，先小批量试。",
                 "逐步加上 退避/解析/落库/日志/断点续爬，做成完整项目。"], code=GRAD_A_CODE, codeCopyOnly=True),

            les("gradB", "毕业项目 B：分布式 + ES 入库", "🏗️", "#58b368",
                '''## 毕业项目 B：分布式 + ES 入库

在 A 的基础上加难度：数据量更大，要**多机分布式**抓，并写入 **Elasticsearch** 支持检索。

### 你要做
1. 用 Redis 做中央队列 + 去重（scrapy-redis 或手写）
2. 多进程/多机协作抓
3. 文本近似去重（SimHash）避免重复
4. 清洗后写入 ES，建立索引可检索
5. 用 Docker 打包，Scrapyd 管理

### 验收点
| 能力 | 对应章节 |
|---|---|
| 分布式/去重 | ch9 |
| 存储/ES | ch10 |
| 部署 | ch12 |
| 合规 | ch13 |

> 💡 B 考的是「规模与工程」：当数据从千到千万，架构（队列/去重/检索/部署）才是分水岭。''',
                "毕业项目B=在A基础上加 Redis 中央队列/去重、多机分布式、SimHash 近似去重、清洗写 ES 检索、Docker+Scrapyd 部署；考规模与工程架构。",
                [fig("adv_grad_arch", "🏗️ 毕业项目B：Redis队列+多机分布式+SimHash去重+ES检索+Docker部署")],
                [word("DISTRIBUTED", "分布式：多机协作抓", "dɪˈstrɪbjuːtɪd"),
                 word("ELASTIC", "ES：检索入库", "ɪˈlæstɪk"),
                 word("PRODUCTION", "生产级：能稳定常驻运行", "prəˈdʌkʃən")],
                [choice("毕业项目 B 相比 A 多了什么？",
                        ["更少功能", "分布式+ES 检索", "不用存储"],
                        1, "规模与检索是 B 的增量。"),
                 fill("分布式用______做中央队列与去重。（填 Redis）",
                      "Redis", "Redis 做队列与去重中枢。"),
                 choice("写入 ES 的目的是？",
                        ["装饰", "支持全文检索", "更慢"],
                        1, "ES 为搜索。"),
                 tap("项目 B 能力（多选）",
                     ["Redis 中央队列", "多机协作", "SimHash 去重", "ES 检索"],
                     [0, 1, 2, 3], "四块增量能力。"),
                 openq("为什么「架构」在千万级数据时是分水岭？",
                       "千级数据单机字典去重、CSV 存储都够；千万级时内存、去重、检索、部署任一短板都会让系统崩溃或慢到不可用，只有合理架构（队列/去重/检索/容器）扛得住。")],
                ["把项目 A 改造成 Redis 中央队列版，起两个进程协作。",
                 "加 SimHash 去重，清洗后写入 ES 建索引。",
                 "用 Docker 打包并用 Scrapyd 管理起来。"], code=GRAD_B_CODE, codeCopyOnly=True),

            les("a14l3", "毕业回顾：站内外延伸与框架选型", "🔭", "#58b368",
                '''## 毕业回顾：走完还要知道的「活知识」

升阶课把主流知识点讲透了，但有两块**变化快/看具体场景**的内容，没法写进固定课——这里给你「思路地图」，遇到时按图索骥。

### ① 具体站点完整逆向思路
每个站点的签名/加密都不同，但套路通用：
1. 抓包定位接口（mitmproxy / DevTools）
2. 找算签名的函数（XHR 断点 / jadx）
3. 复现算法（Python hashlib / 看原生实现）
4. 处理二进制协议（protobuf）和设备绑定
> 这是「手艺活」：多练几个站，手感就来了。没有一招通吃。

### ⑤ 替代框架选型：PySpider vs Celery
- **PySpider**：自带 Web 界面的爬虫框架，适合**快速写+可视化监控**单站采集，胜在开箱即用
- **Celery**：通用**分布式任务队列**，不是爬虫框架，但用来**编排「抓取→清洗→入库」任务流**极稳，胜在和任意爬虫/处理解耦
> 选型口诀：单站快采要界面→PySpider；要把抓取塞进大任务流水线→Celery。''',
                "毕业回顾：①站点逆向套路通用（抓包定位→找签名函数→复现算法→处理二进制/设备绑定），是多练的手艺活；⑤PySpider 带界面快采单站，Celery 编排分布式任务流，按需选型。",
                [fig("adv_grad_arch", "🔭 毕业回顾：①具体站点逆向思路地图 + ⑤PySpider/Celery 框架选型")],
                [word("REVERSING", "逆向：还原站点签名/加密逻辑", "rɪˈvɜːrsɪŋ"),
                 word("PYSIDER", "PySpider：带界面的爬虫框架", "paɪ ˈspaɪdər"),
                 word("CELERY", "Celery：分布式任务队列", "ˈsɛləri")],
                [choice("具体站点逆向的通用套路第一步是？",
                        ["放弃", "抓包定位接口", "直接硬猜"],
                        1, "先定位接口。"),
                 fill("PySpider 自带______界面，适合快速单站采集。（填 Web）",
                      "Web", "PySpider 有可视化 Web 界面。"),
                 choice("Celery 的定位是？",
                        ["爬虫框架", "通用分布式任务队列(编排任务流)", "数据库"],
                        1, "Celery 编排任务流。"),
                 tap("毕业回顾要点（多选）",
                     ["站点逆向是手艺活多练", "PySpider 带界面快采", "Celery 编排任务流", "一招通吃所有站"],
                     [0, 1, 2], "前三项；没有一招通吃。"),
                 openq("为什么「具体站点逆向」是活知识、没法写死成固定课？",
                       "每个站点的签名算法、加密方式、协议、风控都在不停变，没有通用固定答案；只能给通用套路让你遇到新站能上手，具体实现必须现场逆向。")],
                ["挑一个你有权抓的站点，按四步套路试着定位它的接口与签名。",
                 "对比 PySpider 和 Celery 的适用场景，写一句选型口诀。",
                 "记一句：站点逆向是手艺活，多练出手感。"]),

            les("parent14", "家长课程：说明信与工具速览", "💌", "#58b368",
                '''## 给家长的一封信

亲爱的家长：

这是一套面向孩子的 **Python 爬虫进阶**学习工具。孩子在「爬虫入门」之后，继续在这里学**深水区**——异步高并发、JS 逆向、分布式、存储、App 抓包、部署监控，一直到毕业项目。

### 这套工具怎么用
- **学生课程**：按章节闯关，每节有讲解、练习、语音朗读和「小光讲一讲」
- **练习与勋章**：做练习拿勋章，阶段考 / 毕业考检验成果
- **家长面板**：您可以在这里看到孩子的学习进度与获得的勋章
- **设置**：可切换语音女声 / 男声、字号等

### 关于「合规」特别说明
第 13 章专门讲了**法律红线与职业操守**——我们强调「能抓不等于该抓」，只抓公开、授权、不造成损害的数据。希望孩子既长技术，也守底线。

> 陪伴孩子走完这套课，他会拥有一份正经的数据采集能力。有问题随时看家长面板的进度。''',
                "给家长的说明：本工具是孩子爬虫进阶课，含讲解/练习/语音/勋章/阶段考，第13章专讲合规底线；家长可看进度面板陪伴学习。",
                [fig("roadmap", "💌 学习路线地图：入门→进阶→毕业，家长可看进度面板陪伴")],
                [],
                [],
                [],
                True),
        ]),
        # ===================== 第15章 代理 IP 池与反封禁 =====================
        ch("代理 IP 池与反封禁", "🛡️", "#5b8fc4", [
            les("a15l1", "为什么需要代理：封 IP 原理", "🚫", "#5b8fc4",
                '''## 为什么需要代理：IP 会被封

网站靠**来源 IP** 识别「是不是同一个人在狂抓」。同一 IP 短时间发海量请求，风控直接**封 IP**——之后你的请求全被拒。

### 封 IP 原理
- 服务器记录每个 IP 的请求频率/行为
- 超阈值（太快/太像机器人）→ 拉黑该 IP
- 你本地网络就这一个出口 IP，封了=断粮

### 代理干嘛
代理=**换个出口 IP** 发请求。用一群代理 IP 轮换，让每个 IP 都「看起来像正常用户」。

```python
import requests
proxies = {"http": "http://1.2.3.4:8080", "https": "http://1.2.3.4:8080"}
r = requests.get(url, proxies=proxies)
```
> 💡 代理 + Cookie 池（第 7 章）=「IP + 账号」双分散，抗封最强组合。''',
                "封 IP 靠来源 IP 的请求频率/行为超限；代理换出口 IP 轮换，让每个 IP 像正常用户。代理+Cookie 池=IP+账号双分散，抗封最强。",
                [fig("adv_proxy_pool", "🚫 封 IP 原理：同 IP 高频→拉黑；代理换出口 IP 轮换分散")],
                [word("PROXY", "代理：中转请求的服务器，换出口 IP", "ˈprɑːksi"),
                 word("BAN", "封禁：IP 被拉黑拒绝服务", "bæn"),
                 word("ROTATE", "轮换：多个 IP 轮流用", "ˈroʊteɪt")],
                [choice("网站主要靠什么识别狂抓？",
                        ["浏览器颜色", "来源 IP 的请求频率/行为", "鼠标形状"],
                        1, "IP 行为是核心。"),
                 fill("代理的作用是换个______（出口）IP 发请求。（填 出口/来源）",
                      "出口", "代理改的是出口 IP。"),
                 choice("封 IP 后本地会？",
                        ["更快", "断粮(请求被拒)", "没事"],
                        1, "本地就一个出口 IP。"),
                 tap("代理的作用（多选）",
                     ["换出口IP", "让每个IP像正常用户", "分散请求", "提速百倍"],
                     [0, 1, 2], "前三项；代理不保证提速百倍。"),
                 openq("为什么「代理 + Cookie 池」是抗封最强组合？",
                       "风控常同时看 IP 和账号：只换 IP 不换账号仍能关联，只换账号不换 IP 同理；两者都换，每次请求像不同用户在异地访问，关联难度最大。")],
                ["用 requests 加 proxies 访问一个测试接口，看出口 IP 是否变化。",
                 "理解为什么单 IP 高频会被封。",
                 "记一句：IP+账号双分散。"]),

            les("a15l2", "免费 vs 付费代理", "💰", "#5b8fc4",
                '''## 免费 vs 付费代理

代理 IP 来源两类，天差地别。

### 免费代理
- 网上公开列表（如各大代理站），**不稳定、慢、易死、常被目标站也封**
- 适合练手、低频；生产别指望
### 付费代理
- 厂商提供**高匿、稳定、海量 IP**（如机房/IPC 代理）
- 按量/包月，有可用率保障
- 企业采集首选

### 关键指标
- **匿名度**：透明/匿名/高匿（高匿不暴露你真实 IP）
- **可用率**：能用比例
- **延迟/带宽**

> ⚠️ 易错：免费代理「能用」是少数，别在生产里裸用，否则一半请求失败还查不出原因。''',
                "免费代理不稳定易死常被封，只适合练手；付费代理高匿稳定海量，生产首选。看匿名度/可用率/延迟；裸用免费代理一半请求会失败。",
                [fig("adv_proxy_pool", "💰 免费代理(不稳易死) vs 付费代理(高匿稳定海量)")],
                [word("ANONYMOUS", "匿名度：是否暴露真实 IP", "əˈnɑːnəməs"),
                 word("PAID", "付费代理：厂商提供稳定 IP", "peɪd"),
                 word("FREE_PROXY", "免费代理：公开列表，质量参差", "friː ˈprɑːksi")],
                [choice("免费代理的问题是？",
                        ["超稳超快", "不稳定易死常被封", "无限量随便用"],
                        1, "免费代理质量差。"),
                 fill("生产首选______代理（填 付费/免费）。",
                      "付费", "生产用付费代理。"),
                 choice("关于匿名度，生产该用？",
                        ["透明(暴露真实IP)", "高匿(不暴露)", "无所谓"],
                        1, "高匿才安全。"),
                 tap("选代理看指标（多选）",
                     ["匿名度", "可用率", "延迟/带宽", "只看颜色"],
                     [0, 1, 2], "前三项；颜色无关。"),
                 openq("为什么「生产别裸用免费代理」？",
                       "免费代理大量已死或被目标站标记，裸用会导致近半请求失败、超时、拿到错误响应，且难以排查，采集链路直接不可靠。")],
                ["对比同一请求走免费 vs 付费代理的成功率。",
                 "理解匿名度三档（透明/匿名/高匿）的区别。",
                 "记一句：生产上付费代理。"]),

            les("a15l3", "自建代理池：Redis+校验+打分", "🧰", "#5b8fc4",
                '''## 自建代理池：可用率才是命

买来一堆代理 IP，不能直接用——很多已死。**代理池**=自动管理「获取 → 校验 → 打分 → 分发」。

### 架构
```python
import redis
r = redis.Redis()
# 1. 获取：从厂商 API 拉一批 IP 存 Redis
# 2. 校验：定时用每个 IP 访问测试站，能通才算活
# 3. 打分：连续成功+1，失败-1，低于阈值剔除
# 4. 分发：每次随机/按分挑一个可用 IP
def get_proxy():
    return r.zrange("proxies", 0, 0)   # 按分最高的取（示意）
```
### 要点
- 周期性**探活（health check）**，死 IP 及时踢
- 用**分数**优先挑高质量 IP
- 和请求失败自动换 IP 联动（下节）

> 💡 代理池不是「存 IP」，是「持续保证手里的 IP 能用」。可用率决定采集能不能跑通。''',
                "代理池=获取→校验探活→打分→分发，持续保证 IP 可用；周期探活踢死 IP、按分挑高质量。可用率比数量更决定采集成败。",
                [fig("adv_proxy_pool", "🧰 代理池：获取→校验探活→打分→分发，持续保证 IP 可用")],
                [word("PROXY_POOL", "代理池：管理可用代理的系统", "ˈprɑːksi puːl"),
                 word("HEALTH_CHECK", "探活：定时检测 IP 是否可用", "hɛlθ tʃɛk"),
                 word("SCORE", "打分：按成败给 IP 评质量分", "skɔːr")],
                [choice("代理池的核心目标是？",
                        ["存很多 IP", "持续保证手里的 IP 可用", "显示列表"],
                        1, "可用率才是命。"),
                 fill("定时用每个 IP 访问测试站叫______（探活）。（填 校验/探活）",
                      "校验|探活", "周期性探活剔除死 IP。"),
                 choice("代理池用分数优先挑？",
                        ["随机瞎挑", "高质量(高分)IP", "最差的"],
                        1, "优先高质量。"),
                 tap("代理池环节（多选）",
                     ["获取IP", "定时校验探活", "打分排序", "分发可用IP"],
                     [0, 1, 2, 3], "四环节闭环。"),
                 openq("为什么「可用率」比「IP 数量」更决定采集能否跑通？",
                       "1000 个 IP 若只有 10% 可用，实际能用的就 100 个且随时死；而 100 个高可用率 IP 稳定供给，采集反而跑得通。质量（可用率）决定有效产能。")],
                ["写一个最小代理池：拉 IP→定时探活→按分取。",
                 "故意注入几个死 IP，看是否被正确剔除。",
                 "记一句：可用率比数量重要。"]),

            les("a15l4", "封禁识别与换 IP 重试", "🔄", "#5b8fc4",
                '''## 封禁识别与换 IP 重试

有了代理池，还要会「**识别被封 + 自动换 IP 重试**」，否则采集会卡死在失败里。

### 识别被封的信号
- 返回 **403/429**（明确的拒绝）
- 返回**验证码页/登录页**（被拦了）
- 响应**异常快且内容空**（可能进了蜜罐/拦截页）

### 应对策略
```python
def fetch(url, pool):
    proxy = pool.get()
    try:
        r = requests.get(url, proxies=proxy, timeout=10)
        if r.status_code in (403, 429) or "验证码" in r.text:
            pool.fail(proxy)          # 标记这个 IP 不行
            return fetch(url, pool)   # 换 IP 重试
        return r
    except Exception:
        pool.fail(proxy)
        return fetch(url, pool)
```
> 💡 关键：**失败立即换 IP + 标记坏 IP**，别死磕一个被封的。配合退避（第 2 章）更稳。''',
                "被封信号：403/429、验证码/登录页、异常快且空的拦截页。策略：识别后立即换 IP + 标记坏 IP 重试，别死磕；配合退避更稳。",
                [fig("adv_proxy_pool", "🔄 识别封禁(403/验证码)→立即换IP+标记坏IP重试")],
                [word("DETECT_BAN", "识别封禁：判断请求是否被拦", "dɪˈtɛkt bæn"),
                 word("SWAP_IP", "换 IP：弃用坏 IP 换新的", "swɑːp aɪ piː"),
                 word("HONEYPOT", "蜜罐：诱捕爬虫的假页面", "ˈhʌnipɑːt")],
                [choice("哪些是被封信号？",
                        ["返回 200", "403/429 或验证码页", "正常内容"],
                        1, "403/429 是明确拒绝。"),
                 fill("识别到被封，应______ IP 并重试。（填 换/标记）",
                      "换", "换 IP 才能继续。"),
                 choice("关于失败处理，正确的是？",
                        ["死磕一个被封IP", "立即换IP+标记坏IP", "放弃全部"],
                        1, "换 IP 重试最稳。"),
                 tap("被封信号（多选）",
                     ["403/429", "验证码页/登录页", "响应异常快且空", "正常 200"],
                     [0, 1, 2], "前三项；200 正常。"),
                 openq("为什么「别死磕一个被封的 IP」？",
                       "被封的 IP 在封禁期内请求必败，死磕只会无限重试浪费时间、还可能触发更严风控；立即换 IP 并标记它坏，才能用其他 IP 继续推进。")],
                ["写一个 fetch 函数：识别 403/验证码就换 IP 重试。",
                 "区分「真失败」和「被封」两种信号。",
                 "记一句：被封立即换，别死磕。"]),
        ]),
        # ===================== 第16章 WebSocket 实时爬取 =====================
        ch("WebSocket 实时爬取", "📡", "#5aa9e6", [
            les("a16l1", "WS 协议基础与抓包", "📡", "#5aa9e6",
                '''## WebSocket：一条不断开的「双向热线」

普通 HTTP 像**打电话**：你问一句，对方答一句，挂断。问下句得重新拨。

WebSocket 像**开着的 walkietalkie（对讲机）**：一次握手建立长连接后，**服务器能随时主动给你推消息**，不用你再问。这就是「实时」的来源——直播弹幕、股票行情、聊天室都靠它。

### 抓包看 WS
浏览器 DevTools → Network → 找到 **WS 类型**的请求 → 点 **Frames（帧）** 标签，就能看到服务器推来的每条消息。也可以用 mitmproxy（第 11 章）拦截 WS 流量。

### 一个 WS 连接的生命
1. **握手**：客户端发个带 `Upgrade: websocket` 的 HTTP 请求
2. **建立**：服务器同意，连接升级为 WS 长连
3. **通信**：双方随时发「帧(frame)」，直到任一方关闭

> 💡 易错：WS 不是「更快的 HTTP」，是**另一种协议**。你不能用 requests 抓 WS，得用支持 WS 的库。''',
                "WebSocket 是握手后保持的全双工长连接，服务器可主动推数据；实时弹幕/行情靠它。抓包看 DevTools 的 Frames 或 mitmproxy。它≠更快的 HTTP，requests 抓不了。",
                [fig("adv_ws", "📡 WS：握手后长连，服务器能主动推（行情/弹幕）")],
                [word("WS", "WebSocket：全双工长连接协议", "ˈdʌbəljuː ˈɛs"),
                 word("HANDSHAKE", "握手：升级协议的那次请求", "ˈhændʃeɪk"),
                 word("FRAME", "帧：WS 里传递的一条消息", "freɪm"),
                 word("DUPLEX", "双工：双方都能发数据", "ˈdjuːplɛks")],
                [choice("WebSocket 与普通 HTTP 最大区别？",
                        ["HTTP 更快", "WS 握手后全双工长连，服务器可主动推", "WS 只能客户端发"],
                        1, "WS 是双向长连。"),
                 fill("WS 连接第一步叫______（升级协议的那次请求）。（填 握手/响应）",
                      "握手", "先握手升级。"),
                 choice("看 WS 推送的消息，该用？",
                        ["看 HTTP 状态码", "DevTools→Network→WS→Frames", "关掉网络"],
                        1, "Frames 标签看推送。"),
                 tap("WS 连接生命周期（多选）",
                     ["握手升级", "建立长连", "双方发帧通信", "只客户端能发"],
                     [0, 1, 2], "前三；WS 双向。"),
                 openq("为什么 requests 抓不了 WebSocket 数据？",
                       "requests 只实现 HTTP 一问一答模型，而 WS 是握手后的全双工长连接，数据由服务器主动推帧；requests 没有维持长连和读帧的能力，必须用 websockets/aiohttp 这类支持 WS 的库。")],
                ["用浏览器打开一个直播/行情页，DevTools 里找到 WS 请求并看 Frames。",
                 "对比「刷新页面才更新」和「不动就自动更新」两种页面，判断哪个用了 WS。",
                 "记一句：WS=对讲机，不是电话。"]),

            les("a16l2", "websockets 库异步爬取", "🔌", "#5aa9e6",
                '''## 用 websockets 库抓实时数据

Python 有专门的 `websockets` 库（也有 `aiohttp` 内置 WS 支持）。核心套路：

```python
import asyncio, websockets

async def listen(url):
    async with websockets.connect(url) as ws:   # 握手+建连
        while True:
            msg = await ws.recv()                # 等服务器推一帧
            print("收到:", msg)
            # 想订阅哪只股票？发个帧告诉服务器
            # await ws.send('{"sub": "BTC"}')

asyncio.run(listen("wss://example.com/stream"))
```

### 关键点
- `websockets.connect(url)` 返回异步上下文管理器，进入即完成**握手**
- `await ws.recv()` **挂起**等下一帧（又见 asyncio 的 await）
- `await ws.send(data)` 主动发帧（比如订阅某只股票）
- 配合 `asyncio` 可以**同时听好几个 WS 流**

> ⚠️ 易错：`ws.recv()` 是**异步**的，必须 `await`；忘了 await 拿到的是协程对象不是消息。还有：WS 地址是 `ws://` 或 `wss://`（加密），不是 `http://`。''',
                "websockets.connect 进上下文即握手；await ws.recv() 挂起等帧、await ws.send() 发帧；地址是 ws:// 或 wss://，必须 await。可配合 asyncio 并发多流。",
                [fig("adv_ws", "🔌 websockets：connect 握手 → recv 等帧 / send 发帧")],
                [word("CONNECT", "连接：建立 WS 长连", "kəˈnɛkt"),
                 word("RECV", "收帧：接收服务器推来的消息", "rɪˈsiːv"),
                 word("SEND", "发帧：主动发送消息", "sɛnd"),
                 word("WSS", "加密的 WS 地址（wss://）", "ˈdʌbəljuː ˈɛs ˈɛs")],
                [choice("websockets.connect 进 with 时发生了什么？",
                        ["啥也没发生", "完成握手建立长连", "只发普通 HTTP"],
                        1, "进上下文即握手。"),
                 fill("收一帧要写 `await ws.______()`。（填 recv/send）",
                      "recv", "recv 收帧。"),
                 choice("WS 的地址协议头是？",
                        ["http://", "ws:// 或 wss://", "ftp://"],
                        1, "WS 用自己的头。"),
                 choice("关于 ws.recv()，正确的是？",
                        ["同步直接返回", "必须 await 才拿到消息", "不用 await"],
                        1, "忘 await 拿到协程不是消息。"),
                 tap("websockets 爬实时数据要点（多选）",
                     ["connect 握手", "recv 收帧要 await", "send 发帧订阅", "用 http:// 地址"],
                     [0, 1, 2], "前三；地址用 ws://。"),
                 openq("怎么同时监听多个 WS 流？",
                       "用 asyncio 把多个 listen 协程 gather 起来并发跑，每个协程各自 connect+recv；事件循环在它们之间切换，谁有帧就处理谁，实现多路实时采集。")],
                ["写个最小脚本连一个公开 WS 回声服务，recv 打印几帧。",
                 "故意漏写 await 看报什么错，体会协程对象。",
                 "记一句：WS 地址用 ws://，recv 要 await。"]),

            les("a16l3", "实战：行情或直播弹幕", "🎯", "#5aa9e6",
                '''## 实战：抓行情 / 直播弹幕

理论落地。两类最常见实战：

### A. 行情流（如币价/股价）
连上 WS → 循环 `recv` 行情帧 → 帧通常是 **JSON** → 解析出价格 → 打印或入库。
```python
async def ticks(url):
    async with websockets.connect(url) as ws:
        async for msg in ws:                 # 每来一帧
            d = json.loads(msg)              # 解析 JSON
            print(d["symbol"], d["price"])   # 取价格
```

### B. 直播弹幕
连上直播 WS → `recv` 弹幕帧 → 过滤掉系统消息 → 收集「哈哈哈」「666」做词频。

### 三个保命细节
1. **心跳**：有些 WS 要定时发 ping，否则被踢。库一般自动处理，但要知道。
2. **断线重连**：网络抖一下就断，包一层 `while True: try/except: 重连`。
3. **别刷太快**：recv 到的数据量可能很大，处理不过来就丢帧或限流。

> 💡 思路：WS 爬取的难点不在「收」，在「稳」——心跳、重连、限流三件套保你不断流。''',
                "实战=连WS→recv帧→解析JSON(行情)或过滤(弹幕)→入库/统计。保命三件套：心跳保活、断线重连、处理限流。难点在『稳』不在『收』。",
                [fig("adv_ws", "🎯 实战：连WS→收帧→解析(行情JSON/弹幕过滤)→限流保稳")],
                [word("HEARTBEAT", "心跳：定时发 ping 保活", "ˈhɑːrtbiːt"),
                 word("RECONNECT", "重连：断了再建连", "riːkəˈnɛkt"),
                 word("TICK", "行情：一条价格更新", "tɪk"),
                 word("DANMU", "弹幕：直播聊天流", "dàn mù")],
                [choice("行情 WS 每帧通常是？",
                        ["图片", "JSON 文本", "视频"],
                        1, "行情多为 JSON。"),
                 fill("网络抖断后，要______才能继续收。（填 重连/重启电脑）",
                      "重连", "断线重连。"),
                 choice("关于心跳(ping)，正确的是？",
                        ["没用", "定期发保活，防止被踢", "只在结束时发"],
                        1, "心跳防被踢。"),
                 choice("处理 WS 海量帧时，最好？",
                        ["不管", "限流/丢帧防止处理不过来", "全存内存"],
                        1, "帧太多要限流。"),
                 tap("WS 实战保命细节（多选）",
                     ["心跳保活", "断线重连", "处理限流", "收到就永久阻塞"],
                     [0, 1, 2], "前三。"),
                 openq("为什么 WS 爬取『难点在稳不在收』？",
                       "recv 收帧本身很简单，但真实网络会抖动断连、服务器会踢 idle 连接、数据量可能远超处理速度；不重连就断流、不心跳就被踢、不限流就崩，所以工程重心在稳定性三件套。")],
                ["找一个公开行情 WS demo，recv 几帧解析出价格打印。",
                 "给监听函数加 try/except 重连外壳。",
                 "记一句：WS 爬取，稳字当头。"]),
        ]),

        # ===================== 第17章 音视频与 m3u8 下载 =====================
        ch("音视频与 m3u8 下载", "🎬", "#cf6f6f", [
            les("a17l1", "视频直链与大文件下载", "🎞️", "#cf6f6f",
                '''## 视频直链与大文件下载

最简单的音视频：网站直接给你一个 `.mp4` 文件链接（**直链**）。下载它就和下载任何文件一样——但视频往往**很大**（几百 MB 到几 GB），不能像小文件那样一股脑读进内存。

### 大文件正确下法
```python
import requests
url = "https://x.com/big.mp4"
r = requests.get(url, stream=True)        # 流式，不全读内存
with open("v.mp4", "wb") as f:
    for chunk in r.iter_content(1024*1024): # 1MB 一块写
        f.write(chunk)
```
- `stream=True`：别一次性下载，边下边写
- `iter_content(块大小)`：按块读，内存恒定

### 拿到直链
直链常藏在**视频标签的 src**、或**网络请求里的 media 类型响应**、或 **m3u8 里**（下节讲）。Playwright 拦截也能拿到。

> ⚠️ 易错：不用 `stream=True` 直接 `r.content` 读大文件，会爆内存；还有注意遵守网站版权，别乱下别人付费内容。''',
                "视频直链=.mp4 直接下；大文件用 stream=True + iter_content 分块写，内存恒定不爆。直链藏在 video src/网络 media 响应/m3u8 里。注意版权。",
                [fig("adv_m3u8", "🎞️ 直链下载：stream=True + iter_content 分块写盘，内存恒定")],
                [word("DIRECT_LINK", "直链：文件直接 URL", "ˈdaɪrɛkt lɪŋk"),
                 word("STREAM", "流式：边下边写", "striːm"),
                 word("CHUNK", "分块：一块块读", "tʃʌŋk"),
                 word("MEDIA", "媒体：音视频响应", "ˈmiːdiə")],
                [choice("下大视频文件，正确姿势是？",
                        ["r.content 全读内存", "stream=True+iter_content 分块写", "不管直接存"],
                        1, "分块写不爆内存。"),
                 fill("流式下载要设 `requests.get(url, ______=True)`。（填 stream/chunk）",
                      "stream", "stream 才流式。"),
                 choice("视频直链常藏在？",
                        ["网站配色", "video 标签 src / 网络 media 响应", "CSS 文件"],
                        1, "直链在媒体响应里。"),
                 choice("不用 stream 读几 GB 文件会？",
                        ["更快", "爆内存", "没事"],
                        1, "全读内存会炸。"),
                 tap("大文件下载要点（多选）",
                     ["stream=True", "iter_content 分块", "一块块写盘", "一次性 r.content"],
                     [0, 1, 2], "前三；别全读。"),
                 openq("为什么大文件必须用流式分块下载？",
                       "视频可达数 GB，一次性读进内存会超出可用 RAM 导致程序崩溃或系统卡死；stream+iter_content 按块读取并立刻落盘，内存占用保持恒定，既稳又能处理任意大文件。")],
                ["找一个公开 sample mp4 直链，用 stream 分块下到本地。",
                 "对比 r.content 和 iter_content 的内存占用差别（概念上）。",
                 "记一句：大文件，流式分块。"]),

            les("a17l2", "m3u8 解析·分片合并", "🧩", "#cf6f6f",
                '''## m3u8：视频被切成了一地碎片

很多网站（点播/直播）不直接给 mp4，而是给一个 **`.m3u8`** 文件——它**不是视频本身，是「播放清单」**：里面列着一堆 `.ts` 分片（001.ts、002.ts…）的地址。

### 下载步骤
1. 下载 m3u8 文本
2. 解析出所有 `.ts` 分片 URL（有时分片地址要拼上 m3u8 的基址）
3. 逐个下载 `.ts`
4. **按顺序合并**成一个 mp4

```python
import requests
m3u8 = requests.get("https://x.com/a.m3u8").text
ts_list = [line for line in m3u8.splitlines()
           if line and not line.startswith("#")]   # 过滤 # 注释行
# 逐个下 ts... 然后按顺序合并
```
合并可用 `ffmpeg`：`ffmpeg -f concat -i list.txt -c copy out.mp4`（list.txt 写各 ts 路径）。

### 两种 m3u8
- **点播(VOD)**：分片固定，全下完合并
- **直播**：分片不断新增，m3u8 在变，要持续追

> ⚠️ 易错：①分片地址可能是**相对路径**，要拼基址；②**顺序错了**画面就乱；③`#` 开头是注释/指令，不是分片。''',
                "m3u8 是分片清单不是视频；流程：下m3u8→解析出.ts分片URL→逐个下→按顺序合并(ffmpeg)。注意相对路径拼基址、顺序不能乱、#开头是注释非分片。点播全下、直播追更。",
                [fig("adv_m3u8", "🧩 m3u8=分片清单：下清单→解析.ts→逐个下→按序合并")],
                [word("M3U8", "分片播放清单", "ɛm ˈθri ˈjuː eɪt"),
                 word("TS", "分片：一段视频", "tiː ˈɛs"),
                 word("CONCAT", "合并：拼成整片", "kɒnˈkæt"),
                 word("VOD", "点播：固定分片可全下", "viː oʊ diː")],
                [choice(".m3u8 文件本质是？",
                        ["视频本身", "分片播放清单", "字幕"],
                        1, "m3u8 是清单。"),
                 fill("合并分片常用______（填 ffmpeg/word）。",
                      "ffmpeg", "ffmpeg 合并。"),
                 choice("解析 m3u8 时，`#` 开头的行是？",
                        ["分片", "注释/指令，要过滤", "视频数据"],
                        1, "# 是注释。"),
                 choice("分片地址是相对路径时，要？",
                        ["忽略", "拼上 m3u8 的基址", "随便下"],
                        1, "相对路径拼基址。"),
                 tap("m3u8 下载流程（多选）",
                     ["下 m3u8", "解析 .ts 分片", "逐个下载", "按顺序合并"],
                     [0, 1, 2, 3], "四步全对。"),
                 openq("为什么分片『顺序错了画面就乱』？",
                       "视频按时间轴连续编码，ts 分片是按时序切割的，解码器依赖前一片段的状态；顺序错乱会导致解码错位、花屏或卡顿，所以合并必须严格按 m3u8 里的先后次序拼接。")],
                ["找一个公开 m3u8 示例，解析出它的 .ts 分片数量。",
                 "用文本编辑器模拟拼 list.txt，理解合并顺序。",
                 "记一句：m3u8 是清单，分片要按序合并。"]),

            les("a17l3", "断点续传与并发下载", "⏩", "#cf6f6f",
                '''## 断点续传与并发下载

下载大文件/成百 ts 分片时，两个工程技巧让你不掉链子：

### 断点续传（Range）
服务器支持 `Range` 请求时，可以**只下某一段字节**：
```python
headers = {"Range": "bytes=0-1023"}      # 只要前 1KB
r = requests.get(url, headers=headers)
```
用途：①网络断了，从**已下到的字节**继续，不全重来；②配合已落盘大小判断进度。

### 并发下载（线程池/协程）
成百个 ts 分片，一个一个下太慢。用线程池并行：
```python
from concurrent.futures import ThreadPoolExecutor
with ThreadPoolExecutor(8) as ex:        # 8 个 worker 并行
    ex.map(download_one, ts_list)        # 并发下所有分片
```
> ⚠️ 并发数别太猛，不然把自己带宽打满或被封。

### 组合拳
先并发下各分片（带 Range 续传兜底）→ 再按序合并 → 断点续传保证单文件也不重来。

> 💡 思路：下载的成熟方案常常是「并发提速 + 续传保底」，两者配合才稳。''',
                "断点续传靠 Range 请求只下某段字节，断网从已下处续；并发下载用线程池/协程并行下多个分片提速（别太猛）。组合：并发下分片+Range续传兜底+按序合并。",
                [fig("adv_m3u8", "⏩ 续传(Range)+并发(线程池)：提速又保底")],
                [word("RANGE", "范围请求：续传关键", "reɪndʒ"),
                 word("RESUME", "续传：断点继续", "rɪˈzjuːm"),
                 word("CONCURRENT", "并发：并行下载", "kənˈkʌrənt"),
                 word("THREAD_POOL", "线程池：并行 worker", "θrɛd puːl")],
                [choice("断点续传靠 HTTP 的哪个机制？",
                        ["Cookie", "Range 范围请求", "UA"],
                        1, "Range 指定续传起点。"),
                 fill("断点续传用 `Range: bytes=已下字节-` 表示从此处一直下到______。（填 末尾/开头）",
                      "末尾", "省略末尾=下到完。"),
                 choice("并发下多个 ts 分片，常用？",
                        ["单线程一个个等", "线程池/协程并行", "不下载"],
                        1, "池化并行提速。"),
                 choice("并发数设太大可能？",
                        ["更快无代价", "带宽打满或被封", "没事"],
                        1, "太猛有反效果。"),
                 tap("下载加速/保底手段（多选）",
                     ["Range 续传", "线程池并发", "按序合并", "一次性全读"],
                     [0, 1, 2], "前三。"),
                 openq("为什么『并发提速+续传保底』是好组合？",
                       "并发用多线程/协程同时下多个分片大幅缩短总时长；续传保证任一分片因网络中断时只需补下剩余字节而非重头来，二者结合既快又在异常时零浪费，工程上最稳。")],
                ["写个带 Range 的小函数，断网后能从中断字节续下。",
                 "用线程池并发下 5 个示例分片计时对比串行。",
                 "记一句：并发提速，续传保底。"]),
        ]),

        # ===================== 阶段考④（覆盖 ch12-17） =====================
        exam("exam4", "阶段考④：部署·合规·代理·WS·音视频", "📝", "#e0922f",
            '''## 阶段考④：部署 · 合规 · 代理 · WebSocket · 音视频

覆盖 **调度·部署·监控 / 合规深水区 / 代理 IP 池与反封禁 / WebSocket 实时爬取 / 音视频与 m3u8 下载** 五章。

**规则**：8 题，首次正确率 ≥ 80% 过关，得「阶段考④过关」勋章，可重复挑战。

从「能跑」到「稳跑、合法跑、什么都能跑」，这一考收尾工程化。''',
            "阶段考④过关 = 你会定时调度与断点续爬、用 Docker/Scrapyd 部署、守住 PIPL 合规红线、用代理池抗封、用 WebSocket 抓实时、拆 m3u8 下音视频。工程闭环了。",
            [choice("APScheduler/cron 的作用是？",
                    ["画界面", "定时自动跑爬虫任务", "写代码"],
                    1, "定时调度，到点自跑。"),
             choice("断点续爬指？",
                    ["从头再爬", "记录进度，中断后从断点继续而非全重来", "不存进度"],
                    1, "续爬=接着上次处跑。"),
             choice("Docker 容器化部署爬虫的好处是？",
                    ["更慢", "环境一致、随处可跑、隔离依赖", "占更多电"],
                    1, "容器打包环境，到哪都能跑。"),
             choice("《个人信息保护法》对爬虫的核心约束是？",
                    ["随便抓", "未经同意不得非法收集/出售个人信息", "只抓公开的"],
                    1, "PIPL 管的是个人信息的收集与处理。"),
             choice("合规自检清单里，「爬前先查」应优先看？",
                    ["网站配色", "robots.txt + 服务条款 + 数据是否涉个人信息", "服务器位置"],
                    1, "先看 robots/条款/是否涉隐私。"),
             choice("网站封 IP 主要看？",
                    ["浏览器主题", "来源 IP 的请求频率/行为是否异常", "鼠标"],
                    1, "IP 行为超限就拉黑。"),
             choice("代理池的核心目标是？",
                    ["存很多 IP", "持续保证手里的 IP 可用（可用率）", "好看"],
                    1, "可用率比数量重要。"),
             choice("WebSocket 与普通 HTTP 请求的最大区别是？",
                    ["更慢", "全双工长连接，服务器可主动推数据", "只能 GET"],
                    1, "WS 是双向长连接。"),
             choice("m3u8 视频下载的正确流程是？",
                    ["直接下 m3u8 文件当视频", "解析 m3u8 拿到分片列表→逐个下载→合并", "不管分片"],
                    1, "m3u8 是播放列表，要下分片再合并。"),
             choice("大文件下载做「断点续传」靠？",
                    ["重新下", "Range 请求从断点字节续传", "换网络"],
                    1, "Range 头指定续传起点。")]),

        # ===================== 第18章 前沿补充 =====================
        ch("前沿补充", "🚀", "#8e7bd6", [
            les("a18l1", "深度学习自训验证码识别", "🧠", "#8e7bd6",
                '''## 前沿①：自己训练 CNN 认验证码

第 7 章的 ddddocr 能识别**常见简单**验证码，但遇到**强畸变、自定义字体、粘连**的验证码就歇菜。这时可以**自己训练模型**。

### 思路（不是手把手，是路线图）
1. **收集样本**：把验证码图片存下来（几千张起）
2. **人工标注**：告诉模型每张图上的字是啥（最累的一步）
3. **训练 CNN**：用 PyTorch/TensorFlow 搭个卷积网络，让它从像素学「这张图→这几个字」
4. **推理**：训练好后，新验证码丢进去直接出文字

更强的是**目标检测（如 YOLO）**：验证码字符是分开的，检测出每个字符位置再分别认，比整图硬认更准。

### 现实提醒
- 自己训**成本高**（标注几小时起），只对**量大且 ddddocr 搞不定的**才划算
- 这涉及「对抗验证码」，请只用在**你有权处理的站点/授权测试**，别碰别人付费墙

> 💡 思路：ddddocr 是「通用钥匙」，自训 CNN 是「配你家的专属钥匙」。''',
                "强畸变验证码 ddddocr 搞不定时可自训 CNN：收集样本→人工标注→训练卷积网络→推理出字；字符分离用目标检测(YOLO)更准。成本高，只对量大且授权的才划算。自训=专属钥匙。",
                [fig("adv_cnn_captcha", "🧠 自训 CNN：收集样本→人工标注→训练→推理出字（专属钥匙）")],
                [word("CNN", "卷积神经网络：学图像特征", "siː ɛn ɛn"),
                 word("LABEL", "标注：告诉模型答案", "ˈleɪbəl"),
                 word("YOLO", "目标检测：定位每个字符", "ˈjoʊloʊ"),
                 word("INFERENCE", "推理：模型预测输出", "ˈɪnfərəns")],
                [choice("ddddocr 识别不了哪种验证码？",
                        ["标准数字", "强畸变/自定义字体/粘连", "简单英文"],
                        1, "强畸变它歇菜。"),
                 fill("自训模型前，最需要人力的一步是______（告诉模型每张图答案是啥）。（填 标注/删除）",
                      "标注", "标注最累最关键。"),
                 choice("验证码字符分开时，哪种更准？",
                        ["整图硬认", "目标检测先定位每个字符再认", "不管"],
                        1, "检测+分认更准。"),
                 choice("自训 CNN 的成本主要来自？",
                        ["显卡太贵", "收集+人工标注样本耗时", "代码难写"],
                        1, "标注是成本大头。"),
                 tap("自训验证码识别流程（多选）",
                     ["收集样本", "人工标注", "训练 CNN", "推理出字"],
                     [0, 1, 2, 3], "四步全流程。"),
                 openq("什么时候才值得自己训练验证码模型，而不是用 ddddocr？",
                       "当验证码量大、且 ddddocr 等通用工具识别率过低（强畸变/自定义字体/粘连）以至于成为瓶颈，且你有合法授权处理该站点时才划算；自训要投入收集与标注成本，小批量用通用工具更经济。")],
                ["了解 CNN 四步路线图（收集→标注→训练→推理），不必真训。",
                 "区分「通用钥匙 ddddocr」和「专属钥匙自训」的适用场景。",
                 "记一句：自训是专属钥匙，成本高。"]),

            les("a18l2", "浏览器指纹对抗进阶", "🎨", "#8e7bd6",
                '''## 前沿②：浏览器指纹对抗进阶

第 4 章讲过 Playwright stealth 隐藏基础指纹。进阶玩家要懂**更隐蔽的指纹**：

### Canvas / WebGL / Audio 指纹
浏览器画同一幅图（Canvas）或用 WebGL/GPU 渲染，不同**显卡/驱动/系统**算出来的像素**有肉眼看不出的微差**。站点把这幅图哈希成一个**「指纹」**，就能跨会话认出「还是你这台机器」。

- **Canvas 指纹**：`canvas.toDataURL()` 渲染结果哈希
- **WebGL 指纹**：GPU 型号/驱动信息
- **Audio 指纹**：音频处理微差

### 对抗思路（伪造）
既然指纹来自「渲染微差」，就**故意扰动渲染参数**，让每次/每实例的指纹不一样或不稳定：
- 注入 JS 改 `toDataURL` 返回值加随机噪声
- 改 WebGL 返回的 GPU 字符串
- 用 stealth 插件的「指纹随机化」

> ⚠️ 提醒：指纹对抗是**攻防前沿**，站点也在升级。这是「思路课」，真实对抗请合规、授权范围内。''',
                "进阶指纹：Canvas/WebGL/Audio 因显卡/驱动微差生成唯一哈希指纹，跨会话识别你。对抗=故意扰动渲染参数(改toDataURL/WebGL字符串/随机化)让指纹不稳。属攻防前沿，须合规授权。",
                [fig("adv_canvas_fp", "🎨 指纹对抗：扰动 Canvas/WebGL/Audio 渲染→指纹不稳")],
                [word("CANVAS_FP", "Canvas 指纹：渲染微差哈希", "ˈkænvəs fɪŋɡərprɪnt"),
                 word("WEBGL", "WebGL：暴露 GPU 渲染信息", "ˈwɛb dʒiː ɛl"),
                 word("AUDIO_FP", "Audio 指纹：音频管线微差", "ˈɔːdiəʊ fɪŋɡərprɪnt"),
                 word("SPOOF", "伪造：扰动参数骗过追踪", "spuːf")],
                [choice("Canvas 指纹来自？",
                        ["屏幕大小", "同图画在不同显卡上渲染的微差哈希", "鼠标"],
                        1, "微差哈希成指纹。"),
                 fill("让指纹每次不同，可______渲染参数（加噪声/随机化）。（填 扰动/固定）",
                      "扰动", "扰动让指纹不稳。"),
                 choice("WebGL 指纹暴露的是？",
                        ["CPU 型号", "GPU/驱动信息", "硬盘"],
                        1, "WebGL 露 GPU。"),
                 choice("Audio 指纹依据的是？",
                        ["音量", "音频处理管线微差", "网速"],
                        1, "音频管线微差。"),
                 tap("进阶浏览器指纹类型（多选）",
                     ["Canvas", "WebGL", "Audio", "屏幕分辨率"],
                     [0, 1, 2], "前三属渲染微差指纹。"),
                 openq("为什么『扰动渲染参数』能对抗指纹追踪？",
                       "指纹的本质是渲染结果(像素/音频)的哈希，依赖本机显卡驱动等微差；若注入代码给 toDataURL/WebGL 返回值加可控随机噪声或改写 GPU 字符串，每次哈希就不同，站点无法用稳定指纹跨会话锁定同一机器。")],
                ["理解 Canvas/WebGL/Audio 三种指纹的生成原理。",
                 "想清楚「扰动参数」为何能让指纹失效。",
                 "记一句：指纹来自微差，扰动即对抗。"]),

            les("a18l3", "大模型(LLM)辅助爬虫", "🤖", "#8e7bd6",
                '''## 前沿③：让大模型帮你写爬虫

LLM（如 GPT 类）能当你的「爬虫副驾」，干三件爽事：

### 1. 自动生成选择器
把一段 HTML 贴给 LLM：「帮我对这个结构写出取标题和价格的 XPath/CSS」。它秒出，比你肉眼找标签快。

### 2. 智能抽取规则
给 LLM 网页 + 「我要的字段」，它直接产出**抽取逻辑**（甚至代码），特别适合**结构不规整**的页面。

### 3. 写/改爬虫代码
「用 Playwright 写个登录后抓订单的脚本」——LLM 能出初稿，你改改就能跑。

### 必须人把关
- LLM **会瞎编**选择器/字段名，跑之前**一定验证**
- 敏感站点别把**隐私数据**喂给外部 LLM
- 它是「加速器」不是「自动驾驶」

> 💡 思路：LLM 把「找标签→写规则」的重复劳动压缩到一句话，但**最终正确性由你拍板**。''',
                "LLM 辅助爬虫三件事：自动生成 XPath/CSS 选择器、智能抽取不规整页面的字段、写/改爬虫代码初稿。关键：LLM 会瞎编，必须人验证；敏感数据别喂外部模型；它是加速器不是自动驾驶。",
                [fig("adv_llm_selector", "🤖 LLM 副驾：给 HTML→出选择器/抽取规则/代码，人把关")],
                [word("LLM", "大模型：生成文本/代码", "ɛl ɛl ɛm"),
                 word("SELECTOR", "选择器：XPath/CSS 定位", "sɪˈlɛktər"),
                 word("EXTRACT", "抽取：取出目标字段", "ˈɛkstrækt"),
                 word("COPILOT", "副驾：辅助而非替代", "ˈkoʊpaɪlət")],
                [choice("LLM 最适合帮爬虫做？",
                        ["替代你决策", "生成选择器/抽取规则/代码初稿", "关掉电脑"],
                        1, "LLM 出初稿。"),
                 fill("LLM 出的选择器，上线前必须______（它可能会瞎编）。（填 验证/直接信）",
                      "验证", "必验证防瞎编。"),
                 choice("把含用户隐私的网页喂给外部 LLM，风险是？",
                        ["更快", "隐私泄露", "没事"],
                        1, "隐私别外传。"),
                 choice("LLM 在爬虫里的定位是？",
                        ["自动驾驶", "加速器/副驾，人把关", "完全不可信"],
                        1, "副驾，人拍板。"),
                 tap("LLM 辅助爬虫能干的（多选）",
                     ["生成选择器", "智能抽取字段", "写代码初稿", "绝对正确无需验"],
                     [0, 1, 2], "前三；需人验。"),
                 openq("为什么说 LLM 是『加速器』不是『自动驾驶』？",
                       "LLM 能快速产出选择器、抽取规则和代码初稿，把重复劳动压缩到一句话；但它会幻觉出不存在的字段或错误选择器，且可能泄露隐私，正确性必须人验证拍板，所以不能脱离人工直接全自动交付。")],
                ["用 LLM 对一段示例 HTML 生成取标题的 XPath，亲手验证对错。",
                 "体会「LLM 出初稿+人改」比纯手写快在哪。",
                 "记一句：LLM 是副驾，你握方向盘。"]),
        ]),

        # ===================== 毕业考（覆盖 ch1-18 + 毕业项目 A/B） =====================
        exam("exam5", "毕业考：爬虫升阶全程通关", "👑", "#e0922f",
            '''## 毕业考：爬虫升阶全程通关

覆盖 **全部 18 章 + 毕业项目 A（高并发异步采集）/ B（分布式 + ES 入库）** 的综合大考。

**规则**：10 题，首次正确率 ≥ 80%（至少 8 题首次即对）才能过关，获得「毕业考过关」勋章 + 通关「Python 爬虫大师」👑。没过回去复习重做，不限次数。

走到这，你已经从「会写 requests」长成了「能设计整套工程化爬虫系统」的人。最后一考，拿出真本事！''',
            "毕业考过关 = 你贯通了异步/JS逆向/字体OCR/验证码/Scrapy/分布式/存储/App/部署/合规/代理/WS/音视频/前沿，且两个毕业项目能落地。你已是 Python 爬虫大师👑。",
            [choice("设计高并发异步采集系统，核心三件套是？",
                    ["多线程+sleep", "asyncio 事件循环 + aiohttp 并发 + 信号量限流", "单线程"],
                    1, "异步并发+限流=高并发不封。"),
             choice("毕业项目 B（分布式+ES 入库）的灵魂是？",
                    ["单机 for 循环", "Redis 中央队列分发 + ES 建索引检索", "只存 txt"],
                    1, "中央调度+检索入库=分布式可查。"),
             choice("面对一个「数据藏在接口里、页面是空壳」的站点，首选？",
                    ["硬解析 DOM", "Playwright 拦截网络请求拿真实 API", "放弃"],
                    1, "截接口拿数据最快。"),
             choice("前端参数被 webpack 打包混淆，逆向时应？",
                    ["重写网站", "定位打包后的签名函数、扣出来或复现算法", "猜参数"],
                    1, "webpack 只是打包，函数还在，扣出来。"),
             choice("字体反爬 + OCR 混合时，正确拆解顺序是？",
                    ["直接 OCR 整页", "先用 fontTools 还原字体映射、再对残余图片 OCR", "忽略字体"],
                    1, "字体映射先还原，OCR 兜底。"),
             choice("大规模去重，哪组合最省内存又够用？",
                    ["全量 set 存原文", "布隆过滤器(强去重) + SimHash(近似去重) 组合", "不去做重"],
                    1, "布隆+SimHash 组合拳。"),
             choice("爬取的合规底线是？",
                    ["能抓就抓", "不非法收集/出售个人信息，尊重 robots 与条款", "看心情"],
                    1, "合规是不可逾越的红线。"),
             choice("代理池 + Cookie 池组合的价值是？",
                    ["更慢", "IP + 账号双分散，抗封最强", "没用"],
                    1, "双池=双分散抗封。"),
             choice("用 WebSocket 抓直播弹幕，关键是？",
                    ["轮询 HTTP", "建立长连接监听服务端推送的消息帧", "关掉网络"],
                    1, "WS 监听推送帧。"),
             choice("爬虫工程师职业路径上，最重要的长期能力是？",
                    ["背下所有库", "持续学习逆向/反爬对抗 + 工程化 + 合规意识", "只写脚本"],
                    1, "对抗+工程+合规，三位一体。")]),
    ]
}

# 把扁平的考试课塞回对应内容章的 lessons（照入门版机制：
# 考试课作为某章 lessons 的最后一个元素，使 chapters 仅含 18 个内容章，
# 索引 0~17 与 app.js 的 CHAPTER_BADGES.ch 一一对应，避免索引错位）
EXAM_MAP = {'exam1': 2, 'exam2': 6, 'exam3': 10, 'exam4': 16, 'exam5': 17}
_flat_exams = [c for c in COURSE['chapters'] if c.get('type') == 'exam']
COURSE['chapters'] = [c for c in COURSE['chapters'] if c.get('type') != 'exam']
for _ex in _flat_exams:
    _idx = EXAM_MAP[_ex['id']]
    assert _idx < len(COURSE['chapters']), '考试课落位越界: ' + _ex['id']
    COURSE['chapters'][_idx]['lessons'].append(_ex)

with open(OUT, 'w', encoding='utf-8') as f:
    f.write('// 课程数据（由 tools/build_adv_course.py 自动生成，勿手工编辑）\n')
    f.write('window.COURSE_DATA = ')
    json.dump(COURSE, f, ensure_ascii=False, indent=2)
    f.write(';\n')
_chs = COURSE['chapters']
_exams = sum(1 for c in _chs for l in c['lessons'] if l.get('type') == 'exam')
_lessons = sum(len(c['lessons']) for c in _chs)
print('已生成', OUT, '内容章', len(_chs), '课时(含考试)', _lessons, '其中考试课', _exams)
