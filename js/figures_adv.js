// figures_adv.js — 爬虫进阶课 SVG 图解库（进阶深水区 + 沿用基础 17 图）
// 课程用 figures:[{key,caption}] 引用；本文件向 window.FIGURES 追加进阶 key，并保留基础 key。
(function () {
  'use strict';
  var F = window.FIGURES || (window.FIGURES = {});

  function svg(w, h, inner) {
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" class="fig-svg" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">' + inner + '</svg>';
  }
  function rect(x, y, w, h, fill, stroke, r) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (r == null ? 9 : r) + '" fill="' + (fill || '#eaf6ff') + '" stroke="' + (stroke || '#7fb2e0') + '" stroke-width="2"/>';
  }
  function txt(x, y, s, size, color, anchor, weight) {
    return '<text x="' + x + '" y="' + y + '" font-size="' + (size || 15) + '" fill="' + (color || '#2f3e52') + '" text-anchor="' + (anchor || 'middle') + '" font-weight="' + (weight || '400') + '">' + s + '</text>';
  }
  function line(x1, y1, x2, y2, color, w) {
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="' + (color || '#90a4b8') + '" stroke-width="' + (w || 2) + '"/>';
  }
  function arrow(x1, y1, x2, y2, color) {
    var dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx * dx + dy * dy) || 1;
    var ux = dx / len, uy = dy / len, hx = x2 - ux * 10, hy = y2 - uy * 10;
    var a1x = hx - uy * 6, a1y = hy + ux * 6, a2x = hx + uy * 6, a2y = hy - ux * 6;
    return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + hx + '" y2="' + hy + '" stroke="' + (color || '#5b8fc4') + '" stroke-width="2.5"/>' +
      '<polygon points="' + x2 + ',' + y2 + ' ' + a1x + ',' + a1y + ' ' + a2x + ',' + a2y + '" fill="' + (color || '#5b8fc4') + '"/>';
  }
  function chip(x, y, w, h, emoji, label, fill, stroke) {
    return rect(x, y, w, h, fill, stroke) +
      '<text x="' + (x + w / 2) + '" y="' + (y + h / 2 - 2) + '" font-size="20" text-anchor="middle">' + emoji + '</text>' +
      txt(x + w / 2, y + h - 9, label, 11.5, '#3f5066');
  }
  function box(x, y, w, h, title, sub, fill, stroke) {
    return rect(x, y, w, h, fill, stroke) +
      txt(x + w / 2, y + 22, title, 14, '#2f3e52', 'middle', '700') +
      txt(x + w / 2, y + 42, sub, 11, '#5f728a');
  }

  // ===== 基础 17 图（沿用爬虫入门，保留以防引用）=====
  F.crawler_data_flow = function () {
    var s = '';
    s += txt(310, 26, '🕸️ 爬虫全流程：循环不息', 16, '#2f3e52', 'middle', '700');
    var data = [['📡', '发出请求'], ['📄', '拿到网页/接口'], ['🔍', '解析提取'], ['💾', '存文件/库']];
    for (var i = 0; i < 4; i++) s += chip(20 + i * 150, 60, 120, 78, data[i][0], data[i][1], '#eaf6ff', '#5b8fc4');
    for (var j = 0; j < 3; j++) s += arrow(140 + j * 150, 99, 150 + j * 150, 99, '#5b8fc4');
    s += arrow(440, 99, 470, 99, '#5b8fc4');
    s += txt(310, 175, '↩ 拿到数据后，往往还要翻下一页 → 整个流程循环', 12.5, '#7a8aa0');
    return svg(620, 200, s);
  };
  F.browser_server = function () {
    var s = '';
    s += txt(310, 24, '🌐 你点网址 vs 爬虫：干的是同一件事', 15.5, '#2f3e52', 'middle', '700');
    s += box(20, 50, 280, 110, '🧑 真人 + 浏览器', '点网址 → 浏览器发请求 → 收 HTML → 人眼看', '#e3f7e8', '#3a9d5d');
    s += box(320, 50, 280, 110, '🤖 爬虫(代码)', '代码发请求 → 收 HTML → 跳过人眼直接抠', '#fff3cf', '#e6b84d');
    s += box(170, 185, 280, 70, '🖥️ 服务器', '收到请求 → 回 HTML', '#eaf6ff', '#5b8fc4');
    s += arrow(160, 110, 250, 185, '#3a9d5d');
    s += arrow(460, 110, 370, 185, '#e6b84d');
    s += txt(310, 285, '爬虫 = 自动化的你，只是省掉了"人眼看"这一步', 12.5, '#7a8aa0');
    return svg(620, 310, s);
  };
  F.html_tree = function () {
    var s = '';
    s += txt(310, 24, '🌲 HTML 是一棵标签树', 15.5, '#2f3e52', 'middle', '700');
    s += box(250, 44, 120, 40, '<html>', '', '#eaf6ff', '#5b8fc4');
    s += arrow(310, 84, 310, 100, '#5b8fc4');
    s += box(250, 100, 120, 40, '<body>', '', '#eaf6ff', '#5b8fc4');
    var kids = [['<h1>', '#fff3cf', '#e6b84d'], ['<p>', '#e3f7e8', '#3a9d5d'], ['<a>', '#ffe5ec', '#d9536b'], ['<ul>', '#ede7ff', '#7a5fb0']];
    for (var i = 0; i < 4; i++) { var x = 30 + i * 145; s += arrow(310, 140, x + 55, 170, '#90a4b8'); s += box(x, 170, 110, 38, kids[i][0], '', kids[i][1], kids[i][2]); }
    s += box(30 + 3 * 145, 240, 110, 38, '<li> ×N', '子项挂在 ul 下', '#ede7ff', '#7a5fb0');
    s += txt(310, 300, '解析库就是按这棵树"按图索骥"地抠数据', 12.5, '#7a8aa0');
    return svg(620, 320, s);
  };
  F.request_response = function () {
    var s = '';
    s += txt(310, 24, '📨 一次 HTTP：请求 → 响应', 15.5, '#2f3e52', 'middle', '700');
    s += box(20, 50, 280, 110, '➡️ 请求 Request', '方法 GET/POST + URL + 头(Headers) + 参数', '#eaf6ff', '#5b8fc4');
    s += box(320, 50, 280, 110, '⬅️ 响应 Response', '状态码 + 头 + 正文(HTML/JSON)', '#fff3cf', '#e6b84d');
    s += arrow(300, 105, 320, 105, '#5b8fc4');
    s += txt(310, 195, '爬虫 = 用代码构造"请求"，再读取"响应正文"', 12.5, '#7a8aa0');
    return svg(620, 220, s);
  };
  F.robots_txt = function () {
    var s = '';
    s += txt(310, 24, '📄 robots.txt：网站根的"门牌告示"', 15.5, '#2f3e52', 'middle', '700');
    s += box(20, 50, 280, 110, '🚫 Disallow', '站长说"别爬这里" → 真别碰', '#ffe5ec', '#d9536b');
    s += box(320, 50, 280, 110, '✅ Allow', '在大前提禁止里放开某些路径 → 可爬', '#e3f7e8', '#3a9d5d');
    s += txt(310, 195, '爬前先读 /robots.txt：Disallow 的路径绕开，Allow 的才动手（君子协定）', 12, '#7a8aa0');
    return svg(620, 220, s);
  };
  F.legal_redline = function () {
    var s = '';
    s += txt(310, 24, '🚫 红线：这些绝对别碰', 15.5, '#2f3e52', 'middle', '700');
    var red = [['👤', '个人信息'], ['💰', '付费专有内容'], ['⚠️', '违法内容'], ['🔓', '破解技术防爬']];
    for (var i = 0; i < 4; i++) s += chip(20 + i * 150, 50, 130, 76, red[i][0], red[i][1], '#ffe5ec', '#d9536b');
    s += txt(310, 165, '版权 / 不正当竞争也要小心：抓来的内容别擅自商用、别整碗端走对手数据', 12.5, '#7a8aa0');
    s += txt(310, 192, '动手前三问：公开无敏感？允许？用途正当？过不了就收手', 12.5, '#d9536b', 'middle', '700');
    return svg(620, 215, s);
  };
  F.regex_match = function () {
    var s = '';
    s += txt(310, 24, '🔍 正则 = 模式滤网', 15.5, '#2f3e52', 'middle', '700');
    s += box(20, 55, 250, 70, '乱文本', '订单号A12 价格39 编号B7', '#eaf6ff', '#5b8fc4');
    s += box(355, 55, 250, 70, '捞出数字串', '12 / 39 / 7', '#e3f7e8', '#3a9d5d');
    s += arrow(270, 90, 355, 90, '#3a9d5d');
    s += txt(310, 165, '\\d+ 像筛子：只放连续数字过去；邮箱/日期/URL 这类固定模式都好使', 12, '#7a8aa0');
    return svg(620, 190, s);
  };
  F.data_store = function () {
    var s = '';
    s += txt(310, 24, '📊 榜单 → 一张表', 15.5, '#2f3e52', 'middle', '700');
    var st = [['📡', 'requests 拿 HTML'], ['🔍', 'bs4 抠 title/score'], ['📋', 'DictWriter 写 csv']];
    for (var i = 0; i < 3; i++) s += chip(20 + i * 200, 55, 170, 78, st[i][0], st[i][1], '#eaf6ff', '#5b8fc4');
    for (var j = 0; j < 2; j++) s += arrow(190 + j * 200, 94, 200 + j * 200, 94, '#5b8fc4');
    s += txt(310, 175, 'utf-8-sig + newline="" → Excel 打开中文不乱码、不空行', 12, '#7a8aa0');
    return svg(620, 200, s);
  };
  F.api_json = function () {
    var s = '';
    s += txt(310, 24, '🌤️ 天气看板链路', 15.5, '#2f3e52', 'middle', '700');
    var st = [['🔗', '构造带参 URL'], ['📡', 'requests 拿 JSON'], ['🌡️', '取 temp_C/天气'], ['🗂️', '攒字典'], ['💾', 'dump weather.json']];
    for (var i = 0; i < 5; i++) s += chip(8 + i * 122, 55, 110, 78, st[i][0], st[i][1], '#eaf6ff', '#5b8fc4');
    for (var j = 0; j < 4; j++) s += arrow(118 + j * 122, 94, 128 + j * 122, 94, '#5b8fc4');
    s += txt(310, 175, 'wttr.in 的 ?format=j1 免 key 直接给 JSON，练接口爬取的神仙站点', 12, '#7a8aa0');
    return svg(620, 200, s);
  };
  F.download_flow = function () {
    var s = '';
    s += txt(310, 24, '🖼️ 批量下载图片', 15.5, '#2f3e52', 'middle', '700');
    var st = [['🔍', 'bs4 抠 img src'], ['🔁', '循环 requests.get'], ['📦', 'r.content 字节'], ['💾', 'open(wb) 写盘']];
    for (var i = 0; i < 4; i++) s += chip(20 + i * 150, 55, 130, 78, st[i][0], st[i][1], '#eaf6ff', '#5b8fc4');
    for (var j = 0; j < 3; j++) s += arrow(150 + j * 150, 94, 160 + j * 150, 94, '#5b8fc4');
    s += txt(310, 175, '文字用 r.text、图片用 r.content，搞反图片就废了', 12, '#7a8aa0');
    return svg(620, 200, s);
  };
  F.project_map = function () {
    var s = '';
    s += txt(310, 22, '🚀 毕业项目八步走完即毕业', 15.5, '#2f3e52', 'middle', '700');
    var st = [['🎯', '定目标'], ['🔎', '看数据源'], ['📡', '抓'], ['🔍', '解析'], ['💾', '存'], ['🤝', '加礼貌'], ['🛡️', '做兜底'], ['📝', '写说明']];
    for (var i = 0; i < 8; i++) { var x = 12 + (i % 4) * 150, y = 50 + Math.floor(i / 4) * 80; s += chip(x, y, 132, 66, st[i][0], st[i][1], '#eaf6ff', '#5b8fc4'); if (i % 4 < 3) s += arrow(x + 132, y + 33, x + 150, y + 33, '#5b8fc4'); }
    s += arrow(300, 130, 12 + 150, 130, '#5b8fc4');
    s += txt(310, 220, '选一个你真感兴趣的公开站，从头爬到尾就是毕业', 12.5, '#7a8aa0');
    return svg(620, 245, s);
  };
  F.debug_wheel = function () {
    var s = '';
    s += txt(310, 22, '🐞 排错套路：逐层打印缩小范围', 15.5, '#2f3e52', 'middle', '700');
    var st = [['1️⃣', '打印原始响应'], ['2️⃣', '打印解析中间结果'], ['3️⃣', '定位变空的那步'], ['4️⃣', '针对性修复']];
    for (var i = 0; i < 4; i++) s += chip(20 + i * 150, 45, 130, 70, st[i][0], st[i][1], '#fff3cf', '#e6b84d');
    for (var j = 0; j < 3; j++) s += arrow(150 + j * 150, 80, 160 + j * 150, 80, '#e6b84d');
    var pit = [['空列表', '#ffe5ec', '#d9536b'], ['403', '#ffe5ec', '#d9536b'], ['乱码', '#ffe5ec', '#d9536b'], ['缺字段', '#ffe5ec', '#d9536b'], ['被封', '#ffe5ec', '#d9536b']];
    s += txt(310, 150, '五大坑：', 13, '#d9536b', 'middle', '700');
    for (var k = 0; k < 5; k++) s += chip(12 + k * 122, 165, 112, 56, '⚠️', pit[k][0], pit[k][1], pit[k][2]);
    s += txt(310, 250, '别一上来就怀疑人生，哪步变空坑就在哪步', 12, '#7a8aa0');
    return svg(620, 272, s);
  };
  F.roadmap = function () {
    var s = '';
    s += txt(310, 22, '🗺️ 已通链路 → 下一步方向', 15.5, '#2f3e52', 'middle', '700');
    s += box(20, 45, 285, 90, '✅ 已掌握', '请求→解析→存储→工程化→合规', '#e3f7e8', '#3a9d5d');
    s += box(320, 45, 285, 90, '🚀 下一步', 'Scrapy / 异步 aiohttp / Selenium / 可视化 / 定时', '#eaf6ff', '#5b8fc4');
    s += arrow(305, 90, 320, 90, '#5b8fc4');
    s += txt(310, 165, '爬虫是"把网上信息变成你能用的数据"的第一把钥匙', 12.5, '#7a8aa0');
    return svg(620, 190, s);
  };
  F.proxy_rotate = function () {
    var s = '';
    s += txt(310, 24, '🛡️ 代理轮换：别让一个 IP 露馅', 15.5, '#2f3e52', 'middle', '700');
    s += box(20, 55, 140, 70, '🤖 爬虫', '每次换 IP', '#eaf6ff', '#5b8fc4');
    s += box(240, 55, 140, 70, '🔄 代理池', 'IP1/IP2/IP3…', '#fff3cf', '#e6b84d');
    var tg = [['🌐', '目标A'], ['🌐', '目标B'], ['🌐', '目标C']];
    for (var i = 0; i < 3; i++) s += chip(420, 30 + i * 60, 150, 50, tg[i][0], tg[i][1], '#e3f7e8', '#3a9d5d');
    s += arrow(160, 90, 240, 90, '#5b8fc4');
    s += arrow(380, 78, 420, 55, '#3a9d5d');
    s += arrow(380, 90, 420, 115, '#3a9d5d');
    s += arrow(380, 102, 420, 175, '#3a9d5d');
    s += txt(310, 235, '高并发/被限流时的保命手段：IP 轮流上，降低被封概率', 12, '#7a8aa0');
    return svg(620, 258, s);
  };
  F.selenium_dynamic = function () {
    var s = '';
    s += txt(310, 24, '⚡ 动态页：HTML 里没数据，得等 JS', 15.5, '#2f3e52', 'middle', '700');
    s += box(20, 55, 180, 70, '🌐 初始 HTML', '空壳/占位', '#ffe5ec', '#d9536b');
    s += box(230, 55, 180, 70, '⚙️ JS 现拉数据', '渲染后才填充', '#fff3cf', '#e6b84d');
    s += box(440, 55, 160, 70, '🚗 Selenium', '驱动真浏览器等 JS', '#eaf6ff', '#5b8fc4');
    s += arrow(200, 90, 230, 90, '#d9536b');
    s += arrow(410, 90, 440, 90, '#5b8fc4');
    s += txt(310, 175, 'bs4 解析静态 HTML 救不了动态加载；要等 JS 执行拿渲染后页面', 12, '#7a8aa0');
    return svg(620, 200, s);
  };
  F.session_cookie = function () {
    var s = '';
    s += txt(310, 24, '🍪 Session/Cookie：保持登录态', 15.5, '#2f3e52', 'middle', '700');
    s += box(20, 55, 180, 80, '🔐 登录一次', '服务器发 Cookie', '#eaf6ff', '#5b8fc4');
    s += box(230, 55, 180, 80, '🤖 后续请求', '带上同一个 Cookie', '#fff3cf', '#e6b84d');
    s += box(440, 55, 160, 80, '✅ 保持登录', 'Session 串起多次', '#e3f7e8', '#3a9d5d');
    s += arrow(200, 95, 230, 95, '#5b8fc4');
    s += arrow(410, 95, 440, 95, '#3a9d5d');
    s += txt(310, 185, '用 requests.Session() 自动管理 Cookie，爬登录后才能看的页必备', 12, '#7a8aa0');
    return svg(620, 210, s);
  };
  F.status_wheel = function () {
    var s = '';
    s += txt(310, 24, '🔢 状态码：服务器用三位数回话', 15.5, '#2f3e52', 'middle', '700');
    var st = [['200', '✅ 成功', '#e3f7e8', '#3a9d5d'], ['301/2', '↪️ 跳转', '#fff3cf', '#e6b84d'], ['403', '🚫 被拦', '#ffe5ec', '#d9536b'], ['404', '❓ 丢失', '#ffe5ec', '#d9536b'], ['5xx', '💥 服务器错', '#ede7ff', '#7a5fb0']];
    for (var i = 0; i < 5; i++) s += chip(12 + i * 122, 55, 112, 78, st[i][0], st[i][1], st[i][2], st[i][3]);
    s += txt(310, 175, '看到 200 再处理；4xx 查客户端、5xx 查服务端/稍后重试', 12, '#7a8aa0');
    return svg(620, 200, s);
  };

  // ===== 进阶图解（深水区）=====
  // 异步：串行 vs 并发
  F.adv_sync_vs_async = function () {
    var s = '';
    s += txt(310, 22, '🐢 同步串行 vs 🚀 异步并发', 15.5, '#2f3e52', 'middle', '700');
    s += txt(150, 60, '同步：排队等', 13, '#d9536b', 'middle', '700');
    for (var i = 0; i < 4; i++) s += box(40 + i * 60, 75, 50, 36, 'R' + (i + 1), '等回才走', i % 2 ? '#ffe5ec' : '#ffd9e2', '#d9536b');
    for (var j = 0; j < 3; j++) s += arrow(90 + j * 60, 93, 100 + j * 60, 93, '#d9536b');
    s += txt(470, 60, '异步：一起飞', 13, '#3a9d5d', 'middle', '700');
    for (var k = 0; k < 4; k++) s += box(360 + k * 60, 75, 50, 36, 'R' + (k + 1), '同时发', '#e3f7e8', '#3a9d5d');
    s += line(385, 93, 445, 93, '#3a9d5d', 2); s += line(445, 93, 505, 93, '#3a9d5d', 2); s += line(505, 93, 565, 93, '#3a9d5d', 2);
    s += txt(310, 160, 'I/O 等待时不阻塞：等 A 的响应时，B/C/D 已经发出去了', 12, '#7a8aa0');
    return svg(620, 185, s);
  };
  // 事件循环
  F.adv_event_loop = function () {
    var s = '';
    s += txt(310, 22, '🔄 事件循环：一个厨师管多锅', 15.5, '#2f3e52', 'middle', '700');
    s += box(250, 45, 120, 40, '⚙️ Event Loop', '调度器', '#eaf6ff', '#5b8fc4');
    var co = [['🅰️ 协程A', 'await 等网络'], ['🅱️ 协程B', 'await 等网络'], ['🅲️ 协程C', 'await 等网络']];
    for (var i = 0; i < 3; i++) { var y = 110 + i * 70; s += box(40, y, 230, 50, co[i][0], co[i][1], '#fff3cf', '#e6b84d'); s += arrow(270, y + 25, 310, y + 25, '#e6b84d'); }
    s += arrow(310, 110, 310, 160, '#5b8fc4'); s += arrow(310, 180, 310, 230, '#5b8fc4');
    s += txt(310, 340, '协程在 await 处"让出"，循环去跑别的协程；网络回来再回来', 12, '#7a8aa0');
    return svg(620, 365, s);
  };
  // 信号量限速
  F.adv_semaphore = function () {
    var s = '';
    s += txt(310, 22, '🚦 信号量：同时只放 N 个', 15.5, '#2f3e52', 'middle', '700');
    s += box(40, 50, 160, 70, '🚦 Semaphore(5)', '最多 5 个在飞', '#fff3cf', '#e6b84d');
    for (var i = 0; i < 8; i++) { var x = 240 + (i % 4) * 95, y = 45 + Math.floor(i / 4) * 70; s += chip(x, y, 85, 56, i < 5 ? '✅' : '⏳', '任务' + (i + 1), i < 5 ? '#e3f7e8' : '#ede7ff', i < 5 ? '#3a9d5d' : '#7a5fb0'); }
    s += arrow(200, 85, 240, 73, '#e6b84d');
    s += txt(310, 205, '不是"更快"，是"别压垮对方"：限速 = 礼貌 + 不被封', 12, '#7a8aa0');
    return svg(620, 230, s);
  };
  // httpx 连接池
  F.adv_httpx_pool = function () {
    var s = '';
    s += txt(310, 22, '🔗 httpx 连接池：复用 TCP', 15.5, '#2f3e52', 'middle', '700');
    s += box(40, 55, 150, 70, '🤖 客户端', '一次建池', '#eaf6ff', '#5b8fc4');
    for (var i = 0; i < 3; i++) s += box(230 + i * 130, 55, 110, 70, '🛣️ 连接' + (i + 1), '复用不重握', '#e3f7e8', '#3a9d5d');
    s += arrow(190, 90, 230, 90, '#5b8fc4');
    s += arrow(340, 90, 390, 90, '#3a9d5d'); s += arrow(470, 90, 520, 90, '#3a9d5d');
    s += txt(310, 175, '每次请求不再三次握手，省时省资源；httpx 同步异步一套 API', 12, '#7a8aa0');
    return svg(620, 200, s);
  };
  // 指数退避
  F.adv_retry_429 = function () {
    var s = '';
    s += txt(310, 22, '⏳ 指数退避：被限就退远点', 15.5, '#2f3e52', 'middle', '700');
    var st = [['1️⃣ 等 1s', '#ffe5ec', '#d9536b'], ['2️⃣ 等 2s', '#fff3cf', '#e6b84d'], ['3️⃣ 等 4s', '#eaf6ff', '#5b8fc4'], ['4️⃣ 等 8s', '#e3f7e8', '#3a9d5d']];
    for (var i = 0; i < 4; i++) s += chip(20 + i * 150, 55, 130, 70, '⏱️', st[i][0], st[i][1], st[i][2]);
    for (var j = 0; j < 3; j++) s += arrow(150 + j * 150, 90, 160 + j * 150, 90, '#90a4b8');
    s += txt(310, 165, '429=太快了。退避翻倍 + 随机抖动，别卡死也别硬刚', 12, '#7a8aa0');
    return svg(620, 190, s);
  };
  // XPath 树定位
  F.adv_xpath_tree = function () {
    var s = '';
    s += txt(310, 22, '🧭 XPath：像文件路径一样定位', 15.5, '#2f3e52', 'middle', '700');
    s += box(250, 40, 120, 36, 'html', '', '#eaf6ff', '#5b8fc4');
    s += arrow(310, 76, 310, 92, '#5b8fc4');
    s += box(250, 92, 120, 36, 'body', '', '#eaf6ff', '#5b8fc4');
    s += arrow(310, 128, 200, 144, '#90a4b8'); s += arrow(310, 128, 420, 144, '#90a4b8');
    s += box(140, 144, 130, 36, "div[@class='item']", '谓语筛选', '#fff3cf', '#e6b84d');
    s += box(350, 144, 150, 36, "div//h2", '子孙任意层', '#e3f7e8', '#3a9d5d');
    s += arrow(205, 180, 205, 200, '#e6b84d'); s += box(140, 200, 200, 36, "div[@class='item']/h2", '精准命中标题', '#e3f7e8', '#3a9d5d');
    s += txt(310, 270, '轴(//父子孙) + 谓语([]) = 精确定位；比 class 猜更稳', 12, '#7a8aa0');
    return svg(620, 295, s);
  };
  // Playwright 拦截接口
  F.adv_pw_intercept = function () {
    var s = '';
    s += txt(310, 22, '🕵️ Playwright 拦截：不爬页只抓接口', 15.5, '#2f3e52', 'middle', '700');
    s += box(20, 60, 170, 70, '🖥️ 网页', '发 XHR/fetch', '#eaf6ff', '#5b8fc4');
    s += box(230, 60, 180, 70, '🕸️ 路由拦截', 'page.on(response)', '#fff3cf', '#e6b84d');
    s += box(440, 60, 160, 70, '📦 JSON', '直接拿数据', '#e3f7e8', '#3a9d5d');
    s += arrow(190, 95, 230, 95, '#5b8fc4');
    s += arrow(410, 95, 440, 95, '#3a9d5d');
    s += txt(310, 175, '拦到真实接口 → 省去解析 HTML，直接拿结构化 JSON，更快更稳', 12, '#7a8aa0');
    return svg(620, 200, s);
  };
  // Playwright stealth
  F.adv_pw_stealth = function () {
    var s = '';
    s += txt(310, 22, '🥷 stealth：藏起"我是机器人"', 15.5, '#2f3e52', 'middle', '700');
    var fp = [['🌐 UA', '伪装成正常浏览器'], ['🖥️ 分辨率', '别露 0×0'], ['🔌 WebGL', '填真实显卡'], ['🗣️ 语言', 'zh-CN 一致']];
    for (var i = 0; i < 4; i++) s += chip(20 + i * 150, 50, 130, 70, '🤖', fp[i][0], '#eaf6ff', '#5b8fc4');
    for (var j = 0; j < 4; j++) s += arrow(85 + j * 150, 120, 85 + j * 150, 140, '#3a9d5d');
    s += txt(310, 200, 'playwright-stealth 抹掉 webdriver 痕迹，让指纹像真人', 12, '#7a8aa0');
    return svg(620, 225, s);
  };
  // JS 逆向追踪流
  F.adv_js_trace = function () {
    var s = '';
    s += txt(310, 22, '🔑 JS 逆向：从签名倒推密钥', 15.5, '#2f3e52', 'middle', '700');
    s += box(20, 55, 160, 70, '📨 请求带 sign', '不知怎么算', '#ffe5ec', '#d9536b');
    s += box(220, 55, 180, 70, '🔎 DevTools', 'XHR 断点/搜索', '#fff3cf', '#e6b84d');
    s += box(430, 55, 170, 70, '🐍 Python 复现', '同算法出 sign', '#e3f7e8', '#3a9d5d');
    s += arrow(180, 90, 220, 90, '#5b8fc4'); s += arrow(400, 90, 430, 90, '#3a9d5d');
    s += txt(310, 175, '在 Network 里看 sign 怎么生成 → 全局搜 sign= → 读算法 → 用 Python 重写', 12, '#7a8aa0');
    return svg(620, 200, s);
  };
  // webpack 模块图
  F.adv_webpack = function () {
    var s = '';
    s += txt(310, 22, '📦 webpack：一袋模块 + 地图', 15.5, '#2f3e52', 'middle', '700');
    s += box(30, 55, 180, 70, '🧩 模块 a/b/c', '被打包成一坨', '#eaf6ff', '#5b8fc4');
    s += box(250, 55, 180, 70, '🗺️ webpackJsonp', '模块地图数组', '#fff3cf', '#e6b84d');
    s += box(450, 55, 150, 70, '🔑 找入口', '定位签名函数', '#e3f7e8', '#3a9d5d');
    s += arrow(210, 90, 250, 90, '#5b8fc4'); s += arrow(430, 90, 450, 90, '#3a9d5d');
    s += txt(310, 175, '打包后难读但逻辑在：搜关键词 + 在 Source 里格式化还原', 12, '#7a8aa0');
    return svg(620, 200, s);
  };
  // 字体映射还原
  F.adv_font_map = function () {
    var s = '';
    s += txt(310, 22, '🔤 字体反爬：字形≠编码', 15.5, '#2f3e52', 'middle', '700');
    s += box(20, 55, 180, 70, '📄 网页显示', '看似"男科"', '#ffe5ec', '#d9536b');
    s += box(230, 55, 180, 70, '🔡 实际编码', 'uni 映射乱跳', '#fff3cf', '#e6b84d');
    s += box(440, 55, 160, 70, '🛠️ fontTools', '还原真字形', '#e3f7e8', '#3a9d5d');
    s += arrow(200, 90, 230, 90, '#5b8fc4'); s += arrow(410, 90, 440, 90, '#3a9d5d');
    s += txt(310, 175, '用 fontTools 读 cmap：编码→真实字形，建映射表翻回人话', 12, '#7a8aa0');
    return svg(620, 200, s);
  };
  // OCR 识别流
  F.adv_ocr = function () {
    var s = '';
    s += txt(310, 22, '👁️ OCR：图里认字', 15.5, '#2f3e52', 'middle', '700');
    s += box(20, 55, 160, 70, '🖼️ 验证码图', '人能认', '#eaf6ff', '#5b8fc4');
    s += box(220, 55, 180, 70, '🤖 ddddocr', '训练好模型', '#fff3cf', '#e6b84d');
    s += box(430, 55, 170, 70, '🔤 出文字', '4 位字符', '#e3f7e8', '#3a9d5d');
    s += arrow(180, 90, 220, 90, '#5b8fc4'); s += arrow(400, 90, 430, 90, '#3a9d5d');
    s += txt(310, 175, 'ddddocr 开箱即用：图片进、文字出，省去自己训练', 12, '#7a8aa0');
    return svg(620, 200, s);
  };
  // 雪碧图偏移
  F.adv_sprite = function () {
    var s = '';
    s += txt(310, 22, '🧩 雪碧图：一张大图切着看', 15.5, '#2f3e52', 'middle', '700');
    s += rect(20, 50, 300, 120, '#eaf6ff', '#5b8fc4', 9);
    s += line(120, 50, 120, 170, '#5b8fc4', 1); s += line(220, 50, 220, 170, '#5b8fc4', 1);
    for (var i = 0; i < 3; i++) s += txt(70 + i * 100, 115, '数' + (i + 1), 20, '#2f3e52');
    s += box(360, 60, 200, 50, 'CSS background', 'background-position 偏移', '#fff3cf', '#e6b84d');
    s += box(360, 120, 200, 50, '🐍 真实值', '偏移量反推坐标', '#e3f7e8', '#3a9d5d');
    s += txt(310, 200, '坐标是偏移量不是文字：解析 CSS 算出每块真实位置', 12, '#7a8aa0');
    return svg(620, 225, s);
  };
  // 滑块轨迹
  F.adv_slider = function () {
    var s = '';
    s += txt(310, 22, '🎚️ 滑块：模拟人手的轨迹', 15.5, '#2f3e52', 'middle', '700');
    s += line(40, 120, 560, 120, '#90a4b8', 2);
    var x = 60;
    for (var i = 0; i < 12; i++) { var nx = x + 40 + (i < 6 ? i * 3 : (12 - i) * 2); s += circle ? 0 : 0; x = nx; }
    // 画一条先加速后减速的轨迹点
    var px = 60;
    for (var k = 0; k < 12; k++) { var py = 120 - Math.sin(k / 11 * Math.PI) * 26; s += (k === 0 ? '' : line(px, 120 - Math.sin((k - 1) / 11 * Math.PI) * 26, px + 42, py, '#3a9d5d', 2)) + (k === 0 ? '' : '<circle cx="' + (px + 42) + '" cy="' + py + '" r="3" fill="#3a9d5d"/>'); px += 42; }
    s += txt(310, 175, '匀速一眼假：加"先快后慢+抖"才像人；轨迹比点位更关键', 12, '#7a8aa0');
    return svg(620, 200, s);
  };
  // Cookie 池
  F.adv_cookie_pool = function () {
    var s = '';
    s += txt(310, 22, '🍪 Cookie 池：多账号轮换', 15.5, '#2f3e52', 'middle', '700');
    s += box(20, 55, 150, 70, '👥 多账号', '各自登录', '#eaf6ff', '#5b8fc4');
    s += box(220, 55, 180, 70, '🗃️ Cookie 池', 'c1/c2/c3…', '#fff3cf', '#e6b84d');
    s += box(440, 55, 160, 70, '🔄 轮换', '一个失效换', '#e3f7e8', '#3a9d5d');
    s += arrow(170, 90, 220, 90, '#5b8fc4'); s += arrow(400, 90, 440, 90, '#3a9d5d');
    s += txt(310, 175, '登录态失效不慌：池里挑另一个；比硬刚单账号稳', 12, '#7a8aa0');
    return svg(620, 200, s);
  };
  // Scrapy 引擎
  F.adv_scrapy_engine = function () {
    var s = '';
    s += txt(310, 22, '🕷️ Scrapy 引擎：流水线工厂', 15.5, '#2f3e52', 'middle', '700');
    var st = [['📥 Scheduler', '排请求'], ['⬇️ Engine', '调度中枢'], ['📡 Downloader', '抓页面'], ['🕸️ Spider', '解析'], ['🧹 Pipeline', '清洗存']];
    for (var i = 0; i < 5; i++) s += chip(10 + i * 120, 50, 110, 70, st[i][0].split(' ')[0], st[i][1], '#eaf6ff', '#5b8fc4');
    for (var j = 0; j < 4; j++) s += arrow(120 + j * 120, 85, 130 + j * 120, 85, '#5b8fc4');
    s += arrow(560, 85, 540, 130, '#5b8fc4'); s += arrow(70, 120, 90, 130, '#5b8fc4');
    s += txt(310, 175, 'Middleware 卡在下载前后做代理/UA；Pipeline 管清洗入库', 12, '#7a8aa0');
    return svg(620, 200, s);
  };
  // Redis 中央队列
  F.adv_redis_queue = function () {
    var s = '';
    s += txt(310, 22, '🕸️ Redis 中央队列：多机抢活', 15.5, '#2f3e52', 'middle', '700');
    s += box(20, 55, 150, 70, '🖥️ 机器A', 'LPOP 取', '#eaf6ff', '#5b8fc4');
    s += box(20, 140, 150, 70, '🖥️ 机器B', 'LPOP 取', '#eaf6ff', '#5b8fc4');
    s += box(220, 95, 180, 70, '🔴 Redis', 'URL 队列', '#ffe5ec', '#d9536b');
    s += box(440, 55, 160, 70, '🖥️ 机器C', 'LPOP 取', '#eaf6ff', '#5b8fc4');
    s += arrow(170, 90, 220, 110, '#5b8fc4'); s += arrow(170, 175, 220, 130, '#5b8fc4'); s += arrow(400, 90, 440, 90, '#d9536b');
    s += txt(310, 200, '请求放 Redis 队列，多台机器一起抢：水平扩展、断了续得上', 12, '#7a8aa0');
    return svg(620, 225, s);
  };
  // 布隆过滤器
  F.adv_bloom = function () {
    var s = '';
    s += txt(310, 22, '🪣 布隆过滤器：见过的快速判重', 15.5, '#2f3e52', 'middle', '700');
    s += box(20, 55, 200, 70, '🔢 URL → 多个哈希', 'bit 位置 1', '#eaf6ff', '#5b8fc4');
    s += box(260, 55, 330, 70, '🟦 位数组', '某位=0 → 一定没见过；=1 → 可能见过', '#fff3cf', '#e6b84d');
    s += arrow(220, 90, 260, 90, '#5b8fc4');
    s += txt(310, 175, '省内存去重海量 URL；有误判(说见过错)但绝不漏判(说没见过错)', 12, '#7a8aa0');
    return svg(620, 200, s);
  };
  // SimHash
  F.adv_simhash = function () {
    var s = '';
    s += txt(310, 22, '📐 SimHash：文本指纹比相似', 15.5, '#2f3e52', 'middle', '700');
    s += box(20, 55, 180, 70, '📄 文章A', '特征→64位指纹', '#eaf6ff', '#5b8fc4');
    s += box(220, 55, 180, 70, '📄 文章B', '特征→64位指纹', '#eaf6ff', '#5b8fc4');
    s += box(420, 55, 180, 70, '🔍 汉明距', '<=3 判重复', '#e3f7e8', '#3a9d5d');
    s += arrow(200, 90, 420, 90, '#5b8fc4'); s += arrow(400, 90, 420, 90, '#5b8fc4');
    s += txt(310, 175, '整篇转成一个指纹，比位差就知道是不是抄的；近重复克星', 12, '#7a8aa0');
    return svg(620, 200, s);
  };
  // Kafka 管道
  F.adv_kafka = function () {
    var s = '';
    s += txt(310, 22, '📨 Kafka：采集→队列→消费', 15.5, '#2f3e52', 'middle', '700');
    s += box(20, 55, 160, 70, '🕷️ 爬虫', '生产消息', '#eaf6ff', '#5b8fc4');
    s += box(220, 55, 180, 70, '📨 Topic', '削峰缓冲', '#fff3cf', '#e6b84d');
    s += box(430, 55, 170, 70, '🧹 清洗/存', '消费消息', '#e3f7e8', '#3a9d5d');
    s += arrow(180, 90, 220, 90, '#5b8fc4'); s += arrow(400, 90, 430, 90, '#3a9d5d');
    s += txt(310, 175, '爬虫和下游解耦：峰值时消息排队，下游按能力消费', 12, '#7a8aa0');
    return svg(620, 200, s);
  };
  // MongoDB / ES
  F.adv_mongo_es = function () {
    var s = '';
    s += txt(310, 22, '🗄️ 存哪？看要干嘛', 15.5, '#2f3e52', 'middle', '700');
    s += box(20, 55, 280, 80, '🍃 MongoDB', '半结构/灵活 schema，原样存 JSON', '#eaf6ff', '#5b8fc4');
    s += box(320, 55, 280, 80, '🔎 Elasticsearch', '全文检索/聚合，搜索场景首选', '#e3f7e8', '#3a9d5d');
    s += txt(310, 175, '要全文搜用 ES；要灵活存用 Mongo；海量大文件走对象存储', 12, '#7a8aa0');
    return svg(620, 200, s);
  };
  // 对象存储
  F.adv_obj_store = function () {
    var s = '';
    s += txt(310, 22, '🪣 对象存储：图/视频别塞库', 15.5, '#2f3e52', 'middle', '700');
    s += box(20, 55, 200, 70, '🖼️ 大文件', '图片/视频', '#eaf6ff', '#5b8fc4');
    s += box(260, 55, 180, 70, '☁️ OSS/S3', '桶里存 URL', '#fff3cf', '#e6b84d');
    s += box(470, 55, 130, 70, '🔗 存链接', '库只记 URL', '#e3f7e8', '#3a9d5d');
    s += arrow(220, 90, 260, 90, '#5b8fc4'); s += arrow(440, 90, 470, 90, '#3a9d5d');
    s += txt(310, 175, '数据库存元数据+URL，文件放对象存储，省库空间', 12, '#7a8aa0');
    return svg(620, 200, s);
  };
  // mitmproxy
  F.adv_mitmproxy = function () {
    var s = '';
    s += txt(310, 22, '📱 mitmproxy：App 流量中间人', 15.5, '#2f3e52', 'middle', '700');
    s += box(20, 55, 160, 70, '📱 App', '发 HTTPS', '#eaf6ff', '#5b8fc4');
    s += box(220, 55, 180, 70, '🕵️ mitmproxy', '装证书拦下', '#fff3cf', '#e6b84d');
    s += box(430, 55, 170, 70, '📦 接口/参数', '看清怎么调', '#e3f7e8', '#3a9d5d');
    s += arrow(180, 90, 220, 90, '#5b8fc4'); s += arrow(400, 90, 430, 90, '#3a9d5d');
    s += txt(310, 175, '手机设代理+装 CA 证书，App 的 HTTPS 也能看见明文请求', 12, '#7a8aa0');
    return svg(620, 200, s);
  };
  // frida hook
  F.adv_frida = function () {
    var s = '';
    s += txt(310, 22, '🪝 frida：运行时钩住函数', 15.5, '#2f3e52', 'middle', '700');
    s += box(20, 55, 180, 70, '🤖 App 进程', '调 sign()', '#eaf6ff', '#5b8fc4');
    s += box(240, 55, 180, 70, '🪝 frida hook', '拦截入参/出参', '#fff3cf', '#e6b84d');
    s += box(440, 55, 160, 70, '👀 看明文', '算法现形', '#e3f7e8', '#3a9d5d');
    s += arrow(200, 90, 240, 90, '#5b8fc4'); s += arrow(420, 90, 440, 90, '#3a9d5d');
    s += txt(310, 175, '不用读混淆代码：直接 hook 关键函数，看它吃什么吐什么', 12, '#7a8aa0');
    return svg(620, 200, s);
  };
  // Docker
  F.adv_docker = function () {
    var s = '';
    s += txt(310, 22, '📦 Docker：一次打包到处跑', 15.5, '#2f3e52', 'middle', '700');
    s += box(20, 55, 200, 70, '💻 本机环境', 'Python+依赖', '#eaf6ff', '#5b8fc4');
    s += box(260, 55, 160, 70, '🐳 镜像', '环境冻结', '#fff3cf', '#e6b84d');
    s += box(450, 55, 150, 70, '☁️ 服务器', '跑同款容器', '#e3f7e8', '#3a9d5d');
    s += arrow(220, 90, 260, 90, '#5b8fc4'); s += arrow(420, 90, 450, 90, '#3a9d5d');
    s += txt(310, 175, '"在我机器能跑"终结者：环境连同代码一起发，换机不翻车', 12, '#7a8aa0');
    return svg(620, 200, s);
  };
  // Scrapyd
  F.adv_scrapyd = function () {
    var s = '';
    s += txt(310, 22, '🎛️ Scrapyd/Gerapy：爬虫管理平台', 15.5, '#2f3e52', 'middle', '700');
    s += box(20, 55, 180, 70, '🌐 管理后台', '启停/看日志', '#eaf6ff', '#5b8fc4');
    s += box(240, 55, 180, 70, '🎛️ Scrapyd', '托管多个爬虫', '#fff3cf', '#e6b84d');
    s += box(440, 55, 160, 70, '🤖 定时跑', 'APScheduler 触发', '#e3f7e8', '#3a9d5d');
    s += arrow(200, 90, 240, 90, '#5b8fc4'); s += arrow(420, 90, 440, 90, '#3a9d5d');
    s += txt(310, 175, 'Gerapy 给 Scrapyd 加可视化：网页点一下就能部署调度', 12, '#7a8aa0');
    return svg(620, 200, s);
  };
  // 合规边界
  F.adv_compliance = function () {
    var s = '';
    s += txt(310, 22, '⚖️ 个保法边界：能碰 vs 不能', 15.5, '#2f3e52', 'middle', '700');
    s += box(20, 50, 285, 80, '✅ 合规区', '公开、匿名化、已授权、用途正当', '#e3f7e8', '#3a9d5d');
    s += box(320, 50, 285, 80, '🚫 红线区', '未授权个人信息/人脸/行踪/密价', '#ffe5ec', '#d9536b');
    s += txt(310, 165, '抓公开资讯可以；抓能定位到具体个人的信息要授权，否则违法', 12, '#7a8aa0');
    return svg(620, 190, s);
  };
  // 毕业项目架构
  F.adv_grad_arch = function () {
    var s = '';
    s += txt(310, 22, '🎓 毕业项目 A/B 架构', 15.5, '#2f3e52', 'middle', '700');
    s += box(20, 55, 180, 70, '⚡ 异步抓取', 'aiohttp+信号量', '#eaf6ff', '#5b8fc4');
    s += box(230, 55, 180, 70, '🧹 解析清洗', 'XPath/正则', '#fff3cf', '#e6b84d');
    s += box(440, 55, 160, 70, '🗄️ 入库', 'Mongo/ES', '#e3f7e8', '#3a9d5d');
    s += arrow(200, 90, 230, 90, '#5b8fc4'); s += arrow(410, 90, 440, 90, '#3a9d5d');
    s += box(120, 150, 380, 50, '📊 增量+去重(布隆/SimHash)+ 断点续跑', '工程化兜底', '#ede7ff', '#7a5fb0');
    s += txt(310, 235, '两个项目串起全课：高并发采集 → 分布式+ES 入库', 12, '#7a8aa0');
    return svg(620, 260, s);
  };
  // 代理池打分
  F.adv_proxy_pool = function () {
    var s = '';
    s += txt(310, 22, '🛡️ 代理池：能用的才留', 15.5, '#2f3e52', 'middle', '700');
    s += box(20, 55, 220, 70, '🌐 代理 IP', '匿名/高匿', '#eaf6ff', '#5b8fc4');
    s += box(270, 55, 160, 70, '✅ 校验', '可用?延迟?', '#fff3cf', '#e6b84d');
    s += box(460, 55, 140, 70, '⭐ 打分', '优选高分', '#e3f7e8', '#3a9d5d');
    s += arrow(240, 90, 270, 90, '#5b8fc4'); s += arrow(430, 90, 460, 90, '#3a9d5d');
    s += txt(310, 175, '定时校验+打分，脏 IP 自动降权；封了秒换下一个', 12, '#7a8aa0');
    return svg(620, 200, s);
  };
  // WebSocket
  F.adv_ws = function () {
    var s = '';
    s += txt(310, 22, '📡 WebSocket：一条线双向聊', 15.5, '#2f3e52', 'middle', '700');
    s += box(30, 55, 200, 70, '🖥️ 服务器', '主动推数据', '#eaf6ff', '#5b8fc4');
    s += box(390, 55, 200, 70, '🤖 客户端', '收+偶尔发', '#e3f7e8', '#3a9d5d');
    s += arrow(230, 80, 390, 80, '#5b8fc4'); s += arrow(390, 100, 230, 100, '#3a9d5d');
    s += txt(310, 175, 'HTTP 一问一答；WS 握手后长连，服务器能随时推（行情/弹幕）', 12, '#7a8aa0');
    return svg(620, 200, s);
  };
  // m3u8
  F.adv_m3u8 = function () {
    var s = '';
    s += txt(310, 22, '🎬 m3u8：索引+分片拼整片', 15.5, '#2f3e52', 'middle', '700');
    s += box(20, 55, 200, 70, '📄 m3u8', '分片清单', '#eaf6ff', '#5b8fc4');
    s += box(260, 55, 160, 70, '🔪 ts 分片', '001..N', '#fff3cf', '#e6b84d');
    s += box(450, 55, 150, 70, '🎞️ 合并', 'ffmpeg 拼', '#e3f7e8', '#3a9d5d');
    s += arrow(220, 90, 260, 90, '#5b8fc4'); s += arrow(420, 90, 450, 90, '#3a9d5d');
    s += txt(310, 175, '下到所有 .ts 按顺序 cat/ffmpeg 合并；支持断点续传', 12, '#7a8aa0');
    return svg(620, 200, s);
  };
  // CNN 验证码
  F.adv_cnn_captcha = function () {
    var s = '';
    s += txt(310, 22, '🧠 深度自训：CNN 认验证码', 15.5, '#2f3e52', 'middle', '700');
    s += box(20, 55, 200, 70, '🖼️ 标注样本', '人工标几千张', '#eaf6ff', '#5b8fc4');
    s += box(260, 55, 160, 70, '🧠 训练', 'CNN 学特征', '#fff3cf', '#e6b84d');
    s += box(450, 55, 150, 70, '🔤 出文字', '比 ddddocr 强', '#e3f7e8', '#3a9d5d');
    s += arrow(220, 90, 260, 90, '#5b8fc4'); s += arrow(420, 90, 450, 90, '#3a9d5d');
    s += txt(310, 175, '思路：收集+标注+训练自己的模型；畸变强的验证码才需要', 12, '#7a8aa0');
    return svg(620, 200, s);
  };
  // Canvas 指纹
  F.adv_canvas_fp = function () {
    var s = '';
    s += txt(310, 22, '🎨 Canvas 指纹：同代码不同机', 15.5, '#2f3e52', 'middle', '700');
    s += box(20, 55, 200, 70, '🎨 画同一图', '各显卡渲染微差', '#eaf6ff', '#5b8fc4');
    s += box(260, 55, 160, 70, '🔢 哈希', '得唯一指纹', '#fff3cf', '#e6b84d');
    s += box(450, 55, 150, 70, '🥷 伪造', '改渲染参数', '#ffe5ec', '#d9536b');
    s += arrow(220, 90, 260, 90, '#5b8fc4'); s += arrow(420, 90, 450, 90, '#d9536b');
    s += txt(310, 175, '进阶对抗：故意扰动 Canvas/WebGL 输出，让指纹不唯一', 12, '#7a8aa0');
    return svg(620, 200, s);
  };
  // LLM 辅助
  F.adv_llm_selector = function () {
    var s = '';
    s += txt(310, 22, '🤖 LLM 辅助：让 AI 写选择器', 15.5, '#2f3e52', 'middle', '700');
    s += box(20, 55, 200, 70, '🌐 给 HTML', '贴上结构', '#eaf6ff', '#5b8fc4');
    s += box(260, 55, 160, 70, '🤖 大模型', '生成 XPath/CSS', '#fff3cf', '#e6b84d');
    s += box(450, 55, 150, 70, '✅ 人校验', '跑通才用', '#e3f7e8', '#3a9d5d');
    s += arrow(220, 90, 260, 90, '#5b8fc4'); s += arrow(420, 90, 450, 90, '#3a9d5d');
    s += txt(310, 175, '让 LLM 看着页面出选择器/抽取规则，人把关；效率翻倍但别盲信', 12, '#7a8aa0');
    return svg(620, 200, s);
  };
  // 分布式总架构
  F.adv_dist_arch = function () {
    var s = '';
    s += txt(310, 22, '🏗️ 分布式爬虫总架构', 15.5, '#2f3e52', 'middle', '700');
    s += box(20, 45, 180, 70, '⚡ 抓取节点×N', 'aiohttp+代理', '#eaf6ff', '#5b8fc4');
    s += box(230, 45, 180, 70, '🔴 Redis', '去重+调度', '#ffe5ec', '#d9536b');
    s += box(440, 45, 160, 70, '🗄️ ES/Mongo', '入库+检索', '#e3f7e8', '#3a9d5d');
    s += arrow(200, 80, 230, 80, '#5b8fc4'); s += arrow(410, 80, 440, 80, '#3a9d5d');
    s += box(120, 145, 380, 55, '📨 Kafka 解耦 · 🐳 Docker 部署 · 🎛️ Scrapyd 管理 · ⏰ 定时', '工程化一层', '#ede7ff', '#7a5fb0');
    s += txt(310, 235, '全课拼图：抓取→去重→调度→存储→管道→部署→监控 一条龙', 12, '#7a8aa0');
    return svg(620, 260, s);
  };

  // 家长课：安装 Python 步骤图
  F.adv_python_install = function () {
    var s = '';
    s += txt(310, 22, '🐍 给孩子装好 Python 环境（4 步）', 15.5, '#2f3e52', 'middle', '700');
    s += box(15, 45, 135, 78, '① 下载', '官网下安装包', '#eaf6ff', '#5b8fc4');
    s += box(175, 45, 135, 78, '② 运行安装', '勾 Add PATH', '#fff3cf', '#e6b84d');
    s += box(335, 45, 135, 78, '③ 安装', '一路 Install', '#ede7ff', '#7a5fb0');
    s += box(495, 45, 135, 78, '④ 验证', '查版本号', '#e3f7e8', '#3a9d5d');
    s += arrow(150, 84, 175, 84, '#5b8fc4'); s += arrow(310, 84, 335, 84, '#7a5fb0'); s += arrow(470, 84, 495, 84, '#3a9d5d');
    s += txt(310, 158, '最关键一步：安装时务必勾「Add Python to PATH」', 12.5, '#7a8aa0', 'middle', '400');
    s += txt(310, 178, '不勾就要手动配环境变量，孩子最容易卡在这里', 12, '#a06ab0', 'middle', '400');
    return svg(620, 200, s);
  };

  window.FIGURES = F;
})();
