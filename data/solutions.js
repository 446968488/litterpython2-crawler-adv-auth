// 编程题参考答案：仅「能自动判分」的题在此给出；标记完成的题回退用 ex.starter。
// 用 String.raw 保留代码里的反斜杠与换行，避免转义错误。
window.CODING_SOLUTIONS = {
  "a1l1": String.raw`per = 2
n = 5
seq = per * n        # 顺序：每个都跑完才跑下一个
con = per            # 并发：5 个一起跑，总耗时≈单个
print('顺序', seq, '秒；并发', con, '秒')`,

  "a1l4": String.raw`import math
n = 10
sem = 3
waves = math.ceil(n / sem)   # 向上取整
print('需要', waves, '批')`,

  "a2l3": String.raw`import re
htmls = ['<ul><li>苹果</li><li>香蕉</li></ul>', '<ul><li>橙子</li><li>西瓜</li></ul>']
all_items = []
for h in htmls:
    all_items.extend(re.findall(r'<li>(.*?)</li>', h))
print(all_items)`,

  "a2l4": String.raw`delays = []
for i in range(1, 5):
    delays.append(2 ** i)   # 第 i 次等 2**i 秒
print(delays)`,

  "a3l1": String.raw`import re
sample = '<span class="price">￥12</span><span class="price">￥35</span>'
prices = re.findall(r'class="price">(￥\d+)', sample)
print(prices)`,

  "a3l2": String.raw`import re
html = '<a href="http://a.com">首页</a><a href="http://b.com">新闻</a>'
pairs = re.findall(r'<a href="(.*?)">(.*?)</a>', html)
print(pairs)`,

  "a3l3": String.raw`prices = list(range(1, 1001))
by_lc = [p for p in prices if p > 100]
by_loop = []
for p in prices:
    if p > 100:
        by_loop.append(p)
print('推导', len(by_lc), '循环', len(by_loop))`,

  "a3l4": String.raw`import re
doc = '<h2>第一章</h2><p>正文</p><h2>第二章</h2>'
titles = re.findall(r'<h2>(.*?)</h2>', doc)
print(titles)`,

  "a4l4": String.raw`cookies = {'sessionid': 'abc123', 'token': 'xyz'}
header = '; '.join(k + '=' + v for k, v in cookies.items())
print(header)`,

  "a5l3": String.raw`import hashlib
s = 'hello'
h = hashlib.md5(s.encode('utf-8')).hexdigest()
print('md5前10位', h[:10])`,

  "a6l1": String.raw`m = {'G': '爬', 'H': '虫', 'K': '网'}
coded = 'G H K'
decoded = ''.join(m.get(c, c) for c in coded.split())
print('解码后:', decoded)`,

  "a6l4": String.raw`cell = 20
per_row = 5
idx = 3
row = (idx - 1) // per_row
col = (idx - 1) % per_row
x = col * cell
y = row * cell
print('第', idx, '个小图坐标', x, y)`,

  "a7l2": String.raw`track = []
for i in range(10):
    t = i / 9.0
    pos = t * t * (3 - 2 * t) * 100   # 平滑曲线：先慢后快再慢
    track.append(round(pos, 1))
print(track)`,

  "a7l4": String.raw`cookies = ['c1', 'c2', 'c3', 'c4']
used = []
for i in range(3):
    used.append(cookies[i % len(cookies)])   # 轮流取
print('依次用', used)`,

  "a8l4": String.raw`records = [{'id': 1, 'name': ' 张三 '}, {'id': 2, 'name': '李四'}, {'id': 1, 'name': ' 张三 '}]
seen = set()
clean = []
for r in records:
    name = r['name'].strip()
    if r['id'] in seen:
        continue
    seen.add(r['id'])
    clean.append({'id': r['id'], 'name': name})
print('清洗后保留', len(clean), '条')`,

  "a9l1": String.raw`urls = ['a', 'b', 'a', 'c', 'b', 'd']
seen = set()
uniq = []
for u in urls:
    if u not in seen:
        seen.add(u)
        uniq.append(u)
print('去重后', len(uniq), uniq)`,

  "a9l2": String.raw`from collections import deque
q = deque()
for u in ['u1', 'u2', 'u3']:
    q.append(u)          # 入队
out = []
while q:
    out.append(q.popleft())   # 出队（先进先出）
print('出队顺序', out)`,

  "a9l4": String.raw`seen = set()
for u in ['a.com', 'b.com']:
    seen.add(u)
print('a.com 见过?', 'a.com' in seen)
print('c.com 见过?', 'c.com' in seen)`,

  "a9l5": String.raw`def simhash(text):
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
print('海明距离', dist)`,

  "a9l6": String.raw`old = {'a', 'b', 'c'}
new = ['a', 'c', 'd', 'e', 'b']
fresh = [u for u in new if u not in old]   # 在新发现里、但已抓过没有的
print('本轮新抓', fresh)`,

  "a10l1": String.raw`docs = [
    {'title': 'Python 入门', 'len': 10},
    {'title': 'Java 基础', 'len': 8},
    {'title': 'Python 进阶', 'len': 20},
]
found = [d for d in docs if 'Python' in d['title']]
print('含 Python 的文档', len(found), '篇')`,

  "a10l2": String.raw`docs = [
    {'title': '爬虫技巧', 'body': 'asyncio'},
    {'title': '做菜', 'body': '番茄'},
    {'title': '爬虫进阶', 'body': '分布式'},
]
def search(docs, kw):
    return [d for d in docs if kw in d['title'] or kw in d['body']]
print('搜 爬虫 命中', len(search(docs, '爬虫')), '篇')`,

  "a10l3": String.raw`records = [{'id': 1, 'name': ' 王 '}, {'id': 2, 'name': '赵'}, {'id': 1, 'name': ' 王 '}]
seen = set()
clean = []
for r in records:
    name = r['name'].strip()
    if r['id'] in seen:
        continue
    seen.add(r['id'])
    clean.append({'id': r['id'], 'name': name})
print('去重后', len(clean), '条')`,

  "a11l2": String.raw`import hashlib
ts = 1700000000
sign = hashlib.md5(('secret' + str(ts)).encode('utf-8')).hexdigest()
print('sign 前8位', sign[:8])`,

  "a12l2": String.raw`total = 100
done = 30
left = list(range(done + 1, total + 1))   # 从 done+1 到 total
print('还剩', len(left), '个，编号从', left[0], '起')`,

  "a12l3": String.raw`logs = ['INFO ok', 'ERROR db down', 'INFO ok', 'ERROR timeout', 'WARN slow']
n = 0
for line in logs:
    if 'ERROR' in line:
        n += 1
print('ERROR 出现', n, '次')`,

  "a15l1": String.raw`proxies = ['1.1.1.1', '2.2.2.2', '3.3.3.3']
for i in range(6):
    print('第', i + 1, '次用', proxies[i % len(proxies)])   # 轮流取模`,

  "a15l3": String.raw`from collections import deque
pool = deque(['p1', 'p2', 'p3'])
for _ in range(3):
    p = pool.popleft()
    print('用', p)
    pool.append(p)   # 用完补回池子，循环复用`,

  "a15l4": String.raw`proxies = ['p1', 'p2', 'p3']
ok = [False, False, True]   # 模拟前两次失败
for i, succ in enumerate(ok):
    if succ:
        print('成功，用的代理', proxies[i])
        break
    else:
        print('被封，换', proxies[i + 1])`,

  "a17l1": String.raw`import math
size = 1000
chunk = 100
blocks = math.ceil(size / chunk)   # 向上取整
print('分', blocks, '块下载')`,

  "a17l2": String.raw`n = 8
segs = []
for i in range(n):
    segs.append('seg_' + str(i) + '.ts')
print(segs)`,

  "a17l3": String.raw`total = 1000
done = 400
chunk = 100
next_block = done // chunk           # 已下满的块数
left = total // chunk - next_block   # 剩余块数
print('从块', next_block, '继续，还剩', left, '块')`,

  "gradA": String.raw`n = 8
per = 1
seq = per * n        # 顺序：8 个任务排队，每个 1 秒
con = per            # 并发：8 个一起跑，约 1 秒
print('顺序', seq, '秒；并发', con, '秒')`,

  "gradB": String.raw`from collections import deque
q = deque(['t1', 't2', 't3', 't4', 't5', 't6'])
while q:
    print('worker 取走', q.popleft())   # 多 worker 轮流 popleft`,
};
