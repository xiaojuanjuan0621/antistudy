# 知识冒险岛 (ANti Study) - iPad 横屏版项目架构与落地指南

本项目完全基于 **`青少年_AI主动学习成长小程序_iPad版_PRD_V2.0.md`** 深度研发落地，覆盖**数据库建模、AI 课程工厂生产后台、核心后端自适应对战与防作弊校验引擎、以及极具科技感的 iPad 横屏全交互前端原型**。

---

## 📁 项目工程目录结构

```text
├── database/
│   ├── schema.sql                 # PostgreSQL 生产级 DDL 建表脚本 (用户/课程/互动题/PK/卡牌/心愿币/洞察)
│   └── seed.sql                   # 演示测试数据种子 (预置张安泽账号、数学/生物课程、卡牌、心愿数据)
│
├── ai-pipeline/
│   ├── schemas.ts                 # Zod 强类型结构化 Schema & 专家级 System Prompt (十大出题铁律)
│   └── course-generator.ts        # AI 课程流水线 (ASR字幕分段解析、时间戳自动插题、质量自检)
│
├── backend/
│   ├── services/
│   │   ├── ai-pk.service.ts       # AI PK 对战自适应难度数值引擎 (胜率动态平衡 40%~60%)
│   │   ├── learning-validator.service.ts # 视频播放防作弊、心跳验证与四维奖励结算服务
│   │   └── parent-insight.service.ts     # 家长端 AI 洞察周报引擎 (兴趣雷达与行动建议)
│   └── server.ts                  # Express 后端核心 API 接口层 (集成管理后台与学生端 API)
│
├── frontend/
│   ├── index.html                 # iPad 横屏 11~13 寸沉浸式学习工作台 (包含 5 大核心视图交互)
│   └── admin.html                 # ⚙️ 管理后台：AI 课程工厂上传与内容审核工作台
│
├── package.json                   # Node.js / TypeScript 依赖配置
└── 青少年_AI主动学习成长小程序_iPad版_PRD_V2.0.md # 产品 PRD 原文档
```

---

## 🚀 核心工作台与操作流程

### 1. ⚙️ 管理后台：视频上传与 AI 课程工厂 (`frontend/admin.html`)
直接在浏览器中打开 **`frontend/admin.html`**，体验视频生产与 AI 自动插题全流程：
1. **视频上传与配置**：
   - 填写课程标题（如《四年级科学·人体免疫大作战》）、年级、学科及教材章节。
   - 拖拽或选择视频文件（支持 MP4/MOV）。
2. **一键 AI 生产（AI 课程流水线）**：
   - 点击 **“⚡ 开始一键 AI 解析与自动插题”**；
   - 自动执行：`音轨提取 → ASR 语音识别 (毫秒字幕) → 知识图谱提炼 → 句末时间戳插题 → 规则自检与评分`。
3. **内容审核台 (Audit Workbench)**：
   - 查看 AI 质量评分（如 96 分），在时间轴上直接预览插题位置、选项及 15 秒思维提示；
   - 教研老师可实时微调题干与选项；
4. **一键发布**：
   - 点击 **“🚀 审核通过并一键发布至学生端”**，课程立即同步上线到学生端的任务流与课程库中！

---

### 2. 📱 学生端：iPad 横屏沉浸式工作台 (`frontend/index.html`)
直接在浏览器或 iPad Safari 中打开 **`frontend/index.html`**：
1. **🏠 学习基地 (Workspace)**：
   - 展现 AI 伙伴小拓主动问候、四维资产胶囊（18天连胜火焰、Lv.3 探险者 XP 条、680 心愿币）。
   - 语/数/英今日任务三列流，支持核心任务推进，底部联动家庭心愿进度条。
   - 顶部提供 **“⚙️ 课程工厂/上传 ↗”** 快捷跳转按钮。
2. **🎬 节点互动视频播放器 (Interactive Video)**：
   - 视频播放至知识点结束时（演示第 5 秒），**自动暂停并弹出 AI 思考挑战蒙层**。
   - 答对给予正向鼓励并解锁继续播放；答错提供 **15 秒思维支架（Hint）**，杜绝挫败感。
3. **🤖 AI 知识对战擂台 (AI PK Arena)**：
   - 采用血条机制（张安泽 vs 学霸 AI 🦊），双方同步答题扣血，动态拟人化对话。
4. **🎴 知识卡牌馆 (Cards Collection)**：
   - 展示通过学习解锁的“细胞核·指挥官”、“线粒体·能量站”卡牌与套装合成。
5. **📊 家长端 AI 深度洞察看板 (Parent Insight)**：
   - 区分“有效专注时长”与“打开时长”，展示兴趣偏好（生物探索 18 次）与可执行的家庭辅导建议。

---

## 🛠️ 后端与数据库说明

### 初始化数据库
在 PostgreSQL 中执行建表脚本与种子数据：
```bash
psql -U your_user -d antistudy -f database/schema.sql
psql -U your_user -d antistudy -f database/seed.sql
```

### 运行后端服务
```bash
npm install
npm run dev
```
后端服务运行于 `http://localhost:3000`。
