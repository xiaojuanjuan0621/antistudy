#!/usr/bin/env python3
# 首页 · 按 Figma 画板 #47:509 还原（1366×1024 原生 4:3）
# 运行：python3 build_home2.py  →  生成 home.html
import os

BASE = os.path.dirname(os.path.abspath(__file__))
CW, CH = 1366, 1024
A = 'assets/'

# ------------------------------------------------------------------ 数据
cards = [
    # key,   学科, 副标题,        按钮文案, 按钮色,     图,                      frame x, y,     副标题框宽
    ('chinese', '语文', '学而思语文', '去看课', '#3692FF', 'home2-card-chinese.png', 538.61, 218.28, 115),
    ('english', '英语', '连续打卡7天', '去巩固', '#FF8C26', 'home2-card-english.png', 936.83, 218.28, 128),
    ('math',    '数学', '乐读数学',   '去探索', '#2FC56E', 'home2-card-math.png',    534.00, 457.74, 92),
    ('science', '科普', '科普合集',   '去看看', '#A539F3', 'home2-card-science.png', 932.22, 457.74, 92),
]
# 语文/英语卡高 214.87（图 203.95），数学/科普卡高 200.54（图 187.47）
CARD_H = {'chinese': (214.87, 203.95, 136.58, 35.76),
          'english': (214.87, 203.95, 136.58, 34.12),
          'math':    (200.54, 187.47, 129.26, 31.64),
          'science': (200.54, 187.47, 129.26, 38.68)}

tools = [
    ('home2-ico-ai.png',    'AI伙伴', 624.29, 722.77, 78.07, 66.77, 638.57),
    ('home2-ico-book.png',  '绘本馆', 751.43, 732.77, 67.80, 58.56, 758.86),
    ('home2-ico-music.png', '音乐馆', 870.00, 729.91, 59.58, 59.58, 874.29),
    ('home2-ico-anime.png', '动画馆', 982.86, 732.77, 67.80, 56.50, 988.57),
    ('home2-ico-star.png',  '收藏夹', 1100.00, 729.91, 66.77, 60.61, 1104.29),
    ('home2-ico-more.png',  '更多',   1218.57, 732.77, 53.42, 54.45, 1224.29),
]

nav = [
    ('nav-home.png',   '首页',   114.60, 88.04),
    ('nav-task.png',   '任务',   384.10, 357.51),
    ('nav-battle.png', '战斗',   653.90, 624.30),
    ('nav-bag.png',    '储物袋', 923.00, 896.44),
    ('nav-me.png',     '我的',   1189.80, 1163.23),
]

entries = [
    # 图, 文案, 宽, 图高, 组高(含标签条), 渐变, 标签条 x/y, 文字 x/y/宽
    ('entry-shop.png', '灵石商城', 115.59, 106.67, 131.41, '#B264F1,#663A8B', 11.76, 63.68, 30.82, 106.67, 55),
    ('entry-bag.png',  '储物袋',   111.13, 103.33, 129.79, '#FF9A48,#E12D0C', 9.33, 62.05, 35.29, 105.04, 41),
    ('entry-pet.png',  '灵宠',     113.91, 105.91, 126.54, '#60BEFE,#419EFB', 11.76, 58.81, 44.21, 101.80, 28),
]


def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


parts = []

# 背景
parts.append(f'<img class="bg" src="{A}home2-bg.png" alt="">')
# 男孩 / 蛋
parts.append(f'<img class="boy" src="{A}home2-boy.png" alt="">')
parts.append(f'<img class="egg" src="{A}home2-egg.png" alt="">')

# 四张学科卡
for key, name, sub, btn, col, img, fx, fy, subw in cards:
    h, ih, btnY, btnX = CARD_H[key]
    parts.append(f'''
    <div class="card" data-card="{name}" style="left:{fx}px;top:{fy}px;width:{378.04}px;height:{h}px">
      <img class="card-bg" src="{A}{img}" style="height:{ih}px" alt="">
      <div class="card-name" style="left:38.68px;top:24.35px">{name}</div>
      <div class="card-sub" style="left:38.68px;top:83.08px;width:{subw}px">{sub}</div>
      <div class="card-btn" style="left:{btnX}px;top:{btnY}px">
        <span class="t" style="color:{col}">{btn}</span><span class="chev" style="color:{col}">›</span>
      </div>
    </div>''')

# 顶部时间
parts.append('''
    <div class="clock">09:30</div>
    <div class="date">01/18</div>
    <div class="week">星期六</div>
    <div class="vline"></div>
    <img class="weather" src="assets/home2-weather.png" alt="">
    <div class="temp">12°C</div>
    <div class="sky">晴转多云</div>''')

# 右上
parts.append('''
    <div class="parent" id="parentEntry">
      <svg class="ico" viewBox="0 0 24 24" fill="none">
        <path d="M12 2.6 4.6 5.5v6.2c0 4.4 3.1 8.3 7.4 9.7 4.3-1.4 7.4-5.3 7.4-9.7V5.5L12 2.6Z" stroke="#F08A32" stroke-width="2" stroke-linejoin="round"/>
        <circle cx="12" cy="10.2" r="2.1" stroke="#F08A32" stroke-width="2"/>
        <path d="M8.9 16.1c.63-1.7 1.8-2.55 3.1-2.55s2.47.85 3.1 2.55" stroke="#F08A32" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <span>家长中心</span>
    </div>
    <div class="checkin">
      <svg class="cal" viewBox="0 0 24 24" fill="none">
        <rect x="2.6" y="4.6" width="18.8" height="17" rx="4.6" stroke="#5099FD" stroke-width="2.2"/>
        <path d="M2.6 9.6h18.8" stroke="#5099FD" stroke-width="2.2"/>
        <path d="M7.6 2.6v4.2M16.4 2.6v4.2" stroke="#5099FD" stroke-width="2.2" stroke-linecap="round"/>
      </svg>
      <span>连续打卡<i>XX</i>天</span>
    </div>
    <div class="user">
      <span class="avatar"><img src="assets/home2-boy.png" alt=""></span>
      <span>小星星</span>
    </div>''')

# 破壳进度
parts.append('''
    <div class="hatch">
      <div class="hatch-panel"></div>
      <div class="hatch-title">破壳进度</div>
      <div class="hatch-bar"><span class="hatch-pct">68%</span></div>
      <div class="hatch-track"><i id="hatchFill"></i><b></b></div>
    </div>''')

# 工具栏
tl = []
for ico, label, ix, iy, iw, ih, tx in tools:
    tl.append(f'<img class="t-ico" src="{A}{ico}" style="left:{ix}px;top:{iy}px;width:{iw}px;height:{ih}px" alt="">')
    tl.append(f'<div class="t-label" style="left:{tx}px;top:799.91px">{label}</div>')
for dx in (724.29, 840.00, 955.71, 1072.86, 1190.00):
    tl.append(f'<i class="t-sep" style="left:{dx}px"></i>')
parts.append('\n    <div class="toolbar"></div>\n    ' + '\n    '.join(tl))

# 导航
nv = ['<div class="nav-bar"></div>']
for ico, label, ix, tx in nav:
    nv.append(f'<img class="nav-ico" data-nav="{label}" src="{A}{ico}" style="left:{ix}px" alt="">')
    nv.append(f'<div class="nav-label" data-nav="{label}" style="left:{tx}px">{label}</div>')
parts.append('\n    ' + '\n    '.join(nv))

# 左侧三入口
en = []
ey = 145.33
for ico, label, w, ih, gh, grad, tagx, tagy, txtx, txty, txtw in entries:
    en.append(f'''
    <div class="entry" data-entry="{label}" style="left:30.22px;top:{ey}px;width:{w}px;height:{gh}px">
      <span class="entry-tag" style="left:{tagx}px;top:{tagy}px;background:linear-gradient(180deg,{grad})"></span>
      <span class="entry-txt" style="left:{txtx}px;top:{txty}px;width:{txtw}px">{label}</span>
      <img src="{A}{ico}" style="width:{w}px;height:{ih}px" alt="">
    </div>''')
    ey += gh + 9.11
parts.append(''.join(en))

HTML = f'''<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>知识冒险岛 · 首页</title>
<style>
  *{{box-sizing:border-box;margin:0;padding:0}}
  html,body{{height:100%;overflow:hidden;background:#0b2350;
    font-family:"Noto Sans SC","PingFang SC","Hiragino Sans GB",-apple-system,sans-serif;
    -webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}}
  .view{{position:relative;width:100%;height:100%;overflow:hidden}}
  .stage{{position:absolute;left:50%;top:50%;width:{CW}px;height:{CH}px;transform-origin:center center}}
  .stage *{{position:absolute}}
  img{{display:block}}
  .bg{{left:0;top:0;width:{CW}px;height:{CH}px;object-fit:cover}}
  .boy{{left:71px;top:218.28px;width:412.22px;height:699.38px;object-fit:contain}}
  .egg{{left:346px;top:539.28px;width:274.83px;height:371.24px;object-fit:contain}}

  .card{{cursor:pointer}}
  .card-bg{{left:0;top:0;width:378.04px;object-fit:fill;border-radius:30.9px}}
  .card-name{{width:81px;height:48px;font-size:40.1px;font-weight:700;color:#fff;line-height:1.1}}
  .card-sub{{height:28px;font-size:22.9px;font-weight:400;color:#fff;white-space:nowrap}}
  .card-btn{{width:110.3px;height:41.54px;border-radius:21.49px;background:#F7FFFA;
    display:flex;align-items:center;justify-content:center;gap:8px}}
  .card-btn .t{{position:static;font-size:18.62px;font-weight:700}}
  .card-btn .chev{{position:static;font-size:26px;font-weight:700;line-height:1;margin-top:-2px}}

  .clock{{left:37.35px;top:55.28px;width:160px;height:65px;font-family:Inter,sans-serif;
    font-size:53.36px;font-weight:700;color:#11284F;line-height:1.2}}
  .date{{left:208.1px;top:63.28px;width:48px;height:21px;font-size:17.34px;font-weight:700;color:#11284F}}
  .week{{left:208.1px;top:92.63px;width:53px;height:21px;font-size:17.34px;font-weight:700;color:#11284F}}
  .vline{{left:280.14px;top:68.62px;width:1.33px;height:44.02px;background:rgba(184,214,239,.8)}}
  .weather{{left:293.48px;top:59.28px;width:69.07px;height:57.56px}}
  .temp{{left:380.18px;top:61.95px;width:59px;height:31px;font-family:Inter,sans-serif;
    font-size:25.35px;font-weight:700;color:#11284F}}
  .sky{{left:380.18px;top:95.3px;width:65px;height:19px;font-size:16px;font-weight:700;color:#11284F}}

  .checkin{{left:988.53px;top:48.28px;width:164.08px;height:46.69px;border-radius:23.34px;
    background:#EAF6FF;display:flex;align-items:center;justify-content:center;gap:7px;cursor:pointer}}
  .checkin .cal{{position:static;width:23px;height:23px;flex:0 0 auto}}
  .checkin span{{position:static;font-size:16px;font-weight:700;color:#4A93FE;white-space:nowrap}}
  .checkin i{{position:static;font-style:normal;color:#FE7D4A}}
  .parent{{left:810px;top:48.28px;width:164px;height:46.69px;border-radius:23.34px;
    background:#FFF2E4;display:flex;align-items:center;justify-content:center;gap:7px;cursor:pointer;
    transition:transform .15s}}
  .parent .ico{{position:static;width:22px;height:22px;flex:0 0 auto}}
  .parent span{{position:static;font-size:16px;font-weight:700;color:#E8741C;white-space:nowrap}}
  .parent:active{{transform:scale(.97)}}
  .user{{left:1172.57px;top:48.28px;width:157.41px;height:46.69px;border-radius:23.34px;
    background:#F1F0FF;display:flex;align-items:center;justify-content:center;gap:10px;cursor:pointer}}
  .user span{{position:static;font-size:16px;font-weight:700;color:#11284F;white-space:nowrap}}
  .user .avatar{{position:static;width:38.37px;height:38.37px;border-radius:50%;overflow:hidden;
    border:1.92px solid #fff;background:#CECFFD;flex:0 0 auto}}
  .user .avatar img{{position:static;width:100%;height:100%;object-fit:cover;object-position:50% 12%}}

  .hatch{{left:363px;top:480.28px;width:165.41px;height:118.72px;cursor:pointer}}
  .hatch-panel{{left:-0.15px;top:12.94px;width:165.47px;height:106px;border-radius:25.35px;
    background:rgba(248,249,255,.87);border:1.87px solid rgba(255,255,255,.85);
    box-shadow:0 4px 9.34px rgba(107,84,217,.14)}}
  .hatch-title{{left:34.86px;top:27.32px;width:97px;height:29px;font-size:24px;font-weight:700;
    color:#7438FF;line-height:1.2}}
  .hatch-bar{{left:14.67px;top:66.7px;width:137.4px;height:32.02px;border-radius:16px;
    background:linear-gradient(180deg,#BD5DFF,#6737FF);display:flex;align-items:center;justify-content:center}}
  .hatch-pct{{position:static;font-family:Inter,sans-serif;font-size:28px;font-weight:700;color:#fff}}
  .hatch-track{{left:24.01px;top:89.38px;width:117.39px;height:8px;border-radius:4px;background:#6C70FF}}
  .hatch-track i{{left:0;top:0;width:80.04px;height:8px;border-radius:4px;
    background:#35DFFC;transition:width .4s}}
  .hatch-track b{{left:70.8px;top:-0.66px;width:9.34px;height:9.34px;border-radius:50%;
    background:#EEE3FF;transition:left .4s}}

  .toolbar{{left:600px;top:712.77px;width:720px;height:125.71px;border-radius:35.71px;
    background:rgba(248,252,255,.9);border:2px solid rgba(255,255,255,.85);
    box-shadow:0 4.29px 10px rgba(107,84,217,.14)}}
  .t-ico{{cursor:pointer}}
  .t-label{{width:52px;height:21px;font-size:17.14px;font-weight:700;color:#11284F;
    text-align:center;white-space:nowrap;transform:translateX(-50%);cursor:pointer}}
  .t-sep{{top:744.2px;width:.86px;height:50px;background:#E0E5FF}}

  .nav-bar{{left:0;top:893px;width:{CW}px;height:121px;opacity:.8;
    background:linear-gradient(180deg,#E7F0FE,#DBDFFE);
    box-shadow:0 2.31px 9.23px rgba(146,148,207,.15)}}
  .nav-ico{{top:906.55px;width:61.55px;height:54.04px;cursor:pointer;transition:transform .18s}}
  .nav-label{{top:961px;width:114.72px;height:45.36px;font-size:23.48px;font-weight:700;
    color:#2442A3;text-align:center;line-height:1.9;cursor:pointer}}

  .entry{{cursor:pointer}}
  .entry img{{left:0;top:0;object-fit:contain}}
  .entry-tag{{width:92.47px;height:67.73px;border-radius:25.15px}}
  .entry-txt{{height:16px;font-size:13.54px;font-weight:700;color:#fff;
    text-align:center;line-height:16px;white-space:nowrap}}

  .toast{{left:50%;top:640px;transform:translateX(-50%);padding:16px 34px;border-radius:22px;
    background:rgba(9,25,60,.88);color:#fff;font-size:26px;font-weight:700;
    opacity:0;pointer-events:none;transition:opacity .22s;white-space:nowrap}}
  .toast.show{{opacity:1}}

  .card:active,.entry:active{{transform:scale(.985)}}
</style>
</head>
<body>
<div class="view">
  <div class="stage" id="stage">
    {''.join(parts)}
    <div class="toast" id="toast"></div>
  </div>
</div>
<script>
  // 首次进入：还没选过宠物蛋，先去选蛋页
  try {{
    if (!localStorage.getItem('antistudy.egg')) {{
      location.replace('egg-select.html');
    }}
  }} catch (e) {{}}

  var stage = document.getElementById('stage');
  function fit() {{
    var s = Math.min(window.innerWidth / {CW}, window.innerHeight / {CH});
    stage.style.transform = 'translate(-50%,-50%) scale(' + s + ')';
  }}
  addEventListener('resize', fit);
  addEventListener('orientationchange', fit);
  fit();

  var toastEl = document.getElementById('toast'), tm = null;
  function toast(msg) {{
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(tm);
    tm = setTimeout(function () {{ toastEl.classList.remove('show'); }}, 1400);
  }}

  document.querySelectorAll('.card').forEach(function (c) {{
    c.addEventListener('click', function () {{
      toast('进入「' + c.dataset.card + '」课程');
      setTimeout(function () {{ location.href = 'course.html'; }}, 420);
    }});
  }});
  document.querySelectorAll('.t-ico,.t-label').forEach(function (el) {{
    el.addEventListener('click', function () {{
      var n = el.classList.contains('t-label') ? el.textContent : el.nextElementSibling.textContent;
      n = (n || '').trim();
      var toolMap = {{'绘本馆': 'library.html', '音乐馆': 'music.html', '动画馆': 'cartoon.html'}};
      if (!toolMap[n]) {{ toast('「' + n + '」还没做'); return; }}
      toast('打开「' + n + '」');
      setTimeout(function () {{ location.href = toolMap[n]; }}, 320);
    }});
  }});
  document.querySelectorAll('.entry').forEach(function (e) {{
    e.addEventListener('click', function () {{
      var n = e.dataset.entry;
      var map = {{'灵石商城': 'mall.html', '储物袋': 'bag.html'}};
      if (map[n]) {{ toast('打开「' + n + '」'); setTimeout(function () {{ location.href = map[n]; }}, 360); }}
      else {{ toast('「灵宠」页还没做'); }}
    }});
  }});
  document.querySelectorAll('.nav-ico,.nav-label').forEach(function (el) {{
    el.addEventListener('click', function () {{
      var n = el.dataset.nav;
      document.querySelectorAll('.nav-label').forEach(function (t) {{ t.style.color = '#2442A3'; }});
      document.querySelectorAll('.nav-label[data-nav="' + n + '"]').forEach(function (t) {{ t.style.color = '#0F8CEB'; }});
      var map = {{'首页': 'home.html', '任务': 'task.html', '储物袋': 'bag.html', '我的': 'me.html'}};
      if (map[n]) {{ setTimeout(function () {{ location.href = map[n]; }}, 380); toast('进入「' + n + '」'); }}
      else {{ toast('「' + n + '」还没做'); }}
    }});
  }});
  document.getElementById('parentEntry').addEventListener('click', function () {{ location.href = 'parent.html'; }});
  document.querySelector('.checkin').addEventListener('click', function () {{ toast('今日已打卡 · 连续 7 天'); }});
  document.querySelector('.user').addEventListener('click', function () {{ toast('打开小星星的成长档案'); }});
  document.querySelector('.hatch').addEventListener('click', function () {{
    var f = document.getElementById('hatchFill'), d = document.querySelector('.hatch-track b');
    var w = Math.min(117.39, f.offsetWidth + 18.7);
    f.style.width = w + 'px';
    d.style.left = (w - 9.34) + 'px';
    toast('投喂一颗灵石 · 破壳进度 +8%');
  }});
</script>
</body>
</html>'''

out = os.path.join(BASE, 'home.html')
with open(out, 'w', encoding='utf-8') as f:
    f.write(HTML)
print('生成 home.html', len(HTML), '字符')
