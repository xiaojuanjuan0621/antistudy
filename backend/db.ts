import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbDir = path.join(__dirname, '../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'antistudy.db');
export const db = new Database(dbPath);

// 初始化真实 SQLite 表结构 (支持专辑系列 Series 与独立单集 Episodes)
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    nickname TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'child',
    avatar_url TEXT
  );

  CREATE TABLE IF NOT EXISTS children (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    nickname TEXT NOT NULL,
    grade_level INTEGER NOT NULL DEFAULT 4,
    xp INTEGER NOT NULL DEFAULT 1850,
    level INTEGER NOT NULL DEFAULT 3,
    streak_days INTEGER NOT NULL DEFAULT 18,
    wish_coins INTEGER NOT NULL DEFAULT 680,
    wish_goal_title TEXT DEFAULT '《DK 青少年科学大百科》全套',
    wish_goal_target INTEGER DEFAULT 1000,
    wish_goal_current INTEGER DEFAULT 680
  );

  -- 课程专辑/系列表 (如：《四年级趣味数学全集 (共12讲)》、《DK人体微观探索系列 (共6讲)》)
  CREATE TABLE IF NOT EXISTS series (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    grade_level INTEGER NOT NULL DEFAULT 4,
    description TEXT,
    cover_image TEXT,
    total_episodes INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );

  -- 单节课程 / 剧集表 (支持直接纯看模式与AI互动模式)
  CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    series_id TEXT,
    episode_index INTEGER NOT NULL DEFAULT 1,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    grade_level INTEGER NOT NULL,
    video_filename TEXT,
    video_url TEXT NOT NULL,
    duration_seconds INTEGER NOT NULL DEFAULT 300,
    is_interactive INTEGER NOT NULL DEFAULT 1, -- 1: 带AI互动挑战, 0: 自由直看沉浸模式
    is_published INTEGER NOT NULL DEFAULT 1,
    ai_quality_score INTEGER DEFAULT 95,
    audit_notes TEXT,
    card_title TEXT,
    card_fun_fact TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(series_id) REFERENCES series(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS course_knowledge_points (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL,
    name TEXT NOT NULL,
    start_seconds INTEGER NOT NULL,
    end_seconds INTEGER NOT NULL,
    FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS course_interactions (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL,
    timestamp_seconds INTEGER NOT NULL,
    knowledge_point TEXT NOT NULL,
    question TEXT NOT NULL,
    options_json TEXT NOT NULL,
    correct_option_index INTEGER NOT NULL,
    explanation TEXT NOT NULL,
    hint_15s TEXT NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'easy',
    FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS cards (
    id TEXT PRIMARY KEY,
    child_id TEXT NOT NULL,
    title TEXT NOT NULL,
    rarity TEXT NOT NULL DEFAULT 'rare',
    summary_text TEXT NOT NULL,
    fun_fact TEXT,
    image_url TEXT NOT NULL,
    unlocked_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS learning_records (
    id TEXT PRIMARY KEY,
    child_id TEXT NOT NULL,
    course_id TEXT NOT NULL,
    actual_watch_seconds INTEGER NOT NULL DEFAULT 0,
    is_completed INTEGER NOT NULL DEFAULT 0,
    completed_at TEXT,
    UNIQUE(child_id, course_id)
  );
`);

// 预填默认儿童账号
const defaultChild = db.prepare('SELECT id FROM children WHERE id = ?').get('child_demo_01');
if (!defaultChild) {
  db.prepare(`
    INSERT INTO children (id, user_id, nickname, grade_level, xp, level, streak_days, wish_coins, wish_goal_title, wish_goal_target, wish_goal_current)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'child_demo_01',
    'user_demo_01',
    '张安泽',
    4,
    1850,
    3,
    18,
    680,
    '《DK 青少年科学大百科》全套',
    1000,
    680
  );
}

// 预填初始系列专辑 (数学全集 + 生物微观探索)
const defaultSeries = db.prepare('SELECT id FROM series WHERE id = ?').get('series_math_g4');
if (!defaultSeries) {
  db.prepare(`
    INSERT INTO series (id, title, subject, grade_level, description, cover_image, total_episodes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'series_math_g4',
    '小学四年级数学·分数的奥秘全集',
    'math',
    4,
    '系统梳理分数的产生、分子分母的意义、真假分数及生活应用题，打牢数学思维基础。',
    'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400',
    4,
    new Date().toISOString()
  );

  db.prepare(`
    INSERT INTO series (id, title, subject, grade_level, description, cover_image, total_episodes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'series_bio_g4',
    '少年探索课·人体微观细胞与免疫王国',
    'biology',
    4,
    '像看动画一样探索人体内部的细胞城堡、白细胞卫士与病毒防御大战！',
    'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=400',
    3,
    new Date().toISOString()
  );

  // 插入数学系列第 1 ~ 4 讲
  const insertCourse = db.prepare(`
    INSERT INTO courses (id, series_id, episode_index, title, subject, grade_level, video_filename, video_url, duration_seconds, is_interactive, is_published, ai_quality_score, card_title, card_fun_fact, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 96, ?, ?, ?)
  `);

  insertCourse.run(
    'course_math_01',
    'series_math_g4',
    1,
    '第1讲：分数的初体验（分披萨与分子分母的意义）',
    'math',
    4,
    'BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    360,
    1, // 互动课
    '🍕 分数精灵·四分卫',
    '古埃及人最偏爱单位分数！',
    new Date().toISOString()
  );

  insertCourse.run(
    'course_math_02',
    'series_math_g4',
    2,
    '第2讲：真分数与假分数的秘密（大于1的思考）',
    'math',
    4,
    'ElephantsDream.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    420,
    0, // 纯看自由沉浸模式
    '🍰 假分数怪兽',
    '分数居然也能比整块蛋糕还要多！',
    new Date().toISOString()
  );

  insertCourse.run(
    'course_math_03',
    'series_math_g4',
    3,
    '第3讲：分数通分与同分母加减法',
    'math',
    4,
    'ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    480,
    0,
    '⚖️ 通分天平',
    '找到公分母就像给不同的方块统一规格！',
    new Date().toISOString()
  );

  insertCourse.run(
    'course_math_04',
    'series_math_g4',
    4,
    '第4讲：生活中的分数应用题大通关',
    'math',
    4,
    'ForBiggerEscapes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    520,
    1,
    '🏆 分数数学大师',
    '用分数思维解决生活难题！',
    new Date().toISOString()
  );

  // 插入生物系列课程
  insertCourse.run(
    'course_bio_01',
    'series_bio_g4',
    1,
    '第1讲：细胞城堡的司令部（认识细胞核）',
    'biology',
    4,
    'TearsOfSteel.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    390,
    0,
    '🧬 细胞核·指挥官',
    '细胞核储存着所有遗传指令DNA。',
    new Date().toISOString()
  );

  insertCourse.run(
    'course_bio_02',
    'series_bio_g4',
    2,
    '第2讲：白细胞卫士出动！人体免疫防线大战',
    'biology',
    4,
    'Sintel.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
    450,
    1,
    '🛡️ 免疫吞噬卫士',
    '白细胞每秒都在身体里巡逻消灭有害菌！',
    new Date().toISOString()
  );

  // 插入第1讲的互动题目
  db.prepare(`
    INSERT INTO course_interactions (id, course_id, timestamp_seconds, knowledge_point, question, options_json, correct_option_index, explanation, hint_15s, difficulty)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'int_math_1',
    'course_math_01',
    15,
    '分数的分子与分母',
    '小拓把一块大披萨平均分成了 4 份，小明吃了其中 1 份，请问小明吃了这个披萨的几分之几？',
    JSON.stringify(['1/2', '1/4', '1/3', '4/1']),
    1,
    '太棒了！平均分成4份，总份数4作分母；吃了1份，所取份数1作分子，所以是 1/4。',
    '想一想：分母代表一共切成了多少份，分子代表拿走了多少份？',
    'easy'
  );

  // 标记第1节已完成，体现规划进度
  db.prepare(`
    INSERT OR REPLACE INTO learning_records (id, child_id, course_id, actual_watch_seconds, is_completed, completed_at)
    VALUES ('rec_01', 'child_demo_01', 'course_math_01', 360, 1, ?)
  `).run(new Date().toISOString());
}
