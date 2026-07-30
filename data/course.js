// 课程数据（由 tools/build_adv_course.py 自动生成，勿手工编辑）
window.COURSE_DATA = {
  "title": "小光陪你写爬虫 · 进阶深水区",
  "chapters": [
    {
      "title": "异步爬虫基础",
      "icon": "🌀",
      "color": "#5b8fc4",
      "lessons": [
        {
          "id": "a1l1",
          "title": "同步为何慢：I/O 等待与 GIL 的误会",
          "icon": "🐌",
          "markdown": "## 同步爬虫：一个一个来，慢在哪\n\n同步代码像排队打饭：**发一个请求 → 干等服务器回数据 → 收到才发下一个**。等的时候你的程序被「阻塞」住，啥也干不了。\n\n### 慢的根因：I/O 等待\n爬虫 90% 时间在等网络（I/O），不是算数据。同步模式下，等的时候线程被卡死，100 个网址就要等 100 次往返。\n\n### GIL 背不背锅？\n很多人以为慢是 Python 的 GIL（全局锁）。**其实不是**——GIL 限制的是 CPU 计算并行，而爬虫瓶颈是 I/O 等待。这锅 GIL 不背。\n\n### 对比一眼懂\n| 模式 | 等第 1 个时 | 100 个网址耗时 |\n|---|---|---|\n| 同步 | 卡住干等 | ≈ 100 × 单程 |\n| 异步 | 去发第 2、3…个 | ≈ 接近 1 次单程 |\n\n> 💡 异步不是「算得更快」，而是「等的时候不闲着」。",
          "takeaway": "同步慢在「等网络时线程被卡住干等」，不是 GIL 的锅（GIL 只限 CPU 并行）。异步精髓：等的时候不闲着，去发下一个请求，100 个网址并发≈一次单程。",
          "figures": [
            {
              "key": "adv_sync_vs_async",
              "caption": "🐌 同步排队干等 vs 异步边等边发：瓶颈在 I/O 等待，不在算力"
            }
          ],
          "words": [
            {
              "en": "ASYNC",
              "zh": "异步：不等结果、先去干别的事的执行方式",
              "pron": "əˈsɪŋk"
            },
            {
              "en": "BLOCK",
              "zh": "阻塞：程序卡在某一步动不了，直到这步完成",
              "pron": "blɑːk"
            },
            {
              "en": "IO",
              "zh": "I/O：输入/输出，这里指网络收发等等待型操作",
              "pron": "aɪ ˈoʊ"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "同步爬虫慢，最主要的原因是？",
              "options": [
                "等网络 I/O 时线程被阻塞、干等着",
                "Python 算数据太慢",
                "GIL 把 CPU 锁死了"
              ],
              "answer": 0,
              "explain": "爬虫瓶颈是网络等待，线程在等响应时被卡住，而不是算力不够。"
            },
            {
              "type": "fill",
              "question": "异步的核心思想不是「算得更快」，而是「___ 的时候去干别的事」。（填两个字：等/算）",
              "answer": "等",
              "explain": "异步的价值在 I/O 等待期间不空转，去发起别的请求。"
            },
            {
              "type": "tap",
              "question": "下列哪些属于 I/O 等待？（多选）",
              "options": [
                "等服务器回 HTTP 响应",
                "等磁盘读文件",
                "做一道数学题",
                "等数据库返回结果"
              ],
              "answer": [
                0,
                1,
                3
              ],
              "explain": "做数学题是 CPU 计算，不是 I/O 等待；其余都是等外部设备/网络。",
              "multi": true
            },
            {
              "type": "choice",
              "question": "关于 GIL，下列说法正确的是？",
              "options": [
                "GIL 是爬虫慢的元凶",
                "GIL 限制 CPU 并行，但不背 I/O 等待的锅",
                "GIL 让 Python 根本写不了爬虫"
              ],
              "answer": 1,
              "explain": "GIL 影响的是多核 CPU 并行计算，爬虫慢在等网络，两者不是一回事。"
            },
            {
              "type": "open",
              "question": "用你自己的话说说：为什么异步能让抓 100 个网址比同步快那么多？",
              "answer": "因为异步在等某个网址响应时不空转，趁机去发其他请求，100 个请求几乎同时飞出去，总耗时接近一次单程而不是 100 次累加。"
            },
            {
              "type": "coding",
              "question": "顺序下载 5 个网页，每个耗时 2 秒；并发下载 5 个一起跑只要约 2 秒。算一算两种方式的「总耗时」并打印。",
              "starter": "per = 2\nn = 5\nseq = 0   # TODO: 顺序总耗时 = ?\ncon = 0   # TODO: 并发总耗时约 = ?\nprint('顺序', seq, '秒；并发', con, '秒')",
              "_gen": "coding-ex",
              "expect": "顺序 10 秒"
            }
          ],
          "tasks": [
            "用 time 测一下：同步抓 5 个网址用多久？记下数字，学完异步再测一次对比。",
            "在纸上画两幅小人图：同步=排队干等；异步=边等边发下一个。",
            "想一个生活里「等的时候可以并行做」的例子（如烧水时顺便刷牙）。"
          ],
          "color": "#5b8fc4"
        },
        {
          "id": "a1l2",
          "title": "asyncio 三件套：事件循环·协程·任务",
          "icon": "🔁",
          "markdown": "## asyncio 三件套，记住这三个词\n\n### 1. 事件循环（Event Loop）= 调度员\n它是个死循环，手里攥着一堆「待办」，哪个能跑了就调度哪个。你不用管它怎么转，只要把活交给它。\n\n### 2. 协程（Coroutine）= 能暂停的函数\n用 `async def` 定义的函数，遇到 `await` 就**主动让出**控制权，等结果好了再回来接着跑。它像「会打瞌睡的员工」，睡的时候把工位让给别人。\n\n### 3. 任务（Task）= 被排进循环的具体工单\n`asyncio.create_task(协程())` 把协程包成任务丢进循环，循环才真正开始并发跑它。\n\n### 最小骨架\n```python\nimport asyncio\n\nasync def job(n):\n    print(f\"任务{n}开工\")\n    await asyncio.sleep(1)   # 模拟等网络，这里让出控制权\n    print(f\"任务{n}完工\")\n\nasync def main():\n    await asyncio.gather(job(1), job(2), job(3))  # 三个一起跑\n\nasyncio.run(main())\n```\n`gather` 把多个协程打包并发；`await` 是「这儿要等，先去忙别的」的标记。\n\n> ⚠️ 易错：`await` 只能写在 `async def` 里；普通函数里写 `await` 直接报语法错。",
          "takeaway": "事件循环=调度员，协程=用 async def 写、遇 await 会让出控制权的函数，任务=丢进循环的具体工单。asyncio.run 启动循环，gather 并发多个协程。记住：await 只能在 async 函数里用。",
          "figures": [
            {
              "key": "adv_event_loop",
              "caption": "🔁 事件循环当调度员：协程遇到 await 让出工位，循环去跑别的协程，回来再续上"
            }
          ],
          "words": [
            {
              "en": "COROUTINE",
              "zh": "协程：用 async def 定义、能中途让出的函数",
              "pron": "ˈkɔːruːtiːn"
            },
            {
              "en": "AWAIT",
              "zh": "await：标记「这里要等，先去忙别的」",
              "pron": "əˈweɪt"
            },
            {
              "en": "GATHER",
              "zh": "gather：把多个协程打包一起并发跑",
              "pron": "ˈɡæðər"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "事件循环（Event Loop）扮演什么角色？",
              "options": [
                "调度员，决定哪个协程能跑",
                "一个具体要抓的网址",
                "一种数据库"
              ],
              "answer": 0,
              "explain": "事件循环负责调度所有协程，是 asyncio 的发动机。"
            },
            {
              "type": "fill",
              "question": "用 `async def` 定义的函数叫______（填两个字：协/线/进）。",
              "answer": "协程",
              "explain": "async def 定义的是协程（coroutine）。"
            },
            {
              "type": "order",
              "question": "把 asyncio 跑起来的正常顺序排一排：",
              "steps": [
                "定义 async def 协程函数",
                "在 main 里用 gather/create_task 组织协程",
                "调用 asyncio.run(main()) 启动事件循环",
                "协程内用 await 标记等待点"
              ],
              "explain": "顺序：先写协程函数→在组织处排活→run 启动循环；await 写在协程内部。"
            },
            {
              "type": "choice",
              "question": "下面哪句会直接语法报错？",
              "options": [
                "在 async def 里写 await",
                "在普通 def 里写 await",
                "用 asyncio.run 启动"
              ],
              "answer": 1,
              "explain": "await 只能出现在 async 函数内部，普通函数里写会语法错误。"
            },
            {
              "type": "open",
              "question": "用一句话比喻「协程遇到 await 让出控制权」这件事，让别人一听就懂。",
              "answer": "像打瞌睡的员工：活干到要等别人的时候，把工位让给同事先干，等自己那份好了再回来接着干。"
            },
            {
              "type": "coding",
              "question": "协程=能暂停的函数，靠事件循环调度。下面这段代码要在你本机跑（浏览器跑不了 asyncio），看懂思路后点「标记完成」。",
              "starter": "import asyncio\n\nasync def greet(name):\n    print('你好,', name)\n    await asyncio.sleep(0)   # 让出控制权\n\nasync def main():\n    await asyncio.gather(greet('小明'), greet('小红'), greet('小刚'))\n\nasyncio.run(main())",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "打开 Python，把上面的三件套骨架敲一遍，看三个任务是不是「几乎同时」完工。",
            "故意在普通 def 里写一句 await，看报错长什么样，记住这个坑。",
            "把「事件循环=调度员」画成一张小图贴在显示器边。"
          ],
          "color": "#5b8fc4"
        },
        {
          "id": "a1l3",
          "title": "aiohttp 并发抓取：把 asyncio 用在网络上",
          "icon": "🌐",
          "markdown": "## aiohttp：异步版的 requests\n\n`requests` 是同步的，会阻塞；`aiohttp` 是异步的，配合 `async with` + `await` 才能并发抓。\n\n### 单发 vs 并发\n```python\nimport aiohttp, asyncio\n\nasync def fetch(session, url):\n    async with session.get(url) as resp:\n        return await resp.text()   # await：等响应时不空转\n\nasync def main():\n    urls = [\"https://example.com\"] * 5\n    async with aiohttp.ClientSession() as session:\n        tasks = [fetch(session, u) for u in urls]\n        htmls = await asyncio.gather(*tasks)   # 5 个并发飞出\n    print(len(htmls))\n\nasyncio.run(main())\n```\n关键点：**一个 `ClientSession` 复用**；`fetch` 里两处 `await`（等连接、等正文）都是让出点。\n\n### 为什么快\n5 个网址同时飞出去，总耗时≈最慢那一个的单程，而不是 5 个相加。这正是异步的爽点。\n\n> ⚠️ 易错：别在 `async with session.get()` 里漏了 `await`；`resp.text()` 也要 `await`，否则拿到的是协程对象不是字符串。",
          "takeaway": "aiohttp 是异步版 requests：用 async with session.get(url) 发请求，await resp.text() 拿正文。一个 ClientSession 复用，gather 把多个 fetch 并发。两处都要 await，漏了就拿到协程而非字符串。",
          "figures": [
            {
              "key": "adv_sync_vs_async",
              "caption": "🌐 用 aiohttp + gather：多个请求同时飞出，总耗时≈最慢一个而非相加"
            }
          ],
          "words": [
            {
              "en": "AIOHTTP",
              "zh": "aiohttp：支持异步的 HTTP 客户端库",
              "pron": "eɪ aɪ oʊ ˈeɪtʃˈtiˈtiˈpi"
            },
            {
              "en": "SESSION",
              "zh": "ClientSession：可复用的会话，管连接池",
              "pron": "ˈsɛʃən"
            },
            {
              "en": "CLIENT",
              "zh": "Client：客户端，这里指发请求的一方",
              "pron": "ˈklaɪənt"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "下面哪段才能正确异步拿到网页正文？",
              "options": [
                "html = session.get(url).text",
                "async with session.get(url) as r: html = await r.text()",
                "html = await session.get(url)"
              ],
              "answer": 1,
              "explain": "必须 await 响应对象，再 await r.text() 取正文；漏 await 拿不到字符串。"
            },
            {
              "type": "fill",
              "question": "多个协程要一起并发，常用 `asyncio.______(*tasks)` 打包。（填一个词）",
              "answer": "gather",
              "explain": "asyncio.gather 把多个协程并发执行并收集结果。"
            },
            {
              "type": "tap",
              "question": "用 aiohttp 抓一个网址，哪些地方必须 await？（多选）",
              "options": [
                "session.get(url) 拿到响应",
                "resp.text() 取正文",
                "创建任务列表",
                "import aiohttp"
              ],
              "answer": [
                0,
                1
              ],
              "explain": "get 拿到响应、text 取正文都是等待点需 await；建列表和 import 不需。",
              "multi": true
            },
            {
              "type": "choice",
              "question": "复用哪个对象能省下反复建连接的开销？",
              "options": [
                "每次新建 requests",
                "一个 ClientSession 复用",
                "每请求 new 一个 socket"
              ],
              "answer": 1,
              "explain": "ClientSession 带连接池，复用它比每次新建高效得多。"
            },
            {
              "type": "open",
              "question": "为什么说 aiohttp 并发抓 5 个网址的总耗时≈最慢那一个，而不是 5 个相加？",
              "answer": "因为 5 个请求在事件循环里几乎是同时发出的，各自在等自己响应时让出控制权，彼此不排队，所以总时间由最慢的那个决定。"
            },
            {
              "type": "coding",
              "question": "aiohttp 把 asyncio 用在网络上，并发抓很多页。下面代码需本机运行（浏览器跑不了网络），看懂点「标记完成」。",
              "starter": "import asyncio, aiohttp\n\nasync def fetch(session, url):\n    async with session.get(url) as r:\n        return await r.text()\n\nasync def main():\n    urls = ['https://a.com', 'https://b.com']\n    async with aiohttp.ClientSession() as s:\n        pages = await asyncio.gather(*(fetch(s, u) for u in urls))\n    print('抓了', len(pages), '页')\n\nasyncio.run(main())",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "装 aiohttp：`pip install aiohttp`，把上面的并发骨架跑通，对比同步版计时。",
            "把 urls 换成 3 个不同网站，看并发是否真的「同时」返回。",
            "故意漏掉一个 await 运行，观察报错信息并记住。"
          ],
          "color": "#5b8fc4"
        },
        {
          "id": "a1l4",
          "title": "信号量限速：并发不是无穷大",
          "icon": "🚦",
          "markdown": "## 信号量（Semaphore）：给并发拧个水龙头\n\n并发越多越快？**错**。一次性甩 10000 个请求会把对方服务器冲垮，也可能把自己 IP 搞封，还可能把本机内存撑爆。\n\n### 信号量 = 同时最多跑 N 个\n`asyncio.Semaphore(5)` 表示同一时刻最多 5 个协程在跑，其余排队。\n\n```python\nsem = asyncio.Semaphore(5)\n\nasync def fetch(session, url):\n    async with sem:                      # 占一个名额，用完归还\n        async with session.get(url) as r:\n            return await r.text()\n```\n`async with sem` 像进洗手间占坑位：坑满了就在门外等，出来一个进一个。\n\n### 限速三件套\n1. **Semaphore** 限制同时并发数\n2. **delay** 每次请求间随机睡一小会儿\n3. **限总 QPS**（每秒请求数）更稳\n\n> 💡 重点：**信号量限制的是「同时跑几个」，不是「跑得多快」**。它防的是把对方冲垮，不是提速。很多人误会它能加速，其实恰恰相反——它是主动踩刹车。",
          "takeaway": "信号量 Semaphore(N) 限制同一时刻最多 N 个协程并发，像占坑位，满了就排队。它是主动限速、防冲垮服务器/防封 IP，不是提速。配合随机延迟和限 QPS 更稳。",
          "figures": [
            {
              "key": "adv_semaphore",
              "caption": "🚦 Semaphore(5)：5 个坑位，满了排队；限制的是同时并发数，是踩刹车不是加油门"
            }
          ],
          "words": [
            {
              "en": "SEMAPHORE",
              "zh": "信号量：限制同时运行的协程数量",
              "pron": "ˈsɛməfɔːr"
            },
            {
              "en": "CONCURRENT",
              "zh": "并发：同一时段多个任务都在推进",
              "pron": "kənˈkʌrənt"
            },
            {
              "en": "THROTTLE",
              "zh": "限速：主动控制速度，别冲垮对方",
              "pron": "ˈθrɑːtl"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "Semaphore(5) 是什么意思？",
              "options": [
                "最多同时跑 5 个协程",
                "总共只能发 5 个请求",
                "每个请求限速 5 秒"
              ],
              "answer": 0,
              "explain": "信号量限制并发度，不是总次数也不是单请求耗时。"
            },
            {
              "type": "choice",
              "question": "信号量主要作用是？",
              "options": [
                "让爬虫跑得更快",
                "主动限速、防止冲垮服务器或封 IP",
                "把结果排好序"
              ],
              "answer": 1,
              "explain": "它是踩刹车，限制同时并发，保护对方也保护自己。"
            },
            {
              "type": "fill",
              "question": "`async with ______` 能在进入时占一个名额、退出时归还，用来做并发限速。（填英文名）",
              "answer": "sem",
              "explain": "async with sem 用信号量占位/归还，实现并发上限。"
            },
            {
              "type": "tap",
              "question": "下列哪些是稳妥的限速手段？（多选）",
              "options": [
                "用 Semaphore 限制并发数",
                "每次请求间随机 sleep 一小会儿",
                "一次性甩 10000 个请求",
                "限制每秒请求数 QPS"
              ],
              "answer": [
                0,
                1,
                3
              ],
              "explain": "一次性狂发会冲垮服务器/被封；其余都是稳妥限速。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么说「并发不是越大越好」？举一个后果。",
              "answer": "并发过大可能瞬间冲垮目标服务器触发封 IP，也可能耗尽本机内存或打满本地端口，反而全崩。信号量是主动刹车。"
            },
            {
              "type": "coding",
              "question": "信号量(并发数)限制同时只跑 3 个。要抓 10 个页面，算一算需要几「批」才能跑完（向上取整）。",
              "starter": "import math\nn = 10\nsem = 3\nwaves = 0   # TODO: 几批 = ceil(n/sem)\nprint('需要', waves, '批')",
              "_gen": "coding-ex",
              "expect": "需要 4 批"
            }
          ],
          "tasks": [
            "把上节的并发例子加上 Semaphore(3)，抓 10 个网址，观察是否最多 3 个同时在跑。",
            "在 fetch 里加一行 `await asyncio.sleep(random.uniform(0.1,0.3))`，体会随机延迟。",
            "记住一句话写下来：信号量限制同时几个，不是提速。"
          ],
          "color": "#5b8fc4"
        },
        {
          "id": "a1l5",
          "title": "异步异常处理与超时：别让一个挂了全崩",
          "icon": "⏱️",
          "markdown": "## 单个请求挂了，凭什么连累全场？\n\n并发抓 100 个网址，第 50 个超时，**如果不用 try 包住**，整个 `gather` 可能直接抛异常，剩下 50 个白抓。所以每个 `fetch` 都要自己兜底。\n\n### try/except 包住单个任务\n```python\nasync def fetch(session, url):\n    try:\n        async with session.get(url, timeout=10) as r:\n            return await r.text()\n    except Exception as e:\n        print(f\"{url} 翻车：{e}\")\n        return None\n```\n`timeout=10` 表示等 10 秒没响应就放弃，不无限干等。\n\n### gather 的两种脾气\n- `asyncio.gather(*tasks)`：**一个抛异常，全部报错**（默认）。\n- `asyncio.gather(*tasks, return_exceptions=True)`：**单个失败只返回异常对象，其余照常**。✅ 推荐。\n\n### 超时三板斧\n1. `client.get(timeout=10)` 单请求超时\n2. `asyncio.wait_for(coro, 10)` 给任意协程加时限\n3. 外层再包 try，确保返回值可处理\n\n> ⚠️ 易错：`timeout` 参数在 aiohttp 里是 `aiohttp.ClientTimeout` 或简写秒数，写错位置会不生效。",
          "takeaway": "每个 fetch 用 try/except 兜底，单请求设 timeout=10 防无限等。gather 加 return_exceptions=True，让一个失败不影响其余。超时可用 client 的 timeout 或 asyncio.wait_for。核心：别让一个挂了拖垮全场。",
          "figures": [
            {
              "key": "adv_retry_429",
              "caption": "⏱️ 单请求 try 兜底 + 超时：一个翻车返回 None，其余继续，全场不崩"
            }
          ],
          "words": [
            {
              "en": "TIMEOUT",
              "zh": "超时：等这么久还没响应就放弃",
              "pron": "ˈtaɪmaʊt"
            },
            {
              "en": "EXCEPT",
              "zh": "except：捕获异常、防止程序崩溃",
              "pron": "ɪkˈsɛpt"
            },
            {
              "en": "RETURN_EX",
              "zh": "return_exceptions：让单个失败不影响其余",
              "pron": "rɪˈtɜːrn ɪkˈsɛpʃənz"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "gather 默认（不加 return_exceptions）时，一个任务抛异常会？",
              "options": [
                "只那个任务失败，其余照常",
                "整个 gather 报错，其余也拿不到",
                "自动重试那个任务"
              ],
              "answer": 1,
              "explain": "默认情况下一个异常会冒泡，导致整个 gather 失败。"
            },
            {
              "type": "fill",
              "question": "给单个请求加 `timeout=__`，等待超过这个数就放弃，避免无限干等。（填数字示例）",
              "answer": "10",
              "explain": "timeout=10 表示等 10 秒无响应就放弃。"
            },
            {
              "type": "choice",
              "question": "想让「一个失败不影响其余」，该怎么写？",
              "options": [
                "gather(*t)",
                "gather(*t, return_exceptions=True)",
                "try 包住 gather"
              ],
              "answer": 1,
              "explain": "return_exceptions=True 让失败任务只返回异常对象，其余正常。"
            },
            {
              "type": "tap",
              "question": "下列哪些能防止「一个请求卡死拖垮全场」？（多选）",
              "options": [
                "每个 fetch 用 try/except 兜底",
                "给请求设 timeout",
                "gather 用 return_exceptions=True",
                "把所有请求写在一个函数里"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "单独兜底+超时+return_exceptions 三件套防雪崩；堆一个函数没用。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么并发爬虫里「每个任务自己 try 兜底」比「外层一个 try 包全部」更稳？",
              "answer": "因为外层一个 try 一旦捕获异常就会中断整批，已发的其余请求结果也丢了；每个任务内部兜底能让失败的单挑出局、其余照常拿到结果。"
            },
            {
              "type": "coding",
              "question": "异步里一个任务抛异常不能让全部崩，要用 try/except 包住。下面代码需本机跑（浏览器跑不了 asyncio），看懂点「标记完成」。",
              "starter": "import asyncio\n\nasync def may_fail(i):\n    if i == 2:\n        raise ValueError('挂了')\n    return 'ok' + str(i)\n\nasync def main():\n    for i in range(4):\n        try:\n            print(await may_fail(i))\n        except Exception as e:\n            print('跳过', i, '原因', e)\n\nasyncio.run(main())",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "把 fetch 故意指向一个不存在的网址，分别试「不加兜底」和「加 try+return_exceptions」，对比结果。",
            "给请求设 timeout=2，抓一个超慢的网址，看是否按时放弃。",
            "写一条规则：凡 gather 必带 return_exceptions=True。"
          ],
          "color": "#5b8fc4"
        }
      ]
    },
    {
      "title": "httpx 与现代客户端",
      "icon": "🚀",
      "color": "#3a9d5d",
      "lessons": [
        {
          "id": "a2l1",
          "title": "httpx：一个库，同步异步一体",
          "icon": "🔀",
          "markdown": "## httpx：一个库，两种活法\n\n`requests` 只能同步；`aiohttp` 只能异步。httpx 两者通吃——**同一个 API，加个 `async` 就能异步**，迁移成本极低。\n\n### 同步写法（和 requests 几乎一样）\n```python\nimport httpx\nr = httpx.get(\"https://example.com\")\nprint(r.status_code, len(r.text))\n```\n### 异步写法（加 async/await）\n```python\nimport httpx, asyncio\nasync def main():\n    async with httpx.AsyncClient() as c:\n        r = await c.get(\"https://example.com\")\n        print(r.status_code)\nasyncio.run(main())\n```\n> 注意：同步用 `httpx.get`；异步用 `httpx.AsyncClient()` + `await c.get`。**别混**：异步函数里调同步 `httpx.get` 会阻塞事件循环，前功尽弃。\n\n### 速记\n| 场景 | 用 |\n|---|---|\n| 简单脚本、懒得改 | 同步 httpx.get |\n| 高并发抓取 | AsyncClient + await |",
          "takeaway": "httpx 一个库通吃同步/异步：同步 httpx.get；异步 httpx.AsyncClient()+await c.get。千万别在 async 里用同步 get，会阻塞事件循环拖垮并发。",
          "figures": [
            {
              "key": "request_response",
              "caption": "🔀 httpx 同步 httpx.get vs 异步 AsyncClient+await：同一套 API，加 async 即可并发"
            }
          ],
          "words": [
            {
              "en": "HTTPX",
              "zh": "httpx：同时支持同步与异步的 HTTP 客户端库",
              "pron": "eɪtʃˈtiˈtiˈpi ɛks"
            },
            {
              "en": "ASYNCCLIENT",
              "zh": "AsyncClient：httpx 的异步客户端",
              "pron": "əˈsɪŋk ˈklaɪənt"
            },
            {
              "en": "MIGRATE",
              "zh": "迁移：从 requests 换过来几乎不改写法",
              "pron": "ˈmaɪɡreɪt"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "下列哪个库既能同步又能异步？",
              "options": [
                "requests",
                "aiohttp",
                "httpx"
              ],
              "answer": 2,
              "explain": "httpx 一套 API 同时支持同步和异步。"
            },
            {
              "type": "fill",
              "question": "异步要用 `httpx.______()` 而不是 `httpx.get`。（填类名）",
              "answer": "AsyncClient",
              "explain": "异步用 httpx.AsyncClient() 上下文管理器。"
            },
            {
              "type": "tap",
              "question": "异步 httpx 的正确姿势有哪些？（多选）",
              "options": [
                "用 AsyncClient",
                "用 await c.get",
                "写在 async def 里",
                "在 async 里用同步 httpx.get 也行"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "异步必须 AsyncClient+await 且写在 async 函数内；混用同步 get 会阻塞循环。",
              "multi": true
            },
            {
              "type": "choice",
              "question": "在 async 函数里误用同步 httpx.get 会怎样？",
              "options": [
                "完全没问题",
                "阻塞事件循环、拖垮并发",
                "自动变成异步"
              ],
              "answer": 1,
              "explain": "同步调用会卡住单线程事件循环，并发优势全没。"
            },
            {
              "type": "open",
              "question": "为什么说从 requests 迁移到 httpx 比换 aiohttp 成本低？",
              "answer": "因为 httpx 同步写法和 requests 几乎一样，只想异步时加 AsyncClient 和 await 即可，不用重写整套请求逻辑。"
            },
            {
              "type": "coding",
              "question": "httpx 一个库同步异步都能用。下面代码需本机跑（浏览器跑不了网络），看懂点「标记完成」。",
              "starter": "import httpx\n\nwith httpx.Client() as c:\n    r = c.get('https://example.com')\n    print('状态码', r.status_code, '长度', len(r.text))",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "装 httpx，分别跑同步版和异步版抓同一网址，对比代码差异。",
            "故意在 async 函数里用同步 httpx.get，观察是否一下子变慢。",
            "记一句口诀：异步必用 AsyncClient 配 await。"
          ],
          "color": "#3a9d5d"
        },
        {
          "id": "a2l2",
          "title": "连接池复用：别每次都握手",
          "icon": "🔗",
          "markdown": "## 连接池：省掉重复握手\n\n每次发请求都要 TCP 三次握手 + TLS 加密握手，挺费时。**连接池**把建好的连接缓存复用，下次直接发数据。\n\n### httpx 默认就带池\n```python\nasync with httpx.AsyncClient() as c:   # 内部维护连接池\n    for u in urls:\n        r = await c.get(u)             # 复用连接，不每次重握\n```\n一个 `AsyncClient` 生命周期内，连同一主机自动复用连接。\n\n### 手动拧池大小\n```python\nlimits = httpx.Limits(max_connections=100, max_keepalive_connections=20)\nasync with httpx.AsyncClient(limits=limits) as c:\n    ...\n```\n- `max_connections`：最多同时开多少连接\n- `max_keepalive_connections`：池里留多少个保活\n\n> 💡 池太小→并发上不去；池太大→打爆对方或本机端口耗尽。配合信号量一起调。",
          "takeaway": "连接池缓存已建连接、省掉重复握手；httpx 的 AsyncClient 默认带池。Limits 调 max_connections 与 max_keepalive；太大可能打爆对方或耗光端口，要配合信号量。",
          "figures": [
            {
              "key": "adv_httpx_pool",
              "caption": "🔗 连接池复用：建好的 TCP/TLS 连接缓存起来，下次直接发数据，省掉握手"
            }
          ],
          "words": [
            {
              "en": "LIMITS",
              "zh": "Limits：httpx 里控制连接池大小的配置",
              "pron": "ˈlɪmɪts"
            },
            {
              "en": "KEEPALIVE",
              "zh": "保活连接：池里留着、随时能用的连接",
              "pron": "ˈkiːp əˈlaɪv"
            },
            {
              "en": "POOL",
              "zh": "连接池：复用连接的缓冲",
              "pron": "puːl"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "连接池主要省掉什么开销？",
              "options": [
                "握手建连的开销",
                "解析 HTML",
                "写磁盘"
              ],
              "answer": 0,
              "explain": "池复用已建立的连接，避免每次重复 TCP/TLS 握手。"
            },
            {
              "type": "fill",
              "question": "AsyncClient 内部自带______池（填两字：连接/线程/进程）。",
              "answer": "连接",
              "explain": "httpx 客户端默认维护连接池。"
            },
            {
              "type": "choice",
              "question": "关于池大小，正确的是？",
              "options": [
                "越大越好",
                "太小并发上不去、太大可能打爆对方",
                "和并发完全无关"
              ],
              "answer": 1,
              "explain": "池要适中：太小限并发，太大有打爆对端或耗尽本机端口的风险。"
            },
            {
              "type": "tap",
              "question": "下列哪些是 httpx.Limits 的参数？（多选）",
              "options": [
                "max_connections",
                "max_keepalive_connections",
                "timeout",
                "retries"
              ],
              "answer": [
                0,
                1
              ],
              "explain": "Limits 管连接数；timeout/retries 不是 Limits 字段。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「连接池太大」反而有风险？举个具体后果。",
              "answer": "池太大意味着同时开大量连接，可能瞬间压垮目标服务器触发封禁，也可能耗尽本机端口或文件描述符导致程序报错。"
            },
            {
              "type": "coding",
              "question": "连接池复用 TCP，别每次都握手。下面代码需本机跑，看懂点「标记完成」。",
              "starter": "import httpx\n\nwith httpx.Client(headers={'Connection': 'keep-alive'}) as c:\n    for _ in range(3):\n        r = c.get('https://example.com')\n        print('复用连接，第', _, '次', r.status_code)",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "把上节并发例子改成复用同一个 AsyncClient，看是否更快更稳定。",
            "设一个很小的 max_connections=2，抓 10 个网址感受并发受限。",
            "记住：池大小要配合信号量一起调。"
          ],
          "color": "#3a9d5d"
        },
        {
          "id": "a2l3",
          "title": "异步解析并行抠数据",
          "icon": "⚡",
          "markdown": "## 抓和解析，都能并行\n\n很多人以为「异步只管发请求」。其实**解析（抠数据）也能并发**——抓回来一堆 HTML，用 asyncio 把解析也并行掉，CPU 不闲着。\n\n### 抓+解析流水线\n```python\nfrom lxml import html as lxml_html\nasync def parse_one(raw):\n    doc = lxml_html.fromstring(raw)\n    return doc.xpath(\"//h1/text()\")   # 解析也能是协程里的活\n\nasync def main():\n    htmls = await asyncio.gather(*[fetch(u) for u in urls])\n    results = await asyncio.gather(*[parse_one(h) for h in htmls])\n```\n`gather` 第二次把「解析」也并发了，N 个页面同时抠。\n\n### 真正的坑：CPU 密集会卡循环\n解析、正则、算哈希都是 **CPU 活**。asyncio 是单线程，一个协程狂算会卡住事件循环，别人等不了。解法：丢给线程池 `await asyncio.to_thread(重活)`。\n\n> ⚠️ 易错：把超重的 CPU 解析直接写在协程里，会拖累全部并发。重活用 `asyncio.to_thread(...)` 挪到别的线程。",
          "takeaway": "抓和解析都能用 gather 并发；但 CPU 重的解析会卡单线程事件循环，要用 asyncio.to_thread 挪到别的线程，否则拖累全场并发。",
          "figures": [
            {
              "key": "adv_event_loop",
              "caption": "⚡ 事件循环调度「抓」和「解析」：两者都能并发进循环，重 CPU 活用 to_thread 挪走"
            }
          ],
          "words": [
            {
              "en": "PARSE",
              "zh": "解析：从 HTML 里抠出结构化数据",
              "pron": "pɑːrs"
            },
            {
              "en": "TOTHREAD",
              "zh": "to_thread：把重活丢到别的线程跑",
              "pron": "tə ˈθrɛd"
            },
            {
              "en": "PIPELINE",
              "zh": "流水线：抓→解析→存，一环接一环",
              "pron": "ˈpaɪplaɪn"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "解析（抠数据）能放进 asyncio 并发吗？",
              "options": [
                "不能，只能同步",
                "能，用 gather 把解析也并发",
                "必须用多进程"
              ],
              "answer": 1,
              "explain": "解析本身可以是协程里的步骤，用 gather 并发多个页面解析。"
            },
            {
              "type": "fill",
              "question": "超重的 CPU 解析活要挪到别的线程，用 `await asyncio.______(重活)`。",
              "answer": "to_thread",
              "explain": "asyncio.to_thread 把阻塞/CPU 重活移到线程池，不卡事件循环。"
            },
            {
              "type": "choice",
              "question": "单线程 asyncio 里一个协程狂算哈希会怎样？",
              "options": [
                "不影响别人",
                "卡住事件循环、拖累全部并发",
                "自动开新核并行"
              ],
              "answer": 1,
              "explain": "单线程下重 CPU 活会占住循环，其他协程等不了。"
            },
            {
              "type": "tap",
              "question": "下列哪些环节可以并发（多选）",
              "options": [
                "并发发请求",
                "并发解析 HTML",
                "并发写数据库",
                "串行干等网络"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "抓、解析、写库都能并发；串行等网络恰恰是要避免的。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「抓和解析都并发」比「先全抓完再一个个解析」快？",
              "answer": "后者解析阶段是串行的，N 个页面要一个个抠；前者用 gather 把解析也并发，多个页面同时抠，整体耗时大幅下降。"
            },
            {
              "type": "coding",
              "question": "下面是一批网页源码(放在 htmls 列表)。用正则把每个里面所有 <li>文字</li> 的标题抓出来，拼成一个大列表并打印。",
              "starter": "import re\nhtmls = ['<ul><li>苹果</li><li>香蕉</li></ul>', '<ul><li>橙子</li><li>西瓜</li></ul>']\nall_items = []   # TODO: 遍历 htmls，用 re.findall 提取 <li>(.*?)</li> 并extend\nprint(all_items)",
              "_gen": "coding-ex",
              "expect": "['苹果', '香蕉', '橙子', '西瓜']"
            }
          ],
          "tasks": [
            "把 fetch 和 parse 串成两段 gather，跑 5 个页面看总耗时。",
            "故意把一段重正则写在协程里狂跑，观察是否拖累别的请求。",
            "记住口诀：CPU 重活 to_thread。"
          ],
          "color": "#3a9d5d"
        },
        {
          "id": "a2l4",
          "title": "指数退避应对 429",
          "icon": "🔁",
          "markdown": "## 429 = 你太快了，歇会儿\n\n服务器回 `429 Too Many Requests`，意思是「你请求太频繁」。硬重试会越撞越封。**指数退避**：第一次等 1s，再失败等 2s、4s、8s……翻倍增长，给服务器喘口气。\n\n### 退避模板\n```python\nimport asyncio, httpx\nasync def get_with_retry(c, url, max_tries=5):\n    wait = 1\n    for i in range(max_tries):\n        r = await c.get(url)\n        if r.status_code == 200:\n            return r.text\n        if r.status_code == 429:\n            await asyncio.sleep(wait)   # 退避\n            wait *= 2                    # 翻倍\n            continue\n        return None\n    return None\n```\n### 加抖动更稳\n纯翻倍可能和别的客户端「同频」撞车，加一点随机 `wait *= (0.5 + random.random())` 错峰。\n\n> ⚠️ 易错：退避只对「可重试」错误（429/5xx 超时）有意义；404 这种永久错误重试没用，直接放弃。",
          "takeaway": "429=请求太频繁。指数退避：等 1s→2s→4s 翻倍，并加随机抖动错峰；只对 429/5xx 等可重试错误有意义，404 直接放弃。",
          "figures": [
            {
              "key": "adv_retry_429",
              "caption": "🔁 指数退避：1s→2s→4s 翻倍等，429 时给服务器喘口气，避免越撞越封"
            }
          ],
          "words": [
            {
              "en": "BACKOFF",
              "zh": "退避：失败后等一会再试，且越等越久",
              "pron": "ˈbækɔːf"
            },
            {
              "en": "RETRY",
              "zh": "重试：失败了再发一次",
              "pron": "ˈriːtraɪ"
            },
            {
              "en": "JITTER",
              "zh": "抖动：加随机量错峰，避免同频撞车",
              "pron": "ˈdʒɪtər"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "429 状态码表示？",
              "options": [
                "页面不存在",
                "请求太频繁、请慢点",
                "服务器崩了"
              ],
              "answer": 1,
              "explain": "429 Too Many Requests = 频率过高。"
            },
            {
              "type": "fill",
              "question": "指数退避是等待时间逐次______（填两字：翻倍/减半/随机）。",
              "answer": "翻倍",
              "explain": "指数退避每次等待乘以 2。"
            },
            {
              "type": "choice",
              "question": "下面哪种错误重试通常没意义？",
              "options": [
                "429",
                "500 超时",
                "404 页面不存在"
              ],
              "answer": 2,
              "explain": "404 是永久不存在，重试也不会变出页面。"
            },
            {
              "type": "tap",
              "question": "让退避更稳的做法有哪些？（多选）",
              "options": [
                "等待时间翻倍",
                "加随机抖动错峰",
                "对 404 也死命重试",
                "设最大重试次数"
              ],
              "answer": [
                0,
                1,
                3
              ],
              "explain": "404 不该重试；翻倍+抖动+上限才是稳妥退避。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「加随机抖动」能避免和别的爬虫同频撞车？",
              "answer": "如果所有客户端都用同样的 1-2-4-8 节奏，会在同一时刻集体重试 again 撞击服务器；加随机让大家的 retry 时间错开，峰值被削平。"
            },
            {
              "type": "coding",
              "question": "请求被限流(429)要退避重试。写代码算出前 4 次重试的等待秒数：第 i 次等 2**i 秒（i 从 1 开始）。",
              "starter": "delays = []\nfor i in range(1, 5):\n    delays.append(0)   # TODO: 填入 2**i\nprint(delays)",
              "_gen": "coding-ex",
              "expect": "[2, 4, 8, 16]"
            }
          ],
          "tasks": [
            "写个 get_with_retry，故意请求一个会限频的接口，看退避是否生效。",
            "给退避加随机抖动，对比纯翻倍的节奏。",
            "记一句：404 不重试，429/5xx 才退避。"
          ],
          "color": "#3a9d5d"
        }
      ]
    },
    {
      "title": "高效解析 XPath",
      "icon": "🧭",
      "color": "#6a8fd4",
      "lessons": [
        {
          "id": "a3l1",
          "title": "lxml 与 XPath：用路径点名元素",
          "icon": "🎯",
          "markdown": "## XPath：用路径精确点名网页元素\n\nBeautifulSoup 用 .find 慢慢找；XPath 像「文件系统路径」，`/html/body/div[1]/h1` 一步直达。lxml 是跑得最快的 XPath 引擎。\n\n### 最小例子\n```python\nfrom lxml import html\ndoc = html.fromstring(html_text)\ntitles = doc.xpath(\"//h1/text()\")          # 所有 h1 的文字\nlinks = doc.xpath(\"//a/@href\")             # 所有 a 的链接\n```\n- `//` 表示「任意层级往下找」\n- `/text()` 取文字，`/@href` 取属性\n\n### 对比 BS4\n| | 写法 | 速度 |\n|---|---|---|\n| BS4 find | 一步步导航 | 较慢 |\n| XPath | 一条路径直达 | 快很多 |\n\n> 💡 XPath 用「路径 + 条件」定位，适合层层嵌套、规则固定的页面；正则适合非结构文本。",
          "takeaway": "XPath 用路径精确点名元素，// 任意层级、/text() 取文字、/@href 取属性。lxml 是速度最快的 XPath 引擎，适合嵌套深、规则固定的页面。",
          "figures": [
            {
              "key": "adv_xpath_tree",
              "caption": "🎯 XPath 像文件路径：//h1/text() 一步直达，lxml 引擎最快"
            }
          ],
          "words": [
            {
              "en": "XPATH",
              "zh": "XPath：用路径语法在 XML/HTML 里定位节点",
              "pron": "ɛks pɑːθ"
            },
            {
              "en": "LXML",
              "zh": "lxml：高效的 XML/HTML 解析库，支持 XPath",
              "pron": "ɛl ɛks ɛm ɛl"
            },
            {
              "en": "NODE",
              "zh": "节点：HTML 树里的一个元素/文字",
              "pron": "noʊd"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "XPath 里 `//` 表示？",
              "options": [
                "只找直接子节点",
                "任意层级往下找",
                "找属性"
              ],
              "answer": 1,
              "explain": "// 表示跨任意层级 descendant。"
            },
            {
              "type": "fill",
              "question": "`doc.xpath(\"//a/@____\")` 才能拿到链接地址（填属性名）。",
              "answer": "href",
              "explain": "//a/@href 取 a 标签的 href 属性。"
            },
            {
              "type": "choice",
              "question": "关于 lxml 与 BeautifulSoup，正确的是？",
              "options": [
                "lxml 用 XPath 且更快",
                "BS4 永远更快",
                "两者不能共存"
              ],
              "answer": 0,
              "explain": "lxml+XPath 通常比 BS4 的纯 Python 导航更快。"
            },
            {
              "type": "tap",
              "question": "下列哪些是 XPath 常见用法（多选）",
              "options": [
                "//h1/text() 取文字",
                "//a/@href 取链接",
                "//div[1] 第一个 div",
                ".find 慢慢找"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三个是 XPath；.find 是 BS4 风格。",
              "multi": true
            },
            {
              "type": "open",
              "question": "什么场景下 XPath 比 BS4 的 find 更顺手？",
              "answer": "当页面嵌套很深、要按「第几个」「某个属性」精确定位时，一条 XPath 直达比层层 find 更短更快。"
            },
            {
              "type": "coding",
              "question": "下面 sample 是一段商品 HTML。用正则提取所有 class=\"price\" 的 <span> 里的价格（含￥），打印列表。",
              "starter": "import re\nsample = '<span class=\"price\">￥12</span><span class=\"price\">￥35</span>'\nprices = []   # TODO: 用 re.findall 提取 class=\"price\">(￥\\d+)\nprint(prices)",
              "_gen": "coding-ex",
              "expect": "['￥12', '￥35']"
            }
          ],
          "tasks": [
            "装 lxml，用 XPath 抠一个真实页面的标题和所有链接。",
            "对比同样需求用 BS4 find 写出来的代码行数。",
            "记一句：// 任意层级，/@属性 取属性。"
          ],
          "color": "#6a8fd4"
        },
        {
          "id": "a3l2",
          "title": "轴与函数精准定位",
          "icon": "🧩",
          "markdown": "## 轴（axis）与函数：在 XPath 里「找邻居」\n\n光用标签路径不够。XPath 的「轴」能按**位置关系**找元素：父、子、兄弟、祖先。\n\n### 常用轴\n- `parent::` 父节点\n- `following-sibling::` 后面的兄弟\n- `ancestor::` 祖先\n\n```python\ndoc.xpath(\"//span[@class='price']/parent::div\")     # 价格的父 div\ndoc.xpath(\"//h2/following-sibling::p\")               # h2 后面的 p\n```\n### 函数精准筛选\n- `contains(@class,'item')` 类名包含 item\n- `text()='确定'` 文字精确等于\n- `last()` 最后一个；`position()=1` 第一个\n\n> ⚠️ 易错：`//div[@class='a b']` 要求 class **完全等于** \"a b\"（顺序敏感）。多半该用 `contains(@class,'a')` 才稳。",
          "takeaway": "XPath 轴按关系定位：parent（父）、following-sibling（后兄弟）、ancestor（祖先）。函数 contains(@class,'x') 比精确等于更稳，因为 class 多值顺序敏感。",
          "figures": [
            {
              "key": "adv_xpath_tree",
              "caption": "🧩 轴按关系找：parent 父 / following-sibling 后兄弟 / ancestor 祖先，contains 模糊匹配更稳"
            }
          ],
          "words": [
            {
              "en": "AXIS",
              "zh": "轴：按节点间关系（父/子/兄弟）定位",
              "pron": "ˈæksɪs"
            },
            {
              "en": "SIBLING",
              "zh": "兄弟节点：同级的前后元素",
              "pron": "ˈsɪblɪŋ"
            },
            {
              "en": "CONTAINS",
              "zh": "contains：判断包含某子串",
              "pron": "kənˈteɪnz"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "`following-sibling::` 表示？",
              "options": [
                "父节点",
                "后面的兄弟节点",
                "祖先"
              ],
              "answer": 1,
              "explain": "following-sibling 选中同级的后续兄弟。"
            },
            {
              "type": "fill",
              "question": "想匹配「类名包含 item」，用 `______(@class,'item')` 函数。",
              "answer": "contains",
              "explain": "contains(@class,'x') 做子串匹配，不受多 class 顺序影响。"
            },
            {
              "type": "choice",
              "question": "`//div[@class='a b']` 为什么常匹配不到？",
              "options": [
                "顺序敏感要求完全相等",
                "div 不能用",
                "语法错误"
              ],
              "answer": 0,
              "explain": "class 多值时顺序敏感，精确相等很难命中。"
            },
            {
              "type": "tap",
              "question": "下列哪些是 XPath 轴/函数（多选）",
              "options": [
                "parent::",
                "following-sibling::",
                "contains()",
                "position()"
              ],
              "answer": [
                0,
                1,
                2,
                3
              ],
              "explain": "四个都是 XPath 的轴或定位函数。",
              "multi": true
            },
            {
              "type": "open",
              "question": "什么情况你必须用「轴」而不是单纯标签路径？举一个。",
              "answer": "比如要「取某个价格后面的说明文字」，用标签路径很难表达，但 //span[@class='price']/following-sibling::p 一句话就定位到兄弟节点。"
            },
            {
              "type": "coding",
              "question": "用正则把 <a href=\"链接\">文字</a> 的「链接」和「文字」配对，打印成 [(链接,文字),...]。",
              "starter": "import re\nhtml = '<a href=\"http://a.com\">首页</a><a href=\"http://b.com\">新闻</a>'\npairs = []   # TODO: 用 re.findall(r'<a href=\"(.*?)\">(.*?)</a>', html)\nprint(pairs)",
              "_gen": "coding-ex",
              "expect": "http://a.com', '首页"
            }
          ],
          "tasks": [
            "用轴写出「某新闻标题后面那段正文」的 XPath。",
            "把 `[@class='x y']` 改成 contains 重写，对比命中率。",
            "记一句：class 多值用 contains，别精确等于。"
          ],
          "color": "#6a8fd4"
        },
        {
          "id": "a3l3",
          "title": "大规模解析性能优化",
          "icon": "🚀",
          "markdown": "## 抓得快，解析也得跟得上\n\n页面成千上万，解析慢会反成瓶颈。几条实战优化：\n\n### 1. 编译 XPath\n反复用同一条 XPath，先编译再跑，省重复解析表达式：\n```python\nfrom lxml import etree\nxp = etree.XPath(\"//h1/text()\")\nxp(doc)   # 直接调，快\n```\n### 2. 别反复 fromstring\n尽量一次解析、多次 xpath；大文件用 `iterparse` 边读边解，省内存。\n### 3. 只取要的\nXPath 直接定位到目标节点，别先抓整页再 Python 里筛。\n\n> 💡 经验：解析占道时，先用 `cProfile` 看瓶颈；多数情况是「每条 XPath 没编译」或「在 Python 里做本可 XPath 完成的过滤」。",
          "takeaway": "大规模解析优化：编译 XPath 复用、iterparse 流式省内存、XPath 直接定位目标而非整页抓回再筛。先用 cProfile 定位瓶颈。",
          "figures": [
            {
              "key": "adv_xpath_tree",
              "caption": "🚀 性能优化：编译 XPath 复用 + iterparse 流式 + 直接定位，别整页抓回再筛"
            }
          ],
          "words": [
            {
              "en": "COMPILE",
              "zh": "编译：把 XPath 表达式预编译复用",
              "pron": "kəmˈpaɪl"
            },
            {
              "en": "ITERPARSE",
              "zh": "iterparse：边读文件边解析，省内存",
              "pron": "ˈɪtər pɑːrs"
            },
            {
              "en": "PROFILE",
              "zh": "cProfile：给代码计时找瓶颈",
              "pron": "ˈproʊfaɪl"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "反复用同一条 XPath，怎么提速？",
              "options": [
                "每次重新写",
                "先 etree.XPath 编译再调用",
                "改用正则"
              ],
              "answer": 1,
              "explain": "编译后复用避免重复解析表达式。"
            },
            {
              "type": "fill",
              "question": "超大文件用 `______` 边读边解析，省内存。（填函数名）",
              "answer": "iterparse",
              "explain": "iterparse 流式解析，不会整文件载入内存。"
            },
            {
              "type": "choice",
              "question": "解析成瓶颈时，第一步该？",
              "options": [
                "瞎改",
                "cProfile 看瓶颈在哪",
                "直接加机器"
              ],
              "answer": 1,
              "explain": "先量化瓶颈，再针对性优化。"
            },
            {
              "type": "tap",
              "question": "下列哪些能提升解析性能（多选）",
              "options": [
                "编译 XPath",
                "用 iterparse 流式解析",
                "XPath 直接定位目标",
                "每次 fromstring 整页"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三个提速；每次整页 fromstring 反而浪费。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「在 Python 里筛」比「XPath 直接定位」慢？",
              "answer": "XPath 在 C 层（lxml）直接定位目标节点，只返回要的数据；在 Python 里先取整页再过滤，多了序列化/循环开销，量大时差距明显。"
            },
            {
              "type": "coding",
              "question": "给定 1000 个商品价格，分别用「列表推导」和「for 循环」过滤出 >100 的，打印两种方式得到的数量（应相等）。",
              "starter": "prices = list(range(1, 1001))\nby_lc = [p for p in prices if p > 100]   # 列表推导\nby_loop = []\nfor p in prices:            # TODO: 把 >100 的加进 by_loop\n    if p > 100:\n        by_loop.append(p)\nprint('推导', len(by_lc), '循环', len(by_loop))",
              "_gen": "coding-ex",
              "expect": "推导 900 循环 900"
            }
          ],
          "tasks": [
            "把一条常用 XPath 用 etree.XPath 编译，跑 1 万次对比耗时。",
            "用 iterparse 解析一个大 XML，观察内存占用。",
            "记住：瓶颈先 cProfile 再动手。"
          ],
          "color": "#6a8fd4"
        },
        {
          "id": "a3l4",
          "title": "parsel：Scrapy 同款解析器",
          "icon": "🛠️",
          "markdown": "## parsel：Scrapy 同款解析器\n\nScrapy 内部用的就是 **parsel**（底层也是 lxml）。它把 XPath 和 CSS 选择器包成一套顺手的 API，写爬虫极舒服。\n\n### 两种选择器都能用\n```python\nfrom parsel import Selector\nsel = Selector(text=html_text)\nsel.xpath(\"//h1/text()\").get()        # 取第一个\nsel.xpath(\"//h1/text()\").getall()     # 取全部\nsel.css(\"h1::text\").get()             # CSS 也能用\n```\n- `.get()` 取一个，`.getall()` 取全部\n- 既能 XPath 又能 CSS，随意切\n\n> 💡 学到 Scrapy 那章你会发现：`response.xpath(...)` 几乎是同一个味道——因为底层就是 parsel。",
          "takeaway": "parsel 是 Scrapy 同款解析器（底层 lxml），同时支持 XPath 与 CSS，.get() 取一个、.getall() 取全部。学了它，Scrapy 的 response.xpath 无缝衔接。",
          "figures": [
            {
              "key": "adv_xpath_tree",
              "caption": "🛠️ parsel 同款：XPath 与 CSS 通吃，.get() 取一 .getall() 取全，Scrapy 底层就用它"
            }
          ],
          "words": [
            {
              "en": "PARSEL",
              "zh": "parsel：Scrapy 内置的解析库",
              "pron": "ˈpɑːrsəl"
            },
            {
              "en": "SELECTOR",
              "zh": "Selector：parsel 的选择器对象",
              "pron": "sɪˈlɛktər"
            },
            {
              "en": "GETALL",
              "zh": "getall：取所有匹配结果",
              "pron": "ɡɛt ɔːl"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "parsel 底层基于？",
              "options": [
                "regex",
                "lxml",
                "BeautifulSoup"
              ],
              "answer": 1,
              "explain": "parsel 构建于 lxml 之上。"
            },
            {
              "type": "fill",
              "question": "取全部匹配用 `.______()`，取第一个用 `.get()`。",
              "answer": "getall",
              "explain": "getall 返回列表，get 返回单个。"
            },
            {
              "type": "choice",
              "question": "parsel 同时支持？",
              "options": [
                "只 XPath",
                "只 CSS",
                "XPath 和 CSS 都行"
              ],
              "answer": 2,
              "explain": "parsel 两套选择器都支持。"
            },
            {
              "type": "tap",
              "question": "下列哪些是 parsel 用法（多选）",
              "options": [
                "Selector(text=...)",
                ".xpath().get()",
                ".css().getall()",
                "response 里也能用"
              ],
              "answer": [
                0,
                1,
                2,
                3
              ],
              "explain": "四个都是 parsel/Scrapy 的常见用法。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么说「先学 parsel，Scrapy 上手零成本」？",
              "answer": "因为 Scrapy 的 response 对象直接提供 .xpath/.css/.get/.getall，和 parsel 完全一致，提前练熟到 Scrapy 章节直接无缝衔接。"
            },
            {
              "type": "coding",
              "question": "parsel 用 CSS 选择器提取。这里用正则模拟：提取所有 <h2>标题</h2> 里的文字，打印列表。",
              "starter": "import re\ndoc = '<h2>第一章</h2><p>正文</p><h2>第二章</h2>'\ntitles = re.findall(r'<h2>(.*?)</h2>', doc)\nprint(titles)",
              "_gen": "coding-ex",
              "expect": "['第一章', '第二章']"
            }
          ],
          "tasks": [
            "装 parsel，用 XPath 和 CSS 两种方式抠同一个页面的标题。",
            "对比 .get() 和 .getall() 的返回差异。",
            "记一句：parsel = Scrapy 的亲儿子。"
          ],
          "color": "#6a8fd4"
        },
        {
          "id": "exam1",
          "title": "阶段考①：异步·httpx·XPath",
          "icon": "📝",
          "type": "exam",
          "color": "#e0922f",
          "markdown": "## 阶段考①：异步 · httpx · XPath\n\n这一考覆盖 **异步爬虫基础 / httpx 与现代客户端 / 高效解析 XPath** 三章。\n\n**规则**：8 题，首次作答正确率 ≥ 80%（至少 7 题首次即对）才能过关，获得「阶段考①过关」勋章。没过关可以回去复习、重新挑战，不限次数。\n\n把异步和解析的底层逻辑踩实，后面才跑得稳！",
          "takeaway": "阶段考①过关 = 你真懂了 I/O 等待为何慢、asyncio 怎么并发、信号量限的是并发不是速度、httpx 连接池复用、XPath 轴与函数精准抠数据。底层稳了。",
          "words": [],
          "tasks": [],
          "exercises": [
            {
              "type": "choice",
              "question": "爬虫慢的主因是？",
              "options": [
                "CPU 算力不够",
                "I/O 等待（等网络）",
                "Python 太慢"
              ],
              "answer": 1,
              "explain": "90% 时间在等网络，不是算。"
            },
            {
              "type": "choice",
              "question": "GIL 背不背爬虫慢的锅？",
              "options": [
                "背，GIL 限了 I/O",
                "不背，GIL 限 CPU 并行，爬虫瓶颈是 I/O",
                "完全无关"
              ],
              "answer": 1,
              "explain": "GIL 卡的是计算并行，爬虫卡的是等待。"
            },
            {
              "type": "fill",
              "question": "异步函数里，真正会挂起等待的关键字是______。（填 await/async）",
              "answer": "await",
              "explain": "await 才挂起等结果；async 只是声明协程。"
            },
            {
              "type": "choice",
              "question": "在 asyncio 事件循环里调用同步阻塞函数（如 time.sleep）会？",
              "options": [
                "没事",
                "卡住整个事件循环，其他协程也动不了",
                "自动变异步"
              ],
              "answer": 1,
              "explain": "同步阻塞会占住线程，协程全卡。"
            },
            {
              "type": "choice",
              "question": "信号量(Semaphore)的作用是？",
              "options": [
                "让爬虫更快",
                "限制同时并发数（限流防封）",
                "去重"
              ],
              "answer": 1,
              "explain": "信号量=限并发，不是提速。"
            },
            {
              "type": "choice",
              "question": "httpx 相比 requests 的独特优势是？",
              "options": [
                "只能同步",
                "同步异步一体 + 连接池复用",
                "不支持异步"
              ],
              "answer": 1,
              "explain": "httpx 一套代码同步异步都能跑。"
            },
            {
              "type": "choice",
              "question": "遇到 429（请求过多），正确做法是？",
              "options": [
                "立刻猛刷",
                "指数退避后重试",
                "放弃"
              ],
              "answer": 1,
              "explain": "429 要退避，猛刷只会被封更久。"
            },
            {
              "type": "fill",
              "question": "XPath 中 `//div[@class='a']/text()` 的 `/text()` 用来取______。（填 文本/属性）",
              "answer": "文本",
              "explain": "/text() 取标签内文字。"
            },
            {
              "type": "choice",
              "question": "想取某节点「父节点」，XPath 用？",
              "options": [
                "//child",
                "parent:: 或 /..",
                "//sibling"
              ],
              "answer": 1,
              "explain": "parent:: 或 .. 取父。"
            },
            {
              "type": "choice",
              "question": "parsel 和 Scrapy 的关系是？",
              "options": [
                "毫无关系",
                "parsel 是 Scrapy 同款解析库",
                "parsel 是数据库"
              ],
              "answer": 1,
              "explain": "parsel 就是 Scrapy 用的解析库，XPath/CSS 都行。"
            }
          ]
        }
      ]
    },
    {
      "title": "Playwright 进阶",
      "icon": "🎭",
      "color": "#c0659e",
      "lessons": [
        {
          "id": "a4l1",
          "title": "为何比 Selenium 快：自动等待+原生通道",
          "icon": "⚡",
          "markdown": "## Playwright 为什么比 Selenium 快\n\nSelenium 每次操作走「WebDriver 协议 → 浏览器」，且**默认不等地等元素**，容易卡。Playwright 是微软出品，直接和多浏览器通信，关键差异：\n\n### 1. 自动等待（Auto-Waiting）\nPlaywright 点元素前会**自动等它可见、可点**，不用手写 time.sleep。少等=快。\n### 2. 协议更近\nSelenium 多一层 WebDriver 中转；Playwright 用浏览器原生 CDP 通道，命令直达。\n### 3. 轻量上下文并发\n`browser.new_context()` 轻量隔离，并发开多个页比 Selenium 开多个浏览器进程省资源。\n\n```python\nfrom playwright.sync_api import sync_playwright\nwith sync_playwright() as p:\n    b = p.chromium.launch()\n    pg = b.new_page()\n    pg.goto(\"https://example.com\")\n    pg.click(\"text=更多\")        # 自动等\"更多\"可点\n    print(pg.title())\n    b.close()\n```\n> 💡 但记住：能直接抓接口/HTML 就别上浏览器。Playwright 再快也比纯 requests 慢一个量级，它是「对付 JS 渲染」的利器，不是默认选择。",
          "takeaway": "Playwright 快在自动等待+浏览器原生通道+轻量上下文；但它是对付 JS 渲染的利器，能直接抓接口/HTML 就别上浏览器，纯 requests 快一个量级。",
          "figures": [
            {
              "key": "selenium_dynamic",
              "caption": "⚡ Playwright 自动等待+CDP 直达 vs Selenium 多一层 WebDriver 中转：少等=快"
            }
          ],
          "words": [
            {
              "en": "PLAYWRIGHT",
              "zh": "Playwright：微软出的浏览器自动化库",
              "pron": "ˈpleɪraɪt"
            },
            {
              "en": "AUTO_WAIT",
              "zh": "自动等待：操作前自动等元素就绪",
              "pron": "ˈɔːtoʊ weɪt"
            },
            {
              "en": "CONTEXT",
              "zh": "上下文：轻量隔离的浏览器会话",
              "pron": "ˈkɑːntekst"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "Playwright 比 Selenium 快的关键之一是？",
              "options": [
                "操作前自动等元素可点",
                "用更多 sleep",
                "不连浏览器"
              ],
              "answer": 0,
              "explain": "自动等待省掉盲等，是快的重要原因。"
            },
            {
              "type": "fill",
              "question": "Playwright 点元素前会______等待，省掉手写 sleep。",
              "answer": "自动",
              "explain": "Playwright 内置 auto-waiting。"
            },
            {
              "type": "choice",
              "question": "关于「什么时候用 Playwright」，正确的是？",
              "options": [
                "所有网站都该用",
                "能直接抓接口就别上浏览器",
                "它比 requests 还快"
              ],
              "answer": 1,
              "explain": "浏览器开销大，能直接抓就别开浏览器。"
            },
            {
              "type": "tap",
              "question": "Playwright 相比 Selenium 的优势有哪些（多选）",
              "options": [
                "自动等待",
                "用浏览器原生通道更快",
                "轻量上下文并发",
                "必须装 WebDriver 中转"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三个是优势；WebDriver 中转是 Selenium 的特点。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么说「Playwright 再快也比纯 requests 慢一个量级」？",
              "answer": "因为开浏览器、渲染页面、跑 JS 本身开销巨大；纯 requests 只收发文本，量级上差很多。浏览器只用来对付 JS 渲染页面。"
            },
            {
              "type": "coding",
              "question": "Playwright 用真实浏览器内核，比 Selenium 快在「自动等待+原生协议」。代码需本机跑（浏览器里跑不了），看懂点「标记完成」。",
              "starter": "from playwright.sync_api import sync_playwright\n\nwith sync_playwright() as p:\n    b = p.chromium.launch()\n    pg = b.new_page()\n    pg.goto('https://example.com')\n    print(pg.title())\n    b.close()",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "装 playwright 并 `playwright install chromium`，跑上面的例子。",
            "用 Selenium 写同样逻辑对比代码量和速度。",
            "记一句：能直接抓就不开浏览器。"
          ],
          "color": "#c0659e"
        },
        {
          "id": "a4l2",
          "title": "自动等待与选择器：少写 sleep",
          "icon": "🎯",
          "markdown": "## 选择器与自动等待：少写 sleep\n\nPlaywright 选择器支持 text/CSS/XPath，且**任何操作前自动等元素就绪**。\n\n### 常用选择器\n```python\npg.click(\"text=登录\")                 # 按可见文字\npg.click(\"#submit\")                   # CSS id\npg.click(\"//button[@class='go']\")     # XPath（加前缀）\npg.fill(\"input[name='user']\", \"xiaoming\")\n```\n### 等待策略\n```python\npg.wait_for_selector(\"#list\", state=\"visible\")\npg.wait_for_load_state(\"networkidle\")   # 等网络安静\n```\n- `state=\"visible\"` 等可见；`\"attached\"` 等挂上 DOM\n- 别再用 `time.sleep(3)` 盲等，容易不稳\n\n> ⚠️ 易错：用 `time.sleep` 盲等既慢又容易漏（网慢时 3 秒不够）。优先 `wait_for_selector` 等具体条件。",
          "takeaway": "Playwright 支持 text/CSS/XPath 选择器且操作前自动等就绪；用 wait_for_selector 等具体条件，少用 time.sleep 盲等（慢且不稳）。",
          "figures": [
            {
              "key": "selenium_dynamic",
              "caption": "🎯 选择器：text/CSS/XPath 通吃；wait_for_selector 等具体条件而非盲等"
            }
          ],
          "words": [
            {
              "en": "SELECTOR",
              "zh": "选择器：定位页面元素的表达式",
              "pron": "sɪˈlɛktər"
            },
            {
              "en": "WAIT_FOR",
              "zh": "wait_for：等某个条件达成",
              "pron": "weɪt fɔːr"
            },
            {
              "en": "VISIBLE",
              "zh": "visible：元素可见状态",
              "pron": "ˈvɪzəbəl"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "Playwright 点元素前会？",
              "options": [
                "直接点可能报错",
                "自动等元素可点再点",
                "先 sleep 5 秒"
              ],
              "answer": 1,
              "explain": "auto-waiting 在操作前等元素可交互。"
            },
            {
              "type": "fill",
              "question": "按可见文字点按钮用 `pg.click(\"______=登录\")`。",
              "answer": "text",
              "explain": "text= 按可见文字定位。"
            },
            {
              "type": "choice",
              "question": "为什么少用 time.sleep(3) 盲等？",
              "options": [
                "写起来太长",
                "慢且网慢时可能不够稳",
                "Playwright 不支持"
              ],
              "answer": 1,
              "explain": "盲等既拖慢又容易在弱网下漏等。"
            },
            {
              "type": "tap",
              "question": "下列哪些是 Playwright 选择器写法（多选）",
              "options": [
                "text=登录",
                "#submit",
                "//button",
                "wait_for_selector"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三个是选择器；wait_for_selector 是等待 API 不是选择器。",
              "multi": true
            },
            {
              "type": "open",
              "question": "什么场景下「等网络安静 networkidle」比「等某个元素」更合适？",
              "answer": "当数据由多个接口陆续返回、你不确定哪个元素先出现时，等 networkidle 比等单个元素更稳，能确保该加载的都加载完。"
            },
            {
              "type": "coding",
              "question": "Playwright 自动等待元素出现，少写 sleep。代码需本机跑，看懂点「标记完成」。",
              "starter": "from playwright.sync_api import sync_playwright\n\nwith sync_playwright() as p:\n    b = p.chromium.launch()\n    pg = b.new_page()\n    pg.goto('https://example.com')\n    pg.wait_for_selector('h1')   # 自动等，不用 sleep\n    print(pg.text_content('h1'))\n    b.close()",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "用 text= 和 CSS 两种方式点同一个按钮，对比可读性。",
            "把代码里的 sleep 全换成 wait_for_selector，看是否更稳。",
            "记一句：盲等 sleep 是坏味道。"
          ],
          "color": "#c0659e"
        },
        {
          "id": "a4l3",
          "title": "拦截网络请求直接抓接口",
          "icon": "🕸️",
          "markdown": "## 不解析 HTML，直接截接口\n\n很多页面数据其实是从接口（XHR/fetch）返回的 JSON。与其用 Playwright 渲染完再抠 DOM，**不如拦截网络请求，直接拿到接口返回**——又快又干净。\n\n### 监听 + 抓取响应\n```python\nfrom playwright.sync_api import sync_playwright\ndef on_response(resp):\n    if \"/api/list\" in resp.url:\n        print(resp.json())          # 直接拿 JSON\n\nwith sync_playwright() as p:\n    b = p.chromium.launch()\n    pg = b.new_page()\n    pg.on(\"response\", on_response)   # 挂监听器\n    pg.goto(\"https://example.com\")\n    b.close()\n```\n### 还能改请求\n`pg.route(\"**/api/*\", handler)` 能拦截并改写请求/返回，甚至**免登录伪造**。\n\n> 💡 思路升级：先用 DevTools 的 Network 面板找到那个接口，再用 requests/aiohttp **直接打接口**，连浏览器都不用开——这是进阶最常用的一招。",
          "takeaway": "拦截响应直接拿 JSON 比抠 DOM 快且干净；pg.on('response') 监听、pg.route 改写请求。找到接口后常用 requests/aiohttp 直接打，连浏览器都不开。",
          "figures": [
            {
              "key": "adv_pw_intercept",
              "caption": "🕸️ 拦截响应：直接拿接口 JSON，省掉渲染+抠 DOM；找到接口后可换 requests 直打"
            }
          ],
          "words": [
            {
              "en": "INTERCEPT",
              "zh": "拦截：截获网络请求/响应",
              "pron": "ˈɪntərsept"
            },
            {
              "en": "ROUTE",
              "zh": "route：拦截并改写请求",
              "pron": "ruːt"
            },
            {
              "en": "XHR",
              "zh": "XHR/fetch：前端发接口的两种方式",
              "pron": "ɛks eɪtʃ ɑːr"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "拦截网络请求抓数据，相比解析 DOM 的优势是？",
              "options": [
                "更慢",
                "直接拿结构化 JSON 更快更干净",
                "必须完整渲染"
              ],
              "answer": 1,
              "explain": "接口直接返回 JSON，省去渲染和 DOM 解析。"
            },
            {
              "type": "fill",
              "question": "监听响应用 `pg.______(\"response\", 回调)`。",
              "answer": "on",
              "explain": "pg.on('response', cb) 注册响应监听。"
            },
            {
              "type": "choice",
              "question": "找到接口后，进阶常用做法是？",
              "options": [
                "继续用浏览器跑",
                "用 requests/aiohttp 直接打接口",
                "放弃不抓"
              ],
              "answer": 1,
              "explain": "接口稳定后直接用 HTTP 库打，省浏览器开销。"
            },
            {
              "type": "tap",
              "question": "Playwright 网络相关能力有哪些（多选）",
              "options": [
                "on('response') 监听",
                "route 改写请求",
                "直接拿 resp.json()",
                "只能解析 DOM"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三个都是网络能力；解析 DOM 不是唯一手段。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么说「先找接口再用 requests 直接打」是进阶爬虫的常用招？",
              "answer": "浏览器只是为了「看见」接口地址和参数；一旦摸清，用轻量 HTTP 库直接打接口，速度快、资源省、还能并发，是性价比最高的做法。"
            },
            {
              "type": "coding",
              "question": "拦截网络请求直接抓接口，是 Playwright 的杀手锏。代码需本机跑，看懂点「标记完成」。",
              "starter": "from playwright.sync_api import sync_playwright\n\nwith sync_playwright() as p:\n    b = p.chromium.launch()\n    pg = b.new_page()\n    pg.on('response', lambda r: print('接口', r.url) if '/api/' in r.url else None)\n    pg.goto('https://example.com')\n    b.close()",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "用 on('response') 抓一个页面的所有接口 URL 打印出来。",
            "在 Network 面板找到某个 XHR，用 requests 单独打它验证。",
            "记一句：浏览器是探路器，不是生产工具。"
          ],
          "color": "#c0659e"
        },
        {
          "id": "a4l4",
          "title": "Cookie 持久化登录",
          "icon": "🍪",
          "markdown": "## Cookie 持久化：登录一次，复用多次\n\n很多站点要登录才能看数据。用 Playwright 登录一次，把 **Cookie 存下来**，之后用同一批 Cookie 直接进，不用每次重登。\n\n### 存 Cookie\n```python\npg.goto(\"https://site.com/login\")\npg.fill(\"#user\", \"xiaoming\"); pg.fill(\"#pwd\", \"123\")\npg.click(\"text=登录\")\nstorage = pg.context.storage_state()     # 含 Cookie + localStorage\nimport json; json.dump(storage, open(\"state.json\",\"w\"))\n```\n### 用 Cookie 复用\n```python\ncontext = b.new_context(storage_state=\"state.json\")\npg = context.new_page()\npg.goto(\"https://site.com/inside\")       # 直接是登录态\n```\n> ⚠️ 易错：Cookie 有时效，过期要重新登录；且多账号别混用同一份 state，否则串号。",
          "takeaway": "登录一次用 storage_state 存 Cookie+localStorage，之后 new_context(storage_state=...) 直接进登录态。Cookie 有时效会过期，多账号要隔离别混用。",
          "figures": [
            {
              "key": "session_cookie",
              "caption": "🍪 Cookie 持久化：登录一次存 storage_state，后续复用直接进登录态"
            }
          ],
          "words": [
            {
              "en": "COOKIE",
              "zh": "Cookie：服务器发的身份凭证",
              "pron": "ˈkʊki"
            },
            {
              "en": "STORAGE_STATE",
              "zh": "storage_state：Playwright 存的登录态",
              "pron": "ˈstɔːrɪdʒ steɪt"
            },
            {
              "en": "PERSIST",
              "zh": "持久化：存下来下次直接用",
              "pron": "pərˈsɪst"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "storage_state 里主要存了什么？",
              "options": [
                "只有 HTML",
                "Cookie + localStorage",
                "图片"
              ],
              "answer": 1,
              "explain": "storage_state 保存登录态相关的 Cookie 和本地存储。"
            },
            {
              "type": "fill",
              "question": "复用登录态用 `b.new_context(storage_state=\"______\")`。",
              "answer": "state.json",
              "explain": "传入存好的状态文件即可恢复登录。"
            },
            {
              "type": "choice",
              "question": "关于 Cookie 复用，正确的是？",
              "options": [
                "永不过期",
                "有时效、会过期需重登",
                "多账号可混用同一份"
              ],
              "answer": 1,
              "explain": "Cookie 会过期，且多账号混用会串号。"
            },
            {
              "type": "tap",
              "question": "持久化登录的好处有哪些（多选）",
              "options": [
                "登录一次复用多次",
                "免每次输密码",
                "省去重复登录等待",
                "适合多账号隔离使用"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三个是好处；多账号还应隔离而非混用。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「多账号别混用同一份 state」？",
              "answer": "同一份 state 只对应一个账号的登录凭证，混用会导致请求以错误身份发出，轻则数据串号，重则触发风控。"
            },
            {
              "type": "coding",
              "question": "网站用 Cookie 记住登录态。下面 cookies 是已保存的登录信息，写代码把它拼成请求头格式 'k1=v1; k2=v2' 并打印。",
              "starter": "cookies = {'sessionid': 'abc123', 'token': 'xyz'}\nheader = ''   # TODO: 拼成 'sessionid=abc123; token=xyz'\nheader = '; '.join(k + '=' + v for k, v in cookies.items())\nprint(header)",
              "_gen": "coding-ex",
              "expect": "sessionid=abc123; token=xyz"
            }
          ],
          "tasks": [
            "用 Playwright 登录一个测试站，存 state.json 再复用。",
            "故意用过期 state 访问，看是否跳回登录页。",
            "记一句：Cookie 有时效，多账号要隔离。"
          ],
          "color": "#c0659e"
        },
        {
          "id": "a4l5",
          "title": "反检测 stealth：隐藏指纹破绽",
          "icon": "🕵️",
          "markdown": "## stealth：别让网站认出你是机器人\n\n网站会收集「浏览器指纹」——UA、分辨率、字体、WebDriver 标记等。普通 Playwright 带着 `navigator.webdriver=true` 这种破绽，一眼机器人。\n\n### 常见破绽与修补\n- `navigator.webdriver` 应为 undefined（Playwright 默认 true）\n- UA、platform 要像真浏览器\n- 字体/插件列表别是空的\n\n### 思路（不直接给绕过代码）\nPlaywright 可通过 `context.add_init_script()` 在每页加载前注入 JS，把 `webdriver` 等标记抹掉；或用社区 stealth 脚本。但**这属于攻防灰色地带**，只在你有权抓的站点、做合规测试时用。\n\n> ⚠️ 红线：伪造指纹去突破人家明确禁止的防护 = 违法风险。第 13 章合规会细讲边界。",
          "takeaway": "网站靠浏览器指纹（webdriver 标记/UA/字体）识别机器人；可用 add_init_script 抹掉 webdriver 等破绽，但属灰色地带，只在你有权抓、合规测试时用，突破明确禁止的防护有违法风险。",
          "figures": [
            {
              "key": "adv_pw_stealth",
              "caption": "🕵️ stealth：抹掉 navigator.webdriver 等指纹破绽；灰色地带，合规范围内才用"
            }
          ],
          "words": [
            {
              "en": "FINGERPRINT",
              "zh": "指纹：浏览器暴露的一堆特征集合",
              "pron": "ˈfɪŋɡərprɪnt"
            },
            {
              "en": "STEALTH",
              "zh": "隐身：隐藏自动化痕迹",
              "pron": "stɛlθ"
            },
            {
              "en": "WEBDRIVER",
              "zh": "webdriver：自动化标记，真浏览器为 undefined",
              "pron": "ˈwɛbdraɪvər"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "网站靠什么认出你是机器人？",
              "options": [
                "只看 IP",
                "浏览器指纹(webdriver标记/UA等)",
                "看心情"
              ],
              "answer": 1,
              "explain": "指纹是主要识别手段。"
            },
            {
              "type": "fill",
              "question": "Playwright 默认 `navigator.______=true` 是个明显破绽。",
              "answer": "webdriver",
              "explain": "真实浏览器该字段为 undefined。"
            },
            {
              "type": "choice",
              "question": "关于 stealth 隐藏指纹，正确的是？",
              "options": [
                "随便用没关系",
                "属攻防灰色地带、只在合规范围用",
                "一定能骗过所有检测"
              ],
              "answer": 1,
              "explain": "灰色地带，且检测在持续升级，没有万能。"
            },
            {
              "type": "tap",
              "question": "常见指纹破绽有哪些（多选）",
              "options": [
                "navigator.webdriver=true",
                "UA 不像真浏览器",
                "字体列表为空",
                "屏幕分辨率正常"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三个是典型破绽；正常分辨率反而像真人。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「伪造指纹突破明确禁止的防护」有法律风险？",
              "answer": "那等于主动规避对方的技术防护措施去获取受限数据，可能触犯反不正当竞争或计算机相关法规，超出合规爬虫边界。"
            },
            {
              "type": "coding",
              "question": "stealth 隐藏自动化指纹(webdriver 等)。代码需本机跑，看懂点「标记完成」。",
              "starter": "from playwright.sync_api import sync_playwright\n\nwith sync_playwright() as p:\n    b = p.chromium.launch()\n    pg = b.new_page()\n    pg.add_init_script(\"Object.defineProperty(navigator,'webdriver',{get:()=>undefined})\")\n    pg.goto('https://example.com')\n    print('已隐藏 webdriver 指纹')\n    b.close()",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "了解 navigator.webdriver 等字段，知道自己「露怯」在哪。",
            "读第 13 章合规边界，明确哪些不能碰。",
            "记一句：指纹对抗是灰色地带，合规优先。"
          ],
          "color": "#c0659e"
        }
      ]
    },
    {
      "title": "JS 逆向·参数签名",
      "icon": "🔑",
      "color": "#6a8fd4",
      "lessons": [
        {
          "id": "a5l1",
          "title": "sign/token 从哪来：前端现算的防伪签名",
          "icon": "🔏",
          "markdown": "## sign / token：请求里的「防伪签名」\n\n很多接口不是裸奔的：发请求时带一个 `sign` 或 `token` 参数，服务器用同样算法验算，对得上才返数据。这叫**参数签名**，目的是防爬、防篡改。\n\n### 它从哪来\n签名通常由前端 JS 在点击/加载时用固定算法现算：\n```\n原始参数 k1=v1&k2=v2 + 密钥 salt → hash 算法 → sign=xxxx\n```\n你直接抄上次抓到的 sign 没用——它往往绑定时间戳，**过期就废**。\n\n### 逆向要干的事\n1. 在 DevTools 里找到「算 sign 的那段 JS」\n2. 看懂它用了什么算法（md5/sha256/aes…）和密钥\n3. 用 Python 复现同一算法，自己算 sign\n\n> 💡 心态：签名不是密码学高墙，多半是「固定算法 + 固定盐」，只是藏得深。逆向=找算法+复现。",
          "takeaway": "sign/token 是前端 JS 现算的防伪签名，常绑时间戳会过期，不能直接复用。逆向三步走：找算签名的 JS → 看懂算法和盐 → Python 复现。",
          "figures": [
            {
              "key": "adv_js_trace",
              "caption": "🔏 sign 由前端 JS 现算：参数+盐→hash→sign，绑时间戳会过期"
            }
          ],
          "words": [
            {
              "en": "SIGN",
              "zh": "签名：请求里防伪造的参数",
              "pron": "saɪn"
            },
            {
              "en": "TOKEN",
              "zh": "令牌：身份/权限的凭证串",
              "pron": "ˈtoʊkən"
            },
            {
              "en": "SALT",
              "zh": "盐：拼在参数里的固定密钥片段",
              "pron": "sɔːlt"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "接口带的 sign 参数主要作用是？",
              "options": [
                "装饰",
                "防伪/防爬的签名",
                "分页"
              ],
              "answer": 1,
              "explain": "sign 用于服务端校验请求合法性。"
            },
            {
              "type": "fill",
              "question": "sign 通常由前端 JS 用固定算法______算出来（填两字：现/预）。",
              "answer": "现",
              "explain": "签名是运行时现算的，不是写死的。"
            },
            {
              "type": "choice",
              "question": "直接复用上次抓到的 sign 通常？",
              "options": [
                "永远有效",
                "因绑定时间戳等会过期",
                "服务器不校验"
              ],
              "answer": 1,
              "explain": "带时间戳/随机数的签名复用即失效。"
            },
            {
              "type": "tap",
              "question": "逆向签名一般要做哪些（多选）",
              "options": [
                "找到算 sign 的 JS",
                "看懂算法和密钥",
                "用 Python 复现",
                "放弃不抓"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三步是标准逆向流程。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么说「签名多半是固定算法+固定盐，只是藏得深」？",
              "answer": "因为它本质还是确定性的哈希/加密运算，没有真正的随机密钥协商，只是代码被压缩混淆藏在 webpack 里，找到算法和盐就能复现。"
            },
            {
              "type": "coding",
              "question": "sign/token 常是前端现算的「防伪签名」。代码需本机跑，看懂思路点「标记完成」。",
              "starter": "# 思路：前端拿到参数 -> 按规则拼串 -> 哈希 -> 当成 sign 发给后端\nraw = 'a=1&b=2&t=99'\nprint('前端会把', raw, '拼好再哈希当成 sign')",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "在 DevTools 里找一个带 sign 的接口，观察它长什么样。",
            "思考：如果去掉 sign 直接请求会怎样？验证你的猜想。",
            "记一句：逆向=找算法+复现。"
          ],
          "color": "#6a8fd4"
        },
        {
          "id": "a5l2",
          "title": "用 DevTools 追密钥",
          "icon": "🔬",
          "markdown": "## DevTools：逆向的第一现场\n\nChrome DevTools 的 **Sources（源码）** 和 **Network（网络）** 面板是追签名的主战场。\n\n### 标准流程\n1. Network 里点开那个接口，看 Request 的 Query/Body 里有没有 sign、timestamp\n2. 在 Sources → XHR/fetch Breakpoints 对接口 URL 下断点\n3. 刷新页面，断住后看**调用栈（Call Stack）**，一层层往上找「算 sign 的函数」\n4. 在算 sign 的函数里下断点，看它读了哪些变量（盐、密钥）\n\n### 小技巧\n- 「格式化」按钮 `{}` 把压缩代码展开\n- 搜索 `sign=` / `md5(` / `sha256(` 关键字定位\n\n> ⚠️ 易错：断点下太粗会断一堆无关请求。先确定是哪个接口、哪个参数，再精准下断。",
          "takeaway": "用 DevTools 的 Network 看请求里的 sign、Sources 下 XHR 断点+看调用栈找算签名的函数；压缩代码点 {} 格式化，搜 sign=/md5( 定位。断点要精准别太粗。",
          "figures": [
            {
              "key": "adv_js_trace",
              "caption": "🔬 DevTools：Network 看 sign → XHR 断点 → Call Stack 一层层追到算签名的函数"
            }
          ],
          "words": [
            {
              "en": "DEVTOOLS",
              "zh": "浏览器开发者工具",
              "pron": "dɛv tuːlz"
            },
            {
              "en": "BREAKPOINT",
              "zh": "断点：程序运行到此处暂停",
              "pron": "ˈbreɪkpɔɪnt"
            },
            {
              "en": "CALLSTACK",
              "zh": "调用栈：函数一层层调用的记录",
              "pron": "kɔːl stæk"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "追签名最该用 DevTools 的哪两个面板？",
              "options": [
                "Console 和 Performance",
                "Sources 和 Network",
                "Elements 和 Lighthouse"
              ],
              "answer": 1,
              "explain": "Sources 看代码、Network 看请求，是正主。"
            },
            {
              "type": "fill",
              "question": "在算 sign 的函数里下______点，能看清它读了哪些变量。",
              "answer": "断",
              "explain": "断点让执行暂停，方便观察变量。"
            },
            {
              "type": "choice",
              "question": "压缩代码看不懂时，先点哪个按钮？",
              "options": [
                "{}",
                "🔍",
                "⏯"
              ],
              "answer": 0,
              "explain": "{} 是格式化/美化代码按钮。"
            },
            {
              "type": "tap",
              "question": "追密钥的标准动作有哪些（多选）",
              "options": [
                "Network 看请求里的 sign",
                "XHR 断点",
                "看 Call Stack 调用栈",
                "搜 md5(/sha256( 关键字"
              ],
              "answer": [
                0,
                1,
                2,
                3
              ],
              "explain": "四个都是定位签名算法的常用手段。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「断点下太粗」会让你追得很痛苦？",
              "answer": "粗断点会在每个无关请求上都暂停，你要在海量暂停里翻找真正算签名的那次，效率极低；精准下在目标接口/函数上才能直击要害。"
            },
            {
              "type": "coding",
              "question": "用 DevTools 的 Network/Source 面板追密钥。这是分析方法，无代码，看懂点「标记完成」。",
              "starter": "# 步骤：\n# 1) F12 打开 DevTools -> Network 找到那个接口\n# 2) 看 Request 里的 sign 参数\n# 3) 到 Sources 里搜索 'sign' 下断点，跟到哈希函数\n# 4) 把同样的参数顺序和密钥抄到 Python 复现\nprint('方法课：动手在浏览器里跟一遍最有用')",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "对一个真实接口练习：下 XHR 断点→看调用栈→定位算法函数。",
            "用 {} 格式化一段压缩 JS，感受可读性变化。",
            "记一句：先定接口再下断，别撒网。"
          ],
          "color": "#6a8fd4"
        },
        {
          "id": "a5l3",
          "title": "Python 复现 md5/hash 签名",
          "icon": "🐍",
          "markdown": "## Python 复现：把 JS 算法翻译成 Python\n\n找到算法后，用 Python 的 `hashlib` 复现，自己算 sign。最常见是 md5/sha256 + 拼接固定盐。\n\n### 复现示例（md5）\n```python\nimport hashlib, time\ndef make_sign(params: dict, salt: str):\n    s = \"&\".join(f\"{k}={params[k]}\" for k in sorted(params))  # 按 key 排序\n    s += salt                                                   # 拼盐\n    return hashlib.md5(s.encode()).hexdigest()                 # md5\nparams = {\"page\": 1, \"t\": int(time.time())}\nprint(make_sign(params, salt=\"abc123\"))\n```\n### 对齐要点\n- 排序方式（按 key？按出现顺序？）\n- 盐在前面还是后面、是否拼时间戳\n- 是否要转大写/去特定字符\n\n> ⚠️ 易错：JS 里字符串可能是 UTF-8 也可能不是；中文参数编码方式要和 JS 完全一致，否则算出的 sign 对不上。",
          "takeaway": "用 hashlib 复现：参数按 key 排序拼接 + 拼盐 + md5/sha256。对齐排序方式、盐位置、时间戳、UTF-8 编码；中文编码不一致是 sign 对不上的头号元凶。",
          "figures": [
            {
              "key": "adv_js_trace",
              "caption": "🐍 Python hashlib 复现：排序拼接+盐+md5，和 JS 逐字节对齐"
            }
          ],
          "words": [
            {
              "en": "HASHLIB",
              "zh": "hashlib：Python 哈希模块",
              "pron": "hæʃ lɪb"
            },
            {
              "en": "HEXDIGEST",
              "zh": "hexdigest：输出十六进制摘要",
              "pron": "hɛks ˈdaɪdʒɛst"
            },
            {
              "en": "SALT",
              "zh": "盐：拼在参数里的固定密钥",
              "pron": "sɔːlt"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "Python 里算 md5 用哪个模块？",
              "options": [
                "hashlib",
                "base64",
                "json"
              ],
              "answer": 0,
              "explain": "hashlib 提供 md5/sha 系列。"
            },
            {
              "type": "fill",
              "question": "参数通常要按 key ______后再拼接，才和 JS 一致。",
              "answer": "排序",
              "explain": "排序保证拼接顺序确定。"
            },
            {
              "type": "choice",
              "question": "复现 sign 对不上，最该先查？",
              "options": [
                "网络",
                "中文参数的编码方式",
                "显示器"
              ],
              "answer": 1,
              "explain": "编码不一致是 sign 对不上的头号原因。"
            },
            {
              "type": "tap",
              "question": "复现时要注意哪些（多选）",
              "options": [
                "参数排序方式",
                "盐的前后位置",
                "时间戳是否参与",
                "UTF-8 编码一致"
              ],
              "answer": [
                0,
                1,
                2,
                3
              ],
              "explain": "四个都是对齐要点。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「中文参数的编码」不一致会导致 sign 对不上？",
              "answer": "md5/sha 是对字节算的，同一汉字在 UTF-8 和 GBK 下字节不同，哈希结果就不同；必须和 JS 用同一种编码。"
            },
            {
              "type": "coding",
              "question": "签名常把参数拼成字符串再 md5。写代码对字符串 'hello' 求 md5（32 位十六进制），打印前 10 位。",
              "starter": "import hashlib\ns = 'hello'\nh = hashlib.md5(s.encode('utf-8')).hexdigest()\nprint('md5前10位', h[:10])",
              "_gen": "coding-ex",
              "expect": "5d41402abc"
            }
          ],
          "tasks": [
            "把上面的 make_sign 跑通，改 salt 看输出是否变化。",
            "故意把排序改成不排序，对比 sign 差异。",
            "记一句：编码不一致=sign 对不上。"
          ],
          "color": "#6a8fd4"
        },
        {
          "id": "a5l4",
          "title": "读懂 webpack 打包",
          "icon": "📦",
          "markdown": "## webpack：代码被打成了一团毛线\n\n现代前端常用 webpack 把 JS 打包成一个大文件，函数被塞进一个超大数组/对象里，靠数字下标调用。逆向时你会发现：「算 sign 的函数」躲在 `modules[123]` 里，名字都没了。\n\n### 典型长相\n```js\nvar modules = [function(){...}, function(){...} /* 算 sign 的在这 */];\nfunction __webpack_require__(i){ return modules[i](); }\n```\n### 怎么下手\n1. 在 DevTools 里给 `__webpack_require__` 或目标模块下断点\n2. 用「Conditional Breakpoint」只断你关心的模块号\n3. 把那个模块的函数体**整体复制**出来，补上它依赖的小函数，在 Node 里跑通\n\n> 💡 webpack 不是加密，只是「混淆+打包」。耐心一层层剥，总能找到算签名的那一块。",
          "takeaway": "webpack 把函数塞进大数组靠下标调用、名字丢失，但没加密。逆向：给 __webpack_require__ 下断点、用条件断点定位目标模块、复制函数体到 Node 跑通。耐心剥层即可。",
          "figures": [
            {
              "key": "adv_webpack",
              "caption": "📦 webpack：函数塞进 modules 大数组靠下标调用，名字丢失但没加密"
            }
          ],
          "words": [
            {
              "en": "WEBPACK",
              "zh": "webpack：前端打包工具",
              "pron": "ˈwɛbpæk"
            },
            {
              "en": "MODULE",
              "zh": "模块：被打包进数组的一个代码块",
              "pron": "ˈmɑːdʒuːl"
            },
            {
              "en": "REQUIRE",
              "zh": "require：模块加载调用",
              "pron": "rɪˈkwaɪər"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "webpack 打包后，函数通常？",
              "options": [
                "保留原名",
                "塞进大数组靠下标调用、名字丢失",
                "被加密无法读"
              ],
              "answer": 1,
              "explain": "webpack 用数字下标引用模块，原函数名丢失。"
            },
            {
              "type": "fill",
              "question": "模块靠 `_______require__(下标)` 这种方式被调出来。",
              "answer": "webpack",
              "explain": "__webpack_require 是 webpack 的模块加载器。"
            },
            {
              "type": "choice",
              "question": "关于 webpack，正确的是？",
              "options": [
                "是加密算法",
                "只是混淆+打包，可逆向",
                "完全无法读"
              ],
              "answer": 1,
              "explain": "没加密，只是打包混淆。"
            },
            {
              "type": "tap",
              "question": "逆向 webpack 的手法有哪些（多选）",
              "options": [
                "给 __webpack_require__ 下断点",
                "用条件断点只断目标模块",
                "复制目标模块函数体到 Node 跑",
                "直接放弃"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三步是标准手法。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么说「webpack 不是加密，只是打包混淆」？",
              "answer": "它只是把代码重组、改名、合并，逻辑依然以明文 JS 存在，可被 DevTools 断点和复制出来执行，远未到加密不可读的程度。"
            },
            {
              "type": "coding",
              "question": "webpack 把代码打成很多 chunk，密钥藏在某个模块里。这是阅读打包的方法，无代码，看懂点「标记完成」。",
              "starter": "# 思路：\n# 1) Sources -> 切到 '{}' 美化后的源码\n# 2) 搜索 'sign' / 'md5' / 'encrypt'\n# 3) 跟调用栈找到真正算签名的函数\nprint('webpack 只是外壳，重点找算签名的那个函数')",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "找一段 webpack 打包的代码，用 {} 格式化后观察 modules 结构。",
            "练习用条件断点只断某个模块号。",
            "记一句：webpack=毛线团，耐心剥。"
          ],
          "color": "#6a8fd4"
        },
        {
          "id": "a5l5",
          "title": "实战模拟生成签名（AES/RSA 思路）",
          "icon": "🧪",
          "markdown": "## 实战：模拟一个签名生成\n\n综合前几节，我们手搓一个「前端算 sign」的最小模型，并用 Python 复现。这里用 **AES** 思路示意（RSA 见下）。\n\n### 场景：参数 + 时间戳 → AES 加密当 token\n```python\nfrom Crypto.Cipher import AES\nimport time, base64, json\ndef make_token(data: dict, key: bytes):\n    body = json.dumps(data, separators=(\",\",\":\")).encode()\n    pad = body + b\"\\x00\" * ((16 - len(body) % 16) % 16)   # 补到 16 倍数\n    c = AES.new(key, AES.MODE_ECB).encrypt(pad)\n    return base64.b64encode(c).decode()\ntoken = make_token({\"uid\": 7, \"t\": int(time.time())}, b\"16byteskey!!!!!!\")\n```\n### 思路对照\n- **对称 AES**：同一把 key 加解密，快，key 泄露即崩 → 常用于前端\n- **非对称 RSA**：公钥加密、私钥解密，私钥藏服务端，前端拿不到 → 更安全但前端难复现\n\n> ⚠️ 易错：AES 密钥长度必须是 16/24/32 字节，明文要补齐到块倍数，否则报错——这正是逆向时 JS 里那段「补位逻辑」要抄对的地方。",
          "takeaway": "实战用 AES 把参数+时间戳加密当 token：密钥须 16/24/32 字节、明文补到块倍数。AES 对称快但 key 泄露即崩；RSA 私钥在服务端前端拿不到、更安全但难复现。补位逻辑要和 JS 抄一致。",
          "figures": [
            {
              "key": "adv_js_trace",
              "caption": "🧪 AES 对称 vs RSA 非对称：前端多用 AES（key 易泄露），RSA 私钥在服务端难复现"
            }
          ],
          "words": [
            {
              "en": "AES",
              "zh": "AES：对称加密算法",
              "pron": "eɪ iː ɛs"
            },
            {
              "en": "RSA",
              "zh": "RSA：非对称加密算法",
              "pron": "ɑːr ɛs eɪ"
            },
            {
              "en": "PADDING",
              "zh": "补位：把明文补齐到块倍数",
              "pron": "ˈpædɪŋ"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "AES 属于哪类加密？",
              "options": [
                "对称(同钥匙加解密)",
                "非对称(公私钥)",
                "哈希"
              ],
              "answer": 0,
              "explain": "AES 用同一把密钥加解密。"
            },
            {
              "type": "fill",
              "question": "AES 密钥长度必须是 16/24/______ 字节之一。",
              "answer": "32",
              "explain": "AES-128/192/256 对应 16/24/32 字节。"
            },
            {
              "type": "choice",
              "question": "RSA 为什么前端难复现？",
              "options": [
                "算法太难",
                "私钥在服务端前端拿不到",
                "不支持 Python"
              ],
              "answer": 1,
              "explain": "私钥不下发前端，缺私钥就无法完成对应运算。"
            },
            {
              "type": "tap",
              "question": "关于 AES 补位，正确的是（多选）",
              "options": [
                "明文要补齐到块倍数",
                "密钥长度受限",
                "直接加密任意长度也不会错",
                "补位逻辑要和 JS 一致"
              ],
              "answer": [
                0,
                1,
                3
              ],
              "explain": "补位是必须的，且与 JS 对齐才能复现。",
              "multi": true
            },
            {
              "type": "open",
              "question": "对称 AES 和非对称 RSA，在「爬虫逆向」场景下各有什么利弊？",
              "answer": "AES 对称、快、前端易集成但密钥易泄露，逆向者拿到 key 就能复现；RSA 私钥在服务端，前端只有公钥，难以完整复现服务端校验侧的运算，更安全。"
            },
            {
              "type": "coding",
              "question": "AES/RSA 等加密思路：前端用密钥把参数加密当签名。这里只演示「用随机数当一次性 nonce」的思路，看懂点「标记完成」。",
              "starter": "import os\nnonce = os.urandom(4).hex()   # 一次性随机串，防重放\nprint('本次请求的 nonce =', nonce)",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "装 pycryptodome，把上面的 make_token 跑通。",
            "故意用错密钥长度，看报什么错。",
            "记一句：AES 密钥 16/24/32，明文要补位。"
          ],
          "color": "#6a8fd4"
        }
      ]
    },
    {
      "title": "字体·CSS 反爬与 OCR",
      "icon": "🔤",
      "color": "#e6b84d",
      "lessons": [
        {
          "id": "a6l1",
          "title": "字体反爬原理：显示层与数据层不一致",
          "icon": "🔡",
          "markdown": "## 字体反爬：字是假的，映射是真的\n\n有些网站把页面上的文字（价格、数字）换成**自定义字体**（woff/ttf）。你看到的「③」在 HTML 里可能是个「□」，真正显示成几，由字体文件里的**字形→编码映射**决定。直接抠 HTML 文字会拿到乱码。\n\n### 原理\n- 每个字符在字体里有一个「glyph（字形）」\n- 网站随机把「字形」重新分配到不同「编码」\n- 你看到 \"8\"，HTML 里其实是某个随机码，靠字体文件才显示成 8\n\n### 破解思路\n下载它的 woff，看「哪个编码对应哪个真实字形」，建一张「编码→真实字符」的映射表，再还原文本。\n\n> 💡 这是「显示层」和「数据层」不一致的经典把戏。你抠的是数据层（乱码），要看字体文件才知真值。",
          "takeaway": "字体反爬把文字换成自定义 woff/ttf，HTML 直接抠是乱码；真实字符由字体里字形→编码映射决定。破解：下 woff 建「编码→真实字符」映射表还原。",
          "figures": [
            {
              "key": "adv_font_map",
              "caption": "🔡 字体反爬：HTML 里是乱码，靠 woff 里 glyph→编码映射才显示真值"
            }
          ],
          "words": [
            {
              "en": "GLYPH",
              "zh": "字形：字体里一个字符的轮廓形状",
              "pron": "ɡlɪf"
            },
            {
              "en": "WOFF",
              "zh": "woff/ttf：网页自定义字体文件格式",
              "pron": "wɔːf"
            },
            {
              "en": "FONT_MAP",
              "zh": "字体映射：编码→真实字符的对照表",
              "pron": "fɑːnt mæp"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "字体反爬里，HTML 文本直接抠会怎样？",
              "options": [
                "拿到真实文字",
                "拿到乱码/错字符",
                "拿到图片"
              ],
              "answer": 1,
              "explain": "字形被重映射，直接读 HTML 是错码。"
            },
            {
              "type": "fill",
              "question": "真实字符由字体文件里的「字形→______」映射决定。（填两字：编码/颜色）",
              "answer": "编码",
              "explain": "字形到编码的映射决定显示成哪个字符。"
            },
            {
              "type": "choice",
              "question": "破解字体反爬要？",
              "options": [
                "不管",
                "下 woff 建「编码→真实字符」映射表",
                "用正则硬抠"
              ],
              "answer": 1,
              "explain": "必须借助字体文件还原映射。"
            },
            {
              "type": "tap",
              "question": "字体反爬的关键概念有哪些（多选）",
              "options": [
                "glyph 字形",
                "woff/ttf 字体文件",
                "字形到编码的重映射",
                "直接抠 HTML 即得真值"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三个是核心；直接抠 HTML 拿不到真值。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么说这是「显示层和数据层不一致」的把戏？",
              "answer": "浏览器用字体文件把随机编码渲染成正确字符（显示层正常），但 HTML 源码里仍是乱码（数据层错乱），两者靠字体映射才统一。"
            },
            {
              "type": "coding",
              "question": "字体反爬把「显示字」换成「密文字」，但有一张映射表。用 map 把密文 'G' 解码成真字，并打印整句。",
              "starter": "m = {'G': '爬', 'H': '虫', 'K': '网'}\ncoded = 'G H K'\ndecoded = ''   # TODO: 把 coded 按空格切开，逐个用 m 解码拼成句子\ndecoded = ''.join(m.get(c, c) for c in coded.split())\nprint('解码后:', decoded)",
              "_gen": "coding-ex",
              "expect": "解码后: 爬虫网"
            }
          ],
          "tasks": [
            "找一个用自定义字体的页面，看 HTML 源码里数字是否乱码。",
            "下载它的 woff 用字体查看器打开，体会字形与编码。",
            "记一句：乱码别慌，看字体映射。"
          ],
          "color": "#e6b84d"
        },
        {
          "id": "a6l2",
          "title": "fontTools 解析还原映射",
          "icon": "🛠️",
          "markdown": "## fontTools：把字体文件读成映射表\n\n`fontTools` 能把 woff/ttf 打开，拿到「每个字形长什么样」和「它对应哪个编码/名字」。配合**人工标注一次**，就能自动还原。\n\n### 思路\n```python\nfrom fontTools.ttLib import TTFont\nfont = TTFont(\"site.woff\")\ncmap = font.getBestCmap()        # 编码 -> 字形名\nprint(cmap)\n```\n### 还原套路\n1. 字体往往「字形形状固定、编码随机变」\n2. 用**首次人工对照**（截图里 \"8\" 对应哪个字形）建立「字形轮廓 → 真实字符」\n3. 之后每次抓，比对字形轮廓/名字，映射到真实字符\n\n> ⚠️ 易错：网站常**每次刷新换一套编码**（字形不变、编码变）。所以别记「编码→字符」，要记「字形轮廓→字符」，否则下次全错。",
          "takeaway": "fontTools 读 woff 拿 cmap（编码→字形名）；但网站常刷新换编码，所以要记「字形轮廓→真实字符」，之后比对轮廓还原，而非死记编码。",
          "figures": [
            {
              "key": "adv_font_map",
              "caption": "🛠️ fontTools 读 cmap：编码→字形名；但记字形轮廓才防刷新换码"
            }
          ],
          "words": [
            {
              "en": "TTFONT",
              "zh": "TTFont：fontTools 打开字体文件",
              "pron": "ti ti ɛf ɔːnt"
            },
            {
              "en": "CMAP",
              "zh": "cmap：字符编码到字形名的映射表",
              "pron": "siː mæp"
            },
            {
              "en": "GLYPH_NAME",
              "zh": "字形名：字体内部给每个轮廓的编号",
              "pron": "ɡlɪf neɪm"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "fontTools 能做什么？",
              "options": [
                "发请求",
                "读 woff/ttf 拿字形与编码映射",
                "解析 HTML"
              ],
              "answer": 1,
              "explain": "fontTools 专攻字体文件。"
            },
            {
              "type": "fill",
              "question": "`font.getBestCmap()` 返回「编码 → ______名」的映射。（填两字：字形/颜色）",
              "answer": "字形",
              "explain": "cmap 把编码映射到字形名。"
            },
            {
              "type": "choice",
              "question": "网站每次刷新换编码，正确做法是？",
              "options": [
                "记死编码→字符",
                "记「字形轮廓→字符」",
                "放弃不抓"
              ],
              "answer": 1,
              "explain": "字形不变编码变，按轮廓认才稳。"
            },
            {
              "type": "tap",
              "question": "还原字体反爬的步骤有哪些（多选）",
              "options": [
                "下 woff",
                "fontTools 读 cmap",
                "人工标注字形→真值",
                "之后比字形轮廓还原"
              ],
              "answer": [
                0,
                1,
                2,
                3
              ],
              "explain": "四步组成完整还原流程。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「记字形轮廓→字符」比「记编码→字符」更稳？",
              "answer": "因为网站常只换编码、不动字形形状；按字形轮廓认，换码也不怕，按编码记则下次全乱。"
            },
            {
              "type": "coding",
              "question": "fontTools 解析字体文件还原「密文->真字」映射。代码需本机跑（浏览器无 fontTools），看懂点「标记完成」。",
              "starter": "from fontTools.ttLib import TTFont\nfont = TTFont('secret.ttf')\ncmap = font.getBestCmap()\nfor code, name in cmap.items():\n    print(hex(code), name)   # 对照真字表还原",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "装 fontTools，打开一个 woff 打印 cmap 看看。",
            "对比两次刷新同一页面的编码是否变化。",
            "记一句：按轮廓认，不记死编码。"
          ],
          "color": "#e6b84d"
        },
        {
          "id": "a6l3",
          "title": "图片反爬 OCR 入门（ddddocr）",
          "icon": "👁️",
          "markdown": "## 图片验证码：用 OCR 自动认\n\n图形验证码（歪歪扭扭的字母数字）本质是图片。传统做法人工识别，进阶用 **OCR（光学字符识别）** 自动读。\n\n### ddddocr：一行搞定\n```python\nimport ddddocr\nocr = ddddocr.DdddOcr()\nwith open(\"cap.png\", \"rb\") as f:\n    img = f.read()\nprint(ocr.classification(img))     # 输出识别出的文字\n```\n### 提升识别率\n- 先**预处理**：转灰度、二值化、去干扰线，再喂给 OCR\n- 简单验证码 ddddocr 很准；复杂扭曲/粘连的需要更狠的预处理或打码平台\n\n> ⚠️ 易错：别一上来就把原图丢进去。干扰线、噪点会严重拉低准确率，先做图像预处理往往立竿见影。",
          "takeaway": "图形验证码用 OCR 自动认，ddddocr.classification(img) 一行出结果；但先灰度/二值化/去噪预处理能大幅提准确率，别直接丢原图。",
          "figures": [
            {
              "key": "adv_ocr",
              "caption": "👁️ OCR 流程：原图→灰度/二值化去噪→ddddocr 识别文字"
            }
          ],
          "words": [
            {
              "en": "OCR",
              "zh": "光学字符识别：把图片文字读成文本",
              "pron": "oʊ siː ɑːr"
            },
            {
              "en": "DDDDOCR",
              "zh": "ddddocr：开源验证码识别库",
              "pron": "diː diː diː ˈɔːkr"
            },
            {
              "en": "BINARY",
              "zh": "二值化：把图变成纯黑白便于识别",
              "pron": "ˈbaɪnəri"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "OCR 是做什么的？",
              "options": [
                "发请求",
                "把图片里的文字识别出来",
                "解析 JSON"
              ],
              "answer": 1,
              "explain": "OCR 认图里字。"
            },
            {
              "type": "fill",
              "question": "ddddocr 用 `ocr.______(img)` 得到识别文字。（填方法名）",
              "answer": "classification",
              "explain": "classification 接收图片字节返回文字。"
            },
            {
              "type": "choice",
              "question": "识别率低时第一步该？",
              "options": [
                "换库",
                "先做灰度/二值化去噪预处理",
                "直接放弃"
              ],
              "answer": 1,
              "explain": "预处理常立竿见影。"
            },
            {
              "type": "tap",
              "question": "提升 OCR 准确率的做法有哪些（多选）",
              "options": [
                "转灰度",
                "二值化",
                "去干扰线",
                "直接丢原图"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三个提准确率；原图直丢反而低。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「预处理（去噪/二值化）」能立竿见影地提升识别率？",
              "answer": "干扰线和噪点会被 OCR 当成笔画误认；灰度+二值化把前景背景拉开、去掉杂色，字符轮廓干净，识别率自然高。"
            },
            {
              "type": "coding",
              "question": "OCR 把图片里的字识别成文本(ddddocr)。代码需本机跑，看懂点「标记完成」。",
              "starter": "import ddddocr\nocr = ddddocr.DdddOcr()\nwith open('cap.png', 'rb') as f:\n    text = ocr.classification(f.read())\nprint('识别结果', text)",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "装 ddddocr，对自己生成一个简单验证码图识别试试。",
            "对比「原图直识别」和「先二值化再识别」的准确率。",
            "记一句：预处理先行，再喂 OCR。"
          ],
          "color": "#e6b84d"
        },
        {
          "id": "a6l4",
          "title": "雪碧图与 CSS 坐标偏移还原",
          "icon": "🧩",
          "markdown": "## 雪碧图：一张大图切着用\n\n雪碧图（CSS Sprite）把很多小图标拼成**一张大图**，再用 CSS 的 `background-position` 偏移「只露」其中一块。有的网站拿这招藏数字/手机号，直接看 HTML 看不到真值。\n\n### 怎么还原\n```python\n# HTML: <div class=\"num\" style=\"background-position:-20px 0\">\n# CSS: .num 对应一张雪碧图，每个数字占 20px 宽\n# 偏移 -20px 表示露出第 2 个数字\n```\n思路：\n1. 下载雪碧图\n2. 数出每个「格子」宽高（如每数字 20px）\n3. 用 `background-position` 的偏移算出「露的是第几个」，拼回完整数字\n\n> 💡 同理还有「CSS 位移混淆」：HTML 里字符顺序是乱的，靠 `left` 偏移摆正。还原 = 按偏移量重新排序字符。",
          "takeaway": "雪碧图把小图拼成大图，用 background-position 偏移露出一块；还原=下载大图、算每格宽高、用偏移算第几个拼回。CSS 位移混淆同理：按偏移重新排序字符。",
          "figures": [
            {
              "key": "adv_sprite",
              "caption": "🧩 雪碧图：一张大图按 background-position 偏移露出一块；算格子宽高还原数字"
            }
          ],
          "words": [
            {
              "en": "SPRITE",
              "zh": "雪碧图：多小图拼成一张大图",
              "pron": "spraɪt"
            },
            {
              "en": "BACKGROUND_POS",
              "zh": "background-position：控制露出大图哪块",
              "pron": "ˈbækɡraʊnd pəˈzɪʃən"
            },
            {
              "en": "OFFSET",
              "zh": "偏移：位移量，决定露第几个",
              "pron": "ˈɔːfset"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "雪碧图（CSS Sprite）是？",
              "options": [
                "一张大图切着用",
                "多个独立小图",
                "一段视频"
              ],
              "answer": 0,
              "explain": "Sprite 是拼合大图。"
            },
            {
              "type": "fill",
              "question": "用 CSS 的 `background-______` 偏移决定露出哪一块。（填单词）",
              "answer": "position",
              "explain": "background-position 控制背景偏移。"
            },
            {
              "type": "choice",
              "question": "还原雪碧图数字要知道？",
              "options": [
                "每个格子的宽高",
                "图片颜色",
                "字体名称"
              ],
              "answer": 0,
              "explain": "格子宽高才能算第几个。"
            },
            {
              "type": "tap",
              "question": "雪碧图/CSS 混淆还原要点（多选）",
              "options": [
                "下载大图",
                "算每格宽高",
                "用偏移算第几个",
                "直接读 HTML 文字"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三个是还原步骤；HTML 直读拿不到真值。",
              "multi": true
            },
            {
              "type": "open",
              "question": "「CSS 位移混淆」为什么字符顺序在 HTML 里是乱的，却显示正常？",
              "answer": "HTML 里字符按乱序排列，但每个字符用 left 偏移摆到正确视觉位置，人眼看是正常顺序，机器直读则是乱的，需按偏移重排。"
            },
            {
              "type": "coding",
              "question": "雪碧图里每个小图在整张大图上的偏移是 (x,y)。每个小图 20x20，整行排 5 个。算出第 3 个小图的真实坐标(左上角)。",
              "starter": "cell = 20\nper_row = 5\nidx = 3   # 第3个(从1数)\nrow = (idx - 1) // per_row\ncol = (idx - 1) % per_row\nx = col * cell\ny = row * cell\nprint('第', idx, '个小图坐标', x, y)",
              "_gen": "coding-ex",
              "expect": "坐标 40 0"
            }
          ],
          "tasks": [
            "找一个用 background-position 的页面，数格子宽高还原一个数字。",
            "思考 CSS 位移混淆怎么按 left 重排字符。",
            "记一句：偏移=第几个，拼回去。"
          ],
          "color": "#e6b84d"
        },
        {
          "id": "a6l5",
          "title": "综合混合反爬题拆解",
          "icon": "🧅",
          "markdown": "## 混合反爬：一层层剥洋葱\n\n真实站点常**好几招叠加**：字体加密 + 雪碧图 + 接口签名 + 频率限制。别慌，按「数据从哪来」逐层拆。\n\n### 拆解 checklist\n1. **先看数据在哪**：是 HTML 文字？接口 JSON？还是图片？\n2. **HTML 文字乱码** → 字体反爬（下 woff 建映射）\n3. **HTML 没数字、只有图** → 雪碧图/CSS 偏移（算偏移还原）\n4. **接口要 sign** → JS 逆向（DevTools 追算法）\n5. **频繁就 429** → 加退避 + 代理 + 限速\n\n### 方法论\n> 永远先「定位数据源头」，再「针对那一层」选武器。混合反爬没有新魔法，只是几层老招叠一起。",
          "takeaway": "混合反爬按「数据从哪来」逐层拆：HTML乱码→字体映射；没数字只有图→雪碧图偏移；接口要sign→JS逆向；频繁429→退避限速。先定位源头再选武器。",
          "figures": [
            {
              "key": "adv_font_map",
              "caption": "🧅 混合反爬逐层剥：定位数据源→对层选武器，无新魔法只是老招叠加"
            }
          ],
          "words": [
            {
              "en": "LAYERED",
              "zh": "分层：多层防护叠加",
              "pron": "ˈleɪərd"
            },
            {
              "en": "CHECKLIST",
              "zh": "清单：按顺序排查的步骤",
              "pron": "ˈtʃɛklɪst"
            },
            {
              "en": "SOURCE",
              "zh": "数据源：数据真正出现的位置",
              "pron": "sɔːrs"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "遇到混合反爬，第一步该？",
              "options": [
                "瞎试",
                "先定位数据从哪来",
                "直接上代理"
              ],
              "answer": 1,
              "explain": "先定位再动手。"
            },
            {
              "type": "fill",
              "question": "HTML 文字乱码，多半是______反爬。（填两字：字体/Cookie）",
              "answer": "字体",
              "explain": "乱码是字体映射错位典型表现。"
            },
            {
              "type": "choice",
              "question": "接口要 sign 说明要？",
              "options": [
                "换 IP",
                "JS 逆向追算法",
                "放弃"
              ],
              "answer": 1,
              "explain": "sign 需逆向复现。"
            },
            {
              "type": "tap",
              "question": "拆解混合反爬的武器有哪些（多选）",
              "options": [
                "字体映射还原",
                "雪碧图偏移还原",
                "JS 逆向 sign",
                "退避+限速"
              ],
              "answer": [
                0,
                1,
                2,
                3
              ],
              "explain": "四招对应四层。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么说「混合反爬没有新魔法，只是几层老招叠一起」？",
              "answer": "它只是把字体、雪碧图、签名、限频等单点技术组合使用，每一层都有成熟解法，难点在定位而非新原理。"
            },
            {
              "type": "coding",
              "question": "综合混合反爬：字体+图片+加密一起上。这是拆解思路，无单一代码，看懂点「标记完成」。",
              "starter": "# 拆解套路：\n# 1) 先看接口返回的是密文还是图片\n# 2) 密文 -> 找字体映射；图片 -> OCR/打码平台\n# 3) 有 sign -> 跟 webpack 找哈希函数\nprint('一层层剥：先找数据在哪，再破解码/解密')",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "挑一个你已知的多层防护页面，按 checklist 在纸上逐层写拆解方案。",
            "练习「先问数据在哪」再选武器的思考习惯。",
            "记一句：混合反爬=老招叠加，逐层剥。"
          ],
          "color": "#e6b84d"
        }
      ]
    },
    {
      "title": "验证码与登录池",
      "icon": "🧩",
      "color": "#c0659e",
      "lessons": [
        {
          "id": "a7l1",
          "title": "图形验证码与打码平台",
          "icon": "🤖",
          "markdown": "## 打码平台：人肉/OCR 都不行就外包\n\n简单验证码 OCR 能认；但扭曲、粘连、中文成语、点选请等复杂验证码，OCR 准确率暴跌。这时可接**打码平台**：你把图片发过去，平台用「人工+AI」秒回结果，按量付费。\n\n### 流程\n```\n你的程序 → 上传验证码图片 → 打码平台 → 返回文字/坐标 → 你填进表单\n```\n### 取舍\n- 优点：复杂验证码也能过\n- 缺点：**要花钱、有延迟、且仍属「突破防护」的灰色地带**\n\n> ⚠️ 合规提醒：打码平台帮你绕过验证码，性质上是在突破人家的人机校验。只在你**有权**抓、且对方允许的范围内用；公开付费接口/明确禁止的别碰。",
          "takeaway": "打码平台把复杂验证码图发过去，人工+AI 秒回结果；但花钱、有延迟，且属突破人机校验的灰色地带，只在有权抓且对方允许时用。",
          "figures": [
            {
              "key": "adv_ocr",
              "caption": "🤖 打码平台：上传复杂验证码→平台人工+AI 回结果；灰色地带合规优先"
            }
          ],
          "words": [
            {
              "en": "CAPTCHA",
              "zh": "验证码：区分人机的挑战",
              "pron": "ˈkæptʃə"
            },
            {
              "en": "HUMAN",
              "zh": "人工：平台背后真人识别",
              "pron": "ˈhjuːmən"
            },
            {
              "en": "THIRD_PARTY",
              "zh": "第三方：外包给打码平台",
              "pron": "θɜːrd ˈpɑːrti"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "打码平台的作用是？",
              "options": [
                "发请求",
                "把复杂验证码图发给平台认出结果",
                "解析 HTML"
              ],
              "answer": 1,
              "explain": "平台帮你认复杂码。"
            },
            {
              "type": "fill",
              "question": "打码平台本质是「人工+AI」帮你______人机校验。（填两字：绕过|突破）",
              "answer": "绕过|突破",
              "explain": "打码平台帮你跨过验证码这道人机校验。"
            },
            {
              "type": "choice",
              "question": "关于打码平台，正确的是？",
              "options": [
                "免费无限",
                "花钱有延迟且属灰色地带",
                "一定能 100% 识别"
              ],
              "answer": 1,
              "explain": "有成本、有延迟、有合规风险。"
            },
            {
              "type": "tap",
              "question": "打码平台的利弊有哪些（多选）",
              "options": [
                "复杂验证码能过",
                "要花钱",
                "有延迟",
                "完全合法无风险"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三个是事实；合规风险存在。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么用打码平台「突破验证码」有合规风险？",
              "answer": "验证码是人家设置的人机校验门槛，绕过它等于在未通过校验的情况下获取数据，可能违反对方服务条款甚至相关法规，属灰色地带。"
            },
            {
              "type": "coding",
              "question": "图形验证码用打码平台(人工/AI)识别。代码需本机跑，看懂点「标记完成」。",
              "starter": "import requests\n# 把验证码图发给打码平台，拿回文字\nr = requests.post('https://dama.com/api', files={'img': open('cap.png','rb')})\nprint('打码平台返回', r.json().get('result'))",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "了解打码平台的接入流程（只看文档，不违规使用）。",
            "复习第 13 章合规边界，明确哪些不能碰。",
            "记一句：突破验证码是灰色地带，合规优先。"
          ],
          "color": "#c0659e"
        },
        {
          "id": "a7l2",
          "title": "滑块轨迹模拟：像人一样滑",
          "icon": "🎚️",
          "markdown": "## 滑块验证：不是滑过去就行\n\n滑块验证（拼图/拖动）会检测你的**轨迹**。真人拖动是「先快后慢、带点抖、有加速度」的曲线；程序若「瞬间直线到位」会被一眼识破。\n\n### 生成「像人」的轨迹\n```python\nimport random\ndef human_track(distance):\n    tracks = []; cur = 0\n    while cur < distance:\n        step = random.randint(1, 4)          # 每步 1~4 像素\n        cur += step; tracks.append(step)\n    return tracks                            # 越往后越慢可再加衰减\n```\n要点：步长**先大后小**（模拟减速）、加随机抖动、总时间别太整。\n\n> ⚠️ 易错：很多人「匀速直线」滑，缺加速度和抖动，风控直接判机器人。轨迹才是滑块验证的灵魂。",
          "takeaway": "滑块验证检测轨迹是否像人：真人先快后慢带抖有加速度，程序匀速直线会被识破。生成轨迹要步长先大后小、加抖动、别太整。",
          "figures": [
            {
              "key": "adv_slider",
              "caption": "🎚️ 滑块人类轨迹：步长先大后小+抖动+加速度，匀速直线会被识破"
            }
          ],
          "words": [
            {
              "en": "TRACK",
              "zh": "轨迹：拖动过程的位移序列",
              "pron": "træk"
            },
            {
              "en": "ACCELERATE",
              "zh": "加速度：速度由快到慢的变化",
              "pron": "əkˈsɛləreɪt"
            },
            {
              "en": "SLIDER",
              "zh": "滑块：拖动拼图式验证",
              "pron": "ˈslaɪdər"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "滑块验证主要检测什么？",
              "options": [
                "滑动距离",
                "拖动轨迹是否像人",
                "颜色"
              ],
              "answer": 1,
              "explain": "轨迹是判定核心。"
            },
            {
              "type": "fill",
              "question": "人类轨迹通常步长「先大后______」。（填两字：小/快）",
              "answer": "小",
              "explain": "真人减速，步长逐渐变小。"
            },
            {
              "type": "choice",
              "question": "程序「匀速直线」滑会被？",
              "options": [
                "判真人",
                "一眼识破为机器人",
                "无所谓"
              ],
              "answer": 1,
              "explain": "缺加速度和抖动必被识破。"
            },
            {
              "type": "tap",
              "question": "拟人轨迹要点有哪些（多选）",
              "options": [
                "步长先大后小",
                "加随机抖动",
                "有加速度",
                "瞬间直线到位"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三个拟人；直线是机器人特征。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「加速度和抖动」是滑块验证判定真人的关键？",
              "answer": "真人肌肉控制有加减速和细微抖动，机器匀速无抖过于完美，风控靠这种生物特征差异区分。"
            },
            {
              "type": "coding",
              "question": "滑块要「先慢后快再慢」。写代码生成 10 个位移点：用 0~1 的进度 t，位移 = t*t*(3-2*t)（平滑），打印这 10 个位移。",
              "starter": "track = []\nfor i in range(10):\n    t = i / 9.0\n    pos = 0   # TODO: pos = t*t*(3-2*t) * 100（总距离100）\n    pos = t * t * (3 - 2 * t) * 100\n    track.append(round(pos, 1))\nprint(track)",
              "_gen": "coding-ex",
              "expect": "[0.0,"
            }
          ],
          "tasks": [
            "写 human_track 生成轨迹，打印步长看是否先大后小。",
            "故意生成匀速轨迹对比，体会差别。",
            "记一句：轨迹像人，别直线。"
          ],
          "color": "#c0659e"
        },
        {
          "id": "a7l3",
          "title": "行为验证与 token",
          "icon": "🪪",
          "markdown": "## 行为验证：你的一举一动都在被记分\n\n新一代验证（滑动拼图、点选、无感验证）后台会采集**鼠标轨迹、停留时长、设备指纹**，算一个「信任分」，通过才发 `token` 给你后续请求用。\n\n### token 从哪来\n```\n你完成验证 → 后台算分通过 → 返回 token（常藏在 Cookie 或回调）\n→ 之后请求带这个 token = \"我已通过验证\"\n```\n### 逆向思路\n- 无感验证：往往靠**设备指纹 + 历史行为**打分，没显式滑块\n- 想自动化：要么复现「拿 token 的接口」（看它怎么算分），要么用真实浏览器带着正常行为跑\n\n> ⚠️ 易错：别以为「过了一次滑块就永远有 token」——token 常有时效，且和设备/会话绑定，换环境要重来。",
          "takeaway": "行为验证采集鼠标轨迹/停留/设备指纹算信任分，通过才发 token；token 常有时效、绑设备，换环境要重来。无感验证无显式滑块，靠指纹+行为打分更难自动化。",
          "figures": [
            {
              "key": "adv_slider",
              "caption": "🪪 行为验证：采集轨迹/指纹算信任分→通过发 token；token 绑设备有时效"
            }
          ],
          "words": [
            {
              "en": "BEHAVIOR",
              "zh": "行为：鼠标轨迹/停留等交互特征",
              "pron": "bɪˈheɪvjər"
            },
            {
              "en": "TRUST_SCORE",
              "zh": "信任分：风控算出的可信度",
              "pron": "trʌst skɔːr"
            },
            {
              "en": "TOKEN",
              "zh": "token：通过验证后发的凭证",
              "pron": "ˈtoʊkən"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "行为验证后台会采集什么来打分？",
              "options": [
                "只采集 IP",
                "鼠标轨迹/停留/设备指纹",
                "只看验证码对错"
              ],
              "answer": 1,
              "explain": "多维行为特征综合打分。"
            },
            {
              "type": "fill",
              "question": "通过验证后，后台发一个______给后续请求当凭证。（填单词）",
              "answer": "token",
              "explain": "token 是验证通过的凭证。"
            },
            {
              "type": "choice",
              "question": "关于 token，正确的是？",
              "options": [
                "永不过期",
                "常有时效且绑设备/会话",
                "换环境仍有效"
              ],
              "answer": 1,
              "explain": "token 受限且有生命周期。"
            },
            {
              "type": "tap",
              "question": "行为验证特点有哪些（多选）",
              "options": [
                "采集鼠标轨迹",
                "算信任分",
                "通过后发 token",
                "只看验证码对错不看行为"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三个正确；行为也是评分依据。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「无感验证」反而更难自动化？",
              "answer": "它没有显式滑块让你模拟，而是靠设备指纹和历史行为在后台静默打分，缺少可模仿的交互界面，自动化难以伪造可信行为。"
            },
            {
              "type": "coding",
              "question": "行为验证(token)靠鼠标轨迹判断是否真人。这是思路，无单一代码，看懂点「标记完成」。",
              "starter": "# 思路：\n# 1) 生成拟人轨迹（先慢后快再慢）\n# 2) 带上轨迹去请求拿到 token\n# 3) token 随接口一起发\nprint('重点：轨迹要像人，别匀速直线')",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "了解行为验证的采集维度（文档层面）。",
            "思考 token 时效和绑定对自动化的限制。",
            "记一句：token 绑设备有时效。"
          ],
          "color": "#c0659e"
        },
        {
          "id": "a7l4",
          "title": "多账号 Cookie 池",
          "icon": "🍪",
          "markdown": "## Cookie 池：多账号轮着用\n\n单账号频繁抓容易触发风控/限频。进阶做法是养**一批账号**，把它们的 Cookie 存成「池」，每次随机抽一个用，分散风险。\n\n### 池的结构\n```python\ncookies = [\n  {\"name\":\"sessionid\",\"value\":\"aaa...\",\"domain\":\".site.com\"},\n  {\"name\":\"sessionid\",\"value\":\"bbb...\",\"domain\":\".site.com\"},\n]\nimport random\nc = random.choice(cookies)     # 随机挑一个账号\n```\n### 维护要点\n- **健康度**：定期检测哪个 Cookie 过期/被封，移出池\n- **隔离**：每个账号独立，别串\n- **量级**：池越大越稳，但养号成本也高\n\n> 💡 和代理 IP 池搭配（第 15 章）是「账号 + IP 双分散」的经典组合，抗封能力翻倍。",
          "takeaway": "Cookie 池存多账号凭证随机轮换，分散风控；要定期剔过期/被封、账号隔离。和代理 IP 池搭配=账号+IP 双分散，抗封翻倍。",
          "figures": [
            {
              "key": "adv_cookie_pool",
              "caption": "🍪 Cookie 池：多账号凭证随机抽，定期剔无效，和代理 IP 池搭配双分散"
            }
          ],
          "words": [
            {
              "en": "COOKIE_POOL",
              "zh": "Cookie 池：多账号凭证集合",
              "pron": "ˈkʊki puːl"
            },
            {
              "en": "HEALTH",
              "zh": "健康度：Cookie 是否有效可用",
              "pron": "hɛlθ"
            },
            {
              "en": "ISOLATE",
              "zh": "隔离：账号间互不影响",
              "pron": "ˈaɪsəleɪt"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "Cookie 池的主要作用是？",
              "options": [
                "省钱",
                "多账号轮换分散风控风险",
                "提速"
              ],
              "answer": 1,
              "explain": "轮换分散降低单账号被封概率。"
            },
            {
              "type": "fill",
              "question": "每次请求从池里______挑一个账号的 Cookie 用。（填两字：随机/固定）",
              "answer": "随机",
              "explain": "随机轮换才分散风险。"
            },
            {
              "type": "choice",
              "question": "关于 Cookie 池维护，正确的是？",
              "options": [
                "不管过期",
                "定期剔除过期/被封的",
                "所有账号混用"
              ],
              "answer": 1,
              "explain": "要持续维护健康度。"
            },
            {
              "type": "tap",
              "question": "Cookie 池要点有哪些（多选）",
              "options": [
                "随机轮换",
                "检测健康度剔无效",
                "账号隔离",
                "和代理 IP 池搭配更稳"
              ],
              "answer": [
                0,
                1,
                2,
                3
              ],
              "explain": "四条都是要点。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么说「Cookie 池 + 代理 IP 池」是抗封的经典组合？",
              "answer": "单靠换账号但 IP 不变，风控仍能关联；单靠换 IP 但账号不变同理。账号+IP 双随机，让每次请求都像不同用户在异地访问，关联难度翻倍。"
            },
            {
              "type": "coding",
              "question": "多账号 Cookie 池轮流用才不易被封。给定 cookies 列表，按顺序取出第 1、2、3 次用的 Cookie 打印。",
              "starter": "cookies = ['c1', 'c2', 'c3', 'c4']\nused = []\nfor i in range(3):\n    used.append(cookies[i % len(cookies)])   # TODO: 轮流取\nprint('依次用', used)",
              "_gen": "coding-ex",
              "expect": "['c1', 'c2', 'c3']"
            }
          ],
          "tasks": [
            "用列表+random.choice 模拟一个 Cookie 池随机抽。",
            "写个函数检测某个 Cookie 是否还能访问需登录页。",
            "记一句：账号+IP 双分散。"
          ],
          "color": "#c0659e"
        },
        {
          "id": "exam2",
          "title": "阶段考②：Playwright·JS逆向·字体OCR·验证码",
          "icon": "📝",
          "type": "exam",
          "color": "#e0922f",
          "markdown": "## 阶段考②：Playwright · JS 逆向 · 字体OCR · 验证码\n\n覆盖 **Playwright 进阶 / JS 逆向 / 字体·CSS 反爬与 OCR / 验证码与登录池** 四章。\n\n**规则**：8 题，首次正确率 ≥ 80% 过关，得「阶段考②过关」勋章，可重复挑战。\n\n这一考是「硬骨头区」——逆向和验证码的套路，踩熟了才不慌。",
          "takeaway": "阶段考②过关 = 你会用 Playwright 拦截接口偷数据、读懂 sign/token 怎么来、用 fontTools 还原字体映射、用 ddddocr 打 OCR、模拟滑块轨迹。硬骨头啃下来了。",
          "words": [],
          "tasks": [],
          "exercises": [
            {
              "type": "choice",
              "question": "Playwright 比 Selenium 快的关键原因是？",
              "options": [
                "更漂亮",
                "自动等待 + 原生协议通道（不经 WebDriver 中转）",
                "用更多内存"
              ],
              "answer": 1,
              "explain": "原生通道直连浏览器，少中转。"
            },
            {
              "type": "choice",
              "question": "Playwright 的「自动等待」指？",
              "options": [
                "等你手写 sleep",
                "内置等元素可见/可点再操作",
                "不等待"
              ],
              "answer": 1,
              "explain": "自动等元素就绪，少写 sleep。"
            },
            {
              "type": "choice",
              "question": "拦截网络请求直接抓接口，主要为了？",
              "options": [
                "好看",
                "拿到页面背后的真实 API 数据，免去解析 DOM",
                "拖慢页面"
              ],
              "answer": 1,
              "explain": "截接口=直接拿结构化数据，最香。"
            },
            {
              "type": "fill",
              "question": "前端 sign/token 通常是「请求时______算出来的防伪签名」。（填 现/预先）",
              "answer": "现",
              "explain": "签名是前端每次请求现场算的。"
            },
            {
              "type": "choice",
              "question": "复现 JS 签名的第一步通常是？",
              "options": [
                "猜",
                "用 DevTools 在发送前断点追密钥/算法",
                "放弃"
              ],
              "answer": 1,
              "explain": "DevTools 追到算签名的函数。"
            },
            {
              "type": "choice",
              "question": "字体反爬靠的是？",
              "options": [
                "加密图片",
                "显示字形与底层编码映射被故意打乱（woff/ttf）",
                "改 IP"
              ],
              "answer": 1,
              "explain": "字形↔编码映射被换，你看到的和拿到的一致。"
            },
            {
              "type": "choice",
              "question": "用 fontTools 还原字体映射，目的是？",
              "options": [
                "画字体",
                "把乱码字形映射回真实文字",
                "压缩"
              ],
              "answer": 1,
              "explain": "把字形映射回真字。"
            },
            {
              "type": "choice",
              "question": "ddddocr 常用于？",
              "options": [
                "生成验证码",
                "识别简单图形验证码/文字",
                "写爬虫"
              ],
              "answer": 1,
              "explain": "ddddocr 是 OCR 识别库。"
            },
            {
              "type": "choice",
              "question": "雪碧图(CSS Sprite)反爬的破解关键是？",
              "options": [
                "放大图片",
                "还原 CSS 背景坐标偏移，拼回真实位置",
                "忽略"
              ],
              "answer": 1,
              "explain": "算坐标偏移还原位置。"
            },
            {
              "type": "choice",
              "question": "滑块验证码轨迹模拟，哪种更像人？",
              "options": [
                "匀速直线",
                "慢-快-慢带抖动的加速曲线",
                "瞬间到位"
              ],
              "answer": 1,
              "explain": "人滑动是加速曲线+微抖。"
            }
          ]
        }
      ]
    },
    {
      "title": "Scrapy 框架深入",
      "icon": "🕷️",
      "color": "#8e7bd6",
      "lessons": [
        {
          "id": "a8l1",
          "title": "架构：引擎·调度·下载·管道",
          "icon": "⚙️",
          "markdown": "## Scrapy 架构：一条流水线\n\nScrapy 不是「写个循环抓」，而是一套**组件流水线**，各司其职：\n\n### 五大件\n- **Engine 引擎**：总指挥，串起所有人\n- **Scheduler 调度器**：存待抓 URL 队列\n- **Downloader 下载器**：真正发请求收响应\n- **Spider 蜘蛛**：你写的解析逻辑\n- **Pipeline 管道**：清洗/入库\n\n### 数据流\n```\nSpider 产出 Request → Scheduler 排队\n→ Engine 交给 Downloader 发请求\n→ 响应回到 Spider 解析出 Item/新 Request\n→ Item 进 Pipeline 清洗入库\n```\n> 💡 Scrapy 帮你把「发请求/调度/重试/限速」都管了，你只写「解析」和「存」。比手写 asyncio 省心，但灵活度低一点。",
          "takeaway": "Scrapy 是流水线：Engine 调度、Scheduler 排队、Downloader 发请求、Spider 解析、Pipeline 清洗入库。框架管发请求/调度/重试/限速，你只写解析和存。",
          "figures": [
            {
              "key": "adv_scrapy_engine",
              "caption": "⚙️ Scrapy 五大件数据流：Spider→Scheduler→Downloader→Spider→Pipeline"
            }
          ],
          "words": [
            {
              "en": "ENGINE",
              "zh": "引擎：Scrapy 总指挥",
              "pron": "ˈɛndʒɪn"
            },
            {
              "en": "SCHEDULER",
              "zh": "调度器：存待抓 URL 队列",
              "pron": "ˈskɛdʒuːlər"
            },
            {
              "en": "DOWNLOADER",
              "zh": "下载器：真正发请求收响应",
              "pron": "daʊnˈloʊdər"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "Scrapy 里「总指挥、串起各组件」的是？",
              "options": [
                "Spider",
                "Engine 引擎",
                "Pipeline"
              ],
              "answer": 1,
              "explain": "Engine 负责调度整个流程。"
            },
            {
              "type": "fill",
              "question": "存「待抓 URL 队列」的组件叫______（调度器）。",
              "answer": "Scheduler",
              "explain": "Scheduler 管理请求队列。"
            },
            {
              "type": "choice",
              "question": "关于 Scrapy，正确的是？",
              "options": [
                "你只写解析和存，其余框架管",
                "啥都要自己写",
                "不能限速"
              ],
              "answer": 0,
              "explain": "框架接管请求/调度/重试/限速。"
            },
            {
              "type": "tap",
              "question": "下列属于 Scrapy 五大件的有（多选）",
              "options": [
                "Engine",
                "Scheduler",
                "Downloader",
                "Pipeline"
              ],
              "answer": [
                0,
                1,
                2,
                3
              ],
              "explain": "四件加 Spider 即五大件。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么说「用 Scrapy 比手写 asyncio 循环省心」？",
              "answer": "Scrapy 内置了调度、重试、限速、去重、并发，你只需写 parse 解析和 Pipeline 存数据，不用自己用 asyncio 拼整套基础设施。"
            },
            {
              "type": "coding",
              "question": "Scrapy 架构=引擎·调度·下载·管道。这是架构理解，无单一代码，看懂点「标记完成」。",
              "starter": "# 数据流：\n# Spider 产出 Request -> 调度器排队 -> 下载器抓 -> Response -> Spider 解析\n# -> Item 交给 Pipeline 清洗入库\nprint('记住这条流水线就懂了 Scrapy')",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "跑通 Scrapy 官方第一个例子，感受「只写 parse」。",
            "在纸上画出五大件的数据流箭头图。",
            "记一句：你只写解析和存。"
          ],
          "color": "#8e7bd6"
        },
        {
          "id": "a8l2",
          "title": "Spider 与 ItemLoader",
          "icon": "📦",
          "markdown": "## Spider 与 ItemLoader：把解析结构化\n\nSpider 是你写的「解析类」，核心是 `parse` 方法；Item 是「数据容器」，像一张表的字段；ItemLoader 帮你**规整地填**这些字段。\n\n### Spider 最小骨架\n```python\nimport scrapy\nclass BookSpider(scrapy.Spider):\n    name = \"book\"\n    start_urls = [\"https://example.com/books\"]\n    def parse(self, resp):\n        for b in resp.css(\".book\"):\n            yield {\n                \"title\": b.css(\"h2::text\").get(),\n                \"price\": b.css(\".price::text\").get(),\n            }\n```\n### ItemLoader 更稳\n```python\nfrom scrapy.loader import ItemLoader\nl = ItemLoader(item=BookItem(), selector=b)\nl.add_css(\"title\", \"h2::text\")\nl.add_css(\"price\", \".price::text\")\nyield l.load_item()      # 自动清洗、去空白\n```\n> 💡 `yield` 出的字典/Item 会自动流进 Pipeline。Scrapy 用「生成器」边抓边吐，内存友好。",
          "takeaway": "Spider 的 parse 写解析、yield 出字典/Item 自动进 Pipeline；ItemLoader 用 add_css 规整填字段并自动清洗。生成器边抓边吐，内存友好。",
          "figures": [
            {
              "key": "adv_scrapy_engine",
              "caption": "📦 Spider yield 出的 Item 自动流进 Pipeline；ItemLoader 规整填字段"
            }
          ],
          "words": [
            {
              "en": "SPIDER",
              "zh": "Spider：写解析逻辑的爬虫类",
              "pron": "ˈspaɪdər"
            },
            {
              "en": "ITEMLOADER",
              "zh": "ItemLoader：规整填充 Item 字段",
              "pron": "ˈaɪtəm ˈloʊdər"
            },
            {
              "en": "YIELD",
              "zh": "yield：生成器边抓边吐数据",
              "pron": "jiːld"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "Spider 里负责解析响应的是哪个方法？",
              "options": [
                "start_requests",
                "parse",
                "close"
              ],
              "answer": 1,
              "explain": "parse 是默认回调。"
            },
            {
              "type": "fill",
              "question": "用 `l.add_css(\"title\", \"h2::text\")` 的 Loader 叫______（填类名）。",
              "answer": "ItemLoader",
              "explain": "ItemLoader 用 add_css/add_xpath 填字段。"
            },
            {
              "type": "choice",
              "question": "yield 出的数据会流向？",
              "options": [
                "丢弃",
                "自动进 Pipeline",
                "只打印屏幕"
              ],
              "answer": 1,
              "explain": "yield 的 Item 进入管道。"
            },
            {
              "type": "tap",
              "question": "Scrapy 数据结构相关（多选）",
              "options": [
                "Spider 写解析",
                "Item 像表字段",
                "ItemLoader 规整填字段",
                "yield 边抓边吐"
              ],
              "answer": [
                0,
                1,
                2,
                3
              ],
              "explain": "四条都对。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么用 ItemLoader 比手动拼字典更稳？",
              "answer": "ItemLoader 统一了字段提取与清洗（去空白、转类型、默认值），避免在每个 Spider 里重复散落的处理逻辑，字段结构也更清晰。"
            },
            {
              "type": "coding",
              "question": "Spider 定义抓什么、ItemLoader 装载字段。代码需本机跑，看懂点「标记完成」。",
              "starter": "import scrapy\n\nclass BookSpider(scrapy.Spider):\n    name = 'book'\n    start_urls = ['https://example.com/books']\n    def parse(self, r):\n        for b in r.css('.book'):\n            yield {'title': b.css('h2::text').get()}",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "写一个 Spider，用 yield 字典抓列表数据。",
            "把它改成 ItemLoader 版本，对比代码。",
            "记一句：yield 流进 Pipeline。"
          ],
          "color": "#8e7bd6"
        },
        {
          "id": "a8l3",
          "title": "Downloader Middleware：请求中途加工站",
          "icon": "🔧",
          "markdown": "## Downloader Middleware：请求的中途加工站\n\nMiddleware（中间件）是夹在「Engine → Downloader」之间的钩子，每个请求/响应经过时都能加工：**加代理、换 UA、处理重试、记日志**。\n\n### 典型用途\n- 给每个请求自动加 `User-Agent`、`Cookie`\n- 按规则换代理 IP（接第 15 章代理池）\n- 捕获特定响应做特殊处理\n\n### 写一个（示意）\n```python\nclass UAMiddleware:\n    def process_request(self, request, spider):\n        request.headers[\"User-Agent\"] = \"Mozilla/5.0\"\n```\n在 `settings.py` 里 `DOWNLOADER_MIDDLEWARES` 注册启用。\n\n> ⚠️ 易错：中间件里**别做重活/阻塞 IO**（如下载大文件），会拖慢整个下载器；重活在 Pipeline 或单独协程做。",
          "takeaway": "Downloader Middleware 夹在 Engine 与 Downloader 之间，process_request 加工每个请求（加 UA/换代理/重试）。别在里头做阻塞重活，会拖慢整个下载器。",
          "figures": [
            {
              "key": "adv_scrapy_engine",
              "caption": "🔧 Middleware 夹在 Engine 与 Downloader 之间，process_request 加工每个请求"
            }
          ],
          "words": [
            {
              "en": "MIDDLEWARE",
              "zh": "中间件：请求/响应的中途钩子",
              "pron": "ˈmɪdlwer"
            },
            {
              "en": "PROCESS_REQUEST",
              "zh": "process_request：加工单个请求",
              "pron": "ˈprɑːsɛs rɪˈkwɛst"
            },
            {
              "en": "HOOK",
              "zh": "钩子：在特定时机插入的逻辑",
              "pron": "hʊk"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "Downloader Middleware 夹在哪两者之间？",
              "options": [
                "Spider 和 Pipeline",
                "Engine 和 Downloader",
                "Scheduler 和 Spider"
              ],
              "answer": 1,
              "explain": "位于引擎与下载器之间。"
            },
            {
              "type": "fill",
              "question": "中间件里加工单个请求的方法叫 `_______request`。（填 process）",
              "answer": "process",
              "explain": "process_request 在发请求前加工。"
            },
            {
              "type": "choice",
              "question": "中间件里不该做？",
              "options": [
                "加 UA",
                "换代理",
                "下载大文件这种重活/阻塞 IO"
              ],
              "answer": 2,
              "explain": "阻塞 IO 会卡住下载器。"
            },
            {
              "type": "tap",
              "question": "Middleware 常见用途（多选）",
              "options": [
                "自动加 UA/Cookie",
                "换代理 IP",
                "处理重试",
                "解析 HTML"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三项是典型用途；解析在 Spider。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「中间件里别做阻塞 IO」？",
              "answer": "下载器是并发处理请求的，中间件在关键路径上，一旦阻塞就会卡住整个下载器的吞吐，拖累全局速度。"
            },
            {
              "type": "coding",
              "question": "Downloader Middleware 在请求中途加工(加头/换代理)。代码需本机跑，看懂点「标记完成」。",
              "starter": "class ProxyMiddleware:\n    def process_request(self, request, spider):\n        request.meta['proxy'] = 'http://1.2.3.4:8080'\n        return None",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "写一个 UA Middleware 并注册。",
            "理解中间件在请求生命周期的位置。",
            "记一句：中间件别做重活。"
          ],
          "color": "#8e7bd6"
        },
        {
          "id": "a8l4",
          "title": "Pipeline 清洗入库",
          "icon": "💾",
          "markdown": "## Pipeline：数据出厂前的最后一道关\n\nItem 从 Spider yield 出来，会依次流经你定义的 Pipeline，在这里**清洗、去重、入库**（写数据库/文件）。\n\n### 写一个 Pipeline\n```python\nclass CleanPipeline:\n    def process_item(self, item, spider):\n        item[\"price\"] = item[\"price\"].replace(\"¥\", \"\").strip()\n        return item          # 必须 return，才流向下一个\n\nclass SavePipeline:\n    def process_item(self, item, spider):\n        db.insert(item)      # 伪代码：存库\n        return item\n```\n在 `settings.py` 的 `ITEM_PIPELINES` 里按顺序注册多个。\n\n> 💡 多个 Pipeline 像流水线工位：清洗→校验→入库。某个 Pipeline 想「丢弃」就 `raise DropItem`。",
          "takeaway": "Pipeline 的 process_item 清洗/校验/入库，必须 return 才流向下一个；raise DropItem 丢弃。顺序由 settings 注册决定。清洗放 Pipeline 让 Spider 专注解析、逻辑分层。",
          "figures": [
            {
              "key": "data_store",
              "caption": "💾 Pipeline：清洗→校验→入库，像流水线工位；raise DropItem 丢弃"
            }
          ],
          "words": [
            {
              "en": "PIPELINE",
              "zh": "管道：Item 流经的清洗/入库环节",
              "pron": "ˈpaɪplaɪn"
            },
            {
              "en": "DROPITEM",
              "zh": "DropItem：丢弃某个 Item 的异常",
              "pron": "drɑːp ˈaɪtəm"
            },
            {
              "en": "PROCESS_ITEM",
              "zh": "process_item：处理单个 Item",
              "pron": "ˈprɑːsɛs ˈaɪtəm"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "Pipeline 处理单个 Item 的方法叫？",
              "options": [
                "parse",
                "process_item",
                "open_spider"
              ],
              "answer": 1,
              "explain": "process_item 处理每个 Item。"
            },
            {
              "type": "fill",
              "question": "想丢弃某 Item，用 `raise ______`（填类名）。",
              "answer": "DropItem",
              "explain": "raise DropItem 让该 Item 不出厂。"
            },
            {
              "type": "choice",
              "question": "多个 Pipeline 的顺序由什么决定？",
              "options": [
                "随机",
                "settings 里注册的顺序",
                "文件名"
              ],
              "answer": 1,
              "explain": "靠 ITEM_PIPELINES 的顺序号。"
            },
            {
              "type": "tap",
              "question": "Pipeline 常见用途（多选）",
              "options": [
                "清洗字段",
                "去重",
                "入库写库",
                "发请求"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三项是职责；发请求在 Spider。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「清洗放在 Pipeline 而不是 Spider 里」更合理？",
              "answer": "分层让 Spider 只关心「怎么解析」，清洗/校验/入库等数据质量逻辑集中在 Pipeline，可复用、可组合、易测试。"
            },
            {
              "type": "coding",
              "question": "Pipeline 清洗入库：爬来的数据有空格、有重复。给定 records，清洗(去空格)并按 id 去重后，打印保留的条数。",
              "starter": "records = [{'id': 1, 'name': ' 张三 '}, {'id': 2, 'name': '李四'}, {'id': 1, 'name': ' 张三 '}]\nseen = set()\nclean = []\nfor r in records:\n    name = r['name'].strip()\n    if r['id'] in seen:\n        continue\n    seen.add(r['id'])\n    clean.append({'id': r['id'], 'name': name})\nprint('清洗后保留', len(clean), '条')",
              "_gen": "coding-ex",
              "expect": "清洗后保留 2 条"
            }
          ],
          "tasks": [
            "写两个 Pipeline：一个清洗价格、一个存库，按顺序注册。",
            "试一次 raise DropItem 看 Item 是否被正确丢弃。",
            "记一句：清洗出厂前最后一道关。"
          ],
          "color": "#8e7bd6"
        },
        {
          "id": "a8l5",
          "title": "配置调优：并发·限速·重试",
          "icon": "🎚️",
          "markdown": "## 配置调优：并发·限速·重试\n\nScrapy 默认偏保守（怕你被封）。真要提速，调 `settings.py`：\n\n### 关键旋钮\n```python\nCONCURRENT_REQUESTS = 32                # 全局并发\nCONCURRENT_REQUESTS_PER_DOMAIN = 16     # 单域名并发\nDOWNLOAD_DELAY = 0.5                    # 请求间隔（秒）\nAUTOTHROTTLE_ENABLED = True             # 自动限速，按对方响应调\nRETRY_TIMES = 3                         # 失败重试次数\n```\n- `DOWNLOAD_DELAY` + `RANDOMIZE_DOWNLOAD_DELAY` 随机化更稳\n- `AUTOTHROTTLE` 让 Scrapy 自己看对方负载调速度，比写死更聪明\n\n> ⚠️ 易错：并发拉太高 + 没延迟 = 把人家冲垮被封。调优是「在礼貌前提下尽量快」，不是无脑拉满。",
          "takeaway": "调优旋钮：CONCURRENT_REQUESTS 并发、DOWNLOAD_DELAY 间隔、AUTOTHROTTLE 自动限速、RETRY_TIMES 重试。核心是「礼貌前提下尽量快」，并发拉满零延迟必被封。",
          "figures": [
            {
              "key": "adv_scrapy_engine",
              "caption": "🎚️ 调优旋钮：并发/延迟/自动限速/重试，礼貌前提下尽量快"
            }
          ],
          "words": [
            {
              "en": "CONCURRENT",
              "zh": "并发：同时进行的请求数",
              "pron": "kənˈkʌrənt"
            },
            {
              "en": "AUTOTHROTTLE",
              "zh": "自动限速：按对方负载自适应",
              "pron": "ˈɔːtoʊ ˈθrɑːtl"
            },
            {
              "en": "RETRY",
              "zh": "重试：失败再试几次",
              "pron": "ˈriːtraɪ"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "控制全局并发的配置是？",
              "options": [
                "DOWNLOAD_DELAY",
                "CONCURRENT_REQUESTS",
                "RETRY_TIMES"
              ],
              "answer": 1,
              "explain": "CONCURRENT_REQUESTS 管全局并发。"
            },
            {
              "type": "fill",
              "question": "`_______ENABLED=True` 让 Scrapy 按对方负载自动限速。（填 AUTO）",
              "answer": "AUTOTHROTTLE",
              "explain": "AUTOTHROTTLE 自适应限速。"
            },
            {
              "type": "choice",
              "question": "关于调优，正确的是？",
              "options": [
                "并发越高越好",
                "在礼貌前提下尽量快",
                "完全不用延迟"
              ],
              "answer": 1,
              "explain": "调优是平衡，不是拉满。"
            },
            {
              "type": "tap",
              "question": "提速同时保安全的做法（多选）",
              "options": [
                "设 DOWNLOAD_DELAY",
                "开 AUTOTHROTTLE",
                "RANDOMIZE 延迟",
                "并发无脑拉满"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三项稳妥；拉满零延迟易封。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「并发拉满+零延迟」最容易把自己作封？",
              "answer": "对方服务器会瞬间收到远超承受能力的请求，触发风控/限频直接封 IP；礼貌的延迟和自动限速才能长久。"
            },
            {
              "type": "coding",
              "question": "Scrapy 配置调优：并发·限速·重试。这是配置项，无逻辑代码，看懂点「标记完成」。",
              "starter": "# settings.py\n# CONCURRENT_REQUESTS = 16\n# DOWNLOAD_DELAY = 1\n# RETRY_TIMES = 3\nprint('调并发和延迟，别把对方压垮')",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "在 settings 里调 CONCURRENT_REQUESTS 和 DOWNLOAD_DELAY 跑同一站对比速度。",
            "打开 AUTOTHROTTLE 观察速度是否自适应。",
            "记一句：礼貌前提下尽量快。"
          ],
          "color": "#8e7bd6"
        }
      ]
    },
    {
      "title": "分布式·去重·管道",
      "icon": "🕸️",
      "color": "#5b8fc4",
      "lessons": [
        {
          "id": "a9l1",
          "title": "单机限速与 set 去重",
          "icon": "🖥️",
          "markdown": "## 单机限速：先别把自己作死\n\n在搞分布式前，先把**单机**的礼貌与限速做对。Scrapy 的 `DOWNLOAD_DELAY`/`AUTOTHROTTLE` 就是单机限速；用 asyncio 时靠 Semaphore + 随机延迟。\n\n### 为什么限\n- 不礼貌→被封 IP\n- 太猛→本机端口/内存爆\n- 对方服务器被冲垮→你也被牵连\n\n### 单机去重（内存版）\n```python\nseen = set()\ndef dedup(urls):\n    new = [u for u in urls if u not in seen]\n    seen.update(new)\n    return new\n```\n> 💡 单机用 `set` 去重够用；但**进程重启 set 就没了**。要持久化→用 Redis（下节）。",
          "takeaway": "单机先做好限速（DOWNLOAD_DELAY/AUTOTHROTTLE/Semaphore+随机延迟）和 set 去重；但 set 不持久，重启即丢，要持久化得上 Redis。",
          "figures": [
            {
              "key": "adv_semaphore",
              "caption": "🖥️ 单机限速：Semaphore+随机延迟；set 去重但不持久，重启即丢"
            }
          ],
          "words": [
            {
              "en": "THROTTLE",
              "zh": "限速：主动控制请求速度",
              "pron": "ˈθrɑːtl"
            },
            {
              "en": "DEDUP",
              "zh": "去重：去掉重复 URL/数据",
              "pron": "diː ˈdʌp"
            },
            {
              "en": "SEEN",
              "zh": "seen：已见集合，记录抓过的",
              "pron": "siːn"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "单机用 set 去重的缺点是？",
              "options": [
                "太慢",
                "进程重启就没了",
                "不能去重"
              ],
              "answer": 1,
              "explain": "set 在内存，重启清空。"
            },
            {
              "type": "fill",
              "question": "单机限速常用 `DOWNLOAD_DELAY` 或______（自动限速）。",
              "answer": "AUTOTHROTTLE",
              "explain": "AUTOTHROTTLE 自动限速。"
            },
            {
              "type": "choice",
              "question": "为什么单机也要限速？",
              "options": [
                "没必要",
                "防封IP/防爆资源/不冲垮对方",
                "只为好看"
              ],
              "answer": 1,
              "explain": "限速是基本礼貌与自保。"
            },
            {
              "type": "tap",
              "question": "单机限速手段（多选）",
              "options": [
                "DOWNLOAD_DELAY",
                "Semaphore",
                "随机延迟",
                "并发拉满"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三项限速；拉满相反。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「进程重启 set 就没了」会是个问题？",
              "answer": "重启后 seen 清空，已抓的 URL 会重复抓取，浪费资源还可能因重复请求被对方风控；持久化才能跨重启去重。"
            },
            {
              "type": "coding",
              "question": "单机限速+set 去重：给定 urls 列表(有重复)，用 set 去重后打印去重后的数量和列表。",
              "starter": "urls = ['a', 'b', 'a', 'c', 'b', 'd']\nuniq = []   # TODO: 用 set 去重并保持顺序\nseen = set()\nfor u in urls:\n    if u not in seen:\n        seen.add(u)\n        uniq.append(u)\nprint('去重后', len(uniq), uniq)",
              "_gen": "coding-ex",
              "expect": "['a', 'b', 'c', 'd']"
            }
          ],
          "tasks": [
            "用 set 给一个 URL 列表去重，重启程序观察重复。",
            "体会为什么需要把 seen 存到文件/Redis。",
            "记一句：set 不持久，要持久化上 Redis。"
          ],
          "color": "#5b8fc4"
        },
        {
          "id": "a9l2",
          "title": "Redis 中央调度队列",
          "icon": "🧠",
          "markdown": "## Redis：把队列搬出单机\n\n当一台机器不够、要多台一起抓时，需要**中央队列**——所有机器从同一个地方取 URL、上报结果。Redis 是最常用的选择（内存级、超快）。\n\n### 角色\n- **中央调度**：待抓 URL 放 Redis 队列，多机 `pop` 取任务\n- **共享去重**：已抓 URL 放 Redis `set`，全局判重\n- **结果收集**：抓回的数据也丢 Redis，统一消费\n\n```python\nimport redis\nr = redis.Redis()\nr.lpush(\"urls\", \"https://a.com\")      # 入队\nurl = r.rpop(\"urls\")                  # 取一个\nr.sadd(\"seen\", url)                   # 标记已抓\n```\n> 💡 Redis 让「多机」像「一台大机器」：状态集中，机器可随时加减，挂一台不影响整体。",
          "takeaway": "Redis 做中央队列：多机从同一处 pop 任务、共享 seen set 去重、收集结果。状态集中让集群可弹性扩缩、单机故障不影响全局。",
          "figures": [
            {
              "key": "adv_redis_queue",
              "caption": "🧠 Redis 中央队列：多机 pop 任务 + 共享 seen set 去重 + 收集结果"
            }
          ],
          "words": [
            {
              "en": "REDIS",
              "zh": "Redis：内存级键值数据库，常用作中央队列",
              "pron": "ˈrɛdɪs"
            },
            {
              "en": "LPUSH",
              "zh": "lpush：从左侧入队",
              "pron": "ɛl pʊʃ"
            },
            {
              "en": "RPOP",
              "zh": "rpop：从右侧取一个",
              "pron": "ɑːr pɑːp"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "多机协作时，中央队列的作用是？",
              "options": [
                "装饰",
                "让多机从同一处取任务/共享状态",
                "提速单请求"
              ],
              "answer": 1,
              "explain": "中央队列统一调度。"
            },
            {
              "type": "fill",
              "question": "URL 入队用 `r.______(\"urls\", url)`。（填 lpush/rpop）",
              "answer": "lpush",
              "explain": "lpush 入队、rpop 出队。"
            },
            {
              "type": "choice",
              "question": "共享去重常把已抓 URL 放 Redis 的？",
              "options": [
                "list",
                "set（自动去重）",
                "string"
              ],
              "answer": 1,
              "explain": "set 天然去重。"
            },
            {
              "type": "tap",
              "question": "Redis 在分布式里的角色（多选）",
              "options": [
                "中央调度队列",
                "共享去重 set",
                "结果收集",
                "只做缓存图片"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三项；缓存图片不是主用。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「状态集中到 Redis」能让机器随意加减、挂一台不影响整体？",
              "answer": "因为任务队列和去重状态都在 Redis，单机只是「 worker」，挂了任务还在队列里等别的机器取，新机器加入也只是多一个消费者，整体无状态可弹性。"
            },
            {
              "type": "coding",
              "question": "Redis 中央队列用 deque 模拟：把 3 个 URL 放进队列，再依次 popleft 打印（先进先出）。",
              "starter": "from collections import deque\nq = deque()\nfor u in ['u1', 'u2', 'u3']:\n    q.append(u)   # TODO: 入队\nout = []\nwhile q:\n    out.append(q.popleft())   # TODO: 出队\nprint('出队顺序', out)",
              "_gen": "coding-ex",
              "expect": "['u1', 'u2', 'u3']"
            }
          ],
          "tasks": [
            "起一个本地 Redis，用 lpush/rpop 模拟多机取任务。",
            "用 sadd 做全局去重，开两个「机器」抢同一批 URL 看是否重复。",
            "记一句：状态集中，机器无状态。"
          ],
          "color": "#5b8fc4"
        },
        {
          "id": "a9l3",
          "title": "scrapy-redis：给 Scrapy 装分布式",
          "icon": "🔌",
          "markdown": "## scrapy-redis：给 Scrapy 装上分布式\n\n手写 Redis 队列很爽但重复造轮子。`scrapy-redis` 把 Scrapy 的调度器和去重改成**基于 Redis**，你几乎不改 Spider 就能多机跑。\n\n### 怎么用\n```python\n# settings.py\nSCHEDULER = \"scrapy_redis.scheduler.Scheduler\"\nDUPEFILTER_CLASS = \"scrapy_redis.dupefilter.RFPDupeFilter\"\nREDIS_URL = \"redis://localhost:6379\"\n# Spider 继承 RedisSpider\nfrom scrapy_redis import RedisSpider\nclass BookSpider(RedisSpider):\n    name = \"book\"\n    redis_key = \"book:start_urls\"   # 起始 URL 从 Redis 读\n```\n### 好处\n- 调度/去重全自动走 Redis\n- 起多个 Scrapy 进程=多机协作\n- 断点续跑（Redis 里状态不丢）\n\n> ⚠️ 易错：忘了起 Redis 服务，scrapy-redis 会连不上直接报错。先 `redis-server` 再跑。",
          "takeaway": "scrapy-redis 把 Scrapy 调度器和去重改基于 Redis，Spider 继承 RedisSpider、配 redis_key；多进程即多机协作、支持断点续跑。别忘了先起 Redis 服务。",
          "figures": [
            {
              "key": "adv_redis_queue",
              "caption": "🔌 scrapy-redis：调度器+去重走 Redis，多进程即多机协作、断点续跑"
            }
          ],
          "words": [
            {
              "en": "SCRAPY_REDIS",
              "zh": "scrapy-redis：Scrapy 的 Redis 分布式扩展",
              "pron": "skreɪpi ˈrɛdɪs"
            },
            {
              "en": "REDIS_SPIDER",
              "zh": "RedisSpider：从 Redis 读起始 URL 的 Spider",
              "pron": "ˈrɛdɪs ˈspaɪdər"
            },
            {
              "en": "DUPEFILTER",
              "zh": "去重过滤器：判断 URL 是否抓过",
              "pron": "ˈduːp ˈfɪltər"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "scrapy-redis 把什么改成了基于 Redis？",
              "options": [
                "Spider 解析",
                "调度器和去重",
                "Pipeline"
              ],
              "answer": 1,
              "explain": "调度与去重走 Redis。"
            },
            {
              "type": "fill",
              "question": "起始 URL 从 Redis 读的 key 配 `redis_______`。（填 key）",
              "answer": "key",
              "explain": "redis_key 指定起始 URL 的 Redis key。"
            },
            {
              "type": "choice",
              "question": "跑 scrapy-redis 前必须先？",
              "options": [
                "装数据库",
                "起 Redis 服务",
                "关网络"
              ],
              "answer": 1,
              "explain": "连不上 Redis 直接报错。"
            },
            {
              "type": "tap",
              "question": "scrapy-redis 好处（多选）",
              "options": [
                "调度/去重走 Redis",
                "多进程即多机协作",
                "支持断点续跑",
                "要手写队列"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三项；队列已封装好。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「起多个 Scrapy 进程」就等于多机协作？",
              "answer": "因为每个进程的调度器和去重都指向同一个 Redis，任务从同一队列分配、去重状态共享，多个进程天然协作，像多机一样。"
            },
            {
              "type": "coding",
              "question": "scrapy-redis 给 Scrapy 装分布式调度。代码需本机跑(依赖 Redis)，看懂点「标记完成」。",
              "starter": "# settings.py\n# SCHEDULER = 'scrapy_redis.scheduler.Scheduler'\n# REDIS_URL = 'redis://127.0.0.1:6379'\nprint('多台机器读同一个 Redis 队列，就分布式了')",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "装 scrapy-redis，把之前的 Spider 改成 RedisSpider 跑两个进程。",
            "确认两个进程不重复抓同一 URL（去重生效）。",
            "记一句：先起 Redis 再跑。"
          ],
          "color": "#5b8fc4"
        },
        {
          "id": "a9l4",
          "title": "布隆过滤器去重",
          "icon": "🌫️",
          "markdown": "## 布隆过滤器：用极少内存判「见没见过」\n\nURL/数据量巨大时，普通 `set` 存全量太占内存。布隆过滤器（Bloom Filter）用**位数组 + 多个哈希**判断「一定没见过 / 可能见过」。\n\n### 特点（关键！）\n- **有误判（假阳性）：说见过，可能其实没见过**\n- **绝不漏判：说没见过，就一定没见过**\n- 内存极小（对比 set）\n\n```python\nfrom pybloom_live import BloomFilter\nbf = BloomFilter(capacity=1000000, error_rate=0.001)\nif url in bf:\n    pass        # 可能见过（有误判）\nelse:\n    bf.add(url) # 一定没见过，加入\n```\n> 💡 爬虫去重正好需要「宁可误判漏抓几条，也不能重复抓爆」。布隆的「有误判无漏判」完美契合。",
          "takeaway": "布隆过滤器用位数组+多哈希：说没见过=一定没见过（无漏判），说见过=可能误判。内存极小，适合海量去重；爬虫宁可误判漏几条也不重复抓爆，正合它。",
          "figures": [
            {
              "key": "adv_bloom",
              "caption": "🌫️ 布隆：位数组+多哈希；说没见过=一定没见过（无漏判），说见过=可能误判"
            }
          ],
          "words": [
            {
              "en": "BLOOM",
              "zh": "布隆过滤器：省内存的概率去重结构",
              "pron": "bluːm"
            },
            {
              "en": "FALSE_POSITIVE",
              "zh": "误判：假阳性，说见过其实没",
              "pron": "fɔːls ˈpɑːzətɪv"
            },
            {
              "en": "BITARRAY",
              "zh": "位数组：布隆底层存储",
              "pron": "bɪt əˈreɪ"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "布隆过滤器说「没见过」时，结论是？",
              "options": [
                "可能见过",
                "一定没见过",
                "随机"
              ],
              "answer": 1,
              "explain": "无漏判是布隆核心保证。"
            },
            {
              "type": "fill",
              "question": "布隆「说见过」可能是______（填两字：误判|漏判），但不漏判。",
              "answer": "误判",
              "explain": "布隆只误判不漏判。"
            },
            {
              "type": "choice",
              "question": "布隆相比 set 的最大优势是？",
              "options": [
                "更准确",
                "内存极小",
                "不会误判"
              ],
              "answer": 1,
              "explain": "用极小内存换极低误判率。"
            },
            {
              "type": "tap",
              "question": "布隆特性（多选）",
              "options": [
                "有误判无漏判",
                "内存极小",
                "适合海量去重",
                "永远 100% 准确"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三项；不是 100% 准确。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么爬虫去重「宁可误判漏抓几条，也不能重复抓」正好适合布隆？",
              "answer": "重复抓取会浪费带宽、冲击对方、污染数据，危害大；而误判导致偶尔漏抓几条无害。布隆以极小误判率换取海量内存节省，正好匹配这种取舍。"
            },
            {
              "type": "coding",
              "question": "布隆过滤器用多个哈希判断「可能在/一定不在」。这里用 set 模拟：把 'a.com','b.com' 加入，再判断 'a.com' 和 'c.com' 是否「可能已见」。",
              "starter": "seen = set()\nfor u in ['a.com', 'b.com']:\n    seen.add(u)\nprint('a.com 见过?', 'a.com' in seen)\nprint('c.com 见过?', 'c.com' in seen)",
              "_gen": "coding-ex",
              "expect": "a.com 见过? True"
            }
          ],
          "tasks": [
            "装 pybloom_live，用布隆对 100 万 URL 去重，看内存占用。",
            "验证「说没见过一定没见过」：先 add 再查。",
            "记一句：有误判无漏判，爬虫正需要。"
          ],
          "color": "#5b8fc4"
        },
        {
          "id": "a9l5",
          "title": "SimHash·MinHash 文本近似去重",
          "icon": "📐",
          "markdown": "## 文本近似去重：内容一样但写法不同\n\nURL 去重用布隆就够；但**同一篇文章被不同站点微改**（换词、加空格），URL 不同、正文相似。这时要「语义/结构近似」去重。\n\n### SimHash：把文章压成指纹\n- 对文本分词→加权→哈希→压缩成一个 64 位「指纹」\n- 两文指纹**汉明距离**小=内容高度相似\n```python\nif hamming(a_hash, b_hash) <= 3:\n    print(\"近似重复\")\n```\n### MinHash：快速估算两集合相似度（Jaccard）\n用于「两段文本/两个集合像不像」，适合大规模近重复检测。\n\n> 💡 URL 去重管「同一个链接」，SimHash/MinHash 管「内容雷同」。两者互补：先 URL 去重，再文本近似去重。",
          "takeaway": "SimHash 把文章压成短指纹，汉明距离小=内容雷同；MinHash 估算集合相似度。URL 去重管同链接，文本近似去重管内容雷同，两层互补。",
          "figures": [
            {
              "key": "adv_simhash",
              "caption": "📐 SimHash 把文章压成指纹；两指纹汉明距离小=内容近似重复"
            }
          ],
          "words": [
            {
              "en": "SIMHASH",
              "zh": "SimHash：文本指纹算法",
              "pron": "sɪm hæʃ"
            },
            {
              "en": "HAMMING",
              "zh": "汉明距离：两指纹不同位数",
              "pron": "ˈhæmɪŋ"
            },
            {
              "en": "MINHASH",
              "zh": "MinHash：估算集合相似度",
              "pron": "mɪn hæʃ"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "SimHash 把文章压成什么？",
              "options": [
                "原文字",
                "一个短指纹(如64位)",
                "图片"
              ],
              "answer": 1,
              "explain": "指纹用于快速比对。"
            },
            {
              "type": "fill",
              "question": "两文 SimHash 指纹的「______距离」小=内容相似。（填算法名：汉明）",
              "answer": "汉明",
              "explain": "汉明距离衡量指纹差异位数。"
            },
            {
              "type": "choice",
              "question": "为什么 URL 去重不够、还要文本近似去重？",
              "options": [
                "URL 不同但内容雷同",
                "太慢",
                "没必要"
              ],
              "answer": 0,
              "explain": "同文不同链需内容层去重。"
            },
            {
              "type": "tap",
              "question": "文本近似去重手段（多选）",
              "options": [
                "SimHash 指纹",
                "MinHash 估算相似度",
                "汉明距离判近重复",
                "只看 URL"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三项；只看 URL 不够。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「先 URL 去重，再文本近似去重」是互补的两层？",
              "answer": "URL 去重高效剔除完全相同的链接，文本近似去重补上「链接不同但内容雷同」的漏网之鱼，两层结合才能既快又准地避免重复。"
            },
            {
              "type": "coding",
              "question": "SimHash 用「特征出现次数的奇偶」生成指纹。给定两段文字，按字切特征，奇数次记1偶数记0得指纹，再数两指纹不同位数(海明距离)打印。",
              "starter": "def simhash(text):\n    cnt = {}\n    for ch in text:\n        cnt[ch] = cnt.get(ch, 0) + 1\n    fp = 0\n    for ch in sorted(cnt):\n        fp = (fp << 1) | (1 if cnt[ch] % 2 else 0)\n    return fp\n\na = '小光爱爬虫'\nb = '小光爱爬虫'\nfa, fb = simhash(a), simhash(b)\ndist = bin(fa ^ fb).count('1')\nprint('海明距离', dist)",
              "_gen": "coding-ex",
              "expect": "海明距离"
            }
          ],
          "tasks": [
            "用 simhash 库对两篇「同义改写」文章算指纹，看汉明距离。",
            "理解为什么 URL 不同但内容雷同需要文本层去重。",
            "记一句：URL 去重 + 文本近似，两层互补。"
          ],
          "color": "#5b8fc4"
        },
        {
          "id": "a9l6",
          "title": "增量爬取：只抓新的",
          "icon": "🌊",
          "markdown": "## 增量爬取：只抓新的，不重复劳动\n\n很多站点**每天只新增几条**。全量重抓浪费资源。增量爬取=**记住「上次抓到哪」，这次只抓比它新的**。\n\n### 做法\n1. 记录「最新一条的标识」（如最大 id / 最新时间戳）\n2. 下次请求只拉 `id > 上次最大` 的部分\n3. 更新记录\n\n```python\nlast_id = load_last()                      # 上次最大 id\nfor item in fetch_new(last_id):\n    save(item)\n    last_id = max(last_id, item.id)        # 推进水位\nsave_last(last_id)\n```\n### 配合\n- 用 Redis/数据库存「水位」\n- 和断点续爬（第 12 章）配合更稳\n\n> 💡 增量=「水位线」思想：只处理水位之上的新数据，老的不碰。",
          "takeaway": "增量爬取=水位线思想：记录上次最大 id/时间戳，只抓更新的部分并更新水位。配合 Redis/库持久化，避免全量重抓浪费资源。",
          "figures": [
            {
              "key": "adv_redis_queue",
              "caption": "🌊 增量爬取：记录水位线，只抓水位之上的新数据，老的不再碰"
            }
          ],
          "words": [
            {
              "en": "INCREMENTAL",
              "zh": "增量：只处理新增部分",
              "pron": "ˈɪnkrəməntəl"
            },
            {
              "en": "WATERMARK",
              "zh": "水位线：上次处理到的位置标记",
              "pron": "ˈwɔːtərmɑːrk"
            },
            {
              "en": "DELTA",
              "zh": "增量数据：相对上次的差异部分",
              "pron": "ˈdɛltə"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "增量爬取的核心思想是？",
              "options": [
                "全量重抓",
                "只抓比上次新的(水位线)",
                "不抓"
              ],
              "answer": 1,
              "explain": "增量=只处理新数据。"
            },
            {
              "type": "fill",
              "question": "记录「上次最大 id / 最新时间戳」叫记录______（水位）。",
              "answer": "水位",
              "explain": "水位线标记处理进度。"
            },
            {
              "type": "choice",
              "question": "水位线一般存在？",
              "options": [
                "只能内存",
                "Redis/数据库等持久化处",
                "不存"
              ],
              "answer": 1,
              "explain": "持久化才能跨次生效。"
            },
            {
              "type": "tap",
              "question": "增量爬取要点（多选）",
              "options": [
                "记录上次水位",
                "只拉新增部分",
                "更新水位",
                "每次全量重抓"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三项；全量重抓相反。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「增量爬取」能大幅省资源？",
              "answer": "大部分站点新增量远小于存量，只抓增量避免了反复下载和处理已抓过的老数据，带宽、算力、存储都省。"
            },
            {
              "type": "coding",
              "question": "增量爬取：old 是已抓过的 URL 集合，new 是新发现的一批。算出「这一轮只需新抓哪些」(在 new 但不在 old 里)并打印。",
              "starter": "old = {'a', 'b', 'c'}\nnew = ['a', 'c', 'd', 'e', 'b']\nfresh = []   # TODO: 在 new 但不在 old 里的\nprint('本轮新抓', fresh)",
              "_gen": "coding-ex",
              "expect": "['d', 'e']"
            }
          ],
          "tasks": [
            "写一个增量抓取脚本，用 last_id 水位只拉新数据。",
            "把水位存文件，第二次跑验证只抓新增。",
            "记一句：水位线之上才处理。"
          ],
          "color": "#5b8fc4"
        },
        {
          "id": "a9l7",
          "title": "消息队列 Kafka·RabbitMQ 采集管道",
          "icon": "🚰",
          "markdown": "## 消息队列：让「抓取」和「处理」解耦\n\n当抓取量巨大，单机处理不过来，用**消息队列（MQ）**把「生产者（爬虫）」和「消费者（清洗/入库/分析）」隔开，各自按节奏跑。\n\n### 常见 MQ\n- **Kafka**：高吞吐、适合日志/海量事件流\n- **RabbitMQ**：可靠投递、适合任务分发\n\n### 形态\n```\n爬虫 → 发消息到 Topic/Queue → 多个消费者并发处理\n```\n```python\nproducer.send(\"raw_pages\", page_html)   # 生产者（伪代码）\n# 消费者并发消费、互不阻塞\n```\n### 好处\n- 抓取峰值被 MQ 削峰填谷\n- 消费者可水平扩展（加机器）\n- 某消费者挂了，消息还在，不丢\n\n> 💡 和 Redis 队列的区别：Redis 简单轻量；Kafka/RabbitMQ 更专业（持久化、分区、确认机制），适合企业级管道。",
          "takeaway": "MQ（Kafka 高吞吐/RabbitMQ 可靠）解耦生产者(爬虫)与消费者(清洗入库)，削峰填谷、可水平扩展、消费者挂了消息不丢。比 Redis 队列更企业级。",
          "figures": [
            {
              "key": "adv_kafka",
              "caption": "🚰 消息队列：爬虫(生产者)→Topic/Queue→多消费者并发处理，解耦削峰"
            }
          ],
          "words": [
            {
              "en": "KAFKA",
              "zh": "Kafka：高吞吐分布式消息流平台",
              "pron": "ˈkɑːfkə"
            },
            {
              "en": "RABBITMQ",
              "zh": "RabbitMQ：可靠消息队列",
              "pron": "ˈræbɪt ɛm kjuː"
            },
            {
              "en": "CONSUMER",
              "zh": "消费者：从队列取数据处理",
              "pron": "kənˈsuːmər"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "消息队列主要解决？",
              "options": [
                "抓取慢",
                "生产者与消费者解耦、削峰",
                "解析难"
              ],
              "answer": 1,
              "explain": "MQ 解耦并削峰填谷。"
            },
            {
              "type": "fill",
              "question": "Kafka 适合______吞吐的事件流，RabbitMQ 适合可靠任务分发。（填两字：高/低）",
              "answer": "高",
              "explain": "Kafka 主打高吞吐。"
            },
            {
              "type": "choice",
              "question": "MQ 相比 Redis 队列的优势是？",
              "options": [
                "更轻量",
                "持久化/分区/确认更专业",
                "更简单"
              ],
              "answer": 1,
              "explain": "MQ 企业级特性更全。"
            },
            {
              "type": "tap",
              "question": "MQ 好处（多选）",
              "options": [
                "削峰填谷",
                "消费者水平扩展",
                "消费者挂了消息不丢",
                "必须单机"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三项；MQ 本就为分布式。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「消费者挂了，消息还在」很重要？",
              "answer": "抓取和处理解耦后，消费者故障不应导致数据丢失；消息留在队列，恢复后继续消费，保证数据不丢、处理可重放。"
            },
            {
              "type": "coding",
              "question": "Kafka/RabbitMQ 当采集管道，解耦生产消费。代码需本机跑(依赖中间件)，看懂点「标记完成」。",
              "starter": "from kafka import KafkaProducer\np = KafkaProducer(bootstrap_servers='localhost:9092')\np.send('crawl-tasks', b'https://example.com')\nprint('已把任务投进 Kafka 队列')",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "理解 Kafka 与 RabbitMQ 的适用差异（文档层面）。",
            "画一张「爬虫→MQ→多消费者」的架构草图。",
            "记一句：MQ 解耦抓取与处理。"
          ],
          "color": "#5b8fc4"
        }
      ]
    },
    {
      "title": "存储进阶",
      "icon": "🗄️",
      "color": "#4bb3a3",
      "lessons": [
        {
          "id": "a10l1",
          "title": "MongoDB 文档库：存不规整的数据",
          "icon": "🍃",
          "markdown": "## MongoDB：存「不规整」的数据\n\n关系数据库（MySQL）要建表、定字段；爬虫抓回来的数据常常**字段不齐、结构多变**（有的商品有颜色，有的没有）。MongoDB 是**文档库**，一条数据就是一个 JSON 文档，字段随意加。\n\n### 特点\n- 存 BSON（类 JSON），无需固定表结构\n- 适合「半结构化」爬虫数据\n- 查询灵活，按任意字段搜\n\n```python\nfrom pymongo import MongoClient\nc = MongoClient()\ncol = c[\"spider\"][\"books\"]\ncol.insert_one({\"title\": \"Python\", \"price\": 39, \"tags\": [\"编程\"]})\nfor d in col.find({\"price\": {\"$gt\": 30}}):\n    print(d)\n```\n> 💡 和 MySQL 比：MySQL 像「固定表格」，MongoDB 像「活页夹，每页写啥都行」。爬虫数据杂，文档库更顺手。",
          "takeaway": "MongoDB 是文档库，一条数据=一个 JSON 文档，字段随意加，适合字段不齐的半结构化爬虫数据；pymongo 增删查改，比固定表结构的 MySQL 灵活。",
          "figures": [
            {
              "key": "adv_mongo_es",
              "caption": "🍃 MongoDB：一条数据=一个 JSON 文档，字段随意加，适合半结构化爬虫数据"
            }
          ],
          "words": [
            {
              "en": "MONGODB",
              "zh": "MongoDB：文档型 NoSQL 数据库",
              "pron": "ˈmɒŋɡoʊ diː biː"
            },
            {
              "en": "DOCUMENT",
              "zh": "文档：MongoDB 里的一条 JSON 记录",
              "pron": "ˈdɑːkjəmənt"
            },
            {
              "en": "BSON",
              "zh": "BSON：MongoDB 的二进制 JSON 格式",
              "pron": "biː sɑːn"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "MongoDB 适合存？",
              "options": [
                "固定表格",
                "字段不齐/结构多变的半结构化数据",
                "只有数字"
              ],
              "answer": 1,
              "explain": "文档库对结构变化友好。"
            },
            {
              "type": "fill",
              "question": "一条 MongoDB 数据是一个类______文档（填 JSON）。",
              "answer": "JSON",
              "explain": "MongoDB 文档类似 JSON。"
            },
            {
              "type": "choice",
              "question": "和 MySQL 比，MongoDB 的优势在？",
              "options": [
                "必须建表",
                "字段可随意加、结构灵活",
                "不支持查询"
              ],
              "answer": 1,
              "explain": "无需固定 schema。"
            },
            {
              "type": "tap",
              "question": "MongoDB 特点（多选）",
              "options": [
                "存 BSON 类 JSON",
                "无需固定表结构",
                "按任意字段查",
                "适合半结构化爬虫数据"
              ],
              "answer": [
                0,
                1,
                2,
                3
              ],
              "explain": "四条都准。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「字段不齐的爬虫数据」用文档库比关系库省心？",
              "answer": "关系库要求先定死表结构，缺字段要改表；文档库每条自带结构，抓到啥存啥，无需迁移 schema，迭代快。"
            },
            {
              "type": "coding",
              "question": "MongoDB 存不规整的文档。把几条「文章」文档存进列表，再查出 title 含 'Python' 的文档打印其数量。",
              "starter": "docs = [\n    {'title': 'Python 入门', 'len': 10},\n    {'title': 'Java 基础', 'len': 8},\n    {'title': 'Python 进阶', 'len': 20},\n]\nfound = [d for d in docs if 'Python' in d['title']]   # TODO\nprint('含 Python 的文档', len(found), '篇')",
              "_gen": "coding-ex",
              "expect": "含 Python 的文档 2 篇"
            }
          ],
          "tasks": [
            "装 MongoDB（或本地起容器），用 pymongo 插入并查询。",
            "对比同样数据在 MySQL 要建表多麻烦。",
            "记一句：杂数据用文档库。"
          ],
          "color": "#4bb3a3"
        },
        {
          "id": "a10l2",
          "title": "Elasticsearch 建索引：为搜索而生",
          "icon": "🔎",
          "markdown": "## Elasticsearch：为「搜索」而生\n\n抓回来海量文本（文章/商品），要**全文检索、按相关度排序**，用 MySQL LIKE 慢且弱。Elasticsearch（ES）是搜索引擎，专为「建索引、秒级搜」设计。\n\n### 核心概念\n- **索引（Index）**≈ 一张表\n- **文档（Doc）**≈ 一行\n- 写入时分词建**倒排索引**，搜起来飞快\n\n```python\nfrom elasticsearch import Elasticsearch\nes = Elasticsearch()\nes.index(index=\"news\", id=1, document={\"title\": \"爬虫进阶\", \"body\": \"...\"})\nprint(es.search(index=\"news\", query={\"match\": {\"body\": \"异步\"}}))\n```\n> 💡 什么时候用 ES？当你要「搜关键词、按相关度排、千万级文本」时用；只是存下来偶尔取，MongoDB 足够。",
          "takeaway": "ES 是搜索引擎，建倒排索引支持全文检索和相关度排序，适合千万级文本按关键词搜；索引≈表、文档≈行。只在需要搜索时才上 ES，单纯存储 MongoDB 够。",
          "figures": [
            {
              "key": "adv_mongo_es",
              "caption": "🔎 Elasticsearch：分词建倒排索引，按相关度秒级全文检索"
            }
          ],
          "words": [
            {
              "en": "ELASTICSEARCH",
              "zh": "Elasticsearch：分布式搜索引擎",
              "pron": "ɪˈlæstɪk ˈsɜːrtʃ"
            },
            {
              "en": "INDEX",
              "zh": "索引：ES 里类比表的逻辑容器",
              "pron": "ˈɪndɛks"
            },
            {
              "en": "INVERTED",
              "zh": "倒排索引：按词找文档的索引结构",
              "pron": "ɪnˈvɜːrtɪd"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "ES 主要为解决？",
              "options": [
                "事务",
                "全文检索/相关度排序",
                "图片存储"
              ],
              "answer": 1,
              "explain": "ES 为搜索设计。"
            },
            {
              "type": "fill",
              "question": "ES 里「索引 Index」约等于关系库的______（填：表/行）。",
              "answer": "表",
              "explain": "Index 类比表，Doc 类比行。"
            },
            {
              "type": "choice",
              "question": "为什么 ES 搜得快？",
              "options": [
                "全表扫",
                "建了倒排索引",
                "数据少"
              ],
              "answer": 1,
              "explain": "倒排索引让关键词查找极快。"
            },
            {
              "type": "tap",
              "question": "ES 特点（多选）",
              "options": [
                "为搜索设计",
                "倒排索引",
                "按相关度排序",
                "适合海量文本检索"
              ],
              "answer": [
                0,
                1,
                2,
                3
              ],
              "explain": "四条都对。",
              "multi": true
            },
            {
              "type": "open",
              "question": "什么时候该用 ES 而不是 MongoDB？",
              "answer": "当你需要对海量文本做关键词全文检索、按相关度排序、高并发查询时选 ES；如果只是按 id/字段取存，MongoDB 足够且更轻。"
            },
            {
              "type": "coding",
              "question": "Elasticsearch 为搜索而生。这里用列表模拟：写函数 search(docs, kw) 返回标题或正文含 kw 的文档，测试搜 '爬虫'。",
              "starter": "docs = [\n    {'title': '爬虫技巧', 'body': 'asyncio'},\n    {'title': '做菜', 'body': '番茄'},\n    {'title': '爬虫进阶', 'body': '分布式'},\n]\ndef search(docs, kw):\n    return [d for d in docs if kw in d['title'] or kw in d['body']]   # TODO\nprint('搜 爬虫 命中', len(search(docs, '爬虫')), '篇')",
              "_gen": "coding-ex",
              "expect": "搜 爬虫 命中 2 篇"
            }
          ],
          "tasks": [
            "本地起 ES（或容器），索引一批文章并搜关键词。",
            "对比 MySQL LIKE 在大数据量下的速度。",
            "记一句：要搜索才上 ES。"
          ],
          "color": "#4bb3a3"
        },
        {
          "id": "a10l3",
          "title": "清洗去重入库：数据出厂质检",
          "icon": "🧼",
          "markdown": "## 清洗去重再入库：数据出厂质检\n\n抓回来的数据常有脏东西：价格带「¥」、空格、重复项、缺失字段。入库前要做**清洗 + 去重 + 校验**。\n\n### 清洗套路\n```python\ndef clean(item):\n    item[\"price\"] = float(item[\"price\"].replace(\"¥\",\"\").strip())\n    item[\"title\"] = item[\"title\"].strip()\n    return item\n```\n### 去重三层\n1. **抓取时**：URL/指纹去重（布隆/SimHash，见第 9 章）\n2. **入库前**：按唯一键（如商品 id）判重\n3. **库内**：加唯一索引，重复插入自动忽略\n\n> 💡 入库不是终点，是「质检线」。脏数据进库，后面分析全歪。Pipeline（第 8 章）正是干这个的地方。",
          "takeaway": "入库前清洗（去符号/空格/补全）与去重（抓取去重+入库前唯一键+库内唯一索引三层）；Pipeline 正是质检线，脏数据进库会污染后续分析。",
          "figures": [
            {
              "key": "data_store",
              "caption": "🧼 清洗→去重→校验→入库：数据出厂前的质检流水线"
            }
          ],
          "words": [
            {
              "en": "CLEAN",
              "zh": "清洗：修掉脏数据（符号/空格/缺失）",
              "pron": "kliːn"
            },
            {
              "en": "VALIDATE",
              "zh": "校验：检查字段是否合法完整",
              "pron": "ˈvælɪdeɪt"
            },
            {
              "en": "UNIQUE",
              "zh": "唯一键：判重的依据，如商品 id",
              "pron": "juːˈniːk"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "入库前清洗主要处理？",
              "options": [
                "加密",
                "价格符号/空格/缺失等脏数据",
                "发请求"
              ],
              "answer": 1,
              "explain": "清洗针对脏数据。"
            },
            {
              "type": "fill",
              "question": "按商品______（如 id）判重，可加唯一索引防重复插入。",
              "answer": "id",
              "explain": "唯一键（如 id）用来判重。"
            },
            {
              "type": "choice",
              "question": "去重的「第三层」是？",
              "options": [
                "抓取时",
                "入库前按唯一键",
                "库内唯一索引"
              ],
              "answer": 2,
              "explain": "库内唯一索引兜底。"
            },
            {
              "type": "tap",
              "question": "数据质检三层（多选）",
              "options": [
                "抓取时去重",
                "入库前按唯一键判重",
                "库内唯一索引",
                "直接裸存不处理"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三层；裸存会脏。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「脏数据进库，后面分析全歪」？",
              "answer": "后续统计、建模、展示都基于库内数据，单价带了 ¥ 符号无法求平均、重复项虚增计数，一个脏字段会连锁污染整条分析链路。"
            },
            {
              "type": "coding",
              "question": "清洗去重入库：给定一批带空格重复的用户记录，清洗(去空格)并按 id 去重后，打印保留条数。",
              "starter": "records = [{'id': 1, 'name': ' 王 '}, {'id': 2, 'name': '赵'}, {'id': 1, 'name': ' 王 '}]\nseen = set()\nclean = []\nfor r in records:\n    name = r['name'].strip()\n    if r['id'] in seen:\n        continue\n    seen.add(r['id'])\n    clean.append({'id': r['id'], 'name': name})\nprint('去重后', len(clean), '条')",
              "_gen": "coding-ex",
              "expect": "去重后 2 条"
            }
          ],
          "tasks": [
            "写一个 clean 函数处理一组脏价格/标题。",
            "给一张表加唯一索引，试重复插入看是否被忽略。",
            "记一句：入库是质检线。"
          ],
          "color": "#4bb3a3"
        },
        {
          "id": "a10l4",
          "title": "图片大文件对象存储",
          "icon": "📦",
          "markdown": "## 图片/大文件：别塞数据库\n\n抓下来的图片、视频、PDF 动辄几 MB，塞进 MongoDB/MySQL 既慢又贵。正确做法：**对象存储**（如 S3/OSS/COS），数据库只存「文件的 URL/key」。\n\n### 思路\n```python\ndata = requests.get(img_url).content          # 下载图片字节\nurl = oss.upload(\"books/cover1.jpg\", data)    # 上传到对象存储\ncol.insert_one({\"title\": \"Python\", \"cover\": url})  # 库只存 url\n```\n### 好处\n- 存储和计算分离，数据库轻\n- 对象存储天生为海量文件设计，带 CDN 加速\n\n> ⚠️ 易错：把大文件直接 base64 塞进数据库字段，体积暴涨、查询卡死。存 URL，文件交给我们对象存储。",
          "takeaway": "图片/大文件用对象存储（S3/OSS/COS），数据库只存 URL/key；避免 base64 塞库导致体积暴涨查询卡死。存储计算分离、天然适合海量文件且带 CDN。",
          "figures": [
            {
              "key": "adv_obj_store",
              "caption": "📦 大文件存对象存储，数据库只存 URL/key，存储计算分离"
            }
          ],
          "words": [
            {
              "en": "OBJECT_STORE",
              "zh": "对象存储：海量文件存储服务",
              "pron": "ˈɑːbdʒɛkt stɔːr"
            },
            {
              "en": "CDN",
              "zh": "CDN：内容分发网络，加速文件访问",
              "pron": "siː diː ɛn"
            },
            {
              "en": "BINARY",
              "zh": "二进制：图片/视频的原始字节",
              "pron": "ˈbaɪnəri"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "图片/大文件应该怎么存？",
              "options": [
                "直接塞数据库字段",
                "对象存储+数据库存URL",
                "base64 塞进库"
              ],
              "answer": 1,
              "explain": "对象存储更合适。"
            },
            {
              "type": "fill",
              "question": "对象存储里数据库只存文件的______或 key。（填 URL）",
              "answer": "URL",
              "explain": "库只存引用，文件在对象存储。"
            },
            {
              "type": "choice",
              "question": "把大文件 base64 塞数据库会？",
              "options": [
                "更快",
                "体积暴涨查询卡死",
                "更省空间"
              ],
              "answer": 1,
              "explain": "base64 膨胀且拖慢查询。"
            },
            {
              "type": "tap",
              "question": "对象存储好处（多选）",
              "options": [
                "存储计算分离",
                "为海量文件设计",
                "带 CDN 加速",
                "适合存大文件"
              ],
              "answer": [
                0,
                1,
                2,
                3
              ],
              "explain": "四条都对。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「数据库只存 URL、文件交对象存储」更合理？",
              "answer": "数据库擅长结构化检索而非存大块二进制；对象存储为海量文件优化且配 CDN 加速访问，各司其职，数据库也轻、备份快。"
            },
            {
              "type": "coding",
              "question": "图片/大文件存对象存储(如 S3/OSS)。代码需本机跑(依赖 SDK)，看懂点「标记完成」。",
              "starter": "# 伪代码：把图片流上传到对象存储拿回 URL\nurl = 'https://oss.example.com/imgs/abc.jpg'\nprint('图片已存对象存储:', url)",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "用对象存储 SDK 上传一张图拿回 URL，再存库。",
            "对比「base64 塞库」和「存 URL」的库大小。",
            "记一句：大文件存对象存储，库只存 URL。"
          ],
          "color": "#4bb3a3"
        }
      ]
    },
    {
      "title": "App 抓包与移动端",
      "icon": "📱",
      "color": "#d9774b",
      "lessons": [
        {
          "id": "a11l1",
          "title": "mitmproxy 抓 HTTPS",
          "icon": "📡",
          "markdown": "## mitmproxy：拦下 App 的 HTTPS\n\nApp 的数据也走 HTTPS，和网页一样。用 **mitmproxy** 在手机和服务器之间当「中间人」，能看到 App 发的每个请求和返回的 JSON。\n\n### 三步\n1. 电脑跑 `mitmproxy`，手机 Wi-Fi 设代理指向电脑\n2. 手机装 mitmproxy 的 **CA 证书**（否则 HTTPS 校验失败）\n3. 打开 App，请求全在 mitmproxy 面板里\n\n### 拿到什么\n- 接口 URL、参数、Header（常含签名/ token）\n- 返回 JSON —— 往往比网页版还干净\n\n> ⚠️ 合规红线：只对你**自己/授权**的 App 或学习用自己账号抓；抓别人 App 的私密接口、绕过付费=违法风险。第 13 章细讲。",
          "takeaway": "mitmproxy 当中间人代理拦 App 的 HTTPS：电脑跑代理、手机设代理+装 CA 证书、打开 App 看请求/JSON。只对自己/授权 App 或学习用自己账号抓，别碰别人私密接口。",
          "figures": [
            {
              "key": "adv_mitmproxy",
              "caption": "📡 mitmproxy 中间人代理：手机→代理→服务器，拦截 App 的 HTTPS 请求与 JSON"
            }
          ],
          "words": [
            {
              "en": "MITMPROXY",
              "zh": "mitmproxy：HTTP/HTTPS 抓包代理",
              "pron": "mɪt ɛm ˈprɑːksi"
            },
            {
              "en": "CA_CERT",
              "zh": "CA 证书：解密 HTTPS 需手机信任的根证书",
              "pron": "siː eɪ sɜːrt"
            },
            {
              "en": "PROXY",
              "zh": "代理：中转流量的中间服务器",
              "pron": "ˈprɑːksi"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "mitmproxy 在手机和服务器之间扮演？",
              "options": [
                "路由器",
                "中间人代理",
                "数据库"
              ],
              "answer": 1,
              "explain": "它是中间人代理。"
            },
            {
              "type": "fill",
              "question": "抓 HTTPS 需在手机装 mitmproxy 的______证书（填 CA）。",
              "answer": "CA",
              "explain": "需信任其 CA 才能解密 HTTPS。"
            },
            {
              "type": "choice",
              "question": "关于 App 抓包合规，正确的是？",
              "options": [
                "随便抓别人 App",
                "只对自己/授权App或学习用自己账号",
                "绕过付费没事"
              ],
              "answer": 1,
              "explain": "合规是底线。"
            },
            {
              "type": "tap",
              "question": "mitmproxy 抓包步骤（多选）",
              "options": [
                "电脑跑 mitmproxy",
                "手机设代理指向电脑",
                "手机装 CA 证书",
                "打开App看请求"
              ],
              "answer": [
                0,
                1,
                2,
                3
              ],
              "explain": "四步齐全。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「抓 App 接口」常比抓网页更香（数据更干净）？",
              "answer": "很多 App 直接返回结构化的 JSON 接口，没有网页那么多 DOM 噪声和渲染逻辑，数据更规整好抠。"
            },
            {
              "type": "coding",
              "question": "mitmproxy 抓 HTTPS 中间人。代码需本机跑，看懂点「标记完成」。",
              "starter": "def response(flow):\n    if 'api' in flow.request.url:\n        print('抓到接口', flow.request.url, flow.response.text)",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "在本机跑 mitmproxy，用浏览器设代理抓一个请求理解原理。",
            "读第 13 章合规边界，明确手机抓包能碰的线。",
            "记一句：只抓自己/授权的 App。"
          ],
          "color": "#d9774b"
        },
        {
          "id": "a11l2",
          "title": "分析 App 接口与签名",
          "icon": "🔐",
          "markdown": "## App 接口与签名：和网页逆向一脉相承\n\n抓到 App 的请求后，你会发现它和网页接口很像：URL + 参数 + 一个 `sign`/`token`。分析套路和 JS 逆向（第 5 章）相通。\n\n### 常见差异\n- App 常把签名逻辑写进**原生代码（Java/Kotlin/Swift）**或 **so 库**，不在 JS 里\n- 参数可能走 **protobuf/msgpack** 等二进制协议，不是纯 JSON\n- Header 里常带设备指纹（deviceId、机型）\n\n### 思路\n1. 先用 mitmproxy 看明文接口（很多 App 偷懒直接 JSON）\n2. 若参数是二进制协议，需配合反编译（jadx，下节）看结构\n3. 复现签名：要么逆出算法（难），要么用真机/模拟器带着正常环境发请求\n\n> 💡 App 签名常绑**设备指纹**，纯 Python 复现比网页更难——因为缺真机环境。有时「用模拟器带着 App 跑」比硬逆更现实。",
          "takeaway": "App 接口类似网页但签名常在原生/so 库、参数可能二进制协议、带设备指纹；纯 Python 复现难（缺真机环境）。先看明文 JSON，二进制配合 jadx，必要时用模拟器带 App 跑。",
          "figures": [
            {
              "key": "adv_mitmproxy",
              "caption": "🔐 App 接口=网页接口+二进制协议+设备指纹；签名常在原生/so 库"
            }
          ],
          "words": [
            {
              "en": "PROTOBUF",
              "zh": "protobuf：Google 的二进制序列化协议",
              "pron": "proʊtəˌbʌf"
            },
            {
              "en": "DEVICE_ID",
              "zh": "设备指纹：标识一台设备的唯一信息",
              "pron": "dɪˈvaɪs aɪ diː"
            },
            {
              "en": "SIGNATURE",
              "zh": "签名：App 请求里的防伪参数",
              "pron": "ˈsɪɡnətʃər"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "App 签名逻辑常写在？",
              "options": [
                "只在 JS",
                "原生代码/so库",
                "只在 CSS"
              ],
              "answer": 1,
              "explain": "App 签名多在原生层。"
            },
            {
              "type": "fill",
              "question": "App 参数可能走 protobuf/______等二进制协议而非纯 JSON。（填 msgpack）",
              "answer": "msgpack",
              "explain": "msgpack 也是常见二进制协议。"
            },
            {
              "type": "choice",
              "question": "App 签名常绑什么导致纯Python复现更难？",
              "options": [
                "时间戳",
                "设备指纹(真机环境)",
                "颜色"
              ],
              "answer": 1,
              "explain": "设备指纹绑定真机。"
            },
            {
              "type": "tap",
              "question": "App 接口与网页的差异（多选）",
              "options": [
                "签名在原生/so",
                "可能二进制协议",
                "带设备指纹",
                "完全一样无差异"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三项；并非完全一样。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「用模拟器带着 App 跑」有时比硬逆签名更现实？",
              "answer": "因为 App 签名往往依赖设备指纹、系统调用等真机环境，纯 Python 复现要重建整套环境极难；而模拟器里 App 自己算好签名发出，我们只需转发请求。"
            },
            {
              "type": "coding",
              "question": "App 接口常把 token 拼上时间戳再做 md5 当签名。写代码对 'secret'+str(ts) 求 md5 并打印前 8 位。",
              "starter": "import hashlib\nts = 1700000000\nsign = hashlib.md5(('secret' + str(ts)).encode('utf-8')).hexdigest()\nprint('sign 前8位', sign[:8])",
              "_gen": "coding-ex",
              "expect": "sign 前8位"
            }
          ],
          "tasks": [
            "用 mitmproxy 看一个 App 的明文接口，对比网页接口异同。",
            "思考哪些签名依赖真机环境、难以复现。",
            "记一句：App 签名绑设备，复现难。"
          ],
          "color": "#d9774b"
        },
        {
          "id": "a11l3",
          "title": "jadx 反编译入门",
          "icon": "🔬",
          "markdown": "## jadx：把 Apk 还原成 Java 源码\n\nAndroid 的 Apk 是编译后的产物。用 **jadx** 能把它**反编译**回近似 Java 源码，方便找签名算法、接口地址。\n\n### 用法\n```bash\njadx -d out app-release.apk    # 反编译到 out 目录\n```\n打开 `out/` 里的 `.java` 文件，搜 `sign`、`md5(`、`SharedPreferences` 等关键字定位逻辑。\n\n### 能看什么\n- 接口域名/路径（常明文写在代码里）\n- 签名/加密的 Java 实现\n- 硬编码的 key（有的开发者把盐写死在代码里😅）\n\n> ⚠️ 易错：很多 App 会**混淆**（类名变 a/b/c），读起来像天书。配合「搜索关键字」+「看调用关系」慢慢剥；加壳的还要先脱壳。",
          "takeaway": "jadx 把 Apk 反编译回近似 Java，搜 sign/md5/域名定位签名与接口；但常混淆（类名 a/b/c）需耐心剥，加壳要先脱壳。注意：逆向只用于学习/授权范围。",
          "figures": [
            {
              "key": "adv_js_trace",
              "caption": "🔬 jadx 反编译 Apk→Java，搜 sign/md5/域名定位逻辑；混淆后耐心剥"
            }
          ],
          "words": [
            {
              "en": "JADX",
              "zh": "jadx：Android Apk 反编译工具",
              "pron": "dʒeɪ dɪks"
            },
            {
              "en": "DECOMPILE",
              "zh": "反编译：把编译产物还原成源码",
              "pron": "diːkəmˈpaɪl"
            },
            {
              "en": "OBFUSCATE",
              "zh": "混淆：把代码改名打乱增加阅读难度",
              "pron": "ˈɑːbfəskeɪt"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "jadx 能做什么？",
              "options": [
                "抓包",
                "把 Apk 反编译回近似 Java 源码",
                "发请求"
              ],
              "answer": 1,
              "explain": "jadx 是反编译工具。"
            },
            {
              "type": "fill",
              "question": "反编译常用 `jadx -d out ______`（填 apk 文件名）。",
              "answer": "app-release.apk",
              "explain": "jadx 接 apk 路径。"
            },
            {
              "type": "choice",
              "question": "为什么反编译后代码像天书？",
              "options": [
                "Java 难",
                "常被混淆(类名变a/b/c)",
                "反编译失败"
              ],
              "answer": 1,
              "explain": "混淆让类名无意义。"
            },
            {
              "type": "tap",
              "question": "jadx 能帮你看（多选）",
              "options": [
                "接口域名",
                "签名算法Java实现",
                "硬编码的key",
                "运行时内存"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三项是静态可见；运行时内存靠 frida。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「搜关键字（sign/md5）」是读混淆代码的高效入口？",
              "answer": "混淆只改类名/方法名，关键字符串如 'sign'、'md5'、域名常保留；从关键字反查调用链，比从杂乱的 a/b/c 类盲读高效得多。"
            },
            {
              "type": "coding",
              "question": "jadx 反编译 Apk 看 Java 代码。这是工具操作，无 Python 逻辑，看懂点「标记完成」。",
              "starter": "# 步骤：\n# 1) 把 apk 拖进 jadx-gui\n# 2) 在 resources.arsc / smali 里搜 'sign' / 'encrypt'\n# 3) 跟到算签名的方法\nprint('jadx 是看 App 源码的显微镜')",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "用 jadx 反编译一个自己的/开源 Apk，搜 sign 看结构。",
            "体会混淆代码怎么读（搜关键字而非顺读）。",
            "记一句：逆向只用于学习/授权。"
          ],
          "color": "#d9774b"
        },
        {
          "id": "a11l4",
          "title": "frida hook 入门（思路）",
          "icon": "🪝",
          "markdown": "## frida：运行时「hook」改数据\n\njadx 看的是「静态代码」；**frida** 能在 App **运行时**注入 JS，拦截某个函数、改它的参数或返回值——不用改 Apk、不用重编译。\n\n### 思路示意\n```js\nJava.perform(function () {\n  var Utils = Java.use(\"com.xxx.SignUtils\");\n  Utils.makeSign.implementation = function (a) {\n    console.log(\"原参数:\", a);\n    return this.makeSign(a);   // 可在此改返回值\n  };\n});\n```\n### 用来干嘛\n- **看**某个签名函数到底收了啥参数（比静态读快）\n- **改**返回值绕过校验（灰色地带，谨慎）\n- 配合 mitmproxy，动静结合\n\n> ⚠️ 红线：frida 改返回值绕过人家防护 = 违法风险高发区。学习用自己的 App、做安全研究要在合法授权范围内。",
          "takeaway": "frida 在 App 运行时注入 JS hook 函数，看参数/改返回值，无需重编译；jadx 看静态代码，两者动静结合。但改返回值绕过防护是违法高发区，仅限合法授权范围。",
          "figures": [
            {
              "key": "adv_frida",
              "caption": "🪝 frida 运行时注入 JS hook 函数：看参数/改返回值，无需重编译"
            }
          ],
          "words": [
            {
              "en": "FRIDA",
              "zh": "frida：动态插桩/运行时 hook 框架",
              "pron": "ˈfriːdə"
            },
            {
              "en": "HOOK",
              "zh": "hook：拦截并改写函数行为",
              "pron": "hʊk"
            },
            {
              "en": "INJECT",
              "zh": "注入：把代码塞进运行中的进程",
              "pron": "ɪnˈdʒɛkt"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "frida 和 jadx 的最大区别是？",
              "options": [
                "都一样",
                "frida 在运行时hook改数据",
                "jadx 更快"
              ],
              "answer": 1,
              "explain": "动静之分。"
            },
            {
              "type": "fill",
              "question": "frida 注入的是______脚本（填 JS）来拦截函数。",
              "answer": "JS",
              "explain": "frida 用 JS 写 hook 逻辑。"
            },
            {
              "type": "choice",
              "question": "关于 frida 改返回值绕过校验，正确的是？",
              "options": [
                "随便用",
                "违法风险高发区、仅合法授权范围",
                "一定合法"
              ],
              "answer": 1,
              "explain": "绕过防护风险高。"
            },
            {
              "type": "tap",
              "question": "frida 能做的（多选）",
              "options": [
                "运行时看签名函数参数",
                "改返回值",
                "不用重编译Apk",
                "静态读源码"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三项是动态能力；静态读靠 jadx。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么说「frida 动静结合 + mitmproxy」是 App 逆向的黄金组合？",
              "answer": "mitmproxy 看网络层明文请求，frida 看代码层函数参数与返回值，jadx 看静态实现；三层互证，既知请求长啥样、又知签名怎么算，定位极快。"
            },
            {
              "type": "coding",
              "question": "frida hook 运行时改函数/读参数。代码需本机跑，看懂点「标记完成」。",
              "starter": "import frida\n# js = \"Java.perform(function(){ /* hook 目标方法 */ });\"\n# session = frida.get_usb_device().attach('com.xxx')\nprint('frida 在 App 运行时动手脚')",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "了解 frida 的基本 hook 写法（文档/自己授权 App）。",
            "理解动静结合的定位思路。",
            "记一句：改返回值绕过=高风险，合法授权才碰。"
          ],
          "color": "#d9774b"
        },
        {
          "id": "exam3",
          "title": "阶段考③：Scrapy·分布式·存储·App抓包",
          "icon": "📝",
          "type": "exam",
          "color": "#e0922f",
          "markdown": "## 阶段考③：Scrapy · 分布式 · 存储 · App 抓包\n\n覆盖 **Scrapy 框架深入 / 分布式·去重·管道 / 存储进阶 / App 抓包与移动端** 四章。\n\n**规则**：8 题，首次正确率 ≥ 80% 过关，得「阶段考③过关」勋章，可重复挑战。\n\n工程化爬取的硬实力，这一考见真章。",
          "takeaway": "阶段考③过关 = 你懂 Scrapy 引擎流水线、中间件与管道分工、Redis 中央调度、布隆「有误判无漏判」、SimHash 近似去重、MongoDB/ES 入库、mitmproxy/jadx/frida 抓 App。工程化稳了。",
          "words": [],
          "tasks": [],
          "exercises": [
            {
              "type": "choice",
              "question": "Scrapy 引擎的核心作用是？",
              "options": [
                "画界面",
                "协调调度/下载/解析/管道的数据流",
                "写数据库"
              ],
              "answer": 1,
              "explain": "引擎是总调度。"
            },
            {
              "type": "choice",
              "question": "Downloader Middleware 主要干预？",
              "options": [
                "解析 HTML",
                "请求发出前/响应回来后的处理（如加代理/换 UA）",
                "存数据"
              ],
              "answer": 1,
              "explain": "中间件在请求响应之间做手脚。"
            },
            {
              "type": "choice",
              "question": "Pipeline 的典型职责是？",
              "options": [
                "发请求",
                "清洗 + 入库（去重/存库）",
                "算签名"
              ],
              "answer": 1,
              "explain": "管道管清洗和落地。"
            },
            {
              "type": "choice",
              "question": "scrapy-redis 解决的核心问题是？",
              "options": [
                "美化日志",
                "多机共享请求队列，做分布式爬虫",
                "加密"
              ],
              "answer": 1,
              "explain": "Redis 当中央队列，多机协同。"
            },
            {
              "type": "choice",
              "question": "布隆过滤器(Bloom Filter)去重的特点是？",
              "options": [
                "零误判",
                "有误判（可能误以为见过的没见过）但绝不漏判",
                "慢"
              ],
              "answer": 1,
              "explain": "布隆：有误判、无漏判、省内存。"
            },
            {
              "type": "choice",
              "question": "SimHash 用来做？",
              "options": [
                "图片压缩",
                "文本近似去重（相似网页判重）",
                "加密"
              ],
              "answer": 1,
              "explain": "SimHash 算指纹做近似去重。"
            },
            {
              "type": "choice",
              "question": "MongoDB 适合存？",
              "options": [
                "强一致事务表",
                "结构不规整/嵌套的文档数据",
                "只能数字"
              ],
              "answer": 1,
              "explain": "MongoDB 存半结构文档很香。"
            },
            {
              "type": "choice",
              "question": "Elasticsearch 的主要用途是？",
              "options": [
                "当消息队列",
                "全文检索 + 建索引",
                "画图表"
              ],
              "answer": 1,
              "explain": "ES 是搜索引擎，查得快。"
            },
            {
              "type": "choice",
              "question": "mitmproxy 抓 App HTTPS 的前提是？",
              "options": [
                "随便抓",
                "手机装并信任它的 CA 证书，流量过代理",
                "不用证书"
              ],
              "answer": 1,
              "explain": "要装 CA 证书才能解 HTTPS。"
            },
            {
              "type": "choice",
              "question": "frida 主要用于？",
              "options": [
                "写爬虫",
                "运行时 hook App 函数、篡改/读取参数（逆向思路）",
                "做表格"
              ],
              "answer": 1,
              "explain": "frida 是动态 hook 框架。"
            }
          ]
        }
      ]
    },
    {
      "title": "调度·部署·监控",
      "icon": "⚙️",
      "color": "#8e7bd6",
      "lessons": [
        {
          "id": "a12l1",
          "title": "APScheduler/cron 定时跑",
          "icon": "⏰",
          "markdown": "## 定时跑：别手动按\n\n爬虫要**每天定时抓**（如早 8 点更新榜单）。两种主流：服务器 `cron` 和 Python 的 `APScheduler`。\n\n### cron（系统级）\n```bash\n# 每天 8:00 跑\n0 8 * * * cd /app && python crawl.py >> log.txt\n```\n### APScheduler（代码级）\n```python\nfrom apscheduler.schedulers.blocking import BlockingScheduler\ns = BlockingScheduler()\n@s.scheduled_job(\"cron\", hour=8)\ndef job():\n    print(\"开抓\")\ns.start()\n```\n> 💡 cron 适合「脚本丢服务器定时跑」；APScheduler 适合把调度写进 Python 服务里。两者都能「到点自动跑」。",
          "takeaway": "定时跑用系统 cron（0 8 * * *）或 Python APScheduler；cron 系统级、APScheduler 代码级，都能到点自动跑，适合生产常态采集。",
          "figures": [
            {
              "key": "adv_redis_queue",
              "caption": "⏰ 定时调度：cron 系统级 / APScheduler 代码级，到点自动跑爬虫"
            }
          ],
          "words": [
            {
              "en": "APSCHEDULER",
              "zh": "APScheduler：Python 定时任务库",
              "pron": "eɪ piː ˈskɛdʒuːlər"
            },
            {
              "en": "CRON",
              "zh": "cron：Linux 系统定时任务",
              "pron": "krɑːn"
            },
            {
              "en": "SCHEDULE",
              "zh": "调度：按时间自动触发",
              "pron": "ˈskɛdʒuːl"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "每天 8 点定时跑爬虫，用？",
              "options": [
                "cron/APScheduler",
                "手动点",
                "input 等待"
              ],
              "answer": 0,
              "explain": "两者都能定时。"
            },
            {
              "type": "fill",
              "question": "`0 8 * * *` 中第一个 `0` 表示______（填：分钟/小时）。",
              "answer": "分钟",
              "explain": "cron 五段：分 时 日 月 周。"
            },
            {
              "type": "choice",
              "question": "cron 与 APScheduler 区别是？",
              "options": [
                "一个系统级一个代码级",
                "完全一样",
                "都不能定时"
              ],
              "answer": 0,
              "explain": "层级不同，能力相似。"
            },
            {
              "type": "tap",
              "question": "定时方案（多选）",
              "options": [
                "系统 cron",
                "Python APScheduler",
                "到点自动跑",
                "必须人工点"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三项；人工点不算定时。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「定时爬取」比「想起来手动跑」更适合生产？",
              "answer": "生产数据采集要求稳定持续，定时让更新自动化、不依赖人，且可在低峰期跑减轻对方压力，还能保证数据时效。"
            },
            {
              "type": "coding",
              "question": "APScheduler/cron 定时跑任务。这是调度配置，无核心逻辑，看懂点「标记完成」。",
              "starter": "# 每天 8 点跑一次\n# sched.add_job(crawl, 'cron', hour=8)\nprint('定时任务靠调度器，不在代码里手写循环')",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "写一个 cron 表达式让脚本每天凌晨 2 点跑。",
            "用 APScheduler 写个每小时间隔的示例。",
            "记一句：到点自动跑，别手动。"
          ],
          "color": "#8e7bd6"
        },
        {
          "id": "a12l2",
          "title": "断点续爬与重试",
          "icon": "🔁",
          "markdown": "## 断点续爬：别一断就重来\n\n抓 100 万条，跑到 50 万程序崩了——重头再来太亏。**断点续爬**=记住「抓到哪」，重启从断点继续。\n\n### 做法\n- 用 Redis/数据库记「已抓进度/水位」（见第 9 章增量）\n- 失败的任务**重试**而非丢弃：网络抖一下不该丢数据\n```python\nfrom tenacity import retry, stop_after_attempt\n@retry(stop=stop_after_attempt(3))\ndef fetch(url):\n    return requests.get(url, timeout=10)\n```\n### 关键点\n- 任务粒度要小（一条 URL 一个任务），崩了只丢当前这条\n- 幂等：重试同一任务结果一致，不重复写\n\n> ⚠️ 易错：任务粒度太大（一次抓 1 万条），崩了重来还是丢 1 万。粒度小，断点才精准。",
          "takeaway": "断点续爬=记进度从断点继续；失败重试（如 tenacity）而非丢；任务粒度要小、操作幂等，崩了只丢当前小任务。",
          "figures": [
            {
              "key": "adv_dist_arch",
              "caption": "🔁 断点续爬：记进度/水位，崩了从断点继续；任务粒度小、操作幂等"
            }
          ],
          "words": [
            {
              "en": "RESUME",
              "zh": "续爬：从断点继续而非重头",
              "pron": "rɪˈzuːm"
            },
            {
              "en": "IDEMPOTENT",
              "zh": "幂等：重试结果一致不重复",
              "pron": "aɪˈdɛmpətənt"
            },
            {
              "en": "TENACITY",
              "zh": "tenacity：Python 重试装饰器库",
              "pron": "təˈnæsəti"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "断点续爬的核心是？",
              "options": [
                "重头再来",
                "记住进度从断点继续",
                "不存进度"
              ],
              "answer": 1,
              "explain": "记进度才能续。"
            },
            {
              "type": "fill",
              "question": "用______/数据库记「已抓进度」实现续爬。（填 Redis）",
              "answer": "Redis",
              "explain": "Redis 常做进度中枢。"
            },
            {
              "type": "choice",
              "question": "关于任务粒度，正确的是？",
              "options": [
                "越大越好",
                "越小断点越精准",
                "无所谓"
              ],
              "answer": 1,
              "explain": "粒度小断点准。"
            },
            {
              "type": "tap",
              "question": "续爬要点（多选）",
              "options": [
                "记进度/水位",
                "失败重试而非丢",
                "任务粒度小",
                "幂等可重入"
              ],
              "answer": [
                0,
                1,
                2,
                3
              ],
              "explain": "四条齐全。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「幂等」对重试很重要？",
              "answer": "网络抖动触发重试时，若操作不幂等（如重复插入），会产生重复数据或副作用；幂等保证重试多次和一次结果一致，数据才干净。"
            },
            {
              "type": "coding",
              "question": "断点续爬：total 是全部 100 个任务，done 是已完成的前 30 个。算出「还要抓哪些编号」并打印还剩几个。",
              "starter": "total = 100\ndone = 30\nleft = list(range(done + 1, total + 1))   # TODO: 从 done+1 到 total\nprint('还剩', len(left), '个，编号从', left[0], '起')",
              "_gen": "coding-ex",
              "expect": "还剩 70 个"
            }
          ],
          "tasks": [
            "用 tenacity 给一个会随机失败的函数加重试，观察是否自动恢复。",
            "把一个大任务拆成小任务，模拟崩溃看断点续爬。",
            "记一句：粒度小，断点才精准。"
          ],
          "color": "#8e7bd6"
        },
        {
          "id": "a12l3",
          "title": "日志监控报警",
          "icon": "📟",
          "markdown": "## 日志与监控：爬虫得会「喊疼」\n\n爬虫常跑在服务器后台，你不在现场。**日志（log）**记录每一步，**监控+报警**在异常时通知你。\n\n### 日志\n```python\nimport logging\nlogging.basicConfig(filename=\"crawl.log\", level=logging.INFO)\nlogging.info(\"抓到 %d 条\", n)\nlogging.error(\"请求失败: %s\", url)\n```\n### 监控报警\n- 统计：今日抓取量、失败率、耗时\n- 报警：失败率突增 / 连续报错 → 发邮件/钉钉/微信\n- 看板：用 Grafana 等把指标画出来\n\n> 💡 没有日志的爬虫像黑盒：出了问题你只能干瞪眼。好爬虫「平时记日志，出事会报警」。",
          "takeaway": "后台爬虫靠 logging 记步骤、监控统计+报警（失败率突增即通知）、看板可视化；无日志如黑盒，出问题无法定位。",
          "figures": [
            {
              "key": "debug_wheel",
              "caption": "📟 日志+监控+报警：爬虫后台「喊疼」，出事即通知，看板可视化"
            }
          ],
          "words": [
            {
              "en": "LOGGING",
              "zh": "日志：记录程序运行的每一步",
              "pron": "ˈlɔːɡɪŋ"
            },
            {
              "en": "ALERT",
              "zh": "报警：异常时主动通知",
              "pron": "əˈlɜːrt"
            },
            {
              "en": "DASHBOARD",
              "zh": "看板：指标可视化面板",
              "pron": "ˈdæʃbɔːrd"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "后台爬虫靠什么让你知道状态？",
              "options": [
                "凭感觉",
                "日志+监控报警",
                "不管"
              ],
              "answer": 1,
              "explain": "日志监控是眼睛。"
            },
            {
              "type": "fill",
              "question": "用 `logging.______(\"抓到 %d 条\", n)` 记录信息。（填 info）",
              "answer": "info",
              "explain": "logging.info 记普通信息。"
            },
            {
              "type": "choice",
              "question": "报警触发条件通常是？",
              "options": [
                "每天固定",
                "失败率突增/连续报错",
                "从不"
              ],
              "answer": 1,
              "explain": "异常才报警。"
            },
            {
              "type": "tap",
              "question": "监控报警要素（多选）",
              "options": [
                "统计抓取量/失败率",
                "异常发通知",
                "看板可视化",
                "完全不看"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三项；不看等于没监控。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「没有日志的爬虫像黑盒」很危险？",
              "answer": "后台运行无人盯，一旦失败或数据异常，没有日志就无从定位是哪里、何时、什么原因，只能推倒重来，排查成本极高。"
            },
            {
              "type": "coding",
              "question": "日志监控报警：logs 是一批日志行，统计里面出现了几次 'ERROR' 并打印。",
              "starter": "logs = ['INFO ok', 'ERROR db down', 'INFO ok', 'ERROR timeout', 'WARN slow']\nn = 0\nfor line in logs:\n    if 'ERROR' in line:\n        n += 1\nprint('ERROR 出现', n, '次')",
              "_gen": "coding-ex",
              "expect": "ERROR 出现 2 次"
            }
          ],
          "tasks": [
            "给爬虫加 logging，故意制造一个错误看日志输出。",
            "画一张「抓取量/失败率」看板草图。",
            "记一句：好爬虫会喊疼。"
          ],
          "color": "#8e7bd6"
        },
        {
          "id": "a12l4",
          "title": "Docker 容器化",
          "icon": "🐳",
          "markdown": "## Docker：把爬虫打包成「集装箱」\n\n爬虫依赖一堆库（Python 版本、scrapy、redis 客户端…）。换台机器跑，环境不对就崩。**Docker** 把「代码+依赖+环境」打包成镜像，到处运行一致。\n\n### 最小 Dockerfile\n```dockerfile\nFROM python:3.11\nCOPY . /app\nWORKDIR /app\nRUN pip install -r requirements.txt\nCMD [\"python\", \"crawl.py\"]\n```\n### 好处\n- **环境一致**：本地能跑，服务器也能跑\n- **隔离**：互不影响，一台机跑多个爬虫\n- **易扩**：配合编排（K8s）一键起多份\n\n> 💡 Docker 不是虚拟化整机，是「进程级隔离」，轻量。它让「在我机器上能跑」终于不等于「在你机器上崩」。",
          "takeaway": "Docker 把代码+依赖+环境打包成镜像，进程级隔离、轻量，环境一致、易扩展；解决「换机依赖不对就崩」的痛点。",
          "figures": [
            {
              "key": "adv_docker",
              "caption": "🐳 Docker：代码+依赖+环境打包成镜像，进程级隔离，到处一致运行"
            }
          ],
          "words": [
            {
              "en": "DOCKER",
              "zh": "Docker：容器化打包工具",
              "pron": "ˈdɑːkər"
            },
            {
              "en": "IMAGE",
              "zh": "镜像：打包好的运行环境模板",
              "pron": "ˈɪmɪdʒ"
            },
            {
              "en": "CONTAINER",
              "zh": "容器：镜像运行起来的实例",
              "pron": "kənˈteɪnər"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "Docker 主要解决？",
              "options": [
                "网速",
                "环境不一致(依赖/版本)",
                "解析难"
              ],
              "answer": 1,
              "explain": "解决环境漂移。"
            },
            {
              "type": "fill",
              "question": "把代码+依赖打包成______（填镜像/容器）。",
              "answer": "镜像",
              "explain": "镜像是静态模板，容器是运行实例。"
            },
            {
              "type": "choice",
              "question": "关于 Docker 隔离，正确的是？",
              "options": [
                "重",
                "轻量进程级隔离",
                "必须整机虚拟"
              ],
              "answer": 1,
              "explain": "Docker 很轻。"
            },
            {
              "type": "tap",
              "question": "Docker 好处（多选）",
              "options": [
                "环境一致",
                "隔离互不影响",
                "易扩展",
                "换机必崩"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三项；换机不崩才是卖点。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「在我机器上能跑」用 Docker 后就不再等于「在你机器上崩」？",
              "answer": "因为 Docker 把精确的运行环境（系统库、Python 版本、依赖版本）一并打包，目标机只跑容器，环境完全一致，不再受目标机已有环境干扰。"
            },
            {
              "type": "coding",
              "question": "Docker 容器化把爬虫打包成镜像。这是运维配置，无 Python 逻辑，看懂点「标记完成」。",
              "starter": "# Dockerfile\n# FROM python:3.11\n# COPY . /app\n# RUN pip install -r requirements.txt\n# CMD [\"python\", \"crawl.py\"]\nprint('Docker 让环境到处一样')",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "写一个最小 Dockerfile 构建镜像并跑通。",
            "体会「本地能跑、服务器也能跑」的一致性。",
            "记一句：Docker 是集装箱。"
          ],
          "color": "#8e7bd6"
        },
        {
          "id": "a12l5",
          "title": "Scrapyd·Gerapy 管理平台",
          "icon": "🖥️",
          "markdown": "## Scrapyd + Gerapy：爬虫也能「后台管理」\n\n写完 Scrapy 项目，怎么在服务器上**统一启停、看状态、定时调度**？Scrapyd 是 Scrapy 的**部署服务**，Gerapy 是给它做的**可视化后台**。\n\n### Scrapyd 干什么\n- 接收你 `scrapyd-deploy` 上传的项目\n- 提供 HTTP API 启停爬虫、查状态\n- 多项目集中管理\n\n### Gerapy 干什么\n- 网页界面：点几下就启停爬虫\n- 可视化编辑调度、看运行日志\n- 不用记命令行\n\n```bash\npip install scrapyd gerapy\ngerapy runserver 0.0.0.0:8000   # 打开网页管理\n```\n> 💡 个人小脚本用不到；但当爬虫变多、要常驻服务器，Scrapyd+Gerapy 让你「像管服务一样管爬虫」。",
          "takeaway": "Scrapyd 是 Scrapy 部署服务（API 启停/查状态），Gerapy 是可视化后台（点按钮管理、看日志）。爬虫变多常驻服务器时值得上，个人小脚本用不到。",
          "figures": [
            {
              "key": "adv_scrapyd",
              "caption": "🖥️ Scrapyd 部署服务 + Gerapy 可视化后台：网页点按钮启停/看日志/集中管多项目"
            }
          ],
          "words": [
            {
              "en": "SCRAPYD",
              "zh": "Scrapyd：Scrapy 部署运行服务",
              "pron": "skreɪpi diː"
            },
            {
              "en": "GERAPY",
              "zh": "Gerapy：Scrapyd 的可视化后台",
              "pron": "dʒəˈreɪpi"
            },
            {
              "en": "DEPLOY",
              "zh": "部署：把项目发布到服务器",
              "pron": "dɪˈplɔɪ"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "Scrapyd 是？",
              "options": [
                "解析库",
                "Scrapy 的部署/管理服务",
                "数据库"
              ],
              "answer": 1,
              "explain": "Scrapyd 管部署运行。"
            },
            {
              "type": "fill",
              "question": "Gerapy 给 Scrapyd 做了______（填：可视化后台/命令行）。",
              "answer": "可视化后台",
              "explain": "Gerapy 是网页界面。"
            },
            {
              "type": "choice",
              "question": "关于 Scrapyd+Gerapy，正确的是？",
              "options": [
                "个人小脚本必备",
                "爬虫变多常驻服务器时好用",
                "只能命令行"
              ],
              "answer": 1,
              "explain": "规模上来才值。"
            },
            {
              "type": "tap",
              "question": "它们能做的（多选）",
              "options": [
                "HTTP API 启停爬虫",
                "网页点按钮管理",
                "看运行日志",
                "集中管理多项目"
              ],
              "answer": [
                0,
                1,
                2,
                3
              ],
              "explain": "四条齐全。",
              "multi": true
            },
            {
              "type": "open",
              "question": "什么时候值得上 Scrapyd+Gerapy，而不是手动跑脚本？",
              "answer": "当爬虫项目变多、需要常驻服务器、要统一启停/定时/看状态/多人协作时，管理平台省去大量手工运维；零散一两个脚本没必要。"
            },
            {
              "type": "coding",
              "question": "Scrapyd/Gerapy 管理多个爬虫。代码需本机跑(依赖服务)，看懂点「标记完成」。",
              "starter": "# 启服务后\n# curl http://localhost:6800/schedule.json -d project=demo -d spider=book\nprint('Scrapyd 远程启停爬虫')",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "了解 Scrapyd+Gerapy 的部署流程（文档）。",
            "对比「手动 nohup 跑」和「平台管理」的运维差异。",
            "记一句：爬虫多了才上平台。"
          ],
          "color": "#8e7bd6"
        }
      ]
    },
    {
      "title": "合规深水区",
      "icon": "⚖️",
      "color": "#e6b84d",
      "lessons": [
        {
          "id": "a13l1",
          "title": "个人信息保护法与边界",
          "icon": "🚧",
          "markdown": "## 合规红线：能抓 ≠ 该抓\n\n技术上讲啥都能抓，但**法律画了线**。重点几类绝对谨慎：\n\n### 高危数据\n- **个人信息**：姓名、电话、身份证、人脸、行踪——受《个人信息保护法》严管，乱抓乱用违法\n- **商业秘密/付费内容**：人家明确不让抓的\n- **国家禁止爬取的对象**\n\n### 三条自检\n1. 数据是不是**个人信息/敏感信息**？\n2. 对方 `robots.txt` / 服务条款**让不让抓**？\n3. 抓取会不会**给人家服务器造成过重负担**或**突破技术防护措施**？\n\n> ⚠️ 铁律：技术能力 ≠ 法律许可。爬之前先想这三条，拿不准就别碰。",
          "takeaway": "合规红线：个人信息/敏感信息、商业秘密/付费内容、对方禁止抓的都谨慎；爬前自检三问（是否个人信息、对方让不让、是否过重负担/突破防护）。技术≠法律许可。",
          "figures": [
            {
              "key": "adv_compliance",
              "caption": "🚧 合规红线：个人信息/敏感信息、禁止抓的、突破防护都谨慎"
            }
          ],
          "words": [
            {
              "en": "PIPL",
              "zh": "个人信息保护法：管个人信息处理的法规",
              "pron": "piː aɪ piː ɛl"
            },
            {
              "en": "PERSONAL_INFO",
              "zh": "个人信息：可识别自然人的各种信息",
              "pron": "ˈpɜːrsənl ɪnˈfɔː"
            },
            {
              "en": "BOUNDARY",
              "zh": "边界：法律允许的抓取范围",
              "pron": "ˈbaʊndri"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "《个人信息保护法》严管的是？",
              "options": [
                "公开新闻",
                "个人信息/敏感信息(电话/人脸等)",
                "自己的博客"
              ],
              "answer": 1,
              "explain": "敏感个人信息受严管。"
            },
            {
              "type": "fill",
              "question": "爬之前先问：数据是不是______信息？（填 个人/敏感）",
              "answer": "个人",
              "explain": "个人/敏感信息是红线。"
            },
            {
              "type": "choice",
              "question": "关于「能抓≠该抓」，正确的是？",
              "options": [
                "技术能抓就随便",
                "法律画了红线要守",
                "无所谓"
              ],
              "answer": 1,
              "explain": "守法是底线。"
            },
            {
              "type": "tap",
              "question": "高危需谨慎的数据（多选）",
              "options": [
                "个人信息/人脸/行踪",
                "商业秘密/付费内容",
                "对方禁止抓的",
                "公开天气预报"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三项高危；公开天气可抓。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「给服务器造成过重负担」也可能违法/违规？",
              "answer": "高频抓取拖垮对方服务器属于干扰正常经营，既违反服务条款，严重时可构成对计算机信息系统正常功能的破坏或不正当竞争，同样有法律风险。"
            },
            {
              "type": "coding",
              "question": "个人信息保护法划了红线：不能乱抓个人信息。这是法律边界，写一句你的自检口诀点「标记完成」。",
              "starter": "# 自检：抓的是公开？授权？会不会伤到人？\nprint('能抓不等于该抓；先问合规再动手')",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "读一遍目标网站的 robots.txt 和服务条款，判断哪些能碰。",
            "把「爬前三自检」抄在鼠标垫上。",
            "记一句：技术≠许可，拿不准就别碰。"
          ],
          "color": "#e6b84d"
        },
        {
          "id": "a13l2",
          "title": "灰色地带案例与自检清单",
          "icon": "🟡",
          "markdown": "## 灰色地带：这些「擦边」别碰\n\n有些行为游走在边缘，一不小心就越界。举几个典型：\n\n### 擦边案例\n- **伪造指纹/突破防护**：用 stealth 绕过人家明确的技术防护（第 4/13 章提过）\n- **打码平台绕过验证码**：突破人家的人机校验（第 7 章）\n- **绕过付费/登录墙**：拿本不该免费看的内容\n- **爬竞品核心数据做不正当竞争**\n\n### 自检清单（每条 Yes 都要警惕）\n- [ ] 我抓的是别人明确禁止的吗？\n- [ ] 我在突破人家技术防护吗？\n- [ ] 涉及真实个人敏感信息吗？\n- [ ] 会给对方造成实质损害吗？\n\n> 💡 判断标准：是否「尊重对方意愿 + 不造成损害 + 不碰敏感/禁止」。有任一条中招，收手。",
          "takeaway": "灰色地带：伪造指纹突破防护、打码绕过验证码、绕过付费墙、爬竞品核心数据都高危。自检清单任一 Yes 即警惕；标准是尊重意愿+不造成损害+不碰敏感/禁止。",
          "figures": [
            {
              "key": "adv_compliance",
              "caption": "🟡 灰色地带自检：突破防护/绕过验证码/绕过付费墙/爬竞品核心数据均高危"
            }
          ],
          "words": [
            {
              "en": "GREY",
              "zh": "灰色地带：游走在合规边缘的行为",
              "pron": "ɡreɪ"
            },
            {
              "en": "CHECKLIST",
              "zh": "自检清单：判断是否越界的提问",
              "pron": "ˈtʃɛklɪst"
            },
            {
              "en": "FAIR_USE",
              "zh": "合理使用：在授权/合规范围内的使用",
              "pron": "fɛr juːs"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "下列哪种偏「擦边/高危」？",
              "options": [
                "抓自己博客",
                "用打码平台突破人家验证码",
                "抓公开天气"
              ],
              "answer": 1,
              "explain": "突破人机校验高危。"
            },
            {
              "type": "fill",
              "question": "自检清单里「是否在突破人家______防护」要警惕。（填 技术）",
              "answer": "技术",
              "explain": "突破技术防护是红线。"
            },
            {
              "type": "choice",
              "question": "判断能否爬的核心标准是？",
              "options": [
                "只要快",
                "尊重对方意愿+不造成损害+不碰敏感禁止",
                "看心情"
              ],
              "answer": 1,
              "explain": "三条齐备才稳妥。"
            },
            {
              "type": "tap",
              "question": "灰色地带行为（多选）",
              "options": [
                "伪造指纹突破防护",
                "打码绕过验证码",
                "绕过付费墙",
                "抓公开新闻"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三项高危；公开新闻可。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「不正当竞争」（爬竞品核心数据）也可能惹官司？",
              "answer": "爬取竞争对手核心经营数据用于自身竞争，可能构成侵犯商业秘密或不正当竞争，对方可依法索赔，是不少爬虫官司的真实案由。"
            },
            {
              "type": "coding",
              "question": "灰色地带案例自检：遇到「要登录才能看」「对方明确禁止爬」时怎么办。写一句原则点「标记完成」。",
              "starter": "# 原则：\n# 1) robots 禁止 / 明文拒绝 -> 不碰\n# 2) 个人敏感信息 -> 不碰\nprint('尊重 robots 与法律，留好底线')",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "把自检清单记下来，以后每个爬虫项目先过一遍。",
            "回顾前面章节里提到的灰色手段，标注其风险等级。",
            "记一句：尊重意愿+不造成损害+不碰敏感禁止。"
          ],
          "color": "#e6b84d"
        },
        {
          "id": "a13l3",
          "title": "爬虫工程师职业路径",
          "icon": "🧭",
          "markdown": "## 当爬虫工程师：你能走多远\n\n合规地写爬虫，是一份正经技术活。企业需要的是「**能稳定、合规、高效**拿到数据」的人。\n\n### 能力地图\n- 基础：requests/异步/解析（前 13 章）\n- 进阶：逆向/分布式/存储/部署（本升阶课）\n- 工程：调度/监控/容器/合规意识（第 12/13 章）\n- 加分：数据清洗、反爬对抗经验、大数据栈\n\n### 职业方向\n- **数据采集工程师**：为企业合规建数据仓库\n- **反爬/安全方向**：帮企业保护自己（正向）\n- **数据分析上游**：供给干净数据\n\n> 💡 这行越往后越吃「工程素养 + 合规意识」。技术强但无视红线，走不远；合规+稳定+高效，才是真本事。",
          "takeaway": "合规爬虫是正经技术活；能力=基础+进阶+工程+合规意识，方向有数据采集/安全正向/数据上游。技术强+合规+稳定高效才走得远。",
          "figures": [
            {
              "key": "roadmap",
              "caption": "🧭 职业路径能力地图：基础→进阶→工程→合规，方向有数据采集/安全/数据上游"
            }
          ],
          "words": [
            {
              "en": "CAREER",
              "zh": "职业：以爬虫为生的技术路线",
              "pron": "kəˈrɪr"
            },
            {
              "en": "DATA_ENG",
              "zh": "数据采集工程师：合规建数据仓库",
              "pron": "ˈdeɪtə ɛndʒɪnɪr"
            },
            {
              "en": "ETHICS",
              "zh": "职业伦理：合规底线意识",
              "pron": "ˈɛθɪks"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "企业最需要的爬虫人才特点是？",
              "options": [
                "越快越好不管合规",
                "稳定/合规/高效拿数据",
                "只会写死循环"
              ],
              "answer": 1,
              "explain": "稳定合规高效是刚需。"
            },
            {
              "type": "fill",
              "question": "爬虫工程师的核心素养除了技术，还要有______意识。（填 合规）",
              "answer": "合规",
              "explain": "合规意识是职业底线。"
            },
            {
              "type": "choice",
              "question": "关于职业方向，正确的是？",
              "options": [
                "只有黑产",
                "也有合规数据采集/安全正向方向",
                "没前途"
              ],
              "answer": 1,
              "explain": "合规方向正当且需求大。"
            },
            {
              "type": "tap",
              "question": "爬虫工程师能力地图（多选）",
              "options": [
                "基础请求/解析",
                "逆向/分布式/存储",
                "调度/监控/容器",
                "合规意识"
              ],
              "answer": [
                0,
                1,
                2,
                3
              ],
              "explain": "四条都要。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「技术强但无视红线，走不远」？",
              "answer": "无视合规轻则项目被封被诉、重则触犯法律，职业声誉和前途都会断；企业也只敢用既懂技术又守底线的工程师，红线意识决定能走多高多远。"
            },
            {
              "type": "coding",
              "question": "爬虫工程师职业路径：数据/反爬/数据工程都走得通。写一句你的方向点「标记完成」。",
              "starter": "# 路径：爬虫开发 -> 反爬对抗 -> 数据平台/搜索\nprint('先把技术练正，路自然宽')",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "把自己的能力对照能力地图，标出还缺哪块。",
            "了解一个「合规数据采集工程师」的招聘要求。",
            "记一句：合规+稳定+高效才是真本事。"
          ],
          "color": "#e6b84d"
        }
      ]
    },
    {
      "title": "毕业综合 + 家长课",
      "icon": "🎓",
      "color": "#58b368",
      "lessons": [
        {
          "id": "gradA",
          "title": "毕业项目 A：高并发异步采集",
          "icon": "🚀",
          "markdown": "## 毕业项目 A：高并发异步采集系统\n\n把前 13 章串起来，做一个**能并发抓成千上万个页面**的异步采集器。目标：用 asyncio + aiohttp + 信号量 + 退避，稳定高效。\n\n### 你要做\n1. 选一个**你有权抓**的公开站点（如某公开榜单/文档站）\n2. 设计 URL 生成器（列表页 → 详情页）\n3. 用 aiohttp + Semaphore 并发抓，429 退避\n4. 用 lxml/parsel 解析，落 MongoDB 或 CSV\n5. 加日志、断点续爬、限速\n\n### 验收点\n| 能力 | 对应章节 |\n|---|---|\n| 异步并发 | ch1-2 |\n| 解析 | ch3 |\n| 限速/退避 | ch2/ch9 |\n| 存储 | ch10 |\n| 工程化 | ch12 |\n\n> 💡 这个项目考的是「组合能力」：单点你都会，难点在把它们稳稳拼起来、不崩、不封。",
          "takeaway": "毕业项目A=用 asyncio+aiohttp+Semaphore+退避 搭建高并发异步采集器，串起并发/解析/限速/存储/工程化；难点在稳稳组合、不崩不封。",
          "figures": [
            {
              "key": "adv_grad_arch",
              "caption": "🚀 毕业项目A：异步并发采集架构 asyncio+aiohttp+信号量+退避→解析→存储"
            }
          ],
          "words": [
            {
              "en": "PROJECT",
              "zh": "项目：综合运用的毕业实战",
              "pron": "ˈprɑːdʒɛkt"
            },
            {
              "en": "CONCURRENT_CRAWL",
              "zh": "高并发采集：同时抓大量页面",
              "pron": "kənˈkʌrənt krɔːl"
            },
            {
              "en": "ACCEPTANCE",
              "zh": "验收：项目达标的检查点",
              "pron": "əkˈsɛptəns"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "毕业项目 A 的核心技术是？",
              "options": [
                "Selenium 点点点",
                "asyncio+aiohttp+信号量",
                "手工复制"
              ],
              "answer": 1,
              "explain": "异步并发是 A 的主题。"
            },
            {
              "type": "fill",
              "question": "高并发采集用______控制同时并发数防冲垮。（填 信号量/Semaphore）",
              "answer": "信号量|Semaphore",
              "explain": "Semaphore 限制并发。"
            },
            {
              "type": "choice",
              "question": "关于项目 A 的验收，正确的是？",
              "options": [
                "只看速度",
                "稳定+不封+能存",
                "不管合规"
              ],
              "answer": 1,
              "explain": "稳定合规可存才是合格。"
            },
            {
              "type": "tap",
              "question": "项目 A 要用到的能力（多选）",
              "options": [
                "异步并发",
                "解析",
                "限速退避",
                "存储落库"
              ],
              "answer": [
                0,
                1,
                2,
                3
              ],
              "explain": "五章能力综合。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「组合能力」比「单点会」更难也更重要？",
              "answer": "单点技术各自独立好掌握，但真实项目要并发、解析、限速、存储、工程化一起跑且互不拖垮，任何一环不稳整体就崩，组合才是工程能力的分水岭。"
            },
            {
              "type": "coding",
              "question": "毕业项目 A 是高并发异步采集器（完整代码在上方「完整代码」框）。这里用模拟数据体会「并发 vs 顺序」速度差：给定 8 个任务每个 1 秒，算顺序与并发总耗时打印。",
              "starter": "n = 8\nper = 1\nseq = per * n\ncon = per\nprint('顺序', seq, '秒；并发', con, '秒')",
              "_gen": "coding-ex",
              "expect": "顺序 8 秒"
            }
          ],
          "tasks": [
            "选一个你有权抓的公开站，列出「列表页→详情页」的 URL 规律。",
            "用 asyncio+aiohttp+Semaphore 写出并发骨架，先小批量试。",
            "逐步加上 退避/解析/落库/日志/断点续爬，做成完整项目。"
          ],
          "color": "#58b368",
          "code": "# 毕业项目 A：高并发异步采集器（完整可运行示例）\n# 安装依赖：pip install aiohttp\n# 合规提醒：只抓你有权抓的公开站点，控制并发、尊重 robots、加延时。\nimport asyncio, aiohttp, csv, time\n\nTARGETS = [\n    \"https://example.com/page/1\",\n    \"https://example.com/page/2\",\n    # 换成你有权抓的「列表页 -> 详情页」URL\n]\nCONCURRENCY = 8      # 同时并发数（信号量控制）\nTIMEOUT = 15\nOUT = \"result.csv\"\n\nsemaphore = asyncio.Semaphore(CONCURRENCY)\nrows = []\nsess = None\n\nasync def fetch(url):\n    async with semaphore:                      # 限流：别冲垮对方\n        for attempt in range(3):               # 失败重试\n            try:\n                async with sess.get(url, timeout=TIMEOUT) as r:\n                    if r.status == 429:         # 被限流 -> 退避后重试\n                        await asyncio.sleep(2 ** attempt + 1)\n                        continue\n                    r.raise_for_status()\n                    return await r.text()\n            except Exception as e:\n                await asyncio.sleep(1.5 * (attempt + 1))\n    return None\n\ndef parse(html):\n    # 用 parsel / lxml / bs4 / re 解析出你要的字段\n    return {\"len\": len(html) if html else 0}\n\nasync def worker(url):\n    html = await fetch(url)\n    if html:\n        rows.append(parse(html))\n\nasync def main():\n    global sess\n    async with aiohttp.ClientSession() as sess:\n        t0 = time.time()\n        await asyncio.gather(*(worker(u) for u in TARGETS))\n        print(f\"抓了 {len(rows)} 页，用时 {time.time()-t0:.1f}s\")\n    with open(OUT, \"w\", newline=\"\", encoding=\"utf-8\") as f:\n        w = csv.DictWriter(f, fieldnames=[\"len\"])\n        w.writeheader(); w.writerows(rows)\n\nif __name__ == \"__main__\":\n    asyncio.run(main())\n",
          "codeCopyOnly": true
        },
        {
          "id": "gradB",
          "title": "毕业项目 B：分布式 + ES 入库",
          "icon": "🏗️",
          "markdown": "## 毕业项目 B：分布式 + ES 入库\n\n在 A 的基础上加难度：数据量更大，要**多机分布式**抓，并写入 **Elasticsearch** 支持检索。\n\n### 你要做\n1. 用 Redis 做中央队列 + 去重（scrapy-redis 或手写）\n2. 多进程/多机协作抓\n3. 文本近似去重（SimHash）避免重复\n4. 清洗后写入 ES，建立索引可检索\n5. 用 Docker 打包，Scrapyd 管理\n\n### 验收点\n| 能力 | 对应章节 |\n|---|---|\n| 分布式/去重 | ch9 |\n| 存储/ES | ch10 |\n| 部署 | ch12 |\n| 合规 | ch13 |\n\n> 💡 B 考的是「规模与工程」：当数据从千到千万，架构（队列/去重/检索/部署）才是分水岭。",
          "takeaway": "毕业项目B=在A基础上加 Redis 中央队列/去重、多机分布式、SimHash 近似去重、清洗写 ES 检索、Docker+Scrapyd 部署；考规模与工程架构。",
          "figures": [
            {
              "key": "adv_grad_arch",
              "caption": "🏗️ 毕业项目B：Redis队列+多机分布式+SimHash去重+ES检索+Docker部署"
            }
          ],
          "words": [
            {
              "en": "DISTRIBUTED",
              "zh": "分布式：多机协作抓",
              "pron": "dɪˈstrɪbjuːtɪd"
            },
            {
              "en": "ELASTIC",
              "zh": "ES：检索入库",
              "pron": "ɪˈlæstɪk"
            },
            {
              "en": "PRODUCTION",
              "zh": "生产级：能稳定常驻运行",
              "pron": "prəˈdʌkʃən"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "毕业项目 B 相比 A 多了什么？",
              "options": [
                "更少功能",
                "分布式+ES 检索",
                "不用存储"
              ],
              "answer": 1,
              "explain": "规模与检索是 B 的增量。"
            },
            {
              "type": "fill",
              "question": "分布式用______做中央队列与去重。（填 Redis）",
              "answer": "Redis",
              "explain": "Redis 做队列与去重中枢。"
            },
            {
              "type": "choice",
              "question": "写入 ES 的目的是？",
              "options": [
                "装饰",
                "支持全文检索",
                "更慢"
              ],
              "answer": 1,
              "explain": "ES 为搜索。"
            },
            {
              "type": "tap",
              "question": "项目 B 能力（多选）",
              "options": [
                "Redis 中央队列",
                "多机协作",
                "SimHash 去重",
                "ES 检索"
              ],
              "answer": [
                0,
                1,
                2,
                3
              ],
              "explain": "四块增量能力。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「架构」在千万级数据时是分水岭？",
              "answer": "千级数据单机字典去重、CSV 存储都够；千万级时内存、去重、检索、部署任一短板都会让系统崩溃或慢到不可用，只有合理架构（队列/去重/检索/容器）扛得住。"
            },
            {
              "type": "coding",
              "question": "毕业项目 B 是分布式+ES 入库（完整代码在上方）。这里用 deque 模拟「中央队列+多 worker」：把 6 个任务入队，3 个 worker 轮流 popleft 打印。",
              "starter": "from collections import deque\nq = deque(['t1','t2','t3','t4','t5','t6'])\nwhile q:\n    print('worker 取走', q.popleft())",
              "_gen": "coding-ex",
              "expect": "worker 取走 t1"
            }
          ],
          "tasks": [
            "把项目 A 改造成 Redis 中央队列版，起两个进程协作。",
            "加 SimHash 去重，清洗后写入 ES 建索引。",
            "用 Docker 打包并用 Scrapyd 管理起来。"
          ],
          "color": "#58b368",
          "code": "# 毕业项目 B：分布式采集 + ES 入库（生产架构骨架）\n# 安装依赖：pip install redis elasticsearch simhash requests\n# 说明：需本地先起 Redis 与 Elasticsearch；下面演示\n#       「Redis 中央队列 + 多进程 worker + SimHash 近似去重 + 写 ES」。\nimport redis, requests, multiprocessing as mp\nfrom elasticsearch import Elasticsearch\nfrom simhash import Simhash\n\nr = redis.Redis(host=\"127.0.0.1\", port=6379, db=0)\nes = Elasticsearch(\"http://127.0.0.1:9200\")\nQUEUE = \"crawl:tasks\"\nSEEN = \"crawl:simhash\"\n\ndef push_urls(urls):\n    r.lpush(QUEUE, *urls)               # 种子 URL 进中央队列（多机共享）\n\ndef fetch_sync(url):\n    return requests.get(url, timeout=15).text\n\ndef sim_dup(text):\n    h = Simhash(text).value\n    for old in r.sscan_iter(SEEN):      # 汉明距离 < 3 视为近似重复\n        if bin(h ^ int(old)).count(\"1\") < 3:\n            return True\n    r.sadd(SEEN, str(h))\n    return False\n\ndef worker():\n    while True:\n        url = r.rpop(QUEUE)\n        if not url: break\n        html = fetch_sync(url)\n        if html and not sim_dup(html):\n            es.index(index=\"docs\", document={\"url\": url, \"text\": html[:10000]})\n\nif __name__ == \"__main__\":\n    push_urls([\"https://example.com/a\", \"https://example.com/b\"])\n    procs = [mp.Process(target=worker) for _ in range(4)]   # 4 个进程协作\n    for p in procs: p.start()\n    for p in procs: p.join()\n",
          "codeCopyOnly": true
        },
        {
          "id": "a14l3",
          "title": "毕业回顾：站内外延伸与框架选型",
          "icon": "🔭",
          "markdown": "## 毕业回顾：走完还要知道的「活知识」\n\n升阶课把主流知识点讲透了，但有两块**变化快/看具体场景**的内容，没法写进固定课——这里给你「思路地图」，遇到时按图索骥。\n\n### ① 具体站点完整逆向思路\n每个站点的签名/加密都不同，但套路通用：\n1. 抓包定位接口（mitmproxy / DevTools）\n2. 找算签名的函数（XHR 断点 / jadx）\n3. 复现算法（Python hashlib / 看原生实现）\n4. 处理二进制协议（protobuf）和设备绑定\n> 这是「手艺活」：多练几个站，手感就来了。没有一招通吃。\n\n### ⑤ 替代框架选型：PySpider vs Celery\n- **PySpider**：自带 Web 界面的爬虫框架，适合**快速写+可视化监控**单站采集，胜在开箱即用\n- **Celery**：通用**分布式任务队列**，不是爬虫框架，但用来**编排「抓取→清洗→入库」任务流**极稳，胜在和任意爬虫/处理解耦\n> 选型口诀：单站快采要界面→PySpider；要把抓取塞进大任务流水线→Celery。",
          "takeaway": "毕业回顾：①站点逆向套路通用（抓包定位→找签名函数→复现算法→处理二进制/设备绑定），是多练的手艺活；⑤PySpider 带界面快采单站，Celery 编排分布式任务流，按需选型。",
          "figures": [
            {
              "key": "adv_grad_arch",
              "caption": "🔭 毕业回顾：①具体站点逆向思路地图 + ⑤PySpider/Celery 框架选型"
            }
          ],
          "words": [
            {
              "en": "REVERSING",
              "zh": "逆向：还原站点签名/加密逻辑",
              "pron": "rɪˈvɜːrsɪŋ"
            },
            {
              "en": "PYSIDER",
              "zh": "PySpider：带界面的爬虫框架",
              "pron": "paɪ ˈspaɪdər"
            },
            {
              "en": "CELERY",
              "zh": "Celery：分布式任务队列",
              "pron": "ˈsɛləri"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "具体站点逆向的通用套路第一步是？",
              "options": [
                "放弃",
                "抓包定位接口",
                "直接硬猜"
              ],
              "answer": 1,
              "explain": "先定位接口。"
            },
            {
              "type": "fill",
              "question": "PySpider 自带______界面，适合快速单站采集。（填 Web）",
              "answer": "Web",
              "explain": "PySpider 有可视化 Web 界面。"
            },
            {
              "type": "choice",
              "question": "Celery 的定位是？",
              "options": [
                "爬虫框架",
                "通用分布式任务队列(编排任务流)",
                "数据库"
              ],
              "answer": 1,
              "explain": "Celery 编排任务流。"
            },
            {
              "type": "tap",
              "question": "毕业回顾要点（多选）",
              "options": [
                "站点逆向是手艺活多练",
                "PySpider 带界面快采",
                "Celery 编排任务流",
                "一招通吃所有站"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三项；没有一招通吃。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「具体站点逆向」是活知识、没法写死成固定课？",
              "answer": "每个站点的签名算法、加密方式、协议、风控都在不停变，没有通用固定答案；只能给通用套路让你遇到新站能上手，具体实现必须现场逆向。"
            },
            {
              "type": "coding",
              "question": "毕业回顾：站内外延伸与框架选型。写一句你下一步想深入的框架点「标记完成」。",
              "starter": "# 选型口诀：小需求 requests；异步 aiohttp；大型 Scrapy；浏览器 Playwright\nprint('按需求选框架，别盲目堆')",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "挑一个你有权抓的站点，按四步套路试着定位它的接口与签名。",
            "对比 PySpider 和 Celery 的适用场景，写一句选型口诀。",
            "记一句：站点逆向是手艺活，多练出手感。"
          ],
          "color": "#58b368"
        },
        {
          "id": "parent14",
          "title": "家长课程：说明信与工具速览",
          "icon": "💌",
          "markdown": "## 给家长的一封信\n\n亲爱的家长：\n\n这是一套面向孩子的 **Python 爬虫进阶**学习工具。孩子在「爬虫入门」之后，继续在这里学**深水区**——异步高并发、JS 逆向、分布式、存储、App 抓包、部署监控，一直到毕业项目。\n\n### 这套工具怎么用\n- **学生课程**：按章节闯关，每节有讲解、练习、语音朗读和「小光讲一讲」\n- **练习与勋章**：做练习拿勋章，阶段考 / 毕业考检验成果\n- **家长面板**：您可以在这里看到孩子的学习进度与获得的勋章\n- **设置**：可切换语音女声 / 男声、字号等\n\n### 关于「合规」特别说明\n第 13 章专门讲了**法律红线与职业操守**——我们强调「能抓不等于该抓」，只抓公开、授权、不造成损害的数据。希望孩子既长技术，也守底线。\n\n> 陪伴孩子走完这套课，他会拥有一份正经的数据采集能力。有问题随时看家长面板的进度。",
          "takeaway": "给家长的说明：本工具是孩子爬虫进阶课，含讲解/练习/语音/勋章/阶段考，第13章专讲合规底线；家长可看进度面板陪伴学习。",
          "figures": [
            {
              "key": "roadmap",
              "caption": "💌 学习路线地图：入门→进阶→毕业，家长可看进度面板陪伴"
            }
          ],
          "words": [],
          "exercises": [],
          "tasks": [],
          "color": "#58b368",
          "forParent": true
        },
        {
          "id": "parent_install",
          "title": "家长课程：安装 Python（给孩子准备环境）",
          "icon": "🐍",
          "markdown": "## 给孩子装好 Python（家长帮看一眼）\n\n孩子学爬虫，第一步是把 **Python** 装到电脑上。这节教您怎么装，万一孩子卡住您能搭把手。\n\n### 为什么需要装\nPython 是这门课「写代码」用的语言。浏览器只能看网页，写爬虫要在电脑上用 Python 真跑。\n\n### 安装四步\n1. **下载**：打开 python.org，点 Downloads，按系统（Windows / macOS）下安装包\n2. **运行安装包**：双击打开——最重要的，勾选「Add Python to PATH」（这步忘了后面很麻烦）\n3. **安装**：点 Install Now，等进度条走完\n4. **验证**：打开「终端 / 命令提示符」，输入 `python --version`，看到版本号就成功了\n\n### 常见坑\n- 忘勾 Add PATH：重跑安装包，选「Modify」补勾\n- Mac 自带老 Python：不影响，我们用新装的\n- 提示「python 不是命令」：多半是 PATH 没勾上，按上一条处理\n\n> 装好之后，孩子在「学生课程」里就能点「试一试」真跑代码了。您也可以陪他一起验证第一步。",
          "takeaway": "给孩子装 Python：官网下安装包→运行勾 Add Python to PATH→Install→终端 python --version 验证；忘勾 PATH 就重跑 Modify 补勾。装好孩子就能在课里真跑代码。",
          "figures": [
            {
              "key": "adv_python_install",
              "caption": "🐍 安装 Python 四步：下载→勾 Add PATH→安装→验证"
            }
          ],
          "words": [],
          "exercises": [],
          "tasks": [],
          "color": "#3776ab",
          "forParent": true
        }
      ]
    },
    {
      "title": "代理 IP 池与反封禁",
      "icon": "🛡️",
      "color": "#5b8fc4",
      "lessons": [
        {
          "id": "a15l1",
          "title": "为什么需要代理：封 IP 原理",
          "icon": "🚫",
          "markdown": "## 为什么需要代理：IP 会被封\n\n网站靠**来源 IP** 识别「是不是同一个人在狂抓」。同一 IP 短时间发海量请求，风控直接**封 IP**——之后你的请求全被拒。\n\n### 封 IP 原理\n- 服务器记录每个 IP 的请求频率/行为\n- 超阈值（太快/太像机器人）→ 拉黑该 IP\n- 你本地网络就这一个出口 IP，封了=断粮\n\n### 代理干嘛\n代理=**换个出口 IP** 发请求。用一群代理 IP 轮换，让每个 IP 都「看起来像正常用户」。\n\n```python\nimport requests\nproxies = {\"http\": \"http://1.2.3.4:8080\", \"https\": \"http://1.2.3.4:8080\"}\nr = requests.get(url, proxies=proxies)\n```\n> 💡 代理 + Cookie 池（第 7 章）=「IP + 账号」双分散，抗封最强组合。",
          "takeaway": "封 IP 靠来源 IP 的请求频率/行为超限；代理换出口 IP 轮换，让每个 IP 像正常用户。代理+Cookie 池=IP+账号双分散，抗封最强。",
          "figures": [
            {
              "key": "adv_proxy_pool",
              "caption": "🚫 封 IP 原理：同 IP 高频→拉黑；代理换出口 IP 轮换分散"
            }
          ],
          "words": [
            {
              "en": "PROXY",
              "zh": "代理：中转请求的服务器，换出口 IP",
              "pron": "ˈprɑːksi"
            },
            {
              "en": "BAN",
              "zh": "封禁：IP 被拉黑拒绝服务",
              "pron": "bæn"
            },
            {
              "en": "ROTATE",
              "zh": "轮换：多个 IP 轮流用",
              "pron": "ˈroʊteɪt"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "网站主要靠什么识别狂抓？",
              "options": [
                "浏览器颜色",
                "来源 IP 的请求频率/行为",
                "鼠标形状"
              ],
              "answer": 1,
              "explain": "IP 行为是核心。"
            },
            {
              "type": "fill",
              "question": "代理的作用是换个______（出口）IP 发请求。（填 出口/来源）",
              "answer": "出口",
              "explain": "代理改的是出口 IP。"
            },
            {
              "type": "choice",
              "question": "封 IP 后本地会？",
              "options": [
                "更快",
                "断粮(请求被拒)",
                "没事"
              ],
              "answer": 1,
              "explain": "本地就一个出口 IP。"
            },
            {
              "type": "tap",
              "question": "代理的作用（多选）",
              "options": [
                "换出口IP",
                "让每个IP像正常用户",
                "分散请求",
                "提速百倍"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三项；代理不保证提速百倍。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「代理 + Cookie 池」是抗封最强组合？",
              "answer": "风控常同时看 IP 和账号：只换 IP 不换账号仍能关联，只换账号不换 IP 同理；两者都换，每次请求像不同用户在异地访问，关联难度最大。"
            },
            {
              "type": "coding",
              "question": "封 IP 靠来源 IP。proxies 是代理 IP 列表，模拟 6 次请求轮流用不同代理(按下标取模)，打印每次用的代理。",
              "starter": "proxies = ['1.1.1.1', '2.2.2.2', '3.3.3.3']\nfor i in range(6):\n    print('第', i + 1, '次用', proxies[i % len(proxies)])   # TODO",
              "_gen": "coding-ex",
              "expect": "第 6 次用 3.3.3.3"
            }
          ],
          "tasks": [
            "用 requests 加 proxies 访问一个测试接口，看出口 IP 是否变化。",
            "理解为什么单 IP 高频会被封。",
            "记一句：IP+账号双分散。"
          ],
          "color": "#5b8fc4"
        },
        {
          "id": "a15l2",
          "title": "免费 vs 付费代理",
          "icon": "💰",
          "markdown": "## 免费 vs 付费代理\n\n代理 IP 来源两类，天差地别。\n\n### 免费代理\n- 网上公开列表（如各大代理站），**不稳定、慢、易死、常被目标站也封**\n- 适合练手、低频；生产别指望\n### 付费代理\n- 厂商提供**高匿、稳定、海量 IP**（如机房/IPC 代理）\n- 按量/包月，有可用率保障\n- 企业采集首选\n\n### 关键指标\n- **匿名度**：透明/匿名/高匿（高匿不暴露你真实 IP）\n- **可用率**：能用比例\n- **延迟/带宽**\n\n> ⚠️ 易错：免费代理「能用」是少数，别在生产里裸用，否则一半请求失败还查不出原因。",
          "takeaway": "免费代理不稳定易死常被封，只适合练手；付费代理高匿稳定海量，生产首选。看匿名度/可用率/延迟；裸用免费代理一半请求会失败。",
          "figures": [
            {
              "key": "adv_proxy_pool",
              "caption": "💰 免费代理(不稳易死) vs 付费代理(高匿稳定海量)"
            }
          ],
          "words": [
            {
              "en": "ANONYMOUS",
              "zh": "匿名度：是否暴露真实 IP",
              "pron": "əˈnɑːnəməs"
            },
            {
              "en": "PAID",
              "zh": "付费代理：厂商提供稳定 IP",
              "pron": "peɪd"
            },
            {
              "en": "FREE_PROXY",
              "zh": "免费代理：公开列表，质量参差",
              "pron": "friː ˈprɑːksi"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "免费代理的问题是？",
              "options": [
                "超稳超快",
                "不稳定易死常被封",
                "无限量随便用"
              ],
              "answer": 1,
              "explain": "免费代理质量差。"
            },
            {
              "type": "fill",
              "question": "生产首选______代理（填 付费/免费）。",
              "answer": "付费",
              "explain": "生产用付费代理。"
            },
            {
              "type": "choice",
              "question": "关于匿名度，生产该用？",
              "options": [
                "透明(暴露真实IP)",
                "高匿(不暴露)",
                "无所谓"
              ],
              "answer": 1,
              "explain": "高匿才安全。"
            },
            {
              "type": "tap",
              "question": "选代理看指标（多选）",
              "options": [
                "匿名度",
                "可用率",
                "延迟/带宽",
                "只看颜色"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三项；颜色无关。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「生产别裸用免费代理」？",
              "answer": "免费代理大量已死或被目标站标记，裸用会导致近半请求失败、超时、拿到错误响应，且难以排查，采集链路直接不可靠。"
            },
            {
              "type": "coding",
              "question": "免费 vs 付费代理：免费不稳、付费快稳。这是选型权衡，写一句点「标记完成」。",
              "starter": "# 免费：练手；付费：生产\nprint('生产用付费，省心省力')",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "对比同一请求走免费 vs 付费代理的成功率。",
            "理解匿名度三档（透明/匿名/高匿）的区别。",
            "记一句：生产上付费代理。"
          ],
          "color": "#5b8fc4"
        },
        {
          "id": "a15l3",
          "title": "自建代理池：Redis+校验+打分",
          "icon": "🧰",
          "markdown": "## 自建代理池：可用率才是命\n\n买来一堆代理 IP，不能直接用——很多已死。**代理池**=自动管理「获取 → 校验 → 打分 → 分发」。\n\n### 架构\n```python\nimport redis\nr = redis.Redis()\n# 1. 获取：从厂商 API 拉一批 IP 存 Redis\n# 2. 校验：定时用每个 IP 访问测试站，能通才算活\n# 3. 打分：连续成功+1，失败-1，低于阈值剔除\n# 4. 分发：每次随机/按分挑一个可用 IP\ndef get_proxy():\n    return r.zrange(\"proxies\", 0, 0)   # 按分最高的取（示意）\n```\n### 要点\n- 周期性**探活（health check）**，死 IP 及时踢\n- 用**分数**优先挑高质量 IP\n- 和请求失败自动换 IP 联动（下节）\n\n> 💡 代理池不是「存 IP」，是「持续保证手里的 IP 能用」。可用率决定采集能不能跑通。",
          "takeaway": "代理池=获取→校验探活→打分→分发，持续保证 IP 可用；周期探活踢死 IP、按分挑高质量。可用率比数量更决定采集成败。",
          "figures": [
            {
              "key": "adv_proxy_pool",
              "caption": "🧰 代理池：获取→校验探活→打分→分发，持续保证 IP 可用"
            }
          ],
          "words": [
            {
              "en": "PROXY_POOL",
              "zh": "代理池：管理可用代理的系统",
              "pron": "ˈprɑːksi puːl"
            },
            {
              "en": "HEALTH_CHECK",
              "zh": "探活：定时检测 IP 是否可用",
              "pron": "hɛlθ tʃɛk"
            },
            {
              "en": "SCORE",
              "zh": "打分：按成败给 IP 评质量分",
              "pron": "skɔːr"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "代理池的核心目标是？",
              "options": [
                "存很多 IP",
                "持续保证手里的 IP 可用",
                "显示列表"
              ],
              "answer": 1,
              "explain": "可用率才是命。"
            },
            {
              "type": "fill",
              "question": "定时用每个 IP 访问测试站叫______（探活）。（填 校验/探活）",
              "answer": "校验|探活",
              "explain": "周期性探活剔除死 IP。"
            },
            {
              "type": "choice",
              "question": "代理池用分数优先挑？",
              "options": [
                "随机瞎挑",
                "高质量(高分)IP",
                "最差的"
              ],
              "answer": 1,
              "explain": "优先高质量。"
            },
            {
              "type": "tap",
              "question": "代理池环节（多选）",
              "options": [
                "获取IP",
                "定时校验探活",
                "打分排序",
                "分发可用IP"
              ],
              "answer": [
                0,
                1,
                2,
                3
              ],
              "explain": "四环节闭环。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「可用率」比「IP 数量」更决定采集能否跑通？",
              "answer": "1000 个 IP 若只有 10% 可用，实际能用的就 100 个且随时死；而 100 个高可用率 IP 稳定供给，采集反而跑得通。质量（可用率）决定有效产能。"
            },
            {
              "type": "coding",
              "question": "自建代理池用 deque 存可用代理并打分。模拟：把 3 个代理入池，取 3 次(取完补回)打印用到的代理。",
              "starter": "from collections import deque\npool = deque(['p1', 'p2', 'p3'])\nfor _ in range(3):\n    p = pool.popleft()\n    print('用', p)\n    pool.append(p)   # TODO: 用完补回池子",
              "_gen": "coding-ex",
              "expect": "用 p1"
            }
          ],
          "tasks": [
            "写一个最小代理池：拉 IP→定时探活→按分取。",
            "故意注入几个死 IP，看是否被正确剔除。",
            "记一句：可用率比数量重要。"
          ],
          "color": "#5b8fc4"
        },
        {
          "id": "a15l4",
          "title": "封禁识别与换 IP 重试",
          "icon": "🔄",
          "markdown": "## 封禁识别与换 IP 重试\n\n有了代理池，还要会「**识别被封 + 自动换 IP 重试**」，否则采集会卡死在失败里。\n\n### 识别被封的信号\n- 返回 **403/429**（明确的拒绝）\n- 返回**验证码页/登录页**（被拦了）\n- 响应**异常快且内容空**（可能进了蜜罐/拦截页）\n\n### 应对策略\n```python\ndef fetch(url, pool):\n    proxy = pool.get()\n    try:\n        r = requests.get(url, proxies=proxy, timeout=10)\n        if r.status_code in (403, 429) or \"验证码\" in r.text:\n            pool.fail(proxy)          # 标记这个 IP 不行\n            return fetch(url, pool)   # 换 IP 重试\n        return r\n    except Exception:\n        pool.fail(proxy)\n        return fetch(url, pool)\n```\n> 💡 关键：**失败立即换 IP + 标记坏 IP**，别死磕一个被封的。配合退避（第 2 章）更稳。",
          "takeaway": "被封信号：403/429、验证码/登录页、异常快且空的拦截页。策略：识别后立即换 IP + 标记坏 IP 重试，别死磕；配合退避更稳。",
          "figures": [
            {
              "key": "adv_proxy_pool",
              "caption": "🔄 识别封禁(403/验证码)→立即换IP+标记坏IP重试"
            }
          ],
          "words": [
            {
              "en": "DETECT_BAN",
              "zh": "识别封禁：判断请求是否被拦",
              "pron": "dɪˈtɛkt bæn"
            },
            {
              "en": "SWAP_IP",
              "zh": "换 IP：弃用坏 IP 换新的",
              "pron": "swɑːp aɪ piː"
            },
            {
              "en": "HONEYPOT",
              "zh": "蜜罐：诱捕爬虫的假页面",
              "pron": "ˈhʌnipɑːt"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "哪些是被封信号？",
              "options": [
                "返回 200",
                "403/429 或验证码页",
                "正常内容"
              ],
              "answer": 1,
              "explain": "403/429 是明确拒绝。"
            },
            {
              "type": "fill",
              "question": "识别到被封，应______ IP 并重试。（填 换/标记）",
              "answer": "换",
              "explain": "换 IP 才能继续。"
            },
            {
              "type": "choice",
              "question": "关于失败处理，正确的是？",
              "options": [
                "死磕一个被封IP",
                "立即换IP+标记坏IP",
                "放弃全部"
              ],
              "answer": 1,
              "explain": "换 IP 重试最稳。"
            },
            {
              "type": "tap",
              "question": "被封信号（多选）",
              "options": [
                "403/429",
                "验证码页/登录页",
                "响应异常快且空",
                "正常 200"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三项；200 正常。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么「别死磕一个被封的 IP」？",
              "answer": "被封的 IP 在封禁期内请求必败，死磕只会无限重试浪费时间、还可能触发更严风控；立即换 IP 并标记它坏，才能用其他 IP 继续推进。"
            },
            {
              "type": "coding",
              "question": "封禁识别与换 IP 重试：ok 列表模拟每次是否成功(前两次失败)。失败就换下一个代理重试，直到成功，打印最终成功的代理。",
              "starter": "proxies = ['p1', 'p2', 'p3']\nok = [False, False, True]   # 模拟前两次失败\nfor i, succ in enumerate(ok):\n    if succ:\n        print('成功，用的代理', proxies[i])\n        break\n    else:\n        print('被封，换', proxies[i + 1])",
              "_gen": "coding-ex",
              "expect": "成功，用的代理 p3"
            }
          ],
          "tasks": [
            "写一个 fetch 函数：识别 403/验证码就换 IP 重试。",
            "区分「真失败」和「被封」两种信号。",
            "记一句：被封立即换，别死磕。"
          ],
          "color": "#5b8fc4"
        }
      ]
    },
    {
      "title": "WebSocket 实时爬取",
      "icon": "📡",
      "color": "#5aa9e6",
      "lessons": [
        {
          "id": "a16l1",
          "title": "WS 协议基础与抓包",
          "icon": "📡",
          "markdown": "## WebSocket：一条不断开的「双向热线」\n\n普通 HTTP 像**打电话**：你问一句，对方答一句，挂断。问下句得重新拨。\n\nWebSocket 像**开着的 walkietalkie（对讲机）**：一次握手建立长连接后，**服务器能随时主动给你推消息**，不用你再问。这就是「实时」的来源——直播弹幕、股票行情、聊天室都靠它。\n\n### 抓包看 WS\n浏览器 DevTools → Network → 找到 **WS 类型**的请求 → 点 **Frames（帧）** 标签，就能看到服务器推来的每条消息。也可以用 mitmproxy（第 11 章）拦截 WS 流量。\n\n### 一个 WS 连接的生命\n1. **握手**：客户端发个带 `Upgrade: websocket` 的 HTTP 请求\n2. **建立**：服务器同意，连接升级为 WS 长连\n3. **通信**：双方随时发「帧(frame)」，直到任一方关闭\n\n> 💡 易错：WS 不是「更快的 HTTP」，是**另一种协议**。你不能用 requests 抓 WS，得用支持 WS 的库。",
          "takeaway": "WebSocket 是握手后保持的全双工长连接，服务器可主动推数据；实时弹幕/行情靠它。抓包看 DevTools 的 Frames 或 mitmproxy。它≠更快的 HTTP，requests 抓不了。",
          "figures": [
            {
              "key": "adv_ws",
              "caption": "📡 WS：握手后长连，服务器能主动推（行情/弹幕）"
            }
          ],
          "words": [
            {
              "en": "WS",
              "zh": "WebSocket：全双工长连接协议",
              "pron": "ˈdʌbəljuː ˈɛs"
            },
            {
              "en": "HANDSHAKE",
              "zh": "握手：升级协议的那次请求",
              "pron": "ˈhændʃeɪk"
            },
            {
              "en": "FRAME",
              "zh": "帧：WS 里传递的一条消息",
              "pron": "freɪm"
            },
            {
              "en": "DUPLEX",
              "zh": "双工：双方都能发数据",
              "pron": "ˈdjuːplɛks"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "WebSocket 与普通 HTTP 最大区别？",
              "options": [
                "HTTP 更快",
                "WS 握手后全双工长连，服务器可主动推",
                "WS 只能客户端发"
              ],
              "answer": 1,
              "explain": "WS 是双向长连。"
            },
            {
              "type": "fill",
              "question": "WS 连接第一步叫______（升级协议的那次请求）。（填 握手/响应）",
              "answer": "握手",
              "explain": "先握手升级。"
            },
            {
              "type": "choice",
              "question": "看 WS 推送的消息，该用？",
              "options": [
                "看 HTTP 状态码",
                "DevTools→Network→WS→Frames",
                "关掉网络"
              ],
              "answer": 1,
              "explain": "Frames 标签看推送。"
            },
            {
              "type": "tap",
              "question": "WS 连接生命周期（多选）",
              "options": [
                "握手升级",
                "建立长连",
                "双方发帧通信",
                "只客户端能发"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三；WS 双向。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么 requests 抓不了 WebSocket 数据？",
              "answer": "requests 只实现 HTTP 一问一答模型，而 WS 是握手后的全双工长连接，数据由服务器主动推帧；requests 没有维持长连和读帧的能力，必须用 websockets/aiohttp 这类支持 WS 的库。"
            },
            {
              "type": "coding",
              "question": "WS 是长连接双向通信协议。这是协议基础，无 Python 逻辑，看懂点「标记完成」。",
              "starter": "# HTTP: 一问一答，答完断开\n# WS: 握手后一直连着，服务端能主动推\nprint('WS 适合弹幕/行情这类持续推送')",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "用浏览器打开一个直播/行情页，DevTools 里找到 WS 请求并看 Frames。",
            "对比「刷新页面才更新」和「不动就自动更新」两种页面，判断哪个用了 WS。",
            "记一句：WS=对讲机，不是电话。"
          ],
          "color": "#5aa9e6"
        },
        {
          "id": "a16l2",
          "title": "websockets 库异步爬取",
          "icon": "🔌",
          "markdown": "## 用 websockets 库抓实时数据\n\nPython 有专门的 `websockets` 库（也有 `aiohttp` 内置 WS 支持）。核心套路：\n\n```python\nimport asyncio, websockets\n\nasync def listen(url):\n    async with websockets.connect(url) as ws:   # 握手+建连\n        while True:\n            msg = await ws.recv()                # 等服务器推一帧\n            print(\"收到:\", msg)\n            # 想订阅哪只股票？发个帧告诉服务器\n            # await ws.send('{\"sub\": \"BTC\"}')\n\nasyncio.run(listen(\"wss://example.com/stream\"))\n```\n\n### 关键点\n- `websockets.connect(url)` 返回异步上下文管理器，进入即完成**握手**\n- `await ws.recv()` **挂起**等下一帧（又见 asyncio 的 await）\n- `await ws.send(data)` 主动发帧（比如订阅某只股票）\n- 配合 `asyncio` 可以**同时听好几个 WS 流**\n\n> ⚠️ 易错：`ws.recv()` 是**异步**的，必须 `await`；忘了 await 拿到的是协程对象不是消息。还有：WS 地址是 `ws://` 或 `wss://`（加密），不是 `http://`。",
          "takeaway": "websockets.connect 进上下文即握手；await ws.recv() 挂起等帧、await ws.send() 发帧；地址是 ws:// 或 wss://，必须 await。可配合 asyncio 并发多流。",
          "figures": [
            {
              "key": "adv_ws",
              "caption": "🔌 websockets：connect 握手 → recv 等帧 / send 发帧"
            }
          ],
          "words": [
            {
              "en": "CONNECT",
              "zh": "连接：建立 WS 长连",
              "pron": "kəˈnɛkt"
            },
            {
              "en": "RECV",
              "zh": "收帧：接收服务器推来的消息",
              "pron": "rɪˈsiːv"
            },
            {
              "en": "SEND",
              "zh": "发帧：主动发送消息",
              "pron": "sɛnd"
            },
            {
              "en": "WSS",
              "zh": "加密的 WS 地址（wss://）",
              "pron": "ˈdʌbəljuː ˈɛs ˈɛs"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "websockets.connect 进 with 时发生了什么？",
              "options": [
                "啥也没发生",
                "完成握手建立长连",
                "只发普通 HTTP"
              ],
              "answer": 1,
              "explain": "进上下文即握手。"
            },
            {
              "type": "fill",
              "question": "收一帧要写 `await ws.______()`。（填 recv/send）",
              "answer": "recv",
              "explain": "recv 收帧。"
            },
            {
              "type": "choice",
              "question": "WS 的地址协议头是？",
              "options": [
                "http://",
                "ws:// 或 wss://",
                "ftp://"
              ],
              "answer": 1,
              "explain": "WS 用自己的头。"
            },
            {
              "type": "choice",
              "question": "关于 ws.recv()，正确的是？",
              "options": [
                "同步直接返回",
                "必须 await 才拿到消息",
                "不用 await"
              ],
              "answer": 1,
              "explain": "忘 await 拿到协程不是消息。"
            },
            {
              "type": "tap",
              "question": "websockets 爬实时数据要点（多选）",
              "options": [
                "connect 握手",
                "recv 收帧要 await",
                "send 发帧订阅",
                "用 http:// 地址"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三；地址用 ws://。",
              "multi": true
            },
            {
              "type": "open",
              "question": "怎么同时监听多个 WS 流？",
              "answer": "用 asyncio 把多个 listen 协程 gather 起来并发跑，每个协程各自 connect+recv；事件循环在它们之间切换，谁有帧就处理谁，实现多路实时采集。"
            },
            {
              "type": "coding",
              "question": "websockets 库异步爬取。代码需本机跑(asyncio)，看懂点「标记完成」。",
              "starter": "import asyncio, websockets\n\nasync def main():\n    async with websockets.connect('wss://echo') as ws:\n        await ws.send('hi')\n        print(await ws.recv())\n\nasyncio.run(main())",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "写个最小脚本连一个公开 WS 回声服务，recv 打印几帧。",
            "故意漏写 await 看报什么错，体会协程对象。",
            "记一句：WS 地址用 ws://，recv 要 await。"
          ],
          "color": "#5aa9e6"
        },
        {
          "id": "a16l3",
          "title": "实战：行情或直播弹幕",
          "icon": "🎯",
          "markdown": "## 实战：抓行情 / 直播弹幕\n\n理论落地。两类最常见实战：\n\n### A. 行情流（如币价/股价）\n连上 WS → 循环 `recv` 行情帧 → 帧通常是 **JSON** → 解析出价格 → 打印或入库。\n```python\nasync def ticks(url):\n    async with websockets.connect(url) as ws:\n        async for msg in ws:                 # 每来一帧\n            d = json.loads(msg)              # 解析 JSON\n            print(d[\"symbol\"], d[\"price\"])   # 取价格\n```\n\n### B. 直播弹幕\n连上直播 WS → `recv` 弹幕帧 → 过滤掉系统消息 → 收集「哈哈哈」「666」做词频。\n\n### 三个保命细节\n1. **心跳**：有些 WS 要定时发 ping，否则被踢。库一般自动处理，但要知道。\n2. **断线重连**：网络抖一下就断，包一层 `while True: try/except: 重连`。\n3. **别刷太快**：recv 到的数据量可能很大，处理不过来就丢帧或限流。\n\n> 💡 思路：WS 爬取的难点不在「收」，在「稳」——心跳、重连、限流三件套保你不断流。",
          "takeaway": "实战=连WS→recv帧→解析JSON(行情)或过滤(弹幕)→入库/统计。保命三件套：心跳保活、断线重连、处理限流。难点在『稳』不在『收』。",
          "figures": [
            {
              "key": "adv_ws",
              "caption": "🎯 实战：连WS→收帧→解析(行情JSON/弹幕过滤)→限流保稳"
            }
          ],
          "words": [
            {
              "en": "HEARTBEAT",
              "zh": "心跳：定时发 ping 保活",
              "pron": "ˈhɑːrtbiːt"
            },
            {
              "en": "RECONNECT",
              "zh": "重连：断了再建连",
              "pron": "riːkəˈnɛkt"
            },
            {
              "en": "TICK",
              "zh": "行情：一条价格更新",
              "pron": "tɪk"
            },
            {
              "en": "DANMU",
              "zh": "弹幕：直播聊天流",
              "pron": "dàn mù"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "行情 WS 每帧通常是？",
              "options": [
                "图片",
                "JSON 文本",
                "视频"
              ],
              "answer": 1,
              "explain": "行情多为 JSON。"
            },
            {
              "type": "fill",
              "question": "网络抖断后，要______才能继续收。（填 重连/重启电脑）",
              "answer": "重连",
              "explain": "断线重连。"
            },
            {
              "type": "choice",
              "question": "关于心跳(ping)，正确的是？",
              "options": [
                "没用",
                "定期发保活，防止被踢",
                "只在结束时发"
              ],
              "answer": 1,
              "explain": "心跳防被踢。"
            },
            {
              "type": "choice",
              "question": "处理 WS 海量帧时，最好？",
              "options": [
                "不管",
                "限流/丢帧防止处理不过来",
                "全存内存"
              ],
              "answer": 1,
              "explain": "帧太多要限流。"
            },
            {
              "type": "tap",
              "question": "WS 实战保命细节（多选）",
              "options": [
                "心跳保活",
                "断线重连",
                "处理限流",
                "收到就永久阻塞"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么 WS 爬取『难点在稳不在收』？",
              "answer": "recv 收帧本身很简单，但真实网络会抖动断连、服务器会踢 idle 连接、数据量可能远超处理速度；不重连就断流、不心跳就被踢、不限流就崩，所以工程重心在稳定性三件套。"
            },
            {
              "type": "coding",
              "question": "实战：行情或直播弹幕用 WS 持续收。代码需本机跑，看懂点「标记完成」。",
              "starter": "import asyncio, websockets\n\nasync def recv():\n    async with websockets.connect('wss://live') as ws:\n        while True:\n            print('弹幕', await ws.recv())\n\nasyncio.run(recv())",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "找一个公开行情 WS demo，recv 几帧解析出价格打印。",
            "给监听函数加 try/except 重连外壳。",
            "记一句：WS 爬取，稳字当头。"
          ],
          "color": "#5aa9e6"
        }
      ]
    },
    {
      "title": "音视频与 m3u8 下载",
      "icon": "🎬",
      "color": "#cf6f6f",
      "lessons": [
        {
          "id": "a17l1",
          "title": "视频直链与大文件下载",
          "icon": "🎞️",
          "markdown": "## 视频直链与大文件下载\n\n最简单的音视频：网站直接给你一个 `.mp4` 文件链接（**直链**）。下载它就和下载任何文件一样——但视频往往**很大**（几百 MB 到几 GB），不能像小文件那样一股脑读进内存。\n\n### 大文件正确下法\n```python\nimport requests\nurl = \"https://x.com/big.mp4\"\nr = requests.get(url, stream=True)        # 流式，不全读内存\nwith open(\"v.mp4\", \"wb\") as f:\n    for chunk in r.iter_content(1024*1024): # 1MB 一块写\n        f.write(chunk)\n```\n- `stream=True`：别一次性下载，边下边写\n- `iter_content(块大小)`：按块读，内存恒定\n\n### 拿到直链\n直链常藏在**视频标签的 src**、或**网络请求里的 media 类型响应**、或 **m3u8 里**（下节讲）。Playwright 拦截也能拿到。\n\n> ⚠️ 易错：不用 `stream=True` 直接 `r.content` 读大文件，会爆内存；还有注意遵守网站版权，别乱下别人付费内容。",
          "takeaway": "视频直链=.mp4 直接下；大文件用 stream=True + iter_content 分块写，内存恒定不爆。直链藏在 video src/网络 media 响应/m3u8 里。注意版权。",
          "figures": [
            {
              "key": "adv_m3u8",
              "caption": "🎞️ 直链下载：stream=True + iter_content 分块写盘，内存恒定"
            }
          ],
          "words": [
            {
              "en": "DIRECT_LINK",
              "zh": "直链：文件直接 URL",
              "pron": "ˈdaɪrɛkt lɪŋk"
            },
            {
              "en": "STREAM",
              "zh": "流式：边下边写",
              "pron": "striːm"
            },
            {
              "en": "CHUNK",
              "zh": "分块：一块块读",
              "pron": "tʃʌŋk"
            },
            {
              "en": "MEDIA",
              "zh": "媒体：音视频响应",
              "pron": "ˈmiːdiə"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "下大视频文件，正确姿势是？",
              "options": [
                "r.content 全读内存",
                "stream=True+iter_content 分块写",
                "不管直接存"
              ],
              "answer": 1,
              "explain": "分块写不爆内存。"
            },
            {
              "type": "fill",
              "question": "流式下载要设 `requests.get(url, ______=True)`。（填 stream/chunk）",
              "answer": "stream",
              "explain": "stream 才流式。"
            },
            {
              "type": "choice",
              "question": "视频直链常藏在？",
              "options": [
                "网站配色",
                "video 标签 src / 网络 media 响应",
                "CSS 文件"
              ],
              "answer": 1,
              "explain": "直链在媒体响应里。"
            },
            {
              "type": "choice",
              "question": "不用 stream 读几 GB 文件会？",
              "options": [
                "更快",
                "爆内存",
                "没事"
              ],
              "answer": 1,
              "explain": "全读内存会炸。"
            },
            {
              "type": "tap",
              "question": "大文件下载要点（多选）",
              "options": [
                "stream=True",
                "iter_content 分块",
                "一块块写盘",
                "一次性 r.content"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三；别全读。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么大文件必须用流式分块下载？",
              "answer": "视频可达数 GB，一次性读进内存会超出可用 RAM 导致程序崩溃或系统卡死；stream+iter_content 按块读取并立刻落盘，内存占用保持恒定，既稳又能处理任意大文件。"
            },
            {
              "type": "coding",
              "question": "视频直链与大文件下载：文件 1000MB，每块 100MB，算要分几块下载并打印。",
              "starter": "import math\nsize = 1000\nchunk = 100\nblocks = math.ceil(size / chunk)   # TODO\nprint('分', blocks, '块下载')",
              "_gen": "coding-ex",
              "expect": "分 10 块下载"
            }
          ],
          "tasks": [
            "找一个公开 sample mp4 直链，用 stream 分块下到本地。",
            "对比 r.content 和 iter_content 的内存占用差别（概念上）。",
            "记一句：大文件，流式分块。"
          ],
          "color": "#cf6f6f"
        },
        {
          "id": "a17l2",
          "title": "m3u8 解析·分片合并",
          "icon": "🧩",
          "markdown": "## m3u8：视频被切成了一地碎片\n\n很多网站（点播/直播）不直接给 mp4，而是给一个 **`.m3u8`** 文件——它**不是视频本身，是「播放清单」**：里面列着一堆 `.ts` 分片（001.ts、002.ts…）的地址。\n\n### 下载步骤\n1. 下载 m3u8 文本\n2. 解析出所有 `.ts` 分片 URL（有时分片地址要拼上 m3u8 的基址）\n3. 逐个下载 `.ts`\n4. **按顺序合并**成一个 mp4\n\n```python\nimport requests\nm3u8 = requests.get(\"https://x.com/a.m3u8\").text\nts_list = [line for line in m3u8.splitlines()\n           if line and not line.startswith(\"#\")]   # 过滤 # 注释行\n# 逐个下 ts... 然后按顺序合并\n```\n合并可用 `ffmpeg`：`ffmpeg -f concat -i list.txt -c copy out.mp4`（list.txt 写各 ts 路径）。\n\n### 两种 m3u8\n- **点播(VOD)**：分片固定，全下完合并\n- **直播**：分片不断新增，m3u8 在变，要持续追\n\n> ⚠️ 易错：①分片地址可能是**相对路径**，要拼基址；②**顺序错了**画面就乱；③`#` 开头是注释/指令，不是分片。",
          "takeaway": "m3u8 是分片清单不是视频；流程：下m3u8→解析出.ts分片URL→逐个下→按顺序合并(ffmpeg)。注意相对路径拼基址、顺序不能乱、#开头是注释非分片。点播全下、直播追更。",
          "figures": [
            {
              "key": "adv_m3u8",
              "caption": "🧩 m3u8=分片清单：下清单→解析.ts→逐个下→按序合并"
            }
          ],
          "words": [
            {
              "en": "M3U8",
              "zh": "分片播放清单",
              "pron": "ɛm ˈθri ˈjuː eɪt"
            },
            {
              "en": "TS",
              "zh": "分片：一段视频",
              "pron": "tiː ˈɛs"
            },
            {
              "en": "CONCAT",
              "zh": "合并：拼成整片",
              "pron": "kɒnˈkæt"
            },
            {
              "en": "VOD",
              "zh": "点播：固定分片可全下",
              "pron": "viː oʊ diː"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": ".m3u8 文件本质是？",
              "options": [
                "视频本身",
                "分片播放清单",
                "字幕"
              ],
              "answer": 1,
              "explain": "m3u8 是清单。"
            },
            {
              "type": "fill",
              "question": "合并分片常用______（填 ffmpeg/word）。",
              "answer": "ffmpeg",
              "explain": "ffmpeg 合并。"
            },
            {
              "type": "choice",
              "question": "解析 m3u8 时，`#` 开头的行是？",
              "options": [
                "分片",
                "注释/指令，要过滤",
                "视频数据"
              ],
              "answer": 1,
              "explain": "# 是注释。"
            },
            {
              "type": "choice",
              "question": "分片地址是相对路径时，要？",
              "options": [
                "忽略",
                "拼上 m3u8 的基址",
                "随便下"
              ],
              "answer": 1,
              "explain": "相对路径拼基址。"
            },
            {
              "type": "tap",
              "question": "m3u8 下载流程（多选）",
              "options": [
                "下 m3u8",
                "解析 .ts 分片",
                "逐个下载",
                "按顺序合并"
              ],
              "answer": [
                0,
                1,
                2,
                3
              ],
              "explain": "四步全对。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么分片『顺序错了画面就乱』？",
              "answer": "视频按时间轴连续编码，ts 分片是按时序切割的，解码器依赖前一片段的状态；顺序错乱会导致解码错位、花屏或卡顿，所以合并必须严格按 m3u8 里的先后次序拼接。"
            },
            {
              "type": "coding",
              "question": "m3u8 里列了 8 个 .ts 分片。按顺序把它们拼成完整文件名列表(seg_0.ts ... seg_7.ts)打印。",
              "starter": "n = 8\nsegs = []\nfor i in range(n):\n    segs.append('seg_' + str(i) + '.ts')   # TODO\nprint(segs)",
              "_gen": "coding-ex",
              "expect": "['seg_0.ts'"
            }
          ],
          "tasks": [
            "找一个公开 m3u8 示例，解析出它的 .ts 分片数量。",
            "用文本编辑器模拟拼 list.txt，理解合并顺序。",
            "记一句：m3u8 是清单，分片要按序合并。"
          ],
          "color": "#cf6f6f"
        },
        {
          "id": "a17l3",
          "title": "断点续传与并发下载",
          "icon": "⏩",
          "markdown": "## 断点续传与并发下载\n\n下载大文件/成百 ts 分片时，两个工程技巧让你不掉链子：\n\n### 断点续传（Range）\n服务器支持 `Range` 请求时，可以**只下某一段字节**：\n```python\nheaders = {\"Range\": \"bytes=0-1023\"}      # 只要前 1KB\nr = requests.get(url, headers=headers)\n```\n用途：①网络断了，从**已下到的字节**继续，不全重来；②配合已落盘大小判断进度。\n\n### 并发下载（线程池/协程）\n成百个 ts 分片，一个一个下太慢。用线程池并行：\n```python\nfrom concurrent.futures import ThreadPoolExecutor\nwith ThreadPoolExecutor(8) as ex:        # 8 个 worker 并行\n    ex.map(download_one, ts_list)        # 并发下所有分片\n```\n> ⚠️ 并发数别太猛，不然把自己带宽打满或被封。\n\n### 组合拳\n先并发下各分片（带 Range 续传兜底）→ 再按序合并 → 断点续传保证单文件也不重来。\n\n> 💡 思路：下载的成熟方案常常是「并发提速 + 续传保底」，两者配合才稳。",
          "takeaway": "断点续传靠 Range 请求只下某段字节，断网从已下处续；并发下载用线程池/协程并行下多个分片提速（别太猛）。组合：并发下分片+Range续传兜底+按序合并。",
          "figures": [
            {
              "key": "adv_m3u8",
              "caption": "⏩ 续传(Range)+并发(线程池)：提速又保底"
            }
          ],
          "words": [
            {
              "en": "RANGE",
              "zh": "范围请求：续传关键",
              "pron": "reɪndʒ"
            },
            {
              "en": "RESUME",
              "zh": "续传：断点继续",
              "pron": "rɪˈzjuːm"
            },
            {
              "en": "CONCURRENT",
              "zh": "并发：并行下载",
              "pron": "kənˈkʌrənt"
            },
            {
              "en": "THREAD_POOL",
              "zh": "线程池：并行 worker",
              "pron": "θrɛd puːl"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "断点续传靠 HTTP 的哪个机制？",
              "options": [
                "Cookie",
                "Range 范围请求",
                "UA"
              ],
              "answer": 1,
              "explain": "Range 指定续传起点。"
            },
            {
              "type": "fill",
              "question": "断点续传用 `Range: bytes=已下字节-` 表示从此处一直下到______。（填 末尾/开头）",
              "answer": "末尾",
              "explain": "省略末尾=下到完。"
            },
            {
              "type": "choice",
              "question": "并发下多个 ts 分片，常用？",
              "options": [
                "单线程一个个等",
                "线程池/协程并行",
                "不下载"
              ],
              "answer": 1,
              "explain": "池化并行提速。"
            },
            {
              "type": "choice",
              "question": "并发数设太大可能？",
              "options": [
                "更快无代价",
                "带宽打满或被封",
                "没事"
              ],
              "answer": 1,
              "explain": "太猛有反效果。"
            },
            {
              "type": "tap",
              "question": "下载加速/保底手段（多选）",
              "options": [
                "Range 续传",
                "线程池并发",
                "按序合并",
                "一次性全读"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么『并发提速+续传保底』是好组合？",
              "answer": "并发用多线程/协程同时下多个分片大幅缩短总时长；续传保证任一分片因网络中断时只需补下剩余字节而非重头来，二者结合既快又在异常时零浪费，工程上最稳。"
            },
            {
              "type": "coding",
              "question": "断点续传：已下载 400MB，文件共 1000MB，每块 100MB。算出「从哪个块继续下」和「还剩几块」。",
              "starter": "total = 1000\ndone = 400\nchunk = 100\nnext_block = done // chunk   # TODO\nleft = total // chunk - next_block\nprint('从块', next_block, '继续，还剩', left, '块')",
              "_gen": "coding-ex",
              "expect": "从块 4 继续"
            }
          ],
          "tasks": [
            "写个带 Range 的小函数，断网后能从中断字节续下。",
            "用线程池并发下 5 个示例分片计时对比串行。",
            "记一句：并发提速，续传保底。"
          ],
          "color": "#cf6f6f"
        },
        {
          "id": "exam4",
          "title": "阶段考④：部署·合规·代理·WS·音视频",
          "icon": "📝",
          "type": "exam",
          "color": "#e0922f",
          "markdown": "## 阶段考④：部署 · 合规 · 代理 · WebSocket · 音视频\n\n覆盖 **调度·部署·监控 / 合规深水区 / 代理 IP 池与反封禁 / WebSocket 实时爬取 / 音视频与 m3u8 下载** 五章。\n\n**规则**：8 题，首次正确率 ≥ 80% 过关，得「阶段考④过关」勋章，可重复挑战。\n\n从「能跑」到「稳跑、合法跑、什么都能跑」，这一考收尾工程化。",
          "takeaway": "阶段考④过关 = 你会定时调度与断点续爬、用 Docker/Scrapyd 部署、守住 PIPL 合规红线、用代理池抗封、用 WebSocket 抓实时、拆 m3u8 下音视频。工程闭环了。",
          "words": [],
          "tasks": [],
          "exercises": [
            {
              "type": "choice",
              "question": "APScheduler/cron 的作用是？",
              "options": [
                "画界面",
                "定时自动跑爬虫任务",
                "写代码"
              ],
              "answer": 1,
              "explain": "定时调度，到点自跑。"
            },
            {
              "type": "choice",
              "question": "断点续爬指？",
              "options": [
                "从头再爬",
                "记录进度，中断后从断点继续而非全重来",
                "不存进度"
              ],
              "answer": 1,
              "explain": "续爬=接着上次处跑。"
            },
            {
              "type": "choice",
              "question": "Docker 容器化部署爬虫的好处是？",
              "options": [
                "更慢",
                "环境一致、随处可跑、隔离依赖",
                "占更多电"
              ],
              "answer": 1,
              "explain": "容器打包环境，到哪都能跑。"
            },
            {
              "type": "choice",
              "question": "《个人信息保护法》对爬虫的核心约束是？",
              "options": [
                "随便抓",
                "未经同意不得非法收集/出售个人信息",
                "只抓公开的"
              ],
              "answer": 1,
              "explain": "PIPL 管的是个人信息的收集与处理。"
            },
            {
              "type": "choice",
              "question": "合规自检清单里，「爬前先查」应优先看？",
              "options": [
                "网站配色",
                "robots.txt + 服务条款 + 数据是否涉个人信息",
                "服务器位置"
              ],
              "answer": 1,
              "explain": "先看 robots/条款/是否涉隐私。"
            },
            {
              "type": "choice",
              "question": "网站封 IP 主要看？",
              "options": [
                "浏览器主题",
                "来源 IP 的请求频率/行为是否异常",
                "鼠标"
              ],
              "answer": 1,
              "explain": "IP 行为超限就拉黑。"
            },
            {
              "type": "choice",
              "question": "代理池的核心目标是？",
              "options": [
                "存很多 IP",
                "持续保证手里的 IP 可用（可用率）",
                "好看"
              ],
              "answer": 1,
              "explain": "可用率比数量重要。"
            },
            {
              "type": "choice",
              "question": "WebSocket 与普通 HTTP 请求的最大区别是？",
              "options": [
                "更慢",
                "全双工长连接，服务器可主动推数据",
                "只能 GET"
              ],
              "answer": 1,
              "explain": "WS 是双向长连接。"
            },
            {
              "type": "choice",
              "question": "m3u8 视频下载的正确流程是？",
              "options": [
                "直接下 m3u8 文件当视频",
                "解析 m3u8 拿到分片列表→逐个下载→合并",
                "不管分片"
              ],
              "answer": 1,
              "explain": "m3u8 是播放列表，要下分片再合并。"
            },
            {
              "type": "choice",
              "question": "大文件下载做「断点续传」靠？",
              "options": [
                "重新下",
                "Range 请求从断点字节续传",
                "换网络"
              ],
              "answer": 1,
              "explain": "Range 头指定续传起点。"
            }
          ]
        }
      ]
    },
    {
      "title": "前沿补充",
      "icon": "🚀",
      "color": "#8e7bd6",
      "lessons": [
        {
          "id": "a18l1",
          "title": "深度学习自训验证码识别",
          "icon": "🧠",
          "markdown": "## 前沿①：自己训练 CNN 认验证码\n\n第 7 章的 ddddocr 能识别**常见简单**验证码，但遇到**强畸变、自定义字体、粘连**的验证码就歇菜。这时可以**自己训练模型**。\n\n### 思路（不是手把手，是路线图）\n1. **收集样本**：把验证码图片存下来（几千张起）\n2. **人工标注**：告诉模型每张图上的字是啥（最累的一步）\n3. **训练 CNN**：用 PyTorch/TensorFlow 搭个卷积网络，让它从像素学「这张图→这几个字」\n4. **推理**：训练好后，新验证码丢进去直接出文字\n\n更强的是**目标检测（如 YOLO）**：验证码字符是分开的，检测出每个字符位置再分别认，比整图硬认更准。\n\n### 现实提醒\n- 自己训**成本高**（标注几小时起），只对**量大且 ddddocr 搞不定的**才划算\n- 这涉及「对抗验证码」，请只用在**你有权处理的站点/授权测试**，别碰别人付费墙\n\n> 💡 思路：ddddocr 是「通用钥匙」，自训 CNN 是「配你家的专属钥匙」。",
          "takeaway": "强畸变验证码 ddddocr 搞不定时可自训 CNN：收集样本→人工标注→训练卷积网络→推理出字；字符分离用目标检测(YOLO)更准。成本高，只对量大且授权的才划算。自训=专属钥匙。",
          "figures": [
            {
              "key": "adv_cnn_captcha",
              "caption": "🧠 自训 CNN：收集样本→人工标注→训练→推理出字（专属钥匙）"
            }
          ],
          "words": [
            {
              "en": "CNN",
              "zh": "卷积神经网络：学图像特征",
              "pron": "siː ɛn ɛn"
            },
            {
              "en": "LABEL",
              "zh": "标注：告诉模型答案",
              "pron": "ˈleɪbəl"
            },
            {
              "en": "YOLO",
              "zh": "目标检测：定位每个字符",
              "pron": "ˈjoʊloʊ"
            },
            {
              "en": "INFERENCE",
              "zh": "推理：模型预测输出",
              "pron": "ˈɪnfərəns"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "ddddocr 识别不了哪种验证码？",
              "options": [
                "标准数字",
                "强畸变/自定义字体/粘连",
                "简单英文"
              ],
              "answer": 1,
              "explain": "强畸变它歇菜。"
            },
            {
              "type": "fill",
              "question": "自训模型前，最需要人力的一步是______（告诉模型每张图答案是啥）。（填 标注/删除）",
              "answer": "标注",
              "explain": "标注最累最关键。"
            },
            {
              "type": "choice",
              "question": "验证码字符分开时，哪种更准？",
              "options": [
                "整图硬认",
                "目标检测先定位每个字符再认",
                "不管"
              ],
              "answer": 1,
              "explain": "检测+分认更准。"
            },
            {
              "type": "choice",
              "question": "自训 CNN 的成本主要来自？",
              "options": [
                "显卡太贵",
                "收集+人工标注样本耗时",
                "代码难写"
              ],
              "answer": 1,
              "explain": "标注是成本大头。"
            },
            {
              "type": "tap",
              "question": "自训验证码识别流程（多选）",
              "options": [
                "收集样本",
                "人工标注",
                "训练 CNN",
                "推理出字"
              ],
              "answer": [
                0,
                1,
                2,
                3
              ],
              "explain": "四步全流程。",
              "multi": true
            },
            {
              "type": "open",
              "question": "什么时候才值得自己训练验证码模型，而不是用 ddddocr？",
              "answer": "当验证码量大、且 ddddocr 等通用工具识别率过低（强畸变/自定义字体/粘连）以至于成为瓶颈，且你有合法授权处理该站点时才划算；自训要投入收集与标注成本，小批量用通用工具更经济。"
            },
            {
              "type": "coding",
              "question": "深度学习自训验证码识别：用标注数据训练模型。代码需本机跑(依赖 torch)，看懂点「标记完成」。",
              "starter": "# 伪代码：\n# model = CNN(); model.fit(images, labels)\nprint('标注越多，模型越准')",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "了解 CNN 四步路线图（收集→标注→训练→推理），不必真训。",
            "区分「通用钥匙 ddddocr」和「专属钥匙自训」的适用场景。",
            "记一句：自训是专属钥匙，成本高。"
          ],
          "color": "#8e7bd6"
        },
        {
          "id": "a18l2",
          "title": "浏览器指纹对抗进阶",
          "icon": "🎨",
          "markdown": "## 前沿②：浏览器指纹对抗进阶\n\n第 4 章讲过 Playwright stealth 隐藏基础指纹。进阶玩家要懂**更隐蔽的指纹**：\n\n### Canvas / WebGL / Audio 指纹\n浏览器画同一幅图（Canvas）或用 WebGL/GPU 渲染，不同**显卡/驱动/系统**算出来的像素**有肉眼看不出的微差**。站点把这幅图哈希成一个**「指纹」**，就能跨会话认出「还是你这台机器」。\n\n- **Canvas 指纹**：`canvas.toDataURL()` 渲染结果哈希\n- **WebGL 指纹**：GPU 型号/驱动信息\n- **Audio 指纹**：音频处理微差\n\n### 对抗思路（伪造）\n既然指纹来自「渲染微差」，就**故意扰动渲染参数**，让每次/每实例的指纹不一样或不稳定：\n- 注入 JS 改 `toDataURL` 返回值加随机噪声\n- 改 WebGL 返回的 GPU 字符串\n- 用 stealth 插件的「指纹随机化」\n\n> ⚠️ 提醒：指纹对抗是**攻防前沿**，站点也在升级。这是「思路课」，真实对抗请合规、授权范围内。",
          "takeaway": "进阶指纹：Canvas/WebGL/Audio 因显卡/驱动微差生成唯一哈希指纹，跨会话识别你。对抗=故意扰动渲染参数(改toDataURL/WebGL字符串/随机化)让指纹不稳。属攻防前沿，须合规授权。",
          "figures": [
            {
              "key": "adv_canvas_fp",
              "caption": "🎨 指纹对抗：扰动 Canvas/WebGL/Audio 渲染→指纹不稳"
            }
          ],
          "words": [
            {
              "en": "CANVAS_FP",
              "zh": "Canvas 指纹：渲染微差哈希",
              "pron": "ˈkænvəs fɪŋɡərprɪnt"
            },
            {
              "en": "WEBGL",
              "zh": "WebGL：暴露 GPU 渲染信息",
              "pron": "ˈwɛb dʒiː ɛl"
            },
            {
              "en": "AUDIO_FP",
              "zh": "Audio 指纹：音频管线微差",
              "pron": "ˈɔːdiəʊ fɪŋɡərprɪnt"
            },
            {
              "en": "SPOOF",
              "zh": "伪造：扰动参数骗过追踪",
              "pron": "spuːf"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "Canvas 指纹来自？",
              "options": [
                "屏幕大小",
                "同图画在不同显卡上渲染的微差哈希",
                "鼠标"
              ],
              "answer": 1,
              "explain": "微差哈希成指纹。"
            },
            {
              "type": "fill",
              "question": "让指纹每次不同，可______渲染参数（加噪声/随机化）。（填 扰动/固定）",
              "answer": "扰动",
              "explain": "扰动让指纹不稳。"
            },
            {
              "type": "choice",
              "question": "WebGL 指纹暴露的是？",
              "options": [
                "CPU 型号",
                "GPU/驱动信息",
                "硬盘"
              ],
              "answer": 1,
              "explain": "WebGL 露 GPU。"
            },
            {
              "type": "choice",
              "question": "Audio 指纹依据的是？",
              "options": [
                "音量",
                "音频处理管线微差",
                "网速"
              ],
              "answer": 1,
              "explain": "音频管线微差。"
            },
            {
              "type": "tap",
              "question": "进阶浏览器指纹类型（多选）",
              "options": [
                "Canvas",
                "WebGL",
                "Audio",
                "屏幕分辨率"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三属渲染微差指纹。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么『扰动渲染参数』能对抗指纹追踪？",
              "answer": "指纹的本质是渲染结果(像素/音频)的哈希，依赖本机显卡驱动等微差；若注入代码给 toDataURL/WebGL 返回值加可控随机噪声或改写 GPU 字符串，每次哈希就不同，站点无法用稳定指纹跨会话锁定同一机器。"
            },
            {
              "type": "coding",
              "question": "浏览器指纹对抗进阶：收集 canvas/webgl 等特征生成指纹。代码需本机跑，看懂点「标记完成」。",
              "starter": "# 思路：\n# 1) 读 canvas 渲染 hash\n# 2) 读 webgl 厂商\n# 3) 拼成指纹字符串\nprint('指纹越独特，越容易被盯上')",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "理解 Canvas/WebGL/Audio 三种指纹的生成原理。",
            "想清楚「扰动参数」为何能让指纹失效。",
            "记一句：指纹来自微差，扰动即对抗。"
          ],
          "color": "#8e7bd6"
        },
        {
          "id": "a18l3",
          "title": "大模型(LLM)辅助爬虫",
          "icon": "🤖",
          "markdown": "## 前沿③：让大模型帮你写爬虫\n\nLLM（如 GPT 类）能当你的「爬虫副驾」，干三件爽事：\n\n### 1. 自动生成选择器\n把一段 HTML 贴给 LLM：「帮我对这个结构写出取标题和价格的 XPath/CSS」。它秒出，比你肉眼找标签快。\n\n### 2. 智能抽取规则\n给 LLM 网页 + 「我要的字段」，它直接产出**抽取逻辑**（甚至代码），特别适合**结构不规整**的页面。\n\n### 3. 写/改爬虫代码\n「用 Playwright 写个登录后抓订单的脚本」——LLM 能出初稿，你改改就能跑。\n\n### 必须人把关\n- LLM **会瞎编**选择器/字段名，跑之前**一定验证**\n- 敏感站点别把**隐私数据**喂给外部 LLM\n- 它是「加速器」不是「自动驾驶」\n\n> 💡 思路：LLM 把「找标签→写规则」的重复劳动压缩到一句话，但**最终正确性由你拍板**。",
          "takeaway": "LLM 辅助爬虫三件事：自动生成 XPath/CSS 选择器、智能抽取不规整页面的字段、写/改爬虫代码初稿。关键：LLM 会瞎编，必须人验证；敏感数据别喂外部模型；它是加速器不是自动驾驶。",
          "figures": [
            {
              "key": "adv_llm_selector",
              "caption": "🤖 LLM 副驾：给 HTML→出选择器/抽取规则/代码，人把关"
            }
          ],
          "words": [
            {
              "en": "LLM",
              "zh": "大模型：生成文本/代码",
              "pron": "ɛl ɛl ɛm"
            },
            {
              "en": "SELECTOR",
              "zh": "选择器：XPath/CSS 定位",
              "pron": "sɪˈlɛktər"
            },
            {
              "en": "EXTRACT",
              "zh": "抽取：取出目标字段",
              "pron": "ˈɛkstrækt"
            },
            {
              "en": "COPILOT",
              "zh": "副驾：辅助而非替代",
              "pron": "ˈkoʊpaɪlət"
            }
          ],
          "exercises": [
            {
              "type": "choice",
              "question": "LLM 最适合帮爬虫做？",
              "options": [
                "替代你决策",
                "生成选择器/抽取规则/代码初稿",
                "关掉电脑"
              ],
              "answer": 1,
              "explain": "LLM 出初稿。"
            },
            {
              "type": "fill",
              "question": "LLM 出的选择器，上线前必须______（它可能会瞎编）。（填 验证/直接信）",
              "answer": "验证",
              "explain": "必验证防瞎编。"
            },
            {
              "type": "choice",
              "question": "把含用户隐私的网页喂给外部 LLM，风险是？",
              "options": [
                "更快",
                "隐私泄露",
                "没事"
              ],
              "answer": 1,
              "explain": "隐私别外传。"
            },
            {
              "type": "choice",
              "question": "LLM 在爬虫里的定位是？",
              "options": [
                "自动驾驶",
                "加速器/副驾，人把关",
                "完全不可信"
              ],
              "answer": 1,
              "explain": "副驾，人拍板。"
            },
            {
              "type": "tap",
              "question": "LLM 辅助爬虫能干的（多选）",
              "options": [
                "生成选择器",
                "智能抽取字段",
                "写代码初稿",
                "绝对正确无需验"
              ],
              "answer": [
                0,
                1,
                2
              ],
              "explain": "前三；需人验。",
              "multi": true
            },
            {
              "type": "open",
              "question": "为什么说 LLM 是『加速器』不是『自动驾驶』？",
              "answer": "LLM 能快速产出选择器、抽取规则和代码初稿，把重复劳动压缩到一句话；但它会幻觉出不存在的字段或错误选择器，且可能泄露隐私，正确性必须人验证拍板，所以不能脱离人工直接全自动交付。"
            },
            {
              "type": "coding",
              "question": "大模型(LLM)辅助爬虫：让它读页面写解析 XPath。这是用法思路，写一句点「标记完成」。",
              "starter": "# 提示词：把这段 HTML 里商品价格所在的 XPath 写出来\nprint('LLM 写 XPath/正则，人审再上线')",
              "_gen": "coding-ex"
            }
          ],
          "tasks": [
            "用 LLM 对一段示例 HTML 生成取标题的 XPath，亲手验证对错。",
            "体会「LLM 出初稿+人改」比纯手写快在哪。",
            "记一句：LLM 是副驾，你握方向盘。"
          ],
          "color": "#8e7bd6"
        },
        {
          "id": "exam5",
          "title": "毕业考：爬虫升阶全程通关",
          "icon": "👑",
          "type": "exam",
          "color": "#e0922f",
          "markdown": "## 毕业考：爬虫升阶全程通关\n\n覆盖 **全部 18 章 + 毕业项目 A（高并发异步采集）/ B（分布式 + ES 入库）** 的综合大考。\n\n**规则**：10 题，首次正确率 ≥ 80%（至少 8 题首次即对）才能过关，获得「毕业考过关」勋章 + 通关「Python 爬虫大师」👑。没过回去复习重做，不限次数。\n\n走到这，你已经从「会写 requests」长成了「能设计整套工程化爬虫系统」的人。最后一考，拿出真本事！",
          "takeaway": "毕业考过关 = 你贯通了异步/JS逆向/字体OCR/验证码/Scrapy/分布式/存储/App/部署/合规/代理/WS/音视频/前沿，且两个毕业项目能落地。你已是 Python 爬虫大师👑。",
          "words": [],
          "tasks": [],
          "exercises": [
            {
              "type": "choice",
              "question": "设计高并发异步采集系统，核心三件套是？",
              "options": [
                "多线程+sleep",
                "asyncio 事件循环 + aiohttp 并发 + 信号量限流",
                "单线程"
              ],
              "answer": 1,
              "explain": "异步并发+限流=高并发不封。"
            },
            {
              "type": "choice",
              "question": "毕业项目 B（分布式+ES 入库）的灵魂是？",
              "options": [
                "单机 for 循环",
                "Redis 中央队列分发 + ES 建索引检索",
                "只存 txt"
              ],
              "answer": 1,
              "explain": "中央调度+检索入库=分布式可查。"
            },
            {
              "type": "choice",
              "question": "面对一个「数据藏在接口里、页面是空壳」的站点，首选？",
              "options": [
                "硬解析 DOM",
                "Playwright 拦截网络请求拿真实 API",
                "放弃"
              ],
              "answer": 1,
              "explain": "截接口拿数据最快。"
            },
            {
              "type": "choice",
              "question": "前端参数被 webpack 打包混淆，逆向时应？",
              "options": [
                "重写网站",
                "定位打包后的签名函数、扣出来或复现算法",
                "猜参数"
              ],
              "answer": 1,
              "explain": "webpack 只是打包，函数还在，扣出来。"
            },
            {
              "type": "choice",
              "question": "字体反爬 + OCR 混合时，正确拆解顺序是？",
              "options": [
                "直接 OCR 整页",
                "先用 fontTools 还原字体映射、再对残余图片 OCR",
                "忽略字体"
              ],
              "answer": 1,
              "explain": "字体映射先还原，OCR 兜底。"
            },
            {
              "type": "choice",
              "question": "大规模去重，哪组合最省内存又够用？",
              "options": [
                "全量 set 存原文",
                "布隆过滤器(强去重) + SimHash(近似去重) 组合",
                "不去做重"
              ],
              "answer": 1,
              "explain": "布隆+SimHash 组合拳。"
            },
            {
              "type": "choice",
              "question": "爬取的合规底线是？",
              "options": [
                "能抓就抓",
                "不非法收集/出售个人信息，尊重 robots 与条款",
                "看心情"
              ],
              "answer": 1,
              "explain": "合规是不可逾越的红线。"
            },
            {
              "type": "choice",
              "question": "代理池 + Cookie 池组合的价值是？",
              "options": [
                "更慢",
                "IP + 账号双分散，抗封最强",
                "没用"
              ],
              "answer": 1,
              "explain": "双池=双分散抗封。"
            },
            {
              "type": "choice",
              "question": "用 WebSocket 抓直播弹幕，关键是？",
              "options": [
                "轮询 HTTP",
                "建立长连接监听服务端推送的消息帧",
                "关掉网络"
              ],
              "answer": 1,
              "explain": "WS 监听推送帧。"
            },
            {
              "type": "choice",
              "question": "爬虫工程师职业路径上，最重要的长期能力是？",
              "options": [
                "背下所有库",
                "持续学习逆向/反爬对抗 + 工程化 + 合规意识",
                "只写脚本"
              ],
              "answer": 1,
              "explain": "对抗+工程+合规，三位一体。"
            }
          ]
        }
      ]
    }
  ]
};
