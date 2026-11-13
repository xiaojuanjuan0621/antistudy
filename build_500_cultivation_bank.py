import json

realms_meta = [
    {"stage": 1, "title": "凡俗矿奴 · 初入仙途", "rank": "凡俗矿奴", "desc": "字音字形、大数读写与校园英语", "rewardCoins": 60, "rewardXp": 200},
    {"stage": 2, "title": "灵田杂役 · 基础吐纳", "rank": "灵田杂役", "desc": "成语色彩、乘法竖式与时间日常", "rewardCoins": 70, "rewardXp": 220},
    {"stage": 3, "title": "执事药童 · 灵草辨析", "rank": "执事药童", "desc": "修辞手法、角的分类度量与天气出行", "rewardCoins": 80, "rewardXp": 240},
    {"stage": 4, "title": "外门弟子 · 剑气初凝", "rank": "外门弟子", "desc": "关联词法、积的变化规律与农场动物", "rewardCoins": 90, "rewardXp": 260},
    {"stage": 5, "title": "外门大师兄 · 剑堂翘楚", "rank": "外门大师兄", "desc": "古诗名句、平行四边形高底与服装搭配", "rewardCoins": 100, "rewardXp": 280},
    {"stage": 6, "title": "藏经阁抄录 · 练气圆满", "rank": "藏经阁抄录", "desc": "病句辨析、乘法分配律与现在进行时", "rewardCoins": 110, "rewardXp": 300},
    {"stage": 7, "title": "内门试炼者 · 登天梯", "rank": "内门试炼者", "desc": "文言神话、植树间隔奥数与疑问句", "rewardCoins": 120, "rewardXp": 320},
    {"stage": 8, "title": "内门精锐 · 御剑飞驰", "rank": "内门精锐", "desc": "段落主旨、小数移动规律与方位介词", "rewardCoins": 130, "rewardXp": 340},
    {"stage": 9, "title": "核心真传 · 丹道悟法", "rank": "核心真传", "desc": "标点警句、小数加减简算与口语交际", "rewardCoins": 140, "rewardXp": 360},
    {"stage": 10, "title": "天道筑基 · 灵液化海", "rank": "天道筑基", "desc": "记叙深读、三角形三边角度与完形推理", "rewardCoins": 200, "rewardXp": 500},
    {"stage": 11, "title": "筑基剑修 · 青冥出鞘", "rank": "筑基剑修", "desc": "民间寓言、鸡兔同笼假设法与形容词比较", "rewardCoins": 160, "rewardXp": 400},
    {"stage": 12, "title": "镇守执事 · 威震一方", "rank": "镇守执事", "desc": "说明方法、和差倍应用题与时态辨析", "rewardCoins": 170, "rewardXp": 420},
    {"stage": 13, "title": "宗门护法 · 灵印镇岳", "rank": "宗门护法", "desc": "文言短篇、盈亏间隔模型与代词指代", "rewardCoins": 180, "rewardXp": 440},
    {"stage": 14, "title": "结丹秘境客 · 九转归一", "rank": "结丹秘境客", "desc": "表达技巧、倒推还原巧算与动词过去式", "rewardCoins": 190, "rewardXp": 460},
    {"stage": 15, "title": "九转金丹 · 丹碎化灵", "rank": "九转金丹", "desc": "哲理古诗、过桥与流水行船与科普英文", "rewardCoins": 260, "rewardXp": 600},
    {"stage": 16, "title": "传功长老 · 授业解惑", "rank": "传功长老", "desc": "综合阅读、数阵图与周期与逻辑推理", "rewardCoins": 220, "rewardXp": 500},
    {"stage": 17, "title": "宗门首座 · 万修敬仰", "rank": "宗门首座", "desc": "语言创新、抽屉模型鸽巢原理与图表任务", "rewardCoins": 240, "rewardXp": 550},
    {"stage": 18, "title": "元婴老祖 · 法相天地", "rank": "元婴老祖", "desc": "文化百科、巧求不规则面积与语篇完形", "rewardCoins": 320, "rewardXp": 800},
    {"stage": 19, "title": "太上尊者 · 言出法随", "rank": "太上尊者", "desc": "名家散文、统筹优化对策与易错语法突破", "rewardCoins": 360, "rewardXp": 900},
    {"stage": 20, "title": "悟道学圣 · 化神飞升", "rank": "化神学圣", "desc": "四年级全能巅峰总决战与学神冲刺", "rewardCoins": 500, "rewardXp": 1500}
]

print("Realms defined. Ready to generate.")
