#!/usr/bin/env python3
# 数学课程页 · 按 Figma 画板 #47:913 还原（1366×1024 原生 4:3）
# 运行：python3 build_course2.py  →  生成 course.html
import os

BASE = os.path.dirname(os.path.abspath(__file__))
CW, CH = 1366, 1024
A = 'assets/'

stat_icons = [
    ('course2-i-book.png',   36.06, 361.46, 38.84, 44.98),
    ('course2-i-video.png',  36.06, 404.84, 40.23, 43.38),
    ('course2-i-medal.png',  36.06, 469.10, 41.61, 46.59),
    ('course2-i-time.png',   34.68, 515.69, 40.23, 36.95),
    ('course2-i-streak.png', 36.06, 578.34, 38.84, 44.98),
    ('course2-i-gem.png',    36.06, 626.54, 38.84, 40.16),
]

week_nodes = [
    ('course2-week-done1.png', 421.54),
    ('course2-week-done2.png', 557.46),
    ('__CURRENT__', 693.38),
    ('course2-week-todo.png',  829.30),
    ('course2-week-todo.png',  965.22),
    ('course2-week-todo.png',  1101.14),
]

lessons = [
    # 卡图, x, y, w, h, 卡内文字色, 标题 x, 讲号/标题 y, 状态按钮组
    ('course2-l1.png', 319.00, 717.00, 237.45, 130.73, '#24412F', 349.68,
     '第1讲', '用字母表示数', 746.35, 786.37, 'done', 493.75, 718.33),
    ('course2-l2.png', 568.59, 726.80, 241.18, 114.58, '#FFFFFF', 592.47,
     '第2讲', '等式性质', 745.01, 785.03, 'todo', 717.86, 767.69),
    ('course2-l3.png', 824.78, 726.80, 245.18, 114.58, '#FFFFFF', 848.59,
     '第3讲', '解方程应用', 745.01, 785.03, 'live', 979.32, 767.69),
]

parts = [f'<img class="bg" src="{A}course2-bg.png" alt="">']

# 顶部
parts.append(f'''
    <div class="back"><span>‹</span></div>
    <div class="page-title">数学课程</div>
    <div class="chip chip-check"><img src="{A}course2-sign.png" alt=""><span>连续打卡<i>XXX</i></span></div>
    <div class="chip chip-stone"><img src="{A}course2-stone.png" alt=""><span>灵石 1,220</span></div>''')

# 左侧角色卡
si = '\n      '.join(
    f'<img src="{A}{n}" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px" alt="">'
    for n, x, y, w, h in stat_icons)
parts.append(f'''
    <div class="profile">
      <img class="p-bg" src="{A}course2-profile.png" alt="">
      {si}
      <img class="p-badge" src="{A}course2-badge.png" alt="">
      <img class="p-boy" src="{A}course2-boy.png" alt="">
      <div class="lv" style="left:43px;top:187.96px">Level 5</div>
      <div class="lv2" style="left:138.71px;top:189.57px">数学逻辑</div>
      <div class="lv2" style="left:40.23px;top:253.83px">进阶进度</div>
      <div class="lv" style="left:126.23px;top:253.83px;color:#FFF046">68%</div>
      <div class="p-track"><i></i></div>
      <div class="s-t" style="left:81.84px;top:371.1px">共学习</div>
      <div class="s-v" style="left:81.84px;top:411.26px">28个视频</div>
      <div class="s-g" style="left:176.16px;top:414.48px">28/40</div>
      <div class="s-t" style="left:81.84px;top:480.34px">总时长</div>
      <div class="s-v" style="left:81.84px;top:520.51px;color:#FFE161">12.6h</div>
      <div class="s-g" style="left:156.74px;top:523.72px">12.6/20h</div>
      <div class="s-t" style="left:81.84px;top:589.59px">连续学习</div>
      <div class="s-v" style="left:81.84px;top:631.36px">7天</div>
      <div class="s-g" style="left:156.74px;top:632.96px">7/7天</div>
    </div>''')

# 进阶周计划
wn_parts = []
for n, x in week_nodes:
    if n == '__CURRENT__':
        wn_parts.append(f'<i class="w-cur" style="left:{x}px"></i>')
    else:
        wn_parts.append(f'<img src="{A}{n}" style="left:{x}px;top:43.1px;width:37.35px;height:37.35px" alt="">')
wn = '\n      '.join(wn_parts)
parts.append(f'''
    <div class="week">
      <span class="w-title">进阶周计划</span>
      <span class="w-rail"></span><span class="w-fill"></span>
      {wn}
    </div>''')

# 课程内容
parts.append(f'''
    <div class="main">
      <div class="board">
        <img src="{A}course2-board.png" alt="">
        <img class="board-boy" src="{A}course2-board-boy.png" alt="">
        <span class="board-q">123 + 456 = ?</span>
      </div>
      <div class="tab on">清华数学</div>
      <div class="tab">乐读数学</div>
      <div class="lv3" style="left:50.78px;top:127px">Level 5</div>
      <div class="ls-num" style="left:50.78px;top:197.17px">第</div>
      <div class="ls-num" style="left:84.13px;top:191px;color:#BAFF55">3讲</div>
      <div class="ls-title" style="left:153.5px;top:197.17px">数的奇妙世界</div>
      <div class="ls-sub" style="left:52.11px;top:281px">认识更大的数</div>
      <div class="play"><span></span></div>
      <div class="grade">
        <img src="{A}course2-hat.png" alt="">
        <span>四年级</span><b>▾</b>
      </div>
    </div>''')

# 课程卡片
lc = []
for img, x, y, w, h, col, tx, num, title, ny, ty, kind, bx, by in lessons:
    if kind == 'done':
        status = '<div class="st done">已完成</div>'
        extra = '<span class="tick">✓</span>'
    elif kind == 'todo':
        status = '<div class="st todo">可学习</div>'
        extra = f'<i class="mini" style="left:{bx + 18.68}px;top:{by - 24.01}px"></i>'
    else:
        status = '<div class="st todo">进行中</div>'
        extra = f'<i class="mini" style="left:{bx + 18.68}px;top:{by - 24.01}px"></i>'
    lc.append(f'''
      <div class="lesson" data-lesson="{num}">
        <img class="l-bg" src="{A}{img}" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px" alt="">
        <div class="l-num" style="left:{tx}px;top:{ny}px;color:{col}">{num}</div>
        <div class="l-title" style="left:{tx}px;top:{ty}px;color:{col}">{title}</div>
        <div class="l-st" style="left:{bx}px;top:{by}px">{status}</div>
        {extra}
      </div>''')
parts.append('\n    ' + '\n    '.join(lc))
parts.append(f'''
    <div class="lockcard">
      <img src="{A}course2-lock-big.png" alt="">
      <span class="lock-txt"><img src="{A}course2-lock-small.png" alt="">未解锁</span>
    </div>''')

# 导航
nv = ['<div class="nav-bar"></div>']
for ico, label, ix, tx in [('nav-home.png', '首页', 114.60, 88.04),
                           ('nav-task.png', '任务', 384.10, 357.51),
                           ('nav-battle.png', '战斗', 653.90, 624.30),
                           ('nav-bag.png', '储物袋', 923.00, 896.44),
                           ('nav-me.png', '我的', 1189.80, 1163.23)]:
    nv.append(f'<img class="nav-ico" src="{A}{ico}" style="left:{ix}px" alt="">')
    nv.append(f'<div class="nav-label" style="left:{tx}px">{label}</div>')
parts.append('\n    ' + '\n    '.join(nv))

HTML = f'''<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>数学课程 · 知识冒险岛</title>
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

  .back{{left:53.36px;top:20.01px;width:44.02px;height:41.35px;border-radius:21.34px;
    background:linear-gradient(180deg,#2766DC,#1542AD);border:1.6px solid #2766DC;
    display:flex;align-items:center;justify-content:center;cursor:pointer}}
  .back span{{position:static;color:#fff;font-size:30px;font-weight:700;line-height:1;margin-top:-4px}}
  .page-title{{left:116.06px;top:25.35px;width:113px;height:33px;font-size:28px;font-weight:700;color:#fff}}
  .chip{{height:37.35px;border-radius:18.68px;display:flex;align-items:center;gap:6px;cursor:pointer}}
  .chip img{{position:static;width:36.02px;height:37.35px;flex:0 0 auto}}
  .chip span{{position:static;font-size:17.34px;font-weight:700;color:#fff;white-space:nowrap}}
  .chip i{{position:static;font-style:normal}}
  .chip-check{{left:969.81px;top:22.68px;width:181.42px;
    background:linear-gradient(180deg,#102D80,#102267);border:1.6px solid #102D80;padding-right:10px}}
  .chip-stone{{left:1171.24px;top:22.68px;width:150.74px;
    background:linear-gradient(180deg,#183B8B,#102968);border:1.6px solid #183B8B}}
  .chip-stone span{{font-size:18.68px}}

  .profile{{left:34px;top:151px;width:285px;height:696px}}
  .p-bg{{left:0;top:0;width:285px;height:696px;border-radius:24.97px}}
  .p-badge{{left:203.9px;top:239.37px;width:36.06px;height:53.01px}}
  .p-boy{{left:76px;top:14px;width:155.36px;height:157.48px}}
  .lv{{font-size:22.19px;font-weight:700;color:#fff;line-height:1.18;white-space:nowrap}}
  .lv2{{font-size:20.81px;font-weight:700;color:#fff;line-height:1.18;white-space:nowrap}}
  .p-track{{left:40.23px;top:293.99px;width:192.81px;height:25.7px;border-radius:11.1px;background:#1756AF}}
  .p-track i{{left:0;top:0;width:151.19px;height:25.7px;border-radius:11.1px;
    background:linear-gradient(180deg,#36FF80,#12DE69)}}
  .s-t{{font-size:19.42px;font-weight:700;color:#fff;line-height:1.18;white-space:nowrap}}
  .s-v{{font-size:18.03px;font-weight:700;color:#fff;line-height:1.18;white-space:nowrap}}
  .s-g{{font-size:16.65px;font-weight:400;color:#B1C8F4;line-height:1.18;white-space:nowrap}}

  .week{{left:332px;top:128px;width:981px;height:98px;border-radius:17.51px;background:#092467;
    box-shadow:inset 0 3.5px 4px rgba(156,173,255,.45)}}
  .w-title{{left:14.84px;top:10.05px;font-size:25.35px;font-weight:700;color:#fff;white-space:nowrap}}
  .w-rail{{left:25.26px;top:66.12px;width:814.6px;height:8.01px;border-radius:4px;background:#36569A}}
  .w-fill{{left:25.26px;top:66.12px;width:380.28px;height:8.01px;border-radius:4px;
    background:linear-gradient(180deg,#0E8A8C,#5FFF92)}}
  .week img{{width:37.35px;height:37.35px}}
  .w-cur{{top:41.1px;width:41.35px;height:41.35px;border-radius:50%;
    background:linear-gradient(180deg,#FFCE5C,#FF8A00);
    border:2.67px solid #FFF1B8;box-shadow:0 0 14px rgba(255,175,50,.85)}}
  .w-cur::after{{content:"";position:absolute;left:14.7px;top:14.7px;width:12px;height:12px;
    border-radius:50%;background:#fff}}

  .main{{left:318.73px;top:235px;width:994.23px;height:469px}}
  .main::before{{content:"";position:absolute;left:0;top:.72px;width:994.23px;height:468.28px;
    border-radius:17.51px;background:#092467}}
  .board{{left:388.27px;top:115.67px;width:557.91px;height:337.91px;border-radius:21.02px;
    overflow:hidden;background:#D9D9D9}}
  .board img{{left:-388.7px;top:-109.63px;width:1000.49px;height:479.22px;border-radius:24px}}
  .board .board-boy{{left:354.46px;top:21.28px;width:210px;height:307.46px;border-radius:0}}
  .board-q{{left:267px;top:133.34px;font-size:24.01px;font-weight:400;color:#fff;white-space:nowrap}}

  .tab{{top:2.77px;height:61.49px;border-radius:14.67px;display:flex;align-items:center;
    justify-content:center;font-size:22.68px;font-weight:700;cursor:pointer}}
  .tab.on{{left:13.27px;width:166px;color:#fff;
    background:linear-gradient(180deg,#208DFF,#075DD6);border:1.6px solid #208DFF}}
  .tab:not(.on){{left:187.27px;width:164px;color:#AFC3F4;
    background:linear-gradient(180deg,#314C9C,#243C81);border:1.6px solid #314C9C}}

  .lv3{{font-size:25.35px;font-weight:700;color:#fff;white-space:nowrap}}
  .ls-num{{font-size:30.68px;font-weight:700;color:#fff;line-height:1.18;white-space:nowrap}}
  .ls-title{{font-size:29.35px;font-weight:700;color:#fff;line-height:1.18;white-space:nowrap}}
  .ls-sub{{font-size:21.34px;font-weight:700;color:#fff;white-space:nowrap}}
  .play{{left:524.27px;top:228px;width:76px;height:76px;border-radius:50%;
    background:linear-gradient(180deg,#FFCB51,#FF8000);border:1.6px solid #FFCB51;
    display:flex;align-items:center;justify-content:center;cursor:pointer}}
  .play span{{position:static;width:0;height:0;border-left:20px solid #fff;
    border-top:12px solid transparent;border-bottom:12px solid transparent;margin-left:6px}}
  .grade{{left:803.27px;top:0;width:160px;height:66.5px}}
  .grade::before{{content:"";position:absolute;left:0;top:3.89px;width:160px;height:62.61px;
    border-radius:26.68px;background:linear-gradient(180deg,#1858D6,#102A82);border:1.6px solid #1858D6}}
  .grade img{{left:11.83px;top:0;width:42.69px;height:63.76px}}
  .grade span{{left:60px;top:29.76px;position:absolute;font-size:21.34px;font-weight:700;color:#fff;white-space:nowrap}}
  .grade b{{left:131.89px;top:27px;position:absolute;font-size:18px;color:#fff;font-weight:700}}

  .lesson{{cursor:pointer}}
  .l-bg{{border-radius:24px;object-fit:fill}}
  .l-num{{font-size:24.01px;font-weight:700;line-height:1.18;white-space:nowrap}}
  .l-title{{font-size:22.68px;font-weight:700;line-height:1.18;white-space:nowrap}}
  .l-st{{position:absolute}}
  .st{{position:static;display:flex;align-items:center;justify-content:center;gap:3px;
    color:#fff;font-size:21.34px;font-weight:700;border-radius:14.67px}}
  .st.done{{width:61.36px;height:29.35px;font-size:14.67px;
    background:linear-gradient(180deg,#2CE86F,#0CBA4A);border:1.6px solid #2CE86F}}
  .st.todo{{width:77.37px;height:53.36px;background:linear-gradient(180deg,#FFA83A,#FF7B04);
    border:1.6px solid #FFA83A;padding-top:16px}}
  .mini{{position:absolute;width:38.69px;height:38.69px;border-radius:50%;
    background:linear-gradient(180deg,#FFCB51,#FF8000);border:1.6px solid #FFCB51}}
  .mini::after{{content:"";position:absolute;left:15px;top:11px;width:0;height:0;
    border-left:13px solid #fff;border-top:8px solid transparent;border-bottom:8px solid transparent}}
  .tick{{left:503.09px;top:794.37px;width:28.01px;height:21.34px;color:#75F3A5;
    font-size:24px;font-weight:700;line-height:1}}

  .lockcard{{left:1091px;top:726.8px;width:222px;height:115px;border-radius:17.51px;background:#092467}}
  .lockcard img{{left:92.04px;top:21px;width:38.69px;height:41.35px}}
  .lock-txt{{left:63.52px;top:51px;display:flex;align-items:center;gap:2.5px;
    font-size:21.34px;font-weight:700;color:#DEE6FF;white-space:nowrap}}
  .lock-txt img{{position:static;width:29.35px;height:33.35px}}

  .nav-bar{{left:0;top:900px;width:{CW}px;height:121px;
    background:linear-gradient(180deg,rgba(12,40,96,.42),rgba(10,32,80,.62));
    box-shadow:0 -1px 10px rgba(4,16,44,.35)}}
  .nav-ico{{top:913.55px;width:61.55px;height:54.04px;cursor:pointer}}
  .nav-label{{top:968px;width:114.72px;height:45.36px;font-size:23.48px;font-weight:700;
    color:#fff;text-align:center;line-height:1.9;cursor:pointer;
    text-shadow:0 2px 6px rgba(4,18,52,.6)}}

  .toast{{left:50%;top:640px;transform:translateX(-50%);padding:16px 34px;border-radius:22px;
    background:rgba(9,25,60,.88);color:#fff;font-size:26px;font-weight:700;
    opacity:0;pointer-events:none;transition:opacity .22s;white-space:nowrap}}
  .toast.show{{opacity:1}}
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
  var stage = document.getElementById('stage');
  function fit() {{
    var s = Math.min(window.innerWidth / {CW}, window.innerHeight / {CH});
    stage.style.transform = 'translate(-50%,-50%) scale(' + s + ')';
  }}
  addEventListener('resize', fit); addEventListener('orientationchange', fit); fit();

  var toastEl = document.getElementById('toast'), tm = null;
  function toast(m) {{ toastEl.textContent = m; toastEl.classList.add('show');
    clearTimeout(tm); tm = setTimeout(function () {{ toastEl.classList.remove('show'); }}, 1400); }}

  document.querySelectorAll('.tab').forEach(function (t) {{
    t.addEventListener('click', function () {{
      document.querySelectorAll('.tab').forEach(function (x) {{ x.classList.remove('on'); }});
      t.classList.add('on');
      toast('切换到「' + t.textContent + '」');
    }});
  }});
  document.querySelectorAll('.lesson').forEach(function (l) {{
    l.addEventListener('click', function () {{ toast('播放「' + l.dataset.lesson + '」'); }});
  }});
  document.querySelector('.play').addEventListener('click', function () {{ toast('继续学习 · 第3讲'); }});
  document.querySelector('.board').addEventListener('click', function () {{ toast('继续学习 · 第3讲'); }});
  document.querySelector('.lockcard').addEventListener('click', function () {{ toast('先完成第3讲才能解锁'); }});
  document.querySelector('.grade').addEventListener('click', function () {{ toast('切换年级'); }});
  document.querySelector('.back').addEventListener('click', function () {{ location.href = 'home.html'; }});
  document.querySelector('.week').addEventListener('click', function () {{ toast('本周已完成 3 / 5 天'); }});
  document.querySelectorAll('.nav-label').forEach(function (n) {{
    n.addEventListener('click', function () {{
      var map = {{'首页': 'home.html', '任务': 'task.html', '储物袋': 'bag.html', '我的': 'me.html'}};
      var t = map[n.textContent];
      if (t) location.href = t; else toast('「' + n.textContent + '」还没做');
    }});
  }});
</script>
</body>
</html>'''

out = os.path.join(BASE, 'course.html')
with open(out, 'w', encoding='utf-8') as f:
    f.write(HTML)
print('生成 course.html', len(HTML), '字符')
