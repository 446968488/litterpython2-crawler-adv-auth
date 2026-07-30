#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
add_coding_ex.py — 给「爬虫升阶」每节学生课补一道「编程题」(type:'coding')

- 能在浏览器(Skulpt)跑的：用提供的示例/模拟数据写纯 Python，设 expect 自动判分。
- 跑不了的(asyncio/Scrapy/ES/网络/加密库等)：不给 expect，前端显示「标记完成」，starter 给本机真跑代码供理解。
- 跳过 forParent / type:'exam' 的课；对已打 _gen='coding-ex' 标记的课幂等跳过。
- 写回 data/course.js（保留前缀 window.COURSE_DATA = 与后缀 ;）。

用法：python tools/add_coding_ex.py
"""
import os, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "data", "course.js")

# 每节一道编程题。expect=None 表示标记完成；否则为自动判分期望子串。
CODING = {
    # ---------- a1 异步基础 ----------
    "a1l1": {
        "question": "顺序下载 5 个网页，每个耗时 2 秒；并发下载 5 个一起跑只要约 2 秒。算一算两种方式的「总耗时」并打印。",
        "starter": "per = 2\nn = 5\nseq = 0   # TODO: 顺序总耗时 = ?\ncon = 0   # TODO: 并发总耗时约 = ?\nprint('顺序', seq, '秒；并发', con, '秒')",
        "expect": "顺序 10 秒",
    },
    "a1l2": {
        "question": "协程=能暂停的函数，靠事件循环调度。下面这段代码要在你本机跑（浏览器跑不了 asyncio），看懂思路后点「标记完成」。",
        "starter": "import asyncio\n\nasync def greet(name):\n    print('你好,', name)\n    await asyncio.sleep(0)   # 让出控制权\n\nasync def main():\n    await asyncio.gather(greet('小明'), greet('小红'), greet('小刚'))\n\nasyncio.run(main())",
        "expect": None,
    },
    "a1l3": {
        "question": "aiohttp 把 asyncio 用在网络上，并发抓很多页。下面代码需本机运行（浏览器跑不了网络），看懂点「标记完成」。",
        "starter": "import asyncio, aiohttp\n\nasync def fetch(session, url):\n    async with session.get(url) as r:\n        return await r.text()\n\nasync def main():\n    urls = ['https://a.com', 'https://b.com']\n    async with aiohttp.ClientSession() as s:\n        pages = await asyncio.gather(*(fetch(s, u) for u in urls))\n    print('抓了', len(pages), '页')\n\nasyncio.run(main())",
        "expect": None,
    },
    "a1l4": {
        "question": "信号量(并发数)限制同时只跑 3 个。要抓 10 个页面，算一算需要几「批」才能跑完（向上取整）。",
        "starter": "import math\nn = 10\nsem = 3\nwaves = 0   # TODO: 几批 = ceil(n/sem)\nprint('需要', waves, '批')",
        "expect": "需要 4 批",
    },
    "a1l5": {
        "question": "异步里一个任务抛异常不能让全部崩，要用 try/except 包住。下面代码需本机跑（浏览器跑不了 asyncio），看懂点「标记完成」。",
        "starter": "import asyncio\n\nasync def may_fail(i):\n    if i == 2:\n        raise ValueError('挂了')\n    return 'ok' + str(i)\n\nasync def main():\n    for i in range(4):\n        try:\n            print(await may_fail(i))\n        except Exception as e:\n            print('跳过', i, '原因', e)\n\nasyncio.run(main())",
        "expect": None,
    },
    # ---------- a2 httpx / 连接池 / 解析 / 退避 ----------
    "a2l1": {
        "question": "httpx 一个库同步异步都能用。下面代码需本机跑（浏览器跑不了网络），看懂点「标记完成」。",
        "starter": "import httpx\n\nwith httpx.Client() as c:\n    r = c.get('https://example.com')\n    print('状态码', r.status_code, '长度', len(r.text))",
        "expect": None,
    },
    "a2l2": {
        "question": "连接池复用 TCP，别每次都握手。下面代码需本机跑，看懂点「标记完成」。",
        "starter": "import httpx\n\nwith httpx.Client(headers={'Connection': 'keep-alive'}) as c:\n    for _ in range(3):\n        r = c.get('https://example.com')\n        print('复用连接，第', _, '次', r.status_code)",
        "expect": None,
    },
    "a2l3": {
        "question": "下面是一批网页源码(放在 htmls 列表)。用正则把每个里面所有 <li>文字</li> 的标题抓出来，拼成一个大列表并打印。",
        "starter": "import re\nhtmls = ['<ul><li>苹果</li><li>香蕉</li></ul>', '<ul><li>橙子</li><li>西瓜</li></ul>']\nall_items = []   # TODO: 遍历 htmls，用 re.findall 提取 <li>(.*?)</li> 并extend\nprint(all_items)",
        "expect": "['苹果', '香蕉', '橙子', '西瓜']",
    },
    "a2l4": {
        "question": "请求被限流(429)要退避重试。写代码算出前 4 次重试的等待秒数：第 i 次等 2**i 秒（i 从 1 开始）。",
        "starter": "delays = []\nfor i in range(1, 5):\n    delays.append(0)   # TODO: 填入 2**i\nprint(delays)",
        "expect": "[2, 4, 8, 16]",
    },
    # ---------- a3 解析 XPath/parsel ----------
    "a3l1": {
        "question": "下面 sample 是一段商品 HTML。用正则提取所有 class=\"price\" 的 <span> 里的价格（含￥），打印列表。",
        "starter": "import re\nsample = '<span class=\"price\">￥12</span><span class=\"price\">￥35</span>'\nprices = []   # TODO: 用 re.findall 提取 class=\"price\">(￥\\d+)\nprint(prices)",
        "expect": "['￥12', '￥35']",
    },
    "a3l2": {
        "question": "用正则把 <a href=\"链接\">文字</a> 的「链接」和「文字」配对，打印成 [(链接,文字),...]。",
        "starter": "import re\nhtml = '<a href=\"http://a.com\">首页</a><a href=\"http://b.com\">新闻</a>'\npairs = []   # TODO: 用 re.findall(r'<a href=\"(.*?)\">(.*?)</a>', html)\nprint(pairs)",
        "expect": "http://a.com', '首页",
    },
    "a3l3": {
        "question": "给定 1000 个商品价格，分别用「列表推导」和「for 循环」过滤出 >100 的，打印两种方式得到的数量（应相等）。",
        "starter": "prices = list(range(1, 1001))\nby_lc = [p for p in prices if p > 100]   # 列表推导\nby_loop = []\nfor p in prices:            # TODO: 把 >100 的加进 by_loop\n    if p > 100:\n        by_loop.append(p)\nprint('推导', len(by_lc), '循环', len(by_loop))",
        "expect": "推导 900 循环 900",
    },
    "a3l4": {
        "question": "parsel 用 CSS 选择器提取。这里用正则模拟：提取所有 <h2>标题</h2> 里的文字，打印列表。",
        "starter": "import re\ndoc = '<h2>第一章</h2><p>正文</p><h2>第二章</h2>'\ntitles = re.findall(r'<h2>(.*?)</h2>', doc)\nprint(titles)",
        "expect": "['第一章', '第二章']",
    },
    # ---------- a4 Playwright ----------
    "a4l1": {
        "question": "Playwright 用真实浏览器内核，比 Selenium 快在「自动等待+原生协议」。代码需本机跑（浏览器里跑不了），看懂点「标记完成」。",
        "starter": "from playwright.sync_api import sync_playwright\n\nwith sync_playwright() as p:\n    b = p.chromium.launch()\n    pg = b.new_page()\n    pg.goto('https://example.com')\n    print(pg.title())\n    b.close()",
        "expect": None,
    },
    "a4l2": {
        "question": "Playwright 自动等待元素出现，少写 sleep。代码需本机跑，看懂点「标记完成」。",
        "starter": "from playwright.sync_api import sync_playwright\n\nwith sync_playwright() as p:\n    b = p.chromium.launch()\n    pg = b.new_page()\n    pg.goto('https://example.com')\n    pg.wait_for_selector('h1')   # 自动等，不用 sleep\n    print(pg.text_content('h1'))\n    b.close()",
        "expect": None,
    },
    "a4l3": {
        "question": "拦截网络请求直接抓接口，是 Playwright 的杀手锏。代码需本机跑，看懂点「标记完成」。",
        "starter": "from playwright.sync_api import sync_playwright\n\nwith sync_playwright() as p:\n    b = p.chromium.launch()\n    pg = b.new_page()\n    pg.on('response', lambda r: print('接口', r.url) if '/api/' in r.url else None)\n    pg.goto('https://example.com')\n    b.close()",
        "expect": None,
    },
    "a4l4": {
        "question": "网站用 Cookie 记住登录态。下面 cookies 是已保存的登录信息，写代码把它拼成请求头格式 'k1=v1; k2=v2' 并打印。",
        "starter": "cookies = {'sessionid': 'abc123', 'token': 'xyz'}\nheader = ''   # TODO: 拼成 'sessionid=abc123; token=xyz'\nheader = '; '.join(k + '=' + v for k, v in cookies.items())\nprint(header)",
        "expect": "sessionid=abc123; token=xyz",
    },
    "a4l5": {
        "question": "stealth 隐藏自动化指纹(webdriver 等)。代码需本机跑，看懂点「标记完成」。",
        "starter": "from playwright.sync_api import sync_playwright\n\nwith sync_playwright() as p:\n    b = p.chromium.launch()\n    pg = b.new_page()\n    pg.add_init_script(\"Object.defineProperty(navigator,'webdriver',{get:()=>undefined})\")\n    pg.goto('https://example.com')\n    print('已隐藏 webdriver 指纹')\n    b.close()",
        "expect": None,
    },
    # ---------- a5 签名逆向 ----------
    "a5l1": {
        "question": "sign/token 常是前端现算的「防伪签名」。代码需本机跑，看懂思路点「标记完成」。",
        "starter": "# 思路：前端拿到参数 -> 按规则拼串 -> 哈希 -> 当成 sign 发给后端\nraw = 'a=1&b=2&t=99'\nprint('前端会把', raw, '拼好再哈希当成 sign')",
        "expect": None,
    },
    "a5l2": {
        "question": "用 DevTools 的 Network/Source 面板追密钥。这是分析方法，无代码，看懂点「标记完成」。",
        "starter": "# 步骤：\n# 1) F12 打开 DevTools -> Network 找到那个接口\n# 2) 看 Request 里的 sign 参数\n# 3) 到 Sources 里搜索 'sign' 下断点，跟到哈希函数\n# 4) 把同样的参数顺序和密钥抄到 Python 复现\nprint('方法课：动手在浏览器里跟一遍最有用')",
        "expect": None,
    },
    "a5l3": {
        "question": "签名常把参数拼成字符串再 md5。写代码对字符串 'hello' 求 md5（32 位十六进制），打印前 10 位。",
        "starter": "import hashlib\ns = 'hello'\nh = hashlib.md5(s.encode('utf-8')).hexdigest()\nprint('md5前10位', h[:10])",
        "expect": "5d41402abc",
    },
    "a5l4": {
        "question": "webpack 把代码打成很多 chunk，密钥藏在某个模块里。这是阅读打包的方法，无代码，看懂点「标记完成」。",
        "starter": "# 思路：\n# 1) Sources -> 切到 '{}' 美化后的源码\n# 2) 搜索 'sign' / 'md5' / 'encrypt'\n# 3) 跟调用栈找到真正算签名的函数\nprint('webpack 只是外壳，重点找算签名的那个函数')",
        "expect": None,
    },
    "a5l5": {
        "question": "AES/RSA 等加密思路：前端用密钥把参数加密当签名。这里只演示「用随机数当一次性 nonce」的思路，看懂点「标记完成」。",
        "starter": "import os\nnonce = os.urandom(4).hex()   # 一次性随机串，防重放\nprint('本次请求的 nonce =', nonce)",
        "expect": None,
    },
    # ---------- a6 字体/图片反爬 ----------
    "a6l1": {
        "question": "字体反爬把「显示字」换成「密文字」，但有一张映射表。用 map 把密文 'G' 解码成真字，并打印整句。",
        "starter": "m = {'G': '爬', 'H': '虫', 'K': '网'}\ncoded = 'G H K'\ndecoded = ''   # TODO: 把 coded 按空格切开，逐个用 m 解码拼成句子\ndecoded = ''.join(m.get(c, c) for c in coded.split())\nprint('解码后:', decoded)",
        "expect": "解码后: 爬虫网",
    },
    "a6l2": {
        "question": "fontTools 解析字体文件还原「密文->真字」映射。代码需本机跑（浏览器无 fontTools），看懂点「标记完成」。",
        "starter": "from fontTools.ttLib import TTFont\nfont = TTFont('secret.ttf')\ncmap = font.getBestCmap()\nfor code, name in cmap.items():\n    print(hex(code), name)   # 对照真字表还原",
        "expect": None,
    },
    "a6l3": {
        "question": "OCR 把图片里的字识别成文本(ddddocr)。代码需本机跑，看懂点「标记完成」。",
        "starter": "import ddddocr\nocr = ddddocr.DdddOcr()\nwith open('cap.png', 'rb') as f:\n    text = ocr.classification(f.read())\nprint('识别结果', text)",
        "expect": None,
    },
    "a6l4": {
        "question": "雪碧图里每个小图在整张大图上的偏移是 (x,y)。每个小图 20x20，整行排 5 个。算出第 3 个小图的真实坐标(左上角)。",
        "starter": "cell = 20\nper_row = 5\nidx = 3   # 第3个(从1数)\nrow = (idx - 1) // per_row\ncol = (idx - 1) % per_row\nx = col * cell\ny = row * cell\nprint('第', idx, '个小图坐标', x, y)",
        "expect": "坐标 40 0",
    },
    "a6l5": {
        "question": "综合混合反爬：字体+图片+加密一起上。这是拆解思路，无单一代码，看懂点「标记完成」。",
        "starter": "# 拆解套路：\n# 1) 先看接口返回的是密文还是图片\n# 2) 密文 -> 找字体映射；图片 -> OCR/打码平台\n# 3) 有 sign -> 跟 webpack 找哈希函数\nprint('一层层剥：先找数据在哪，再破解码/解密')",
        "expect": None,
    },
    # ---------- a7 验证码/滑块 ----------
    "a7l1": {
        "question": "图形验证码用打码平台(人工/AI)识别。代码需本机跑，看懂点「标记完成」。",
        "starter": "import requests\n# 把验证码图发给打码平台，拿回文字\nr = requests.post('https://dama.com/api', files={'img': open('cap.png','rb')})\nprint('打码平台返回', r.json().get('result'))",
        "expect": None,
    },
    "a7l2": {
        "question": "滑块要「先慢后快再慢」。写代码生成 10 个位移点：用 0~1 的进度 t，位移 = t*t*(3-2*t)（平滑），打印这 10 个位移。",
        "starter": "track = []\nfor i in range(10):\n    t = i / 9.0\n    pos = 0   # TODO: pos = t*t*(3-2*t) * 100（总距离100）\n    pos = t * t * (3 - 2 * t) * 100\n    track.append(round(pos, 1))\nprint(track)",
        "expect": "[0.0,",
    },
    "a7l3": {
        "question": "行为验证(token)靠鼠标轨迹判断是否真人。这是思路，无单一代码，看懂点「标记完成」。",
        "starter": "# 思路：\n# 1) 生成拟人轨迹（先慢后快再慢）\n# 2) 带上轨迹去请求拿到 token\n# 3) token 随接口一起发\nprint('重点：轨迹要像人，别匀速直线')",
        "expect": None,
    },
    "a7l4": {
        "question": "多账号 Cookie 池轮流用才不易被封。给定 cookies 列表，按顺序取出第 1、2、3 次用的 Cookie 打印。",
        "starter": "cookies = ['c1', 'c2', 'c3', 'c4']\nused = []\nfor i in range(3):\n    used.append(cookies[i % len(cookies)])   # TODO: 轮流取\nprint('依次用', used)",
        "expect": "['c1', 'c2', 'c3']",
    },
    # ---------- a8 Scrapy ----------
    "a8l1": {
        "question": "Scrapy 架构=引擎·调度·下载·管道。这是架构理解，无单一代码，看懂点「标记完成」。",
        "starter": "# 数据流：\n# Spider 产出 Request -> 调度器排队 -> 下载器抓 -> Response -> Spider 解析\n# -> Item 交给 Pipeline 清洗入库\nprint('记住这条流水线就懂了 Scrapy')",
        "expect": None,
    },
    "a8l2": {
        "question": "Spider 定义抓什么、ItemLoader 装载字段。代码需本机跑，看懂点「标记完成」。",
        "starter": "import scrapy\n\nclass BookSpider(scrapy.Spider):\n    name = 'book'\n    start_urls = ['https://example.com/books']\n    def parse(self, r):\n        for b in r.css('.book'):\n            yield {'title': b.css('h2::text').get()}",
        "expect": None,
    },
    "a8l3": {
        "question": "Downloader Middleware 在请求中途加工(加头/换代理)。代码需本机跑，看懂点「标记完成」。",
        "starter": "class ProxyMiddleware:\n    def process_request(self, request, spider):\n        request.meta['proxy'] = 'http://1.2.3.4:8080'\n        return None",
        "expect": None,
    },
    "a8l4": {
        "question": "Pipeline 清洗入库：爬来的数据有空格、有重复。给定 records，清洗(去空格)并按 id 去重后，打印保留的条数。",
        "starter": "records = [{'id': 1, 'name': ' 张三 '}, {'id': 2, 'name': '李四'}, {'id': 1, 'name': ' 张三 '}]\nseen = set()\nclean = []\nfor r in records:\n    name = r['name'].strip()\n    if r['id'] in seen:\n        continue\n    seen.add(r['id'])\n    clean.append({'id': r['id'], 'name': name})\nprint('清洗后保留', len(clean), '条')",
        "expect": "清洗后保留 2 条",
    },
    "a8l5": {
        "question": "Scrapy 配置调优：并发·限速·重试。这是配置项，无逻辑代码，看懂点「标记完成」。",
        "starter": "# settings.py\n# CONCURRENT_REQUESTS = 16\n# DOWNLOAD_DELAY = 1\n# RETRY_TIMES = 3\nprint('调并发和延迟，别把对方压垮')",
        "expect": None,
    },
    # ---------- a9 去重/分布式 ----------
    "a9l1": {
        "question": "单机限速+set 去重：给定 urls 列表(有重复)，用 set 去重后打印去重后的数量和列表。",
        "starter": "urls = ['a', 'b', 'a', 'c', 'b', 'd']\nuniq = []   # TODO: 用 set 去重并保持顺序\nseen = set()\nfor u in urls:\n    if u not in seen:\n        seen.add(u)\n        uniq.append(u)\nprint('去重后', len(uniq), uniq)",
        "expect": "['a', 'b', 'c', 'd']",
    },
    "a9l2": {
        "question": "Redis 中央队列用 deque 模拟：把 3 个 URL 放进队列，再依次 popleft 打印（先进先出）。",
        "starter": "from collections import deque\nq = deque()\nfor u in ['u1', 'u2', 'u3']:\n    q.append(u)   # TODO: 入队\nout = []\nwhile q:\n    out.append(q.popleft())   # TODO: 出队\nprint('出队顺序', out)",
        "expect": "['u1', 'u2', 'u3']",
    },
    "a9l3": {
        "question": "scrapy-redis 给 Scrapy 装分布式调度。代码需本机跑(依赖 Redis)，看懂点「标记完成」。",
        "starter": "# settings.py\n# SCHEDULER = 'scrapy_redis.scheduler.Scheduler'\n# REDIS_URL = 'redis://127.0.0.1:6379'\nprint('多台机器读同一个 Redis 队列，就分布式了')",
        "expect": None,
    },
    "a9l4": {
        "question": "布隆过滤器用多个哈希判断「可能在/一定不在」。这里用 set 模拟：把 'a.com','b.com' 加入，再判断 'a.com' 和 'c.com' 是否「可能已见」。",
        "starter": "seen = set()\nfor u in ['a.com', 'b.com']:\n    seen.add(u)\nprint('a.com 见过?', 'a.com' in seen)\nprint('c.com 见过?', 'c.com' in seen)",
        "expect": "a.com 见过? True",
    },
    "a9l5": {
        "question": "SimHash 用「特征出现次数的奇偶」生成指纹。给定两段文字，按字切特征，奇数次记1偶数记0得指纹，再数两指纹不同位数(海明距离)打印。",
        "starter": "def simhash(text):\n    cnt = {}\n    for ch in text:\n        cnt[ch] = cnt.get(ch, 0) + 1\n    fp = 0\n    for ch in sorted(cnt):\n        fp = (fp << 1) | (1 if cnt[ch] % 2 else 0)\n    return fp\n\na = '小光爱爬虫'\nb = '小光爱爬虫'\nfa, fb = simhash(a), simhash(b)\ndist = bin(fa ^ fb).count('1')\nprint('海明距离', dist)",
        "expect": "海明距离",
    },
    "a9l6": {
        "question": "增量爬取：old 是已抓过的 URL 集合，new 是新发现的一批。算出「这一轮只需新抓哪些」(在 new 但不在 old 里)并打印。",
        "starter": "old = {'a', 'b', 'c'}\nnew = ['a', 'c', 'd', 'e', 'b']\nfresh = []   # TODO: 在 new 但不在 old 里的\nprint('本轮新抓', fresh)",
        "expect": "['d', 'e']",
    },
    "a9l7": {
        "question": "Kafka/RabbitMQ 当采集管道，解耦生产消费。代码需本机跑(依赖中间件)，看懂点「标记完成」。",
        "starter": "from kafka import KafkaProducer\np = KafkaProducer(bootstrap_servers='localhost:9092')\np.send('crawl-tasks', b'https://example.com')\nprint('已把任务投进 Kafka 队列')",
        "expect": None,
    },
    # ---------- a10 存储 ----------
    "a10l1": {
        "question": "MongoDB 存不规整的文档。把几条「文章」文档存进列表，再查出 title 含 'Python' 的文档打印其数量。",
        "starter": "docs = [\n    {'title': 'Python 入门', 'len': 10},\n    {'title': 'Java 基础', 'len': 8},\n    {'title': 'Python 进阶', 'len': 20},\n]\nfound = [d for d in docs if 'Python' in d['title']]   # TODO\nprint('含 Python 的文档', len(found), '篇')",
        "expect": "含 Python 的文档 2 篇",
    },
    "a10l2": {
        "question": "Elasticsearch 为搜索而生。这里用列表模拟：写函数 search(docs, kw) 返回标题或正文含 kw 的文档，测试搜 '爬虫'。",
        "starter": "docs = [\n    {'title': '爬虫技巧', 'body': 'asyncio'},\n    {'title': '做菜', 'body': '番茄'},\n    {'title': '爬虫进阶', 'body': '分布式'},\n]\ndef search(docs, kw):\n    return [d for d in docs if kw in d['title'] or kw in d['body']]   # TODO\nprint('搜 爬虫 命中', len(search(docs, '爬虫')), '篇')",
        "expect": "搜 爬虫 命中 2 篇",
    },
    "a10l3": {
        "question": "清洗去重入库：给定一批带空格重复的用户记录，清洗(去空格)并按 id 去重后，打印保留条数。",
        "starter": "records = [{'id': 1, 'name': ' 王 '}, {'id': 2, 'name': '赵'}, {'id': 1, 'name': ' 王 '}]\nseen = set()\nclean = []\nfor r in records:\n    name = r['name'].strip()\n    if r['id'] in seen:\n        continue\n    seen.add(r['id'])\n    clean.append({'id': r['id'], 'name': name})\nprint('去重后', len(clean), '条')",
        "expect": "去重后 2 条",
    },
    "a10l4": {
        "question": "图片/大文件存对象存储(如 S3/OSS)。代码需本机跑(依赖 SDK)，看懂点「标记完成」。",
        "starter": "# 伪代码：把图片流上传到对象存储拿回 URL\nurl = 'https://oss.example.com/imgs/abc.jpg'\nprint('图片已存对象存储:', url)",
        "expect": None,
    },
    # ---------- a11 App 抓包 ----------
    "a11l1": {
        "question": "mitmproxy 抓 HTTPS 中间人。代码需本机跑，看懂点「标记完成」。",
        "starter": "def response(flow):\n    if 'api' in flow.request.url:\n        print('抓到接口', flow.request.url, flow.response.text)",
        "expect": None,
    },
    "a11l2": {
        "question": "App 接口常把 token 拼上时间戳再做 md5 当签名。写代码对 'secret'+str(ts) 求 md5 并打印前 8 位。",
        "starter": "import hashlib\nts = 1700000000\nsign = hashlib.md5(('secret' + str(ts)).encode('utf-8')).hexdigest()\nprint('sign 前8位', sign[:8])",
        "expect": "sign 前8位",
    },
    "a11l3": {
        "question": "jadx 反编译 Apk 看 Java 代码。这是工具操作，无 Python 逻辑，看懂点「标记完成」。",
        "starter": "# 步骤：\n# 1) 把 apk 拖进 jadx-gui\n# 2) 在 resources.arsc / smali 里搜 'sign' / 'encrypt'\n# 3) 跟到算签名的方法\nprint('jadx 是看 App 源码的显微镜')",
        "expect": None,
    },
    "a11l4": {
        "question": "frida hook 运行时改函数/读参数。代码需本机跑，看懂点「标记完成」。",
        "starter": "import frida\n# js = \"Java.perform(function(){ /* hook 目标方法 */ });\"\n# session = frida.get_usb_device().attach('com.xxx')\nprint('frida 在 App 运行时动手脚')",
        "expect": None,
    },
    # ---------- a12 部署监控 ----------
    "a12l1": {
        "question": "APScheduler/cron 定时跑任务。这是调度配置，无核心逻辑，看懂点「标记完成」。",
        "starter": "# 每天 8 点跑一次\n# sched.add_job(crawl, 'cron', hour=8)\nprint('定时任务靠调度器，不在代码里手写循环')",
        "expect": None,
    },
    "a12l2": {
        "question": "断点续爬：total 是全部 100 个任务，done 是已完成的前 30 个。算出「还要抓哪些编号」并打印还剩几个。",
        "starter": "total = 100\ndone = 30\nleft = list(range(done + 1, total + 1))   # TODO: 从 done+1 到 total\nprint('还剩', len(left), '个，编号从', left[0], '起')",
        "expect": "还剩 70 个",
    },
    "a12l3": {
        "question": "日志监控报警：logs 是一批日志行，统计里面出现了几次 'ERROR' 并打印。",
        "starter": "logs = ['INFO ok', 'ERROR db down', 'INFO ok', 'ERROR timeout', 'WARN slow']\nn = 0\nfor line in logs:\n    if 'ERROR' in line:\n        n += 1\nprint('ERROR 出现', n, '次')",
        "expect": "ERROR 出现 2 次",
    },
    "a12l4": {
        "question": "Docker 容器化把爬虫打包成镜像。这是运维配置，无 Python 逻辑，看懂点「标记完成」。",
        "starter": "# Dockerfile\n# FROM python:3.11\n# COPY . /app\n# RUN pip install -r requirements.txt\n# CMD [\"python\", \"crawl.py\"]\nprint('Docker 让环境到处一样')",
        "expect": None,
    },
    "a12l5": {
        "question": "Scrapyd/Gerapy 管理多个爬虫。代码需本机跑(依赖服务)，看懂点「标记完成」。",
        "starter": "# 启服务后\n# curl http://localhost:6800/schedule.json -d project=demo -d spider=book\nprint('Scrapyd 远程启停爬虫')",
        "expect": None,
    },
    # ---------- a13 合规 ----------
    "a13l1": {
        "question": "个人信息保护法划了红线：不能乱抓个人信息。这是法律边界，写一句你的自检口诀点「标记完成」。",
        "starter": "# 自检：抓的是公开？授权？会不会伤到人？\nprint('能抓不等于该抓；先问合规再动手')",
        "expect": None,
    },
    "a13l2": {
        "question": "灰色地带案例自检：遇到「要登录才能看」「对方明确禁止爬」时怎么办。写一句原则点「标记完成」。",
        "starter": "# 原则：\n# 1) robots 禁止 / 明文拒绝 -> 不碰\n# 2) 个人敏感信息 -> 不碰\nprint('尊重 robots 与法律，留好底线')",
        "expect": None,
    },
    "a13l3": {
        "question": "爬虫工程师职业路径：数据/反爬/数据工程都走得通。写一句你的方向点「标记完成」。",
        "starter": "# 路径：爬虫开发 -> 反爬对抗 -> 数据平台/搜索\nprint('先把技术练正，路自然宽')",
        "expect": None,
    },
    # ---------- 毕业项目 ----------
    "gradA": {
        "question": "毕业项目 A 是高并发异步采集器（完整代码在上方「完整代码」框）。这里用模拟数据体会「并发 vs 顺序」速度差：给定 8 个任务每个 1 秒，算顺序与并发总耗时打印。",
        "starter": "n = 8\nper = 1\nseq = per * n\ncon = per\nprint('顺序', seq, '秒；并发', con, '秒')",
        "expect": "顺序 8 秒",
    },
    "gradB": {
        "question": "毕业项目 B 是分布式+ES 入库（完整代码在上方）。这里用 deque 模拟「中央队列+多 worker」：把 6 个任务入队，3 个 worker 轮流 popleft 打印。",
        "starter": "from collections import deque\nq = deque(['t1','t2','t3','t4','t5','t6'])\nwhile q:\n    print('worker 取走', q.popleft())",
        "expect": "worker 取走 t1",
    },
    # ---------- a14 毕业回顾 ----------
    "a14l3": {
        "question": "毕业回顾：站内外延伸与框架选型。写一句你下一步想深入的框架点「标记完成」。",
        "starter": "# 选型口诀：小需求 requests；异步 aiohttp；大型 Scrapy；浏览器 Playwright\nprint('按需求选框架，别盲目堆')",
        "expect": None,
    },
    # ---------- a15 代理 ----------
    "a15l1": {
        "question": "封 IP 靠来源 IP。proxies 是代理 IP 列表，模拟 6 次请求轮流用不同代理(按下标取模)，打印每次用的代理。",
        "starter": "proxies = ['1.1.1.1', '2.2.2.2', '3.3.3.3']\nfor i in range(6):\n    print('第', i + 1, '次用', proxies[i % len(proxies)])   # TODO",
        "expect": "第 6 次用 3.3.3.3",
    },
    "a15l2": {
        "question": "免费 vs 付费代理：免费不稳、付费快稳。这是选型权衡，写一句点「标记完成」。",
        "starter": "# 免费：练手；付费：生产\nprint('生产用付费，省心省力')",
        "expect": None,
    },
    "a15l3": {
        "question": "自建代理池用 deque 存可用代理并打分。模拟：把 3 个代理入池，取 3 次(取完补回)打印用到的代理。",
        "starter": "from collections import deque\npool = deque(['p1', 'p2', 'p3'])\nfor _ in range(3):\n    p = pool.popleft()\n    print('用', p)\n    pool.append(p)   # TODO: 用完补回池子",
        "expect": "用 p1",
    },
    "a15l4": {
        "question": "封禁识别与换 IP 重试：ok 列表模拟每次是否成功(前两次失败)。失败就换下一个代理重试，直到成功，打印最终成功的代理。",
        "starter": "proxies = ['p1', 'p2', 'p3']\nok = [False, False, True]   # 模拟前两次失败\nfor i, succ in enumerate(ok):\n    if succ:\n        print('成功，用的代理', proxies[i])\n        break\n    else:\n        print('被封，换', proxies[i + 1])",
        "expect": "成功，用的代理 p3",
    },
    # ---------- a16 WebSocket ----------
    "a16l1": {
        "question": "WS 是长连接双向通信协议。这是协议基础，无 Python 逻辑，看懂点「标记完成」。",
        "starter": "# HTTP: 一问一答，答完断开\n# WS: 握手后一直连着，服务端能主动推\nprint('WS 适合弹幕/行情这类持续推送')",
        "expect": None,
    },
    "a16l2": {
        "question": "websockets 库异步爬取。代码需本机跑(asyncio)，看懂点「标记完成」。",
        "starter": "import asyncio, websockets\n\nasync def main():\n    async with websockets.connect('wss://echo') as ws:\n        await ws.send('hi')\n        print(await ws.recv())\n\nasyncio.run(main())",
        "expect": None,
    },
    "a16l3": {
        "question": "实战：行情或直播弹幕用 WS 持续收。代码需本机跑，看懂点「标记完成」。",
        "starter": "import asyncio, websockets\n\nasync def recv():\n    async with websockets.connect('wss://live') as ws:\n        while True:\n            print('弹幕', await ws.recv())\n\nasyncio.run(recv())",
        "expect": None,
    },
    # ---------- a17 视频/大文件 ----------
    "a17l1": {
        "question": "视频直链与大文件下载：文件 1000MB，每块 100MB，算要分几块下载并打印。",
        "starter": "import math\nsize = 1000\nchunk = 100\nblocks = math.ceil(size / chunk)   # TODO\nprint('分', blocks, '块下载')",
        "expect": "分 10 块下载",
    },
    "a17l2": {
        "question": "m3u8 里列了 8 个 .ts 分片。按顺序把它们拼成完整文件名列表(seg_0.ts ... seg_7.ts)打印。",
        "starter": "n = 8\nsegs = []\nfor i in range(n):\n    segs.append('seg_' + str(i) + '.ts')   # TODO\nprint(segs)",
        "expect": "['seg_0.ts'",
    },
    "a17l3": {
        "question": "断点续传：已下载 400MB，文件共 1000MB，每块 100MB。算出「从哪个块继续下」和「还剩几块」。",
        "starter": "total = 1000\ndone = 400\nchunk = 100\nnext_block = done // chunk   # TODO\nleft = total // chunk - next_block\nprint('从块', next_block, '继续，还剩', left, '块')",
        "expect": "从块 4 继续",
    },
    # ---------- a18 前沿 ----------
    "a18l1": {
        "question": "深度学习自训验证码识别：用标注数据训练模型。代码需本机跑(依赖 torch)，看懂点「标记完成」。",
        "starter": "# 伪代码：\n# model = CNN(); model.fit(images, labels)\nprint('标注越多，模型越准')",
        "expect": None,
    },
    "a18l2": {
        "question": "浏览器指纹对抗进阶：收集 canvas/webgl 等特征生成指纹。代码需本机跑，看懂点「标记完成」。",
        "starter": "# 思路：\n# 1) 读 canvas 渲染 hash\n# 2) 读 webgl 厂商\n# 3) 拼成指纹字符串\nprint('指纹越独特，越容易被盯上')",
        "expect": None,
    },
    "a18l3": {
        "question": "大模型(LLM)辅助爬虫：让它读页面写解析 XPath。这是用法思路，写一句点「标记完成」。",
        "starter": "# 提示词：把这段 HTML 里商品价格所在的 XPath 写出来\nprint('LLM 写 XPath/正则，人审再上线')",
        "expect": None,
    },
}


# 参考答案：仅「能自动判分」的题需要显式给出；标记完成(expect=None)的题回退用 starter。
# 这里是完整可运行的正确代码，渲染时由「👀 参考答案」按钮展示。
SOLUTIONS = {
    "a1l1": r"""per = 2
n = 5
seq = per * n        # 顺序：每个都跑完才跑下一个
con = per            # 并发：5 个一起跑，总耗时≈单个
print('顺序', seq, '秒；并发', con, '秒')""",
    "a1l4": r"""import math
n = 10
sem = 3
waves = math.ceil(n / sem)   # 向上取整
print('需要', waves, '批')""",
    "a2l3": r"""import re
htmls = ['<ul><li>苹果</li><li>香蕉</li></ul>', '<ul><li>橙子</li><li>西瓜</li></ul>']
all_items = []
for h in htmls:
    all_items.extend(re.findall(r'<li>(.*?)</li>', h))
print(all_items)""",
    "a2l4": r"""delays = []
for i in range(1, 5):
    delays.append(2 ** i)   # 第 i 次等 2**i 秒
print(delays)""",
    "a3l1": r"""import re
sample = '<span class="price">￥12</span><span class="price">￥35</span>'
prices = re.findall(r'class="price">(￥\d+)', sample)
print(prices)""",
    "a3l2": r"""import re
html = '<a href="http://a.com">首页</a><a href="http://b.com">新闻</a>'
pairs = re.findall(r'<a href="(.*?)">(.*?)</a>', html)
print(pairs)""",
    "a3l3": r"""prices = list(range(1, 1001))
by_lc = [p for p in prices if p > 100]
by_loop = []
for p in prices:
    if p > 100:
        by_loop.append(p)
print('推导', len(by_lc), '循环', len(by_loop))""",
    "a3l4": r"""import re
doc = '<h2>第一章</h2><p>正文</p><h2>第二章</h2>'
titles = re.findall(r'<h2>(.*?)</h2>', doc)
print(titles)""",
    "a4l4": r"""cookies = {'sessionid': 'abc123', 'token': 'xyz'}
header = '; '.join(k + '=' + v for k, v in cookies.items())
print(header)""",
    "a5l3": r"""import hashlib
s = 'hello'
h = hashlib.md5(s.encode('utf-8')).hexdigest()
print('md5前10位', h[:10])""",
    "a6l1": r"""m = {'G': '爬', 'H': '虫', 'K': '网'}
coded = 'G H K'
decoded = ''.join(m.get(c, c) for c in coded.split())
print('解码后:', decoded)""",
    "a6l4": r"""cell = 20
per_row = 5
idx = 3
row = (idx - 1) // per_row
col = (idx - 1) % per_row
x = col * cell
y = row * cell
print('第', idx, '个小图坐标', x, y)""",
    "a7l2": r"""track = []
for i in range(10):
    t = i / 9.0
    pos = t * t * (3 - 2 * t) * 100   # 平滑曲线：先慢后快再慢
    track.append(round(pos, 1))
print(track)""",
    "a7l4": r"""cookies = ['c1', 'c2', 'c3', 'c4']
used = []
for i in range(3):
    used.append(cookies[i % len(cookies)])   # 轮流取
print('依次用', used)""",
    "a8l4": r"""records = [{'id': 1, 'name': ' 张三 '}, {'id': 2, 'name': '李四'}, {'id': 1, 'name': ' 张三 '}]
seen = set()
clean = []
for r in records:
    name = r['name'].strip()
    if r['id'] in seen:
        continue
    seen.add(r['id'])
    clean.append({'id': r['id'], 'name': name})
print('清洗后保留', len(clean), '条')""",
    "a9l1": r"""urls = ['a', 'b', 'a', 'c', 'b', 'd']
seen = set()
uniq = []
for u in urls:
    if u not in seen:
        seen.add(u)
        uniq.append(u)
print('去重后', len(uniq), uniq)""",
    "a9l2": r"""from collections import deque
q = deque()
for u in ['u1', 'u2', 'u3']:
    q.append(u)          # 入队
out = []
while q:
    out.append(q.popleft())   # 出队（先进先出）
print('出队顺序', out)""",
    "a9l4": r"""seen = set()
for u in ['a.com', 'b.com']:
    seen.add(u)
print('a.com 见过?', 'a.com' in seen)
print('c.com 见过?', 'c.com' in seen)""",
    "a9l5": r"""def simhash(text):
    cnt = {}
    for ch in text:
        cnt[ch] = cnt.get(ch, 0) + 1
    fp = 0
    for ch in sorted(cnt):
        fp = (fp << 1) | (1 if cnt[ch] % 2 else 0)   # 奇数为1，偶数为0
    return fp

a = '小光爱爬虫'
b = '小光爱爬虫'
fa, fb = simhash(a), simhash(b)
dist = bin(fa ^ fb).count('1')   # 不同位数 = 海明距离
print('海明距离', dist)""",
    "a9l6": r"""old = {'a', 'b', 'c'}
new = ['a', 'c', 'd', 'e', 'b']
fresh = [u for u in new if u not in old]   # 在新发现里、但已抓过没有的
print('本轮新抓', fresh)""",
    "a10l1": r"""docs = [
    {'title': 'Python 入门', 'len': 10},
    {'title': 'Java 基础', 'len': 8},
    {'title': 'Python 进阶', 'len': 20},
]
found = [d for d in docs if 'Python' in d['title']]
print('含 Python 的文档', len(found), '篇')""",
    "a10l2": r"""docs = [
    {'title': '爬虫技巧', 'body': 'asyncio'},
    {'title': '做菜', 'body': '番茄'},
    {'title': '爬虫进阶', 'body': '分布式'},
]
def search(docs, kw):
    return [d for d in docs if kw in d['title'] or kw in d['body']]
print('搜 爬虫 命中', len(search(docs, '爬虫')), '篇')""",
    "a10l3": r"""records = [{'id': 1, 'name': ' 王 '}, {'id': 2, 'name': '赵'}, {'id': 1, 'name': ' 王 '}]
seen = set()
clean = []
for r in records:
    name = r['name'].strip()
    if r['id'] in seen:
        continue
    seen.add(r['id'])
    clean.append({'id': r['id'], 'name': name})
print('去重后', len(clean), '条')""",
    "a11l2": r"""import hashlib
ts = 1700000000
sign = hashlib.md5(('secret' + str(ts)).encode('utf-8')).hexdigest()
print('sign 前8位', sign[:8])""",
    "a12l2": r"""total = 100
done = 30
left = list(range(done + 1, total + 1))   # 从 done+1 到 total
print('还剩', len(left), '个，编号从', left[0], '起')""",
    "a12l3": r"""logs = ['INFO ok', 'ERROR db down', 'INFO ok', 'ERROR timeout', 'WARN slow']
n = 0
for line in logs:
    if 'ERROR' in line:
        n += 1
print('ERROR 出现', n, '次')""",
    "a15l1": r"""proxies = ['1.1.1.1', '2.2.2.2', '3.3.3.3']
for i in range(6):
    print('第', i + 1, '次用', proxies[i % len(proxies)])   # 轮流取模
""",
    "a15l3": r"""from collections import deque
pool = deque(['p1', 'p2', 'p3'])
for _ in range(3):
    p = pool.popleft()
    print('用', p)
    pool.append(p)   # 用完补回池子，循环复用
""",
    "a15l4": r"""proxies = ['p1', 'p2', 'p3']
ok = [False, False, True]   # 模拟前两次失败
for i, succ in enumerate(ok):
    if succ:
        print('成功，用的代理', proxies[i])
        break
    else:
        print('被封，换', proxies[i + 1])
""",
    "a17l1": r"""import math
size = 1000
chunk = 100
blocks = math.ceil(size / chunk)   # 向上取整
print('分', blocks, '块下载')""",
    "a17l2": r"""n = 8
segs = []
for i in range(n):
    segs.append('seg_' + str(i) + '.ts')
print(segs)""",
    "a17l3": r"""total = 1000
done = 400
chunk = 100
next_block = done // chunk           # 已下满的块数
left = total // chunk - next_block   # 剩余块数
print('从块', next_block, '继续，还剩', left, '块')""",
    "gradA": r"""n = 8
per = 1
seq = per * n        # 顺序：8 个任务排队，每个 1 秒
con = per            # 并发：8 个一起跑，约 1 秒
print('顺序', seq, '秒；并发', con, '秒')""",
    "gradB": r"""from collections import deque
q = deque(['t1', 't2', 't3', 't4', 't5', 't6'])
while q:
    print('worker 取走', q.popleft())   # 多 worker 轮流 popleft
""",
}


def load_course():
    src = open(SRC, encoding="utf-8").read()
    pre = src[: src.index("{")]
    post = src[src.rindex("}") + 1 :]
    body = src[src.index("{") : src.rindex("}") + 1]
    return pre, post, json.loads(body)


def main():
    pre, post, data = load_course()
    added = 0
    updated = 0
    for ch in data["chapters"]:
        for les in ch.get("lessons", []):
            lid = les.get("id")
            if lid not in CODING:
                continue
            spec = CODING[lid]
            # 参考答案：显式 > SOLUTIONS > 回退 starter（标记完成的题用 starter 当参考答案）
            solution = spec.get("solution") or SOLUTIONS.get(lid) or spec.get("starter", "")
            exs = les.setdefault("exercises", [])
            ex = next((e for e in exs if e.get("_gen") == "coding-ex"), None)
            if ex is None:
                ex = {"type": "coding", "_gen": "coding-ex"}
                exs.append(ex)
                added += 1
            ex["question"] = spec["question"]
            ex["starter"] = spec.get("starter", "")
            ex["solution"] = solution
            if spec.get("expect"):
                ex["expect"] = spec["expect"]
            else:
                ex.pop("expect", None)
            updated += 1
    out = pre + json.dumps(data, ensure_ascii=False, indent=2) + post
    open(SRC, "w", encoding="utf-8").write(out)
    print("编程题：新增 %d 道，更新 %d 道；参考答案已写入" % (added, updated))
    print("学生课编程题总数(含标记完成):", sum(1 for ch in data["chapters"] for l in ch.get("lessons", []) if any(e.get("_gen") == "coding-ex" for e in l.get("exercises", []))))


if __name__ == "__main__":
    main()
