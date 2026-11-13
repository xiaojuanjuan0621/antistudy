import json
import os

realms_meta = [
    {"stage": 1, "title": "凡俗矿奴 · 初入仙途", "desc": "凝气感应：字音字形、大数读写与校园英语"},
    {"stage": 2, "title": "灵田杂役 · 基础吐纳", "desc": "灵气初聚：成语感情色彩、三位数乘法与时间日常"},
    {"stage": 3, "title": "执事药童 · 灵草辨析", "desc": "神识初探：修辞手法、角的分类度量与天气出行"},
    {"stage": 4, "title": "外门弟子 · 剑气初凝", "desc": "锻体通脉：关联词运用、积的变化规律与农场动植物"},
    {"stage": 5, "title": "外门大师兄 · 剑堂翘楚", "desc": "真气护体：古诗名句意象、平行四边形高底与服装搭配"},
    {"stage": 6, "title": "藏经阁抄录 · 练气圆满", "desc": "墨海悟法：典型病句辨析、乘法分配律与现在进行时"},
    {"stage": 7, "title": "内门试炼者 · 登天梯", "desc": "破障入境：文言神话典故、植树间隔奥数与疑问句通关"},
    {"stage": 8, "title": "内门精锐 · 御剑飞驰", "desc": "法术精纯：段落主旨提炼、小数移动规律与方位介词"},
    {"stage": 9, "title": "核心真传 · 丹道悟法", "desc": "丹田凝液：标点警句、小数加减简算与情景口语交际"},
    {"stage": 10, "title": "天道筑基 · 灵液化海", "desc": "天劫淬炼：记叙深层阅读、三角形三边角度与完形推理"},
    {"stage": 11, "title": "筑基剑修 · 青冥出鞘", "desc": "御剑八方：寓言民间故事、鸡兔同笼假设法与形容词比较"},
    {"stage": 12, "title": "镇守执事 · 威震一方", "desc": "法相森严：说明文说明方法、和差倍应用题与时态辨析"},
    {"stage": 13, "title": "宗门护法 · 灵印镇岳", "desc": "道心通明：文言短篇词义、盈亏间隔模型与代词指代"},
    {"stage": 14, "title": "结丹秘境客 · 九转归一", "desc": "探秘洞天：表达效果技巧、倒推还原巧算与不规则动词"},
    {"stage": 15, "title": "九转金丹 · 丹碎化灵", "desc": "金丹大道：哲理古诗鉴赏、过桥与流水行船与科普阅读"},
    {"stage": 16, "title": "传功长老 · 授业解惑", "desc": "传经授道：综合阅读主旨、数阵图与周期与逻辑推理"},
    {"stage": 17, "title": "宗门首座 · 万修敬仰", "desc": "执掌法印：语言综合创新、抽屉模型鸽巢原理与图表任务"},
    {"stage": 18, "title": "元婴老祖 · 法相天地", "desc": "元婴离体：传统文化百科、巧求不规则面积与语篇完形"},
    {"stage": 19, "title": "太上尊者 · 言出法随", "desc": "返璞归真：名家经典散文、统筹优化对策与易错混淆突破"},
    {"stage": 20, "title": "悟道学圣 · 化神飞升", "desc": "天地合一：四年级全能巅峰总决战、跨学科奥数与学神冲刺"}
]

# We will build 25 distinct questions per stage. Total 20 * 25 = 500 questions.
# Load templates and generate.
questions = []

def make_q(stage, idx, sub, scope, topic, text, opts, c_idx, kp, tree, trap, var, cult):
    return {
        "id": f"g4_s{stage:02d}_{idx:02d}",
        "stage": stage,
        "stageTitle": realms_meta[stage-1]["title"],
        "grade": "g4",
        "gradeDisplay": "四年级",
        "subject": sub,
        "subjectDisplay": "大语文" if sub == "chinese" else ("数学思维" if sub == "math" else "核心英语"),
        "scope": scope,
        "scopeDisplay": "课内考点" if scope == "in" else "课外拔高",
        "topic": topic,
        "question": text,
        "options": opts,
        "correctIndex": c_idx,
        "analysis": f"【考点定位】{kp}\n【破题母树】{tree}\n【避坑雷区】{trap}\n【名师变式】{var}\n【道心突破】{cult}"
    }

print("Generator structure ready.")
