#!/usr/bin/env python3
# 灵石商城 · 按 Figma 画板 #47:821 还原（1366×1024 原生 4:3）
# 运行：python3 build_mall2.py  →  生成 mall.html
import os

BASE = os.path.dirname(os.path.abspath(__file__))
CW, CH = 1366, 1024
A = 'assets/'

# 名称, 数量, 图, 卡 x, y, 图标 x, y, w, h, 名称 y, 数量 y, 类别
goods = [
    ('灵石',     'x100', 'mall2-i-stone.png',  53.36, 361.00, 24.01, 101.78, 154.74, 144.07, 251.18, 291.20, '道具'),
    ('星星卡',   'x5',   'mall2-i-star.png',  274.80, 361.00, 24.01,  99.11, 154.74, 146.74, 251.18, 291.20, '道具'),
    ('经验药水', 'x3',   'mall2-i-potion.png', 496.24, 361.00, 26.68,  99.11, 149.41, 146.74, 251.18, 291.20, '道具'),
    ('加速卷轴', 'x1',   'mall2-i-scroll.png', 715.02, 361.00, 21.34,  99.11, 157.41, 146.74, 251.18, 291.20, '道具'),
    ('活动帽',   'x1',   'mall2-i-hat.png',    53.36, 648.00, 21.34,  18.68, 157.41, 141.40, 170.75, 210.77, '装备'),
    ('酷炫书包', 'x1',   'mall2-i-bag.png',   274.80, 648.00, 24.01,  16.01, 154.74, 144.07, 170.75, 210.77, '服装'),
    ('天使翅膀', 'x1',   'mall2-i-wings.png', 496.24, 648.00, 21.34,  18.68, 157.41, 141.40, 170.75, 210.77, '装备'),
    ('魔法棒',   'x1',   'mall2-i-wand.png',  715.02, 648.00, 21.34,  18.68, 160.08, 141.40, 170.75, 210.77, '装备'),
]

cats = [('全部', 45.36, 202.77, True), ('道具', 250.79, 176.09, False),
        ('装备', 426.88, 176.09, False), ('服装', 602.96, 176.09, False),
        ('宠物', 779.05, 165.41, False)]

card_html, cat_html = [], []
for name, qty, img, x, y, ix, iy, iw, ih, ny, qy, cat in goods:
    card_html.append(f'''
      <div class="good" data-name="{name}" data-cat="{cat}" style="left:{x}px;top:{y}px">
      </div>''')

for name, x, w, on in cats:
    cat_html.append(f'''
      <div class="cat{' on' if on else ''}" data-cat="{name}" style="left:{x}px;width:{w}px">{name}</div>''')

HTML = f'''<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>灵石商城 · 知识冒险岛</title>
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
  .boy{{left:971.21px;top:173px;width:342.75px;height:706.02px}}

  .title-bar{{left:29px;top:21px;width:370.85px;height:128.06px;border-radius:53.36px;
    background:linear-gradient(180deg,#1739AA,#0B2788);opacity:.75}}
  .home-btn{{left:40.02px;top:37px;width:93.38px;height:96.05px;cursor:pointer}}
  .title{{left:154.74px;top:50px;width:245.45px;height:69.37px;font-size:50.69px;
    font-weight:900;color:#fff;display:flex;align-items:center;
    text-shadow:0 2.66px 2.67px rgba(20,42,102,.6)}}

  .wallet{{left:808.39px;top:45.66px;width:266.8px;height:77.18px;border-radius:40.02px;
    background:rgba(2,56,149,.85);border:1.87px solid #246DE1;display:flex;align-items:center}}
  .wallet img{{position:static;width:75.05px;height:70.05px;margin-left:10.2px}}
  .wallet .num{{position:static;width:109.39px;height:53.23px;display:flex;align-items:center;
    justify-content:center;font-family:Inter,sans-serif;font-size:37.35px;font-weight:700;color:#fff}}
  .wallet2{{left:1109.87px;top:45.66px;width:221.44px;height:77.18px;border-radius:40.02px;
    background:rgba(2,56,149,.85);border:1.87px solid #246DE1;display:flex;align-items:center}}
  .wallet2 img{{position:static;width:65.05px;height:63.55px;margin-left:10.95px}}
  .wallet2 .num{{position:static;width:61.36px;height:53.23px;display:flex;align-items:center;
    justify-content:center;font-family:Inter,sans-serif;font-size:37.35px;font-weight:700;color:#fff}}
  .plus{{width:53.36px;height:61.21px;border-radius:29.35px;
    background:linear-gradient(180deg,#347FF6,#0746BA);color:#fff;font-size:46px;font-weight:500;
    display:flex;align-items:center;justify-content:center;line-height:1;cursor:pointer;padding-bottom:6px}}
  .p1{{left:1011.16px;top:53.64px}}
  .p2{{left:1267.00px;top:50.99px}}

  .hit{{background:transparent;border:0}}
  .cat{{top:219px;height:85.38px;border-radius:26.68px;cursor:pointer;background:transparent;
    color:transparent;font-size:0;line-height:0}}
  .sel{{border:5px solid #FFE14D;border-radius:29.35px;box-shadow:0 0 22px rgba(255,225,77,.9);
    pointer-events:none;opacity:0;transition:opacity .15s}}

  .good{{width:197.43px;height:290px;border-radius:29.35px;cursor:pointer}}
  .good.hide{{display:none}}

  .buy{{left:968.47px;top:814px;width:336.16px;height:109.39px;border-radius:53.36px}}

  .toast{{left:50%;top:600px;transform:translateX(-50%);padding:16px 34px;border-radius:22px;
    background:rgba(9,25,60,.9);color:#fff;font-size:26px;font-weight:700;
    opacity:0;pointer-events:none;transition:opacity .22s;white-space:nowrap}}
  .toast.show{{opacity:1}}
</style>
</head>
<body>
<div class="view">
  <div class="stage" id="stage">
    <img class="bg" src="assets/mall-flat.png" alt="">
    <a class="hit home-btn" id="homeBtn" href="javascript:void(0)"></a>
    <a class="hit plus p1" id="plus1" href="javascript:void(0)"></a>
    <a class="hit plus p2" id="plus2" href="javascript:void(0)"></a>
{"".join(cat_html)}
{"".join(card_html)}
    <a class="hit buy" id="buy" href="javascript:void(0)"></a>
    <div class="sel" id="sel"></div>
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
  document.getElementById('plus1').addEventListener('click', function () {{ toast('充值灵石'); }});
  document.getElementById('plus2').addEventListener('click', function () {{ toast('补充药水'); }});

  var picked = null;
  document.querySelectorAll('.cat').forEach(function (c) {{
    c.addEventListener('click', function () {{
      document.querySelectorAll('.cat').forEach(function (x) {{ x.classList.remove('on'); }});
      c.classList.add('on');
      var k = c.dataset.cat;
      document.querySelectorAll('.good').forEach(function (g) {{
        g.classList.toggle('hide', k !== '全部' && g.dataset.cat !== k);
      }});
    }});
  }});
  document.querySelectorAll('.good').forEach(function (g) {{
    g.addEventListener('click', function () {{
      var sel = document.getElementById('sel');
      sel.style.left = g.offsetLeft + 'px';
      sel.style.top = g.offsetTop + 'px';
      sel.style.width = g.offsetWidth + 'px';
      sel.style.height = g.offsetHeight + 'px';
      sel.style.opacity = '1';
      picked = g.dataset.name;
      toast('已选中「' + picked + '」');
    }});
  }});
  document.getElementById('buy').addEventListener('click', function () {{
    toast(picked ? '兑换「' + picked + '」成功' : '先选一件商品吧～');
  }});
</script>
</body>
</html>'''

out = os.path.join(BASE, 'mall.html')
with open(out, 'w', encoding='utf-8') as f:
    f.write(HTML)
print('生成 mall.html', len(HTML), '字符')
