#!/usr/bin/env python3
# 每日修行任务 · 按 Figma 画板 #47:663 还原（1366×1024 原生 4:3）
# 运行：python3 build_task2.py  →  生成 task.html
import os

BASE = os.path.dirname(os.path.abspath(__file__))
CW, CH = 1366, 1024
A = 'assets/'

tasks = [
    # 图标, 标题, 副标题, 奖励, 已完成, 卡片 y
    ('task-i-chinese.png', '语文修行', '完成1节语文课程',    '+20', True,  288.14),
    ('task-i-math.png',    '数学修行', '完成10道数学题',     '+20', False, 400.20),
    ('task-i-english.png', '英语修行', '完成一次英语学习',   '+20', False, 512.25),
    ('task-i-science.png', '科普探索', '完成一个知识挑战',   '+30', False, 624.30),
    ('task-i-battle.png',  '灵宠挑战', '与AI宠物进行一次答题', '+30', False, 736.36),
]

rows = []
for i, (ico, title, sub, bonus, done, y) in enumerate(tasks):
    if done:
        btn = ('<div class="t-btn done"><i class="tick">✓</i><span>已完成</span></div>')
    else:
        btn = '<div class="t-btn go"><span>去完成</span></div>'
    rows.append(f'''
      <div class="task{' done' if done else ''}" data-idx="{i}" style="top:{y}px">
        <img class="t-card" src="{A}task-cardbg.png" alt="">
        <img class="t-ico" src="{A}{ico}" alt="">
        <span class="t-title">{title}</span>
        <span class="t-sub">{sub}</span>
        <img class="t-gem" src="{A}task-gem-s.png" alt="">
        <span class="t-bonus">{bonus}</span>
        {btn}
      </div>''')

nav = [('nav-home.png', '首页', 114.60, 88.04, 'home.html'),
       ('nav-task.png', '任务', 384.10, 357.51, ''),
       ('nav-battle.png', '战斗', 653.90, 624.30, ''),
       ('nav-bag.png', '储物袋', 923.00, 896.44, 'bag.html'),
       ('nav-me.png', '我的', 1189.80, 1163.23, '')]
nav_html = ['<div class="nav-bar"></div>']
for ico, label, ix, tx, href in nav:
    nav_html.append(f'<img class="nav-ico" data-go="{href}" data-name="{label}" src="{A}{ico}" style="left:{ix}px" alt="">')
    nav_html.append(f'<div class="nav-label" data-go="{href}" data-name="{label}" '
                    f'style="left:{tx}px;{"color:#0F8CEB" if label == "任务" else ""}">{label}</div>')

HTML = f'''<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>每日修行任务 · 知识冒险岛</title>
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

  .back{{left:32.02px;top:26.68px;width:64.03px;height:64.03px;border-radius:32.02px;
    background:linear-gradient(180deg,#77D8FF,#398DE7);box-shadow:0 5.34px 5.34px rgba(20,98,186,.35);
    display:flex;align-items:center;justify-content:center;cursor:pointer}}
  .back span{{position:static;color:#fff;font-size:50px;font-weight:700;line-height:1;margin-top:-6px}}
  .title-bar{{left:162.75px;top:26.68px;width:338.83px;height:61.36px;border-radius:32.02px;
    background:rgba(34,91,188,.65)}}
  .title-house{{left:178.76px;top:32.02px;width:58.7px;height:50.69px}}
  .title{{left:250.79px;top:26.68px;width:242.79px;height:58.7px;font-size:33.35px;font-weight:700;
    color:#fff;display:flex;align-items:center}}

  .w1{{left:941.79px;top:32.02px;width:184.09px;height:48.02px;border-radius:24.01px;
    background:rgba(48,98,186,.7)}}
  .w2{{left:1155.23px;top:32.02px;width:181.42px;height:48.02px;border-radius:24.01px;
    background:rgba(48,98,186,.7)}}
  .gem-top{{left:944.46px;top:32.02px;width:56.03px;height:45.36px}}
  .coin-top{{left:1155.23px;top:32.02px;width:58.7px;height:48.02px}}
  .num{{width:80.04px;height:50.69px;font-family:Inter,sans-serif;font-size:25.35px;font-weight:700;
    color:#fff;display:flex;align-items:center;justify-content:center}}
  .n1{{left:1005.82px;top:29.35px}}
  .n2{{left:1227.26px;top:29.35px;width:53.36px}}
  .plus{{width:29.35px;height:29.35px;border-radius:16px;cursor:pointer;
    background:linear-gradient(180deg,#9FC2FF,#6F96EF)}}
  .plus::before,.plus::after{{content:"";position:absolute;background:#fff;border-radius:1.07px}}
  .plus::before{{left:5.87px;top:13.21px;width:17.61px;height:2.93px}}
  .plus::after{{left:13.34px;top:5.74px;width:2.93px;height:17.61px}}
  .p1{{left:1083.19px;top:40.02px}}
  .p2{{left:1299.30px;top:40.02px}}

  .boy{{left:21.92px;top:164.98px;width:332.85px;height:685.88px}}
  .pet{{left:296.14px;top:456.22px;width:232.11px;height:282.8px}}
  .dialog{{left:194.76px;top:122.73px;width:320.16px;height:165.41px}}
  .dialog-txt{{left:224.11px;top:144.07px;width:285.47px;height:96.05;font-size:28.81px;
    font-weight:700;color:#062D8E;line-height:1.55;white-space:pre-line}}

  .prog-card{{left:562.94px;top:136.07px;width:776.38px;height:130.73px}}
  .prog-star{{left:576.28px;top:144.07px;width:88.04px;height:96.05px}}
  .prog-title{{left:672.33px;top:157.41px;width:309.48px;height:40.02px;font-size:24.01px;
    font-weight:700;color:#fff;display:flex;align-items:center}}
  .prog-count{{left:1040.51px;top:200.1px;width:96.05px;height:34.68px;
    font-family:Inter,sans-serif;font-size:24.01px;font-weight:700;color:#fff;
    display:flex;align-items:center;justify-content:center}}
  .chest{{left:1173.91px;top:128.06px;width:170.75px;height:138.73px}}

  .list-bg{{left:562.94px;top:269.46px;width:776.38px;height:589.62px}}

  .task{{left:576.28px;width:749.7px;height:101.38px}}
  .t-card{{left:0;top:0;width:749.7px;height:101.38px;border-radius:24.01px}}
  .t-ico{{left:24.01px;top:6px;width:93.38px;height:88px;object-fit:contain}}
  .t-title{{left:138.73px;top:5.34px;width:282.8px;height:45.36px;font-size:28.81px;
    font-weight:700;color:#0B348E;display:flex;align-items:center}}
  .t-sub{{left:138.73px;top:48.02px;width:282.8px;height:40.02px;font-size:21.08px;
    font-weight:500;color:#526EAF;display:flex;align-items:center}}
  .t-gem{{left:402.86px;top:26.68px;width:48.02px;height:45.36px}}
  .t-bonus{{left:450.89px;top:24.01px;width:88.04px;height:45.36px;font-family:Inter,sans-serif;
    font-size:28.28px;font-weight:700;color:#073EAE;display:flex;align-items:center}}
  .t-btn{{left:562.94px;top:16.01px;width:165.41px;height:66.7px;border-radius:34.68px;
    cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px}}
  .t-btn.go{{background:linear-gradient(180deg,#76DBFF,#3E80F6);
    box-shadow:0 5.34px 5.34px rgba(94,153,240,.3)}}
  .t-btn.go span{{position:static;font-size:28.55px;font-weight:700;color:#fff}}
  .t-btn.done{{background:linear-gradient(180deg,#B8F5CB,#79DC9D);
    box-shadow:0 5.34px 5.34px rgba(88,186,144,.3)}}
  .t-btn.done span{{position:static;font-size:26.68px;font-weight:700;color:#278F62}}
  .tick{{position:static;width:34.68px;height:34.68px;border-radius:50%;background:#30BB79;
    color:#fff;font-size:22px;font-style:normal;display:flex;align-items:center;
    justify-content:center;margin-left:-26px}}

  .total{{left:32.02px;top:792.39px;width:504.25px;height:82.71px}}
  .total-bg{{left:0;top:0;width:504.25px;height:82.71px}}
  .total-t{{left:93.38px;top:13.34px;width:170.75px;height:53.36px;font-size:22.41px;
    font-weight:700;color:#133D91;display:flex;align-items:center}}
  .total-gem{{left:242.79px;top:21.34px;width:37.35px;height:37.35px}}
  .total-n{{left:282.8px;top:13.34px;width:66.7px;height:53.36px;font-family:Inter,sans-serif;
    font-size:24.01px;font-weight:700;color:#173A91;display:flex;align-items:center}}
  .claim{{left:352.17px;top:13.34px;width:136.07px;height:58.7px;border-radius:32.02px;
    background:linear-gradient(180deg,#B9C2D5,#929DB8);cursor:pointer;
    display:flex;align-items:center;justify-content:center}}
  .claim span{{position:static;font-size:22.94px;font-weight:700;color:#fff}}
  .claim.on{{background:linear-gradient(180deg,#FFF36C,#FFAD05);
    box-shadow:0 4px 0 rgba(249,153,22,.95),0 0 14px rgba(255,210,80,.8)}}
  .gift{{left:45.36px;top:795.05px;width:77.37px;height:74.7px}}

  .nav-bar{{left:0;top:903.75px;width:{CW}px;height:121px;opacity:.8;
    background:linear-gradient(180deg,#E7F0FE,#DBDFFE);
    box-shadow:0 2.31px 9.23px rgba(146,148,207,.15)}}
  .nav-ico{{top:917.3px;width:61.55px;height:54.04px;cursor:pointer}}
  .nav-label{{top:971.75px;width:114.72px;height:45.36px;font-size:23.48px;font-weight:700;
    color:#2442A3;text-align:center;line-height:1.9;cursor:pointer}}

  .toast{{left:50%;top:620px;transform:translateX(-50%);padding:16px 34px;border-radius:22px;
    background:rgba(9,25,60,.9);color:#fff;font-size:26px;font-weight:700;
    opacity:0;pointer-events:none;transition:opacity .22s;white-space:nowrap}}
  .toast.show{{opacity:1}}
</style>
</head>
<body>
<div class="view">
  <div class="stage" id="stage">
    <img class="bg" src="assets/task-bg.png" alt="">
    <img class="boy" src="assets/task-boy.png" alt="">
    <img class="pet" src="assets/task-pet.png" alt="">

    <div class="back" id="back"><span>‹</span></div>
    <div class="title-bar"></div>
    <img class="title-house" src="assets/task-house.png" alt="">
    <div class="title">每日修行任务</div>

    <div class="w1"></div><div class="w2"></div>
    <img class="gem-top" src="assets/task-gem.png" alt="">
    <img class="coin-top" src="assets/task-coins.png" alt="">
    <div class="num n1">1280</div>
    <div class="num n2">12</div>
    <div class="plus p1"></div><div class="plus p2"></div>

    <img class="dialog" src="assets/task-dialog.png" alt="">
    <div class="dialog-txt">完成今日任务，
获得灵石和经验吧！</div>

    <img class="prog-card" src="assets/task-progress.png" alt="">
    <img class="prog-star" src="assets/task-star.png" alt="">
    <div class="prog-title">今日任务进度</div>
    <div class="prog-count" id="count">3 / 5</div>
    <img class="chest" src="assets/task-chest.png" alt="">

    <img class="list-bg" src="assets/task-listbg.png" alt="">
{"".join(rows)}

    <div class="total">
      <img class="total-bg" src="{A}task-rewardcard.png" alt="">
      <span class="total-t">全部完成奖励</span>
      <img class="total-gem" src="{A}task-gem-s.png" alt="">
      <span class="total-n">+50</span>
      <div class="claim" id="claim"><span>领取奖励</span></div>
    </div>
    <img class="gift" src="assets/task-gift.png" alt="">

    {"".join(nav_html)}
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
    clearTimeout(tm); tm = setTimeout(function () {{ toastEl.classList.remove('show'); }}, 1500); }}

  var total = {len(tasks)}, doneN = {sum(1 for t in tasks if t[4])};
  var claim = document.getElementById('claim');

  function refresh() {{
    document.getElementById('count').textContent = doneN + ' / ' + total;
    claim.classList.toggle('on', doneN === total);
  }}
  refresh();

  document.querySelectorAll('.task').forEach(function (t) {{
    var btn = t.querySelector('.t-btn');
    btn.addEventListener('click', function (ev) {{
      ev.stopPropagation();
      if (btn.classList.contains('done')) {{ toast('这个任务今天已经完成啦'); return; }}
      btn.classList.remove('go');
      btn.classList.add('done');
      btn.innerHTML = '<i class="tick">✓</i><span>已完成</span>';
      t.classList.add('done');
      doneN++;
      refresh();
      toast('任务完成 · 灵石 +20');
    }});
  }});

  claim.addEventListener('click', function () {{
    if (doneN < total) {{ toast('还有 ' + (total - doneN) + ' 个任务没完成'); return; }}
    toast('奖励已领取 · 灵石 +50');
  }});

  document.getElementById('back').addEventListener('click', function () {{ location.href = 'home.html'; }});
  document.getElementById('plus').addEventListener('click', function () {{}});
  document.querySelectorAll('.plus').forEach(function (p) {{
    p.addEventListener('click', function () {{ toast('补充灵石 · 打开商城'); }});
  }});
  document.querySelectorAll('.nav-ico,.nav-label').forEach(function (el) {{
    el.addEventListener('click', function () {{
      var go = el.dataset.go;
      if (go) {{ location.href = go; }}
      else {{ toast('「' + el.dataset.name + '」还没做'); }}
    }});
  }});
</script>
</body>
</html>'''

out = os.path.join(BASE, 'task.html')
with open(out, 'w', encoding='utf-8') as f:
    f.write(HTML)
print('生成 task.html', len(HTML), '字符')
