#!/usr/bin/env python3
# 储物袋 · 按 Figma 画板 #47:766 还原（1366×1024 原生 4:3）
# 运行：python3 build_bag2.py  →  生成 bag.html
import os

BASE = os.path.dirname(os.path.abspath(__file__))
CW, CH = 1366, 1024
A = 'assets/'

tabs = [
    # 名称, y, 高亮
    ('服装', 218.23, False),
    ('发型', 367.27, False),
    ('配饰', 513.64, False),
    ('宠物', 660.02, True),
]

# 卡 x, y, w, h, 卡底图(空=渐变), 物品图, 物品 x, y, w, h, 名称, 名称 x, y, 数量, 数量 x, y
items = [
    (736.83, 301.58, 160.08, 188.96, '',                  'bag2-dragon.png',  24.01, 13.31, 106.72, 130.41, '小龙',     2.67, 143.72, 'x1',  114.72, 109.12),
    (918.25, 301.58, 160.08, 188.96, 'bag2-c2.png',       'bag2-egg.png',     32.02, 21.29, 101.38, 125.08, '宠物蛋',   2.67, 143.72, '',     0,     0),
    (1098.29, 301.78, 158.62, 188.64, 'bag2-c3.png',      'bag2-stone.png',   25.40, 18.43, 106.72, 111.78, '灵石',     1.38, 143.52, 'x3',  113.44, 108.92),
    (737.03, 520.94, 160.12, 211.65, 'bag2-c4.png',       'bag2-potion.png',  23.81, 12.18, 114.72, 119.76, '经验药水', 2.47, 139.93, 'x3',  114.52, 105.33),
    (918.16, 520.94, 160.12, 211.65, 'bag2-c5.png',       'bag2-dust.png',    18.77, 17.50, 117.39, 114.44, '星尘碎片', 2.76, 139.93, 'x10', 106.81, 105.33),
    (1096.79, 521.44, 160.12, 211.15, 'bag2-c6.png',      'bag2-clothes.png', 18.89, 14.34, 125.39, 119.76, '宠物服装', 2.88, 139.43, '',     0,     0),
]

tab_html = []
for name, y, on in tabs:
    cls = 'tab on' if on else 'tab'
    tab_html.append(f'''
      <div class="{cls}" data-tab="{name}" style="top:{y}px">
        <img src="{A}bag2-i-{'clothes' if name == '服装' else ('hair' if name == '发型' else ('acc' if name == '配饰' else 'pet'))}.png" alt="">
        <span style="{'color:#FFF0B0' if on else '#fff'}">{name}</span>
      </div>''')

item_html = []
for x, y, w, h, card, thing, tx, ty, tw, th, name, nx, ny, cnt, cx, cy in items:
    card_html = (f'<img class="card" src="{A}{card}" alt="">' if card else '<span class="card grad"></span>')
    cnt_html = f'<i class="cnt" style="left:{cx}px;top:{cy}px">{cnt}</i>' if cnt else ''
    item_html.append(f'''
      <div class="item" data-item="{name}" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px">
        {card_html}
        <img class="thing" src="{A}{thing}" style="left:{tx}px;top:{ty}px;width:{tw}px;height:{th}px" alt="">
        <span class="nm" style="left:{nx}px;top:{ny}px">{name}</span>
        {cnt_html}
      </div>''')

HTML = f'''<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>储物袋 · 知识冒险岛</title>
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

  .title-bar{{left:29px;top:20.59px;width:370.85px;height:128.06px;border-radius:53.36px;
    background:linear-gradient(180deg,#1739AA,#0B2788);opacity:.75}}
  .home-btn{{left:40.02px;top:36.59px;width:93.38px;height:96.05px;cursor:pointer;opacity:1}}
  .title{{left:154.74px;top:49.59px;width:245.45px;height:69.37px;font-size:50.69px;
    font-weight:900;color:#fff;display:flex;align-items:center;
    text-shadow:0 2.66px 2.67px rgba(20,42,102,.6)}}

  .wallet{{left:808.39px;top:45.25px;width:266.8px;height:77.18px;border-radius:40.02px;
    background:rgba(2,56,149,.85);border:1.87px solid #246DE1;display:flex;align-items:center}}
  .wallet img{{position:static;width:75.05px;height:70.05px;margin-left:10.2px}}
  .wallet .num{{position:static;margin-left:0;width:109.39px;height:53.23px;
    display:flex;align-items:center;justify-content:center;
    font-family:Inter,sans-serif;font-size:37.35px;font-weight:700;color:#fff}}
  .wallet2{{left:1109.87px;top:45.25px;width:221.44px;height:77.18px;border-radius:40.02px;
    background:rgba(2,56,149,.85);border:1.87px solid #246DE1;display:flex;align-items:center}}
  .wallet2 img{{position:static;width:65.05px;height:63.55;margin-left:10.95px}}
  .wallet2 .num{{position:static;width:61.36px;height:53.23px;display:flex;align-items:center;
    justify-content:center;font-family:Inter,sans-serif;font-size:37.35px;font-weight:700;color:#fff}}
  .plus{{width:53.36px;height:61.21px;border-radius:29.35px;
    background:linear-gradient(180deg,#347FF6,#0746BA);color:#fff;font-size:46px;font-weight:500;
    display:flex;align-items:center;justify-content:center;line-height:1;cursor:pointer;
    padding-bottom:6px}}
  .p1{{left:1011.16px;top:53.23px}}
  .p2{{left:1267.00px;top:50.59px}}

  .tab{{left:56.03px;width:253.46px;height:130.41px;border-radius:34.68px;cursor:pointer;
    background:linear-gradient(180deg,#2F67E2,#2448AC);border:2.13px solid #4389ED;
    box-shadow:0 5.32px 8px rgba(17,45,152,.4);display:flex;align-items:center}}
  .tab img{{position:static;margin-left:34.68px;width:69.37px;height:74.52px}}
  .tab span{{position:static;margin-left:13.34px;font-size:42.69px;font-weight:900;
    line-height:1;text-shadow:0 2.66px 2.67px rgba(20,42,102,.6)}}
  .tab.on{{background:linear-gradient(180deg,#65C7FF,#1167FF);border:4.27px solid #C2FFFF;
    box-shadow:0 5.32px 24px rgba(0,231,255,.85)}}

  .pet{{left:349px;top:223.59px;width:342.75px;height:706.02px}}

  .panel{{left:707.48px;top:224.4px;width:573.61px;height:683.97px;opacity:.85}}
  .panel-title{{left:739.5px;top:235.05px;width:242.79px;height:53.23px;font-size:32.02px;
    font-weight:700;color:#fff;display:flex;align-items:center;
    text-shadow:0 2.66px 2.67px rgba(20,42,102,.6)}}

  .item{{cursor:pointer}}
  .item .card{{left:0;top:0;width:100%;height:100%;border-radius:27.52px}}
  .item .card.grad{{background:linear-gradient(180deg,#65C7FF,#1167FF);
    border:4.27px solid #C2FFFF;border-radius:34.68px;
    box-shadow:0 5.32px 24px rgba(0,231,255,.85)}}
  .item .thing{{object-fit:contain}}
  .nm{{width:154.74px;height:42.58px;font-size:26.68px;font-weight:700;color:#fff;
    display:flex;align-items:center;justify-content:center;text-align:center;
    text-shadow:0 2.66px 2.67px rgba(20,42,102,.6)}}
  .cnt{{width:45.36px;height:34.6px;font-size:24.01px;font-weight:700;color:#fff;
    display:flex;align-items:center;justify-content:center;
    text-shadow:0 2.66px 2.67px rgba(20,42,102,.6)}}

  .tidy{{left:851.55px;top:762px;width:328.16px;height:109.12px;border-radius:56.03px;
    background:linear-gradient(180deg,#FFF568,#FFBE00);border:4px solid #FFF4A2;
    box-shadow:0 7.98px 8px rgba(108,61,0,.5);display:flex;align-items:center;
    justify-content:center;cursor:pointer}}
  .tidy span{{position:static;font-size:48.02px;font-weight:900;color:#713100;line-height:1}}

  .toast{{left:50%;top:620px;transform:translateX(-50%);padding:16px 34px;border-radius:22px;
    background:rgba(9,25,60,.9);color:#fff;font-size:26px;font-weight:700;
    opacity:0;pointer-events:none;transition:opacity .22s;white-space:nowrap}}
  .toast.show{{opacity:1}}
</style>
</head>
<body>
<div class="view">
  <div class="stage" id="stage">
    <img class="bg" src="assets/bag2-bg.png" alt="">
    <div class="title-bar"></div>
    <img class="home-btn" id="homeBtn" src="assets/bag2-ico-home.png" alt="">
    <div class="title">储物袋</div>
    <div class="wallet"><img src="assets/bag2-ico-stone.png" alt=""><span class="num">1280</span></div>
    <div class="wallet2"><img src="assets/bag2-ico-potion.png" alt=""><span class="num">12</span></div>
    <div class="plus p1" data-plus="灵石">+</div>
    <div class="plus p2" data-plus="药水">+</div>
{"".join(tab_html)}
    <img class="pet" src="{A}bag2-pet.png" alt="">
    <img class="panel" src="{A}bag2-panel.png" alt="">
    <div class="panel-title">宠物背包</div>
{"".join(item_html)}
    <div class="tidy" id="tidy"><span>整理背包</span></div>
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

  document.getElementById('homeBtn').addEventListener('click', function () {{ location.href = 'home.html'; }});
  document.querySelectorAll('.plus').forEach(function (p) {{
    p.addEventListener('click', function () {{ toast('补充' + p.dataset.plus + ' · 打开商城'); }});
  }});
  document.querySelectorAll('.tab').forEach(function (t) {{
    t.addEventListener('click', function () {{
      document.querySelectorAll('.tab').forEach(function (x) {{ x.classList.remove('on'); }});
      t.classList.add('on');
      document.querySelector('.panel-title').textContent = t.dataset.tab + '背包';
      toast('切换到「' + t.dataset.tab + '」');
    }});
  }});
  document.querySelectorAll('.item').forEach(function (i) {{
    i.addEventListener('click', function () {{ toast('「' + i.dataset.item + '」详情'); }});
  }});
  document.getElementById('tidy').addEventListener('click', function () {{ toast('背包已整理 · 按类别排好了'); }});
</script>
</body>
</html>'''

out = os.path.join(BASE, 'bag.html')
with open(out, 'w', encoding='utf-8') as f:
    f.write(HTML)
print('生成 bag.html', len(HTML), '字符')
