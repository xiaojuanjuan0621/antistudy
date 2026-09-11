import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import Database from 'better-sqlite3';

const app = express();
app.use(cors());
app.use(express.json());

const dataDir = path.join(__dirname, 'data');
const uploadsDir = path.join(__dirname, 'uploads');
const frontendDir = path.join(__dirname, 'frontend');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use('/uploads', express.static(uploadsDir));
app.use(express.static(frontendDir));

const db = new Database(path.join(dataDir, 'antistudy.db'));

// 初始化完整数据库
db.exec(`
  CREATE TABLE IF NOT EXISTS children (
    id TEXT PRIMARY KEY,
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
    is_interactive INTEGER NOT NULL DEFAULT 0,
    is_published INTEGER NOT NULL DEFAULT 1,
    ai_quality_score INTEGER DEFAULT 95,
    card_title TEXT,
    card_fun_fact TEXT,
    created_at TEXT NOT NULL
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

// 预填默认数据
if (!db.prepare('SELECT id FROM children WHERE id = ?').get('child_demo_01')) {
  db.prepare(`
    INSERT INTO children (id, nickname, grade_level, xp, level, streak_days, wish_coins, wish_goal_title, wish_goal_target, wish_goal_current)
    VALUES ('child_demo_01', '张安泽', 4, 1850, 3, 18, 680, '《DK 青少年科学大百科》全套', 1000, 680)
  `).run();

  db.prepare(`
    INSERT INTO series (id, title, subject, grade_level, description, cover_image, total_episodes, created_at)
    VALUES 
    ('series_math_g4', '小学四年级数学·分数的奥秘全集', 'math', 4, '系统梳理分数的产生、分子分母的意义与应用题。', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400', 4, ?),
    ('series_bio_g4', '少年探索课·人体微观细胞与免疫王国', 'biology', 4, '像看动画一样探索人体微观细胞与免疫防御大战！', 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=400', 2, ?)
  `).run(new Date().toISOString(), new Date().toISOString());

  const insCourse = db.prepare(`
    INSERT INTO courses (id, series_id, episode_index, title, subject, grade_level, video_filename, video_url, duration_seconds, is_interactive, is_published, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
  `);

  insCourse.run('course_math_01', 'series_math_g4', 1, '第1讲：分数的初体验（分披萨与分数的意义）', 'math', 4, '', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 360, 0, new Date().toISOString());
  insCourse.run('course_math_02', 'series_math_g4', 2, '第2讲：真分数与假分数的秘密（大于1的思考）', 'math', 4, '', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 420, 0, new Date().toISOString());
  insCourse.run('course_math_03', 'series_math_g4', 3, '第3讲：分数通分与同分母加减法', 'math', 4, '', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 480, 0, new Date().toISOString());
  insCourse.run('course_math_04', 'series_math_g4', 4, '第4讲：生活中的分数应用题大通关', 'math', 4, '', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4', 520, 0, new Date().toISOString());

  insCourse.run('course_bio_01', 'series_bio_g4', 1, '第1讲：细胞城堡的司令部（认识细胞核）', 'biology', 4, '', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', 390, 0, new Date().toISOString());
  insCourse.run('course_bio_02', 'series_bio_g4', 2, '第2讲：白细胞卫士出动！人体免疫防线大战', 'biology', 4, '', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4', 450, 0, new Date().toISOString());

  db.prepare(`
    INSERT OR REPLACE INTO learning_records (id, child_id, course_id, actual_watch_seconds, is_completed, completed_at)
    VALUES ('rec_01', 'child_demo_01', 'course_math_01', 360, 1, ?)
  `).run(new Date().toISOString());
}

// 接口列表
app.get('/api/student/dashboard', (req: Request, res: Response) => {
  const child = db.prepare('SELECT * FROM children WHERE id = ?').get('child_demo_01') as any;
  const allSeries = db.prepare('SELECT * FROM series ORDER BY created_at DESC').all() as any[];

  res.json({
    success: true,
    data: {
      child: {
        id: child.id,
        name: child.nickname,
        grade: child.grade_level,
        xp: child.xp,
        level: child.level,
        streakDays: child.streak_days,
        wishBalance: child.wish_coins,
        wishGoal: {
          title: child.wish_goal_title,
          target: child.wish_goal_target,
          current: child.wish_goal_current,
        },
      },
    },
  });
});

app.get('/api/series/list', (req: Request, res: Response) => {
  const allSeries = db.prepare('SELECT * FROM series ORDER BY created_at DESC').all() as any[];
  const seriesWithProgress = allSeries.map((s) => {
    const episodes = db.prepare(`
      SELECT c.*, lr.is_completed 
      FROM courses c
      LEFT JOIN learning_records lr ON c.id = lr.course_id AND lr.child_id = 'child_demo_01'
      WHERE c.series_id = ?
      ORDER BY c.episode_index ASC
    `).all(s.id) as any[];

    const completedCount = episodes.filter((ep) => ep.is_completed === 1).length;
    const nextEpisode = episodes.find((ep) => !ep.is_completed) || episodes[episodes.length - 1];

    return {
      id: s.id,
      title: s.title,
      subject: s.subject,
      gradeLevel: s.grade_level,
      description: s.description,
      totalEpisodes: episodes.length,
      completedEpisodes: completedCount,
      progressPercent: episodes.length > 0 ? Math.round((completedCount / episodes.length) * 100) : 0,
      nextEpisode: nextEpisode ? {
        id: nextEpisode.id,
        episodeIndex: nextEpisode.episode_index,
        title: nextEpisode.title,
        durationMinutes: Math.ceil(nextEpisode.duration_seconds / 60),
      } : null,
      episodes: episodes.map((ep) => ({
        id: ep.id,
        episodeIndex: ep.episode_index,
        title: ep.title,
        durationMinutes: Math.ceil(ep.duration_seconds / 60),
        isCompleted: ep.is_completed === 1,
      })),
    };
  });
  res.json({ success: true, data: seriesWithProgress });
});

app.get('/api/course/context/:courseId', (req: Request, res: Response) => {
  const { courseId } = req.params;
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId) as any;
  if (!course) return res.status(404).json({ success: false, message: '未找到课程' });

  const series = db.prepare('SELECT * FROM series WHERE id = ?').get(course.series_id) as any;
  const allEpisodes = db.prepare(`
    SELECT c.*, lr.is_completed 
    FROM courses c
    LEFT JOIN learning_records lr ON c.id = lr.course_id AND lr.child_id = 'child_demo_01'
    WHERE c.series_id = ?
    ORDER BY c.episode_index ASC
  `).all(course.series_id) as any[];

  const currentIndex = allEpisodes.findIndex((ep) => ep.id === course.id);
  const nextEpisode = currentIndex < allEpisodes.length - 1 ? allEpisodes[currentIndex + 1] : null;

  res.json({
    success: true,
    data: {
      course,
      series,
      navigation: {
        hasNext: !!nextEpisode,
        nextEpisode,
      },
      playlist: allEpisodes.map((ep) => ({
        id: ep.id,
        episodeIndex: ep.episode_index,
        title: ep.title,
        durationMinutes: Math.ceil(ep.duration_seconds / 60),
        isCurrent: ep.id === course.id,
        isCompleted: ep.is_completed === 1,
      })),
    },
  });
});

app.post('/api/course/complete', (req: Request, res: Response) => {
  const { courseId, actualWatchDuration } = req.body;
  db.prepare(`
    INSERT OR REPLACE INTO learning_records (id, child_id, course_id, actual_watch_seconds, is_completed, completed_at)
    VALUES (?, 'child_demo_01', ?, ?, 1, ?)
  `).run(`rec_${courseId}`, courseId, actualWatchDuration || 300, new Date().toISOString());

  db.prepare(`
    UPDATE children 
    SET xp = xp + 40, wish_coins = wish_coins + 15, wish_goal_current = wish_goal_current + 15
    WHERE id = 'child_demo_01'
  `).run();

  const currentCourse = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId) as any;
  let nextCourse = null;
  if (currentCourse && currentCourse.series_id) {
    nextCourse = db.prepare(`
      SELECT * FROM courses WHERE series_id = ? AND episode_index = ?
    `).get(currentCourse.series_id, currentCourse.episode_index + 1) as any;
  }

  res.json({
    success: true,
    grantedRewards: { xp: 40, wishCoins: 15 },
    nextCourse,
  });
});

app.post('/api/student/wish-goal', (req: Request, res: Response) => {
  const { title, targetCoins } = req.body;
  db.prepare('UPDATE children SET wish_goal_title = ?, wish_goal_target = ? WHERE id = ?').run(title, Number(targetCoins), 'child_demo_01');
  res.json({ success: true, message: '🎉 心愿已更新！' });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, 'video-' + Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname)),
});
const upload = multer({ storage });

app.post('/api/admin/series/batch-upload', upload.array('videoFiles', 100), (req: Request, res: Response) => {
  const { seriesTitle, subject, gradeLevel, description } = req.body;
  const files = (req.files as Express.Multer.File[]) || [];
  const seriesId = 'series_' + Date.now();

  db.prepare(`
    INSERT INTO series (id, title, subject, grade_level, description, total_episodes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(seriesId, seriesTitle, subject || 'math', Number(gradeLevel) || 4, description || '', files.length, new Date().toISOString());

  const sortedFiles = [...files].sort((a, b) => a.originalname.localeCompare(b.originalname, undefined, { numeric: true }));
  for (let i = 0; i < sortedFiles.length; i++) {
    const f = sortedFiles[i];
    const epIdx = i + 1;
    let epTitle = path.parse(f.originalname).name;
    if (!epTitle.startsWith('第')) epTitle = `第${epIdx}讲：${epTitle}`;

    db.prepare(`
      INSERT INTO courses (id, series_id, episode_index, title, subject, grade_level, video_filename, video_url, duration_seconds, is_interactive, is_published, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 300, 0, 1, ?)
    `).run(`course_${seriesId}_${epIdx}`, seriesId, epIdx, epTitle, subject || 'math', Number(gradeLevel) || 4, f.filename, `/uploads/${f.filename}`, new Date().toISOString());
  }

  res.json({ success: true, message: `🎉 成功上传《${seriesTitle}》（共 ${files.length} 讲）！` });
});

const PORT = 3300;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[ANti Study Server] Running on port ${PORT}`);
});
