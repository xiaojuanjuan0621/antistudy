#!/usr/bin/env python3
# 四页 iPad 预览构建器：把 Figma 原稿坐标 + 交互热区组装成单文件 HTML
# 素材来源：Figma 文件 B8Tqw1HG33tuzZaSCFFipk（画板 14:2 / 21:2 / 30:2 / 32:2）
# 运行：python3 build.py  →  生成 index.html
import re, os

BASE = os.path.dirname(os.path.abspath(__file__))
A = 'assets/'


def B(x, y, w, h, style='', cls=''):
    return f'<div class="{cls}" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px;{style}"></div>'


def P(x, y, w, h, src, style=''):
    return (f'<div style="left:{x}px;top:{y}px;width:{w}px;height:{h}px;{style}">'
            f'<img class="img" src="{A}{src}" alt=""></div>')


def T(x, y, w, h, text, size, weight=700, color='#fff', align='left', extra=''):
    jc = 'center' if align == 'center' else ('flex-end' if align == 'right' else 'flex-start')
    return (f'<div class="txt" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px;'
            f'font-size:{size}px;font-weight:{weight};color:{color};justify-content:{jc};{extra}">{text}</div>')


def HOT(x, y, w, h, go=None, act=None, **kw):
    attrs = ''
    if go:
        attrs += f' data-go="{go}"'
    if act:
        attrs += f' data-act="{act}"'
    for k, v in kw.items():
        attrs += f' data-{k.replace("_", "-")}="{v}"'
    return (f'<a class="hot"{attrs} style="left:{x}px;top:{y}px;width:{w}px;height:{h}px" '
            f'href="javascript:void(0)"></a>')


# ---------------------------------------------------------------- 首页 14:2
# 原稿 2848×1600，放入 .inner 后整体 scale(2730/2848)
h = []
h.append(P(0, 0, 2848, 1600, 'home-bg.png'))
h.append(P(226, 75, 814, 1381, 'home-hero-4656a3.png'))
h.append(P(734, 667, 573, 774, 'home-pet-11199f.png'))
h.append(P(611.88, 47.28, 144, 120, 'home-weather.png'))
h.append(T(77.88, 38.94, 334, 135, '09:30', 111, 700, '#11284F'))
h.append(T(433.88, 55.63, 160, 60, '01/18', 36, 700, '#11284F'))
h.append(T(433.88, 116.81, 160, 60, '星期六', 36, 700, '#11284F'))
h.append(B(584.06, 66.75, 2.78, 91.78, 'background:rgba(184,214,239,.8)'))
h.append(T(792.66, 52.84, 200, 70, '12°C', 53, 700, '#11284F'))
h.append(T(792.66, 122.38, 220, 55, '晴转多云', 33, 700, '#11284F'))

cards = [
    ('语文', '学而思语文', '去看课', '#3692FF', 'home-card-chinese.png', 1251.56, 205.81, 750.94, 417.19, 69.44, 265.19),
    ('英语', '连续打卡7天', '去巩固', '#FF8C26', 'home-card-english.png', 2024.75, 205.81, 756.5, 417.19, 66.25, 265.19),
    ('数学', '乐读数学', '去探索', '#2FC56E', 'home-card-math.png', 1251.56, 648.03, 750.94, 389.38, 61.44, 250.97),
    ('科普', '科普合集', '去看看', '#A539F3', 'home-card-science.png', 2024.75, 648.03, 756.5, 389.38, 75.09, 250.97),
]
for name, series, btn, col, img, x, y, w, ch, bx, by in cards:
    hh = 396 if ch > 400 else 364
    h.append(P(x, y, w, hh, img, 'border-radius:60px;overflow:hidden'))
    h.append(T(x + 75.09, y + 47.28, 300, 100, name, 78, 700, '#fff'))
    h.append(T(x + 75.09, y + 161.31, 320, 65, series, 44, 400, '#fff'))
    h.append(B(x + bx, y + by, 214.16, 80.66, 'background:#F7FFFA;border-radius:41.7px'))
    h.append(T(x + bx + 30.59, y + by + 17, 140, 50, btn, 36, 700, col))
    h.append(T(x + bx + 164, y + by - 9, 23, 83, '›', 69, 700, col))

h.append(B(2061, 61.19, 342.09, 97.34, 'background:#EAF6FF;border-radius:48.7px'))
h.append(T(2158, 89.86, 230, 44, '连续打卡 7 天', 33, 700, '#4A93FE'))
h.append(B(2444.72, 61.19, 328.19, 97.34, 'background:#F1F0FF;border-radius:48.7px'))
h.append(B(2461, 70, 80, 80, 'background:#CECFFD;border:4px solid #fff;border-radius:50%'))
h.append(T(2578, 89.86, 180, 44, '小星星', 33, 700, '#11284F'))

h.append(B(873, 586, 345, 221, 'background:rgba(248,249,255,.87);border:3.9px solid rgba(255,255,255,.85);border-radius:52.8px'))
h.append(T(946, 616, 240, 70, '破壳进度', 50, 700, '#7438FF'))
h.append(B(903, 698, 286.47, 66.75, 'background:linear-gradient(180deg,#BD5DFF,#6737FF);border-radius:33.4px'))
h.append(T(988, 687, 150, 80, '68%', 58, 700, '#fff'))
h.append(B(923, 745, 244.75, 16.69, 'background:#6C70FF;border-radius:8.3px'))
h.append(B(923, 745, 166.88, 16.69, 'background:#35DFFC;border-radius:8.3px'))

h.append(B(1371.16, 1070.78, 1401.75, 244.75, 'background:rgba(248,252,255,.9);border:3.9px solid rgba(255,255,255,.85);border-radius:69.5px'))
tools = [
    ('home-ico-ai.png', 'AI伙伴', 1418.44, 1090.25, 152, 130, 1446.25),
    ('home-ico-book.png', '绘本馆', 1665.97, 1109.72, 132, 114, 1679.88),
    ('home-ico-music.png', '音乐馆', 1896.81, 1104.16, 116, 116, 1905.16),
    ('home-ico-video.png', '动画馆', 2116.53, 1109.72, 132, 110, 2127.66),
    ('home-ico-star.png', '收藏夹', 2344.59, 1104.16, 130, 118, 2352.94),
    ('home-ico-more.png', '更多', 2575.44, 1109.72, 104, 106, 2586.56),
]
for ico, label, ix, iy, iw, ih, tx in tools:
    h.append(P(ix, iy, iw, ih, ico))
    h.append(T(tx, 1240.44, 140, 45, label, 33, 700, '#11284F'))
    h.append(HOT(ix - 12, iy - 12, iw + 24, ih + 90, act='toast', msg=f'{label} · 功能开发中'))

entries = [
    ('home-entry-shop-358d2a.png', '灵石商城', 63, 303, 241, 274, 'mall'),
    ('home-entry-bag-93d3b4.png', '储物袋', 63, 596, 232, 271, 'bag'),
    ('home-entry-pet-6b2dd5.png', '灵宠', 63, 886, 238, 264, None),
]
for ico, label, ex, ey, ew, eh, go in entries:
    h.append(P(ex, ey, ew, eh, ico, 'border-radius:52px'))
    h.append(B(ex + 20, ey + 132, 193, 141,
               'background:linear-gradient(180deg,#B264F1,#663A8B);border-radius:52px')
             if label == '灵石商城' else
             ('background:linear-gradient(180deg,#FF9A48,#E12D0C);border-radius:52px' if label == '储物袋'
              else 'background:linear-gradient(176deg,#60BEFE,#419EFB);border-radius:52px'))
    h.append(T(ex + 30, ey + 222, 180, 45, label, 28, 700, '#fff', 'center'))
    if go:
        h.append(HOT(ex, ey, ew, eh, go=go))
    else:
        h.append(HOT(ex, ey, ew, eh, act='toast', msg='灵宠 · 功能开发中'))

h.append(B(144, 1406, 2560, 299, 'background:#F0F2FF;border:8px solid #fff;border-radius:120px'))
navhome = [('首页', 218.28, 'home'), ('今日任务', 722.28, 'course'),
           ('学习', 1612.28, 'course'), ('我的', 2132.28, None)]
for label, nx, go in navhome:
    h.append(B(144 + nx, 1472, 106, 102, 'background:#E7E4FF;border-radius:26px'))
    h.append(T(144 + nx + 126, 1486, 190, 60, label, 44, 700, '#7A50C5' if label == '首页' else '#666D95'))
    if go:
        h.append(HOT(144 + nx, 1440, 336, 150, go=go))
    else:
        h.append(HOT(144 + nx, 1440, 336, 150, act='toast', msg='我的 · 功能开发中'))
h.append(P(1322, 1368, 223, 227, 'home-nav-star.png'))
h.append(HOT(1322, 1368, 223, 227, act='toast', msg='今日航线 · 2 个关卡待完成'))

for name, series, btn, col, img, x, y, w, ch, bx, by in cards:
    h.append(HOT(x, y, w, ch, go='course', subject=name))
h.append(HOT(2061, 61.19, 342.09, 97.34, act='toast', msg='连续打卡 7 天 · 明天再来'))
h.append(HOT(2444.72, 61.19, 328.19, 97.34, act='toast', msg='小星星 · 个人中心'))
h.append(HOT(873, 559, 345, 248, act='toast', msg='破壳进度 68% · 还差 160 能量'))
HOME = '\n      '.join(h)

# ------------------------------------------------------------ 课程页 21:2
c = []
c.append(P(0, 0, 2730, 1535.63, 'course-bg.png'))
c.append(B(106.64, 39.99, 87.98, 82.65,
           'background:linear-gradient(180deg,#2766DC,#1542AD);border:3.2px solid #2766DC;border-radius:42.7px'))
c.append(T(115, 52, 74, 66, '‹', 62, 700, '#fff', 'center'))
c.append(T(231.94, 50.65, 400, 75, '数学课程', 56, 700, '#fff'))
c.append(B(1938.19, 45.32, 362.58, 74.65,
           'background:linear-gradient(180deg,#102D80,#102267);border:3.2px solid #102D80;border-radius:37.3px'))
c.append(P(1943.52, 45.32, 71.98, 74.65, 'course-sign.png'))
c.append(T(2020.84, 61.32, 260, 48, '连续打卡 7 天', 35, 700, '#fff'))
c.append(B(2340.76, 45.32, 301.26, 74.65,
           'background:linear-gradient(180deg,#183B8B,#102968);border:3.2px solid #183B8B;border-radius:37.3px'))
c.append(P(2343.43, 45.32, 71.98, 74.65, 'course-stone.png'))
c.append(T(2420.74, 61.32, 220, 48, '灵石 1,220', 37, 700, '#fff'))

c.append(P(106.64, 186.62, 490.55, 1154.38, 'course-profile.png', 'border-radius:48px;overflow:hidden'))
c.append(P(218.61, 208, 298.59, 261.33, 'course-boy.png'))
c.append(P(498.54, 583.86, 69.32, 87.98, 'course-badge.png'))
for ico, iy in [('course-i1.png', 786.47), ('course-i2.png', 858.46),
                ('course-i3.png', 965.1), ('course-i4.png', 1042.41),
                ('course-i5.png', 1146.39), ('course-i6.png', 1226.37)]:
    c.append(P(175.96, iy, 75, 75, ico))
c.append(T(189.29, 498.54, 200, 60, 'Level 5', 43, 700, '#fff'))
c.append(T(373.24, 501.21, 220, 60, '数学逻辑', 40, 700, '#fff'))
c.append(T(183.95, 607.85, 220, 60, '进阶进度', 40, 700, '#fff'))
c.append(T(349.25, 607.85, 120, 60, '68%', 43, 700, '#FFF046'))
c.append(B(183.95, 674.5, 370.58, 42.66, 'background:#1756AF;border-radius:21.3px'))
c.append(B(183.95, 674.5, 290.6, 42.66,
           'background:linear-gradient(180deg,#36FF80,#12DE69);border-radius:21.3px'))
c.append(T(263.93, 802.47, 160, 52, '共学习', 37, 700, '#fff'))
c.append(T(263.93, 869.12, 200, 50, '28个视频', 35, 700, '#fff'))
c.append(T(445.22, 874.45, 130, 45, '28/40', 32, 400, '#B1C8F4'))
c.append(T(263.93, 983.76, 160, 52, '总时长', 37, 700, '#fff'))
c.append(T(263.93, 1050.41, 160, 52, '12.6h', 37, 700, '#FFE161'))
c.append(T(407.9, 1055.74, 170, 45, '12.6/20h', 32, 400, '#B1C8F4'))
c.append(T(263.93, 1165.05, 180, 52, '连续学习', 37, 700, '#fff'))
c.append(T(263.93, 1234.36, 100, 52, '7天', 37, 700, '#fff'))

c.append(B(637, 168, 1987, 233, 'background:#092467;border-radius:35px'))
c.append(T(693, 208, 300, 70, '进阶周计划', 51, 700, '#fff'))
c.append(B(714, 320, 1628, 16, 'background:#36569A;border-radius:8px'))
c.append(B(714, 320, 760, 16,
           'background:linear-gradient(180deg,#0E8A8C,#5FFF92);border-radius:8px'))
for i, ico in enumerate(['course-week1.png', 'course-week2.png', 'course-week3.png',
                         'course-week4.png', 'course-week4.png', 'course-week3.png']):
    c.append(P(842 + i * 272, 274, 75, 75, ico))

c.append(B(637, 434, 1987, 607, 'background:#092467;border-radius:35px'))
c.append(B(1472, 583, 1115, 438, 'background:#D9D9D9;border-radius:42px;overflow:hidden'))
c.append(P(695, 441, 1999.51, 621.18, 'course-board.png', 'border-radius:48px'))
c.append(P(2094.66, 555.77, 367.91, 453.33, 'course-board-boy.png'))
c.append(T(1902.71, 720.93, 400, 70, '123 + 456 = ?', 48, 400, '#fff'))
c.append(B(663.84, 463.89, 330.59, 114.64,
           'background:linear-gradient(180deg,#208DFF,#075DD6);border:3.2px solid #208DFF;border-radius:29.3px',
           'tab-btn on'))
c.append(B(1010.42, 463.89, 327.92, 114.64,
           'background:linear-gradient(180deg,#314C9C,#243C81);border:3.2px solid #314C9C;border-radius:29.3px',
           'tab-btn'))
c.append(T(760, 493.1, 200, 60, '清华数学', 45, 700, '#fff'))
c.append(T(1079.74, 493.1, 200, 60, '乐读数学', 45, 700, '#AFC3F4'))
c.append(T(738.49, 679.83, 200, 70, 'Level 5', 51, 700, '#fff'))
c.append(T(738.49, 767.81, 80, 80, '第', 61, 700, '#fff'))
c.append(T(805.14, 759.81, 130, 90, '3讲', 69, 700, '#BAFF55'))
c.append(T(943.77, 767.81, 400, 80, '数的奇妙世界', 59, 700, '#fff'))
c.append(T(741.15, 885.12, 320, 60, '认识更大的数', 43, 700, '#fff'))
c.append(B(1684.92, 727.82, 151.96, 151.96,
           'background:linear-gradient(180deg,#FFCB51,#FF8000);border:3.2px solid #FFCB51;border-radius:76px'))
c.append(T(1700, 760, 122, 90, '▶', 62, 700, '#fff', 'center'))
c.append(B(2242, 464, 319.92, 103.97,
           'background:linear-gradient(180deg,#1858D6,#102A82);border:3.2px solid #1858D6;border-radius:53.3px'))
c.append(P(2265.99, 472, 85.31, 82.65, 'course-hat.png'))
c.append(T(2367.3, 490.66, 160, 60, '四年级', 43, 700, '#fff'))
c.append(T(2505.94, 494.65, 40, 40, '▾', 34, 700, '#fff'))

lessons = [
    ('course-lesson1.png', 0, '第1讲', '用字母表示数', '已完成', '#24412F', 61.32, 59.06),
    ('course-lesson2-2e76f4.png', 498.82, '第2讲', '等式性质', '可学习', '#fff', 546.53, 56.39),
    ('course-lesson3-3bef41.png', 1010.82, '第3讲', '解方程应用', '进行中', '#fff', 1058.41, 56.39),
]
for ico, lx, num, title, status, col, tx, ty in lessons:
    lw = 474.55 if lx == 0 else (482 if lx < 1000 else 490)
    c.append(P(637.18 + lx, 1086 if lx == 0 else 1086, lw, 229 if lx else 261,
               ico, 'border-radius:46px;overflow:hidden'))
    c.append(T(637.18 + tx, 1066 + ty, 160, 65, num, 48, 700, col))
    c.append(T(637.18 + tx, 1066 + ty + 80, 300, 60, title, 45, 700, col))
    pill = ('background:linear-gradient(180deg,#FFA83A,#FF7B04);border:3.2px solid #FFA83A;border-radius:29.3px'
            if status != '已完成' else
            'background:linear-gradient(180deg,#2CE86F,#0CBA4A);border:3.2px solid #2CE86F;border-radius:29.3px')
    c.append(B(637.18 + lx + 300, 1069, 155, 107, pill))
    c.append(T(637.18 + lx + 313, 1202, 130, 55, status, 43, 700, '#fff', 'center'))
c.append(B(2181, 1066, 443, 249, 'background:#092467;border-radius:35px'))
c.append(P(2364, 1111.73, 77.31, 82.65, 'course-lock-big.png'))
c.append(T(2307, 1199.71, 200, 60, '未解锁', 43, 700, '#DEE6FF', 'center'))

nav = [('course-nav1.png', '首页', 245, 'home'), ('course-nav2.png', '今日任务', 802.2, 'course'),
       ('course-nav3.png', '宠物', 1311.41, None), ('course-nav4.png', '学习', 1868.6, 'bag'),
       ('course-nav5-4121f6.png', '我的', 2388, None)]
for ico, label, nx, go in nav:
    c.append(P(nx, 1373, 96, 91, ico))
    c.append(T(nx, 1471.97, 140, 48, label, 35, 700, '#91FF9C' if label == '首页' else '#fff'))
    if go:
        c.append(HOT(nx - 8, 1368, 150, 150, go=go))
    else:
        c.append(HOT(nx - 8, 1368, 150, 150, act='toast', msg=f'{label} · 功能开发中'))

c.append(HOT(106.64, 39.99, 87.98, 82.65, go='home'))
c.append(HOT(663.84, 463.89, 330.59, 114.64, act='tab', key='清华数学'))
c.append(HOT(1010.42, 463.89, 327.92, 114.64, act='tab', key='乐读数学'))
c.append(HOT(2242, 464, 319.92, 103.97, act='grade'))
c.append(HOT(1684.92, 727.82, 151.96, 151.96, act='toast', msg='开始播放 · 第3讲 数的奇妙世界'))
c.append(HOT(1938.19, 45.32, 362.58, 74.65, act='toast', msg='今日已打卡 · 连续 7 天'))
c.append(HOT(2340.76, 45.32, 301.26, 74.65, go='mall'))
for i, (ico, lx, num, title, status, col, tx, ty) in enumerate(lessons):
    c.append(HOT(637.18 + lx, 1066, 474 if i else 474, 262,
                 act='toast', msg=f'{num} {title} · {status}'))
c.append(HOT(2181, 1066, 443, 249, act='toast', msg='第4讲未解锁 · 先完成第3讲'))
COURSE = '\n      '.join(c)

# ------------------------------------------- 储物袋 / 商城：复用上一版内容
prev = open(os.path.join(BASE, 'index_v2.html'), encoding='utf-8').read()


def content_of(sid, bgname):
    m = re.search(r'<div class="stage" id="' + sid + r'"[^>]*>(.*?)\n  </div>', prev, re.S)
    body = m.group(1)
    inner = re.search(r'<div class="content">(.*?)\n    </div>', body, re.S).group(1)
    return '\n'.join(l for l in inner.splitlines() if bgname not in l)


BAG = content_of('bag', 'assets/bg.png')
MALL = content_of('mall', 'assets/mall-bg.png')

# 给商城 8 张卡片加类别，供分类筛选
cats = ['道具 宠物', '道具 宠物', '道具', '道具', '服装', '装备 服装', '服装', '装备']
it = iter(cats)
MALL = re.sub(r'(<div style="left:[\d.]+px;top:[\d.]+px;width:394\.57px;height:522\.54px)">',
              lambda m: m.group(1) + '" class="mall-card" data-cat="' + next(it) + '">', MALL)

# 叠加交互热区
BAG += '\n      ' + '\n      '.join([
    HOT(100, 78, 194, 190, go='home'),
    HOT(111.97, 436.15, 506.54, 260.62, act='tab', key='服装'),
    HOT(111.97, 734, 506.54, 260.62, act='tab', key='发型'),
    HOT(111.97, 1026.54, 506.54, 260.62, act='tab', key='配饰'),
    HOT(111.97, 1319.07, 506.54, 260.62, act='tab', key='宠物'),
    HOT(1828.89, 1430.77, 655.84, 218.07, act='toast', msg='背包已整理好'),
])
for i, (x, y) in enumerate([(1599.61, 510.61), (1962.19, 510.61), (2322, 511),
                            (1600, 949), (1962, 949), (2319, 950)]):
    BAG += '\n      ' + HOT(x, y, 320, 400, act='toast', msg=f'道具 {i + 1} · 点击使用')

MALL += '\n      ' + '\n      '.join([
    HOT(78, 57, 189, 194, go='home'),
    HOT(2010.18, 95.98, 101.31, 111.97, act='toast', msg='充值入口 · 由家长控制'),
    HOT(2207.46, 74.65, 431.89, 159.96, act='toast', msg='灵石商城 · 今日特惠'),
    HOT(1935.53, 1466.31, 671.84, 218.61, act='exchange'),
])
for key, x, w in [('全部', 90.64, 405.23), ('道具', 501.21, 351.91), ('装备', 853.13, 351.91),
                  ('服装', 1205.04, 351.91), ('宠物', 1556.95, 330.59)]:
    MALL += '\n      ' + HOT(x, 298.59, w, 170.63, act='cat', key=key)
for i, (x, y) in enumerate([(106.64, 543.87), (549.2, 543.87), (991.76, 543.87), (1428.98, 543.87),
                            (106.64, 1109.06), (549.2, 1109.06), (991.76, 1109.06), (1428.98, 1109.06)]):
    MALL += '\n      ' + HOT(x, y, 394.57, 522.54, act='item', idx=i)

# ---------------------------------------------------------------- 组装
HTML = '''<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>知识冒险岛 · 四页 iPad 交互预览</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{height:100%;overflow:hidden;background:#081430;font-family:"Noto Sans SC","PingFang SC",sans-serif}
  .bar{height:52px;display:flex;align-items:center;gap:8px;padding:0 16px;background:#0d1e42;border-bottom:1px solid rgba(255,255,255,.12)}
  .bar button,.bar select{padding:7px 16px;border-radius:8px;border:1px solid rgba(255,255,255,.2);background:transparent;color:#cbdcf7;font-size:13px;cursor:pointer;font-family:inherit}
  .bar select{margin-left:12px}
  .bar select option{color:#111;background:#fff}
  .bar button.on{background:#2f6fe4;border-color:#2f6fe4;color:#fff}
  .bar .tip{margin-left:auto;color:#7f96bd;font-size:12px}
  .view{position:relative;width:100%;height:calc(100% - 52px);overflow:hidden}
  .stage{position:absolute;left:50%;top:50%;transform-origin:center center}
  .stage[hidden]{display:none}
  .stage *{position:absolute}
  .stage .bg{position:absolute;left:0;top:0;right:0;bottom:0;overflow:hidden}
  .stage .bg img{position:static;width:100%;height:100%;object-fit:cover;display:block}
  .stage .content{position:absolute;left:0;top:0;width:2730px;height:1835px;transform-origin:top left}
  .stage .content *{position:absolute}
  .stage .content .inner{position:absolute;left:0;top:0;width:2848px;height:1600px;transform:scale(.95857);transform-origin:top left}
  .stage .content .img{position:static;width:100%;height:100%;object-fit:fill;display:block}
  .stage .content .txt{display:flex;align-items:center;justify-content:center;white-space:nowrap;color:#fff}
  .stage .content .hot{z-index:120;cursor:pointer;border-radius:40px;background:transparent;transition:background .15s,box-shadow .15s}
  .stage .content .hot:hover{background:rgba(255,255,255,.16);box-shadow:0 0 0 3px rgba(255,255,255,.35)}
  .stage .content .hot.sel{background:rgba(255,235,120,.28);box-shadow:0 0 0 4px #FFE36E}
  .stage .content .mall-card.hide{display:none}
  .stage .content .tab-btn.dim{filter:brightness(.65)}
  .stroke{-webkit-text-stroke:3.2px #244578;text-shadow:0 5.3px 5.3px rgba(20,42,102,.6)}
  .shadow-cyan{box-shadow:0 10.6px 48px 0 rgba(0,231,255,.85)}
  .shadow-blue{box-shadow:0 10.6px 16px 0 rgba(17,45,152,.4)}
  .btn-nav{border:4.3px solid #4389ED;border-radius:69.3px;background:linear-gradient(180deg,#2F67E2,#2448AC)}
  #toast{position:absolute;right:24px;bottom:24px;z-index:999;padding:14px 22px;border-radius:12px;
    background:rgba(12,28,64,.94);border:1px solid rgba(120,180,255,.5);color:#fff;font-size:15px;
    opacity:0;transform:translateY(12px);transition:opacity .2s,transform .2s;pointer-events:none}
  #toast.show{opacity:1;transform:translateY(0)}
</style>
</head>
<body>
<div class="bar">
  <button class="on" data-p="home">首页</button>
  <button data-p="course">课程</button>
  <button data-p="bag">储物袋</button>
  <button data-p="mall">灵石商城</button>
  <select id="dev">
    <option value="2732,2048">iPad Pro 12.9″ · 2732 × 2048</option>
    <option value="2388,1668">iPad Pro 11″ / Air · 2388 × 1668</option>
    <option value="2160,1620">iPad 10.2″ · 2160 × 1620</option>
  </select>
  <span class="tip" id="dim">四页同一坐标系 · 点元素可交互</span>
</div>
<div class="view">
  <div class="stage" id="home">
    <div class="bg"><img src="assets/home-bg.png" alt=""></div>
    <div class="content"><div class="inner">
__HOME__
    </div></div>
  </div>
  <div class="stage" id="course" hidden>
    <div class="bg"><img src="assets/course-bg.png" alt=""></div>
    <div class="content">
__COURSE__
    </div>
  </div>
  <div class="stage" id="bag" hidden>
    <div class="bg"><img src="assets/bg.png" alt=""></div>
    <div class="content">
__BAG__
    </div>
  </div>
  <div class="stage" id="mall" hidden>
    <div class="bg"><img src="assets/mall-bg.png" alt=""></div>
    <div class="content">
__MALL__
    </div>
  </div>
  <div id="toast"></div>
</div>
<script>
  var W0=2730,BAR=52,CW=2732,CH=2048;
  var toastEl=document.getElementById('toast'),timer=null;
  function toast(msg){toastEl.textContent=msg;toastEl.classList.add('show');
    clearTimeout(timer);timer=setTimeout(function(){toastEl.classList.remove('show')},1900);}
  function fit(){
    var s=Math.min(window.innerWidth/CW,(window.innerHeight-BAR)/CH);
    document.querySelectorAll('.stage').forEach(function(e){
      e.style.transform='translate(-50%,-50%) scale('+s+')';});
  }
  function applySize(){
    var v=document.getElementById('dev').value.split(',');
    CW=+v[0];CH=+v[1];var cs=CW/W0;
    document.querySelectorAll('.stage').forEach(function(e){
      e.style.width=CW+'px';e.style.height=CH+'px';
      var c=e.querySelector('.content');if(c)c.style.transform='scale('+cs+')';});
    document.getElementById('dim').textContent=CW+' × '+CH+' @2x · 四页统一 · 内容等比 '+cs.toFixed(3)+'×';
    fit();
  }
  function show(p){
    document.querySelectorAll('.stage').forEach(function(e){e.hidden=(e.id!==p)});
    document.querySelectorAll('.bar button').forEach(function(b){b.classList.toggle('on',b.dataset.p===p)});
  }
  document.querySelectorAll('.bar button').forEach(function(b){
    b.addEventListener('click',function(){show(b.dataset.p)});});
  document.addEventListener('click',function(ev){
    var el=ev.target.closest('[data-go],[data-act]');if(!el)return;
    ev.preventDefault();
    if(el.dataset.go){show(el.dataset.go);return;}
    var a=el.dataset.act,k=el.dataset.key||'';
    if(a==='toast'){toast(el.dataset.msg||'功能开发中');return;}
    if(a==='tab'){
      document.querySelectorAll('[data-act="tab"]').forEach(function(x){x.classList.remove('sel')});
      el.classList.add('sel');
      if(el.closest('#course')){
        document.querySelectorAll('.tab-btn').forEach(function(x,i){x.classList.toggle('dim',i===1)});
        toast('已切换到 · '+k);
      }else{toast('背包分类 · '+k);}
      return;
    }
    if(a==='cat'){
      document.querySelectorAll('[data-act="cat"]').forEach(function(x){x.classList.remove('sel')});
      el.classList.add('sel');
      document.querySelectorAll('.mall-card').forEach(function(card){
        var ok=(k==='全部')||(card.dataset.cat||'').indexOf(k)>=0;
        card.classList.toggle('hide',!ok);});
      toast('商城分类 · '+k);return;
    }
    if(a==='item'){
      document.querySelectorAll('[data-act="item"]').forEach(function(x){x.classList.remove('sel')});
      el.classList.add('sel');toast('已选中该商品，点「立即兑换」');return;
    }
    if(a==='exchange'){
      var n=document.querySelectorAll('.mall-card:not(.hide)').length;
      toast('兑换成功 · 消耗 120 灵石（演示）');return;
    }
    if(a==='grade'){toast('年级：四年级（可切换）');return;}
  });
  document.getElementById('dev').addEventListener('change',applySize);
  window.addEventListener('resize',fit);
  applySize();
</script>
</body>
</html>'''

HTML = (HTML.replace('__HOME__', HOME).replace('__COURSE__', COURSE)
        .replace('__BAG__', BAG).replace('__MALL__', MALL))
open(os.path.join(BASE, 'index.html'), 'w', encoding='utf-8').write(HTML)
print('生成 index.html', len(HTML), '字符')
