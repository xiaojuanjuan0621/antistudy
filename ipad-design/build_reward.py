#!/usr/bin/env python3
# 奖励弹窗 · 按 Figma 画板 #47:1024 还原（1366×1024 原生 4:3）
# 运行：python3 build_reward.py  →  生成 reward.html
import os

BASE = os.path.dirname(os.path.abspath(__file__))
CW, CH = 1366, 1024
A = 'assets/'

items = [
    # 卡图, 卡 x, y, w, 图标, 图标 x, y, w, h, 名称, 名称 x, 名称色, 数值, 数值 y
    ('rw-c1.png', 257.00, 378.73, 231.87, 'rw-i1.png', 291.47, 422.60, 169.20, 153.53,
     '灵石',    21.93, '#102887', '+100', 256.93),
    ('rw-c2.png', 488.87, 378.73, 241.27, 'rw-i2.png', 520.20, 413.20, 181.73, 166.07,
     '酷炫外套', 10.40, '#24147D', '(永久)', 260.07),
    ('rw-c3.png', 733.27, 378.73, 231.87, 'rw-i3.png', 770.87, 413.20, 156.67, 159.80,
     '经验值',   18.00, '#70290D', '+200', 256.93),
    ('rw-c4.png', 962.00, 378.73, 235.00, 'rw-i4.png', 990.20, 413.20, 153.53, 169.20,
     '宠物卡',   15.67, '#24502C', 'x1',   256.93),
]

cards = []
for card, cx, cy, cw, ico, ix, iy, iw, ih, name, nx, nc, val, vy in items:
    cards.append(f'''
      <div class="rcard" style="left:{cx}px;top:{cy}px;width:{cw}px">
        <img class="rc-bg" src="{A}{card}" alt="">
        <img class="rc-ico" src="{A}{ico}" style="left:{ix - cx}px;top:{iy - cy}px;width:{iw}px;height:{ih}px" alt="">
        <span class="rc-name" style="left:{nx}px;top:{206.8}px;color:{nc}">{name}</span>
        <span class="rc-val" style="left:{nx}px;top:{vy}px;color:{nc}">{val}</span>
      </div>''')

HTML = f'''<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>恭喜获得 · 知识冒险岛</title>
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

  .boy{{left:0;top:310px;width:378.92px;height:561.9px;object-fit:contain}}
  .title-bg{{left:226px;top:144.04px;width:940px;height:249.55px}}
  .title{{left:468.83px;top:173.14px;width:444.85px;height:131.37px;
    font-size:104.5px;font-weight:900;color:#FFF6B4;line-height:1.12;
    -webkit-text-stroke:5.97px #D95102;paint-order:stroke fill;
    text-shadow:0 8.96px 0 rgba(168,58,0,.75);
    display:flex;align-items:center;justify-content:center}}

  .rcard{{height:341.53px}}
  .rc-bg{{left:0;top:0;width:100%;height:100%;object-fit:fill;border-radius:24px}}
  .rc-ico{{object-fit:contain}}
  .rc-name{{width:100%;height:53.27px;font-size:43.87px;font-weight:900;line-height:1.12;
    text-align:center;white-space:nowrap}}
  .rc-val{{width:100%;height:50.13px;font-size:40.73px;font-weight:900;line-height:1.12;
    text-align:center;white-space:nowrap}}
  .rcard:nth-of-type(2) .rc-val{{font-size:37.6px}}

  .dash{{left:576.28px;top:680.33px;width:120.06px;height:45.36px;color:#D5E8FF;
    font-size:29.35px;font-weight:700;display:flex;align-items:center;justify-content:center}}

  .ok{{left:498.91px;top:779px;width:365.51px;height:112.05px;border-radius:61.36px;
    background:linear-gradient(180deg,#FFF797 0%,#FFDA2A 45%,#FF9A00 100%);
    border:5.34px solid #FFF4A8;
    box-shadow:0 5.34px 0 rgba(237,102,0,.8),0 0 16px rgba(255,207,26,.65);
    display:flex;align-items:center;justify-content:center;gap:16px;cursor:pointer}}
  .ok span{{position:static;font-size:53.36px;font-weight:900;color:#702500;line-height:1.12}}
  .ok i{{position:static;width:16.01px;height:32.02px;border-right:9.34px solid #702500;
    border-top:9.34px solid #702500;transform:rotate(45deg);margin-right:6px}}

  .go-pet{{left:386.86px;top:915.07px;width:192.09px;height:45.36px;font-size:29.35px;
    font-weight:700;color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;
    text-shadow:0 2px 6px rgba(4,18,52,.55)}}
  .go-back{{left:741.7px;top:915.07px;width:213.44px;height:45.36px;font-size:29.35px;
    font-weight:700;color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;
    text-shadow:0 2px 6px rgba(4,18,52,.55)}}

  .dragon{{left:1109px;top:561px;width:314px;height:330px;object-fit:contain;
    animation:float 3.6s ease-in-out infinite}}
  @keyframes float{{0%,100%{{transform:translateY(0)}}50%{{transform:translateY(-12px)}}}}

  .toast{{left:50%;top:700px;transform:translateX(-50%);padding:16px 34px;border-radius:22px;
    background:rgba(9,25,60,.9);color:#fff;font-size:26px;font-weight:700;
    opacity:0;pointer-events:none;transition:opacity .22s;white-space:nowrap}}
  .toast.show{{opacity:1}}
</style>
</head>
<body>
<div class="view">
  <div class="stage" id="stage">
    <img class="bg" src="assets/rw-bg.png" alt="">
    <img class="boy" src="assets/rw-boy.png" alt="">
    <img class="title-bg" src="assets/rw-titlebg.png" alt="">
    <div class="title">恭喜获得</div>
{"".join(cards)}
    <div class="dash">—</div>
    <div class="ok" id="ok"><span>开心收下</span><i></i></div>
    <div class="go-pet" id="goPet">去看宠物</div>
    <div class="go-back" id="goBack">返回课程页</div>
    <img class="dragon" src="assets/rw-dragon.png" alt="">
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

  document.getElementById('ok').addEventListener('click', function () {{
    toast('奖励已收下 · 灵石 +100 经验 +200');
    setTimeout(function () {{ location.href = 'home.html'; }}, 900);
  }});
  document.getElementById('goPet').addEventListener('click', function () {{
    toast('宠物页还没做');
  }});
  document.getElementById('goBack').addEventListener('click', function () {{
    location.href = 'course.html';
  }});
</script>
</body>
</html>'''

out = os.path.join(BASE, 'reward.html')
with open(out, 'w', encoding='utf-8') as f:
    f.write(HTML)
print('生成 reward.html', len(HTML), '字符')
