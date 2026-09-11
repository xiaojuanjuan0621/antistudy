const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { exec } = require('child_process');
const Database = require('better-sqlite3');

const app = express();
app.use(cors());
app.use(express.json());

const dataDir = path.join(__dirname, 'data');
const uploadsDir = path.join(__dirname, 'uploads');
const assetsDir = path.join(uploadsDir, 'assets');
const frontendDir = path.join(__dirname, 'frontend');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

app.use('/uploads', express.static(uploadsDir));
app.use(express.static(frontendDir));

// ==================== ⚡ GitHub Webhook 自动部署接口 ====================
app.post('/api/webhook/deploy', (req, res) => {
  console.log('⚡ [Webhook] 收到 GitHub 代码推送通知，开始自动化静默更新...');
  
  exec('git pull origin main && npm install && pm2 restart antistudy', { cwd: __dirname }, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ [Webhook 部署失败]:', stderr);
      return res.status(500).json({ success: false, error: stderr });
    }
    console.log('🎉 [Webhook 部署成功]:', stdout);
    res.json({ success: true, message: '🎉 代码已自动同步并重启成功！', output: stdout });
  });
});

const db = new Database(path.join(dataDir, 'antistudy.db'));

// 初始化完整数据库（支持视频课程、书籍绘本、有声音频）
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

  -- 📚 书籍/绘本/文章数据表
  CREATE TABLE IF NOT EXISTS books (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT DEFAULT '名师推荐',
    category TEXT DEFAULT '科学探索',
    grade_level INTEGER DEFAULT 4,
    cover_image TEXT,
    summary TEXT,
    content_text TEXT,
    file_url TEXT,
    file_type TEXT DEFAULT 'text',
    read_minutes INTEGER DEFAULT 8,
    read_count INTEGER DEFAULT 0,
    is_completed INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
  );

  -- 🎧 有声故事/课文音频数据表
  CREATE TABLE IF NOT EXISTS audios (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    speaker TEXT DEFAULT '小拓AI主播',
    category TEXT DEFAULT '名著故事',
    grade_level INTEGER DEFAULT 4,
    cover_image TEXT,
    description TEXT,
    audio_url TEXT NOT NULL,
    duration_seconds INTEGER DEFAULT 180,
    play_count INTEGER DEFAULT 0,
    is_completed INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
  );
`);

// ==================== 1. 学生端仪表盘与任务流 ====================
app.get('/api/student/dashboard', (req, res) => {
  const child = db.prepare('SELECT * FROM children WHERE id = ?').get('child_demo_01');
  const bookCount = db.prepare('SELECT count(*) as total, sum(is_completed) as completed FROM books').get();
  const audioCount = db.prepare('SELECT count(*) as total, sum(is_completed) as completed FROM audios').get();

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
      stats: {
        booksTotal: bookCount.total || 0,
        booksCompleted: bookCount.completed || 0,
        audiosTotal: audioCount.total || 0,
        audiosCompleted: audioCount.completed || 0,
      }
    },
  });
});

// ==================== 2. 课程视频相关 API ====================
app.get('/api/series/list', (req, res) => {
  const allSeries = db.prepare('SELECT * FROM series ORDER BY created_at DESC').all();
  const seriesWithProgress = allSeries.map((s) => {
    const episodes = db.prepare(`
      SELECT c.*, lr.is_completed 
      FROM courses c
      LEFT JOIN learning_records lr ON c.id = lr.course_id AND lr.child_id = 'child_demo_01'
      WHERE c.series_id = ?
      ORDER BY c.episode_index ASC
    `).all(s.id);

    const completedCount = episodes.filter((ep) => ep.is_completed === 1).length;
    const nextEpisode = episodes.find((ep) => !ep.is_completed) || episodes[episodes.length - 1];

    return {
      id: s.id,
      title: s.title,
      subject: s.subject,
      gradeLevel: s.grade_level,
      description: s.description,
      coverImage: s.cover_image || '/uploads/assets/series_math.png',
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

app.get('/api/course/context/:courseId', (req, res) => {
  const { courseId } = req.params;
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId);
  if (!course) return res.status(404).json({ success: false, message: '未找到课程' });

  const series = db.prepare('SELECT * FROM series WHERE id = ?').get(course.series_id);
  const allEpisodes = db.prepare(`
    SELECT c.*, lr.is_completed 
    FROM courses c
    LEFT JOIN learning_records lr ON c.id = lr.course_id AND lr.child_id = 'child_demo_01'
    WHERE c.series_id = ?
    ORDER BY c.episode_index ASC
  `).all(course.series_id);

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

app.post('/api/course/complete', (req, res) => {
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

  const currentCourse = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId);
  let nextCourse = null;
  if (currentCourse && currentCourse.series_id) {
    nextCourse = db.prepare(`
      SELECT * FROM courses WHERE series_id = ? AND episode_index = ?
    `).get(currentCourse.series_id, currentCourse.episode_index + 1);
  }

  res.json({
    success: true,
    grantedRewards: { xp: 40, wishCoins: 15 },
    nextCourse,
  });
});

// ==================== 3. 📖 书籍/绘本相关 API ====================
app.get('/api/books/list', (req, res) => {
  const books = db.prepare('SELECT * FROM books ORDER BY created_at DESC').all();
  res.json({ success: true, data: books });
});

app.get('/api/books/:id', (req, res) => {
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
  if (!book) return res.status(404).json({ success: false, message: '书籍不存在' });
  
  db.prepare('UPDATE books SET read_count = read_count + 1 WHERE id = ?').run(req.params.id);
  res.json({ success: true, data: book });
});

app.post('/api/books/complete', (req, res) => {
  const { bookId } = req.body;
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(bookId);
  if (!book) return res.status(404).json({ success: false, message: '未找到该书籍' });

  db.prepare('UPDATE books SET is_completed = 1 WHERE id = ?').run(bookId);

  db.prepare(`
    UPDATE children 
    SET xp = xp + 30, wish_coins = wish_coins + 10, wish_goal_current = wish_goal_current + 10
    WHERE id = 'child_demo_01'
  `).run();

  res.json({
    success: true,
    message: '🎉 恭喜读完本书！获得 +30 XP 和 +10 心愿币！',
    grantedRewards: { xp: 30, wishCoins: 10 }
  });
});

// ==================== 4. 🎧 有声音频相关 API ====================
app.get('/api/audios/list', (req, res) => {
  const audios = db.prepare('SELECT * FROM audios ORDER BY created_at DESC').all();
  res.json({ success: true, data: audios });
});

app.get('/api/audios/:id', (req, res) => {
  const audio = db.prepare('SELECT * FROM audios WHERE id = ?').get(req.params.id);
  if (!audio) return res.status(404).json({ success: false, message: '音频不存在' });

  db.prepare('UPDATE audios SET play_count = play_count + 1 WHERE id = ?').run(req.params.id);
  res.json({ success: true, data: audio });
});

app.post('/api/audios/complete', (req, res) => {
  const { audioId } = req.body;
  const audio = db.prepare('SELECT * FROM audios WHERE id = ?').get(audioId);
  if (!audio) return res.status(404).json({ success: false, message: '未找到该音频' });

  db.prepare('UPDATE audios SET is_completed = 1 WHERE id = ?').run(audioId);

  db.prepare(`
    UPDATE children 
    SET xp = xp + 25, wish_coins = wish_coins + 8, wish_goal_current = wish_goal_current + 8
    WHERE id = 'child_demo_01'
  `).run();

  res.json({
    success: true,
    message: '🎉 恭喜听完本期音频故事！获得 +25 XP 和 +8 心愿币！',
    grantedRewards: { xp: 25, wishCoins: 8 }
  });
});

// ==================== 5. 心愿目标 API ====================
app.post('/api/student/wish-goal', (req, res) => {
  const { title, targetCoins } = req.body;
  db.prepare('UPDATE children SET wish_goal_title = ?, wish_goal_target = ? WHERE id = ?').run(title, Number(targetCoins), 'child_demo_01');
  res.json({ success: true, message: '🎉 心愿已更新！' });
});

// ==================== 6. 文件与封面上传引擎 ====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const prefix = file.fieldname === 'audioFile' ? 'audio-' : file.fieldname === 'bookFile' ? 'book-' : file.fieldname.includes('cover') ? 'cover-' : 'file-';
    cb(null, prefix + Date.now() + '-' + Math.round(Math.random() * 1e9) + ext);
  },
});
const upload = multer({ storage });

// 视频批量上传
app.post('/api/admin/series/batch-upload', upload.fields([{ name: 'videoFiles', maxCount: 100 }, { name: 'coverImage', maxCount: 1 }]), (req, res) => {
  const { seriesTitle, subject, gradeLevel, description } = req.body;
  const files = (req.files && req.files['videoFiles']) || [];
  const coverFile = (req.files && req.files['coverImage'] && req.files['coverImage'][0]) || null;
  const seriesId = 'series_' + Date.now();

  let coverImageUrl = coverFile ? `/uploads/${coverFile.filename}` : '/uploads/assets/series_math.png';
  if (!coverFile && subject === 'biology') {
    coverImageUrl = '/uploads/assets/series_bio.png';
  }

  db.prepare(`
    INSERT INTO series (id, title, subject, grade_level, description, cover_image, total_episodes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(seriesId, seriesTitle, subject || 'math', Number(gradeLevel) || 4, description || '', coverImageUrl, files.length, new Date().toISOString());

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

// 书籍上传（支持正文、电子书文件以及自定义封面图片）
app.post('/api/admin/books/upload', upload.fields([{ name: 'bookFile', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]), (req, res) => {
  const { title, author, category, gradeLevel, summary, contentText, readMinutes } = req.body;
  const bookFile = (req.files && req.files['bookFile'] && req.files['bookFile'][0]) || null;
  const coverFile = (req.files && req.files['coverImage'] && req.files['coverImage'][0]) || null;

  if (!title) {
    return res.status(400).json({ success: false, message: '请填写书籍标题！' });
  }

  const bookId = 'book_' + Date.now();
  let fileUrl = '';
  let fileType = 'text';

  if (bookFile) {
    fileUrl = `/uploads/${bookFile.filename}`;
    if (bookFile.mimetype === 'application/pdf') {
      fileType = 'pdf';
    }
  }

  let coverImageUrl = coverFile ? `/uploads/${coverFile.filename}` : '/uploads/assets/book_insects.png';
  if (!coverFile) {
    if (category === '经典科幻') coverImageUrl = '/uploads/assets/book_sea.png';
    else if (category === '历史素养') coverImageUrl = '/uploads/assets/book_myth.png';
  }

  db.prepare(`
    INSERT INTO books (id, title, author, category, grade_level, cover_image, summary, content_text, file_url, file_type, read_minutes, read_count, is_completed, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?)
  `).run(
    bookId,
    title,
    author || '名师推荐',
    category || '科学探索',
    Number(gradeLevel) || 4,
    coverImageUrl,
    summary || '这是一本通俗易懂的优质少年好书。',
    contentText || '',
    fileUrl,
    fileType,
    Number(readMinutes) || 8,
    new Date().toISOString()
  );

  res.json({ success: true, message: `🎉 书籍《${title}》已成功发布至阅览室！` });
});

// 书籍删除 API
app.delete('/api/admin/books/:id', (req, res) => {
  db.prepare('DELETE FROM books WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: '书籍已删除' });
});

// 音频上传（支持音频文件与自定义封面）
app.post('/api/admin/audios/upload', upload.fields([{ name: 'audioFile', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]), (req, res) => {
  const { title, speaker, category, gradeLevel, description, durationMinutes } = req.body;
  const audioFile = (req.files && req.files['audioFile'] && req.files['audioFile'][0]) || null;
  const coverFile = (req.files && req.files['coverImage'] && req.files['coverImage'][0]) || null;

  if (!title || !audioFile) {
    return res.status(400).json({ success: false, message: '请填写标题并选择音频文件！' });
  }

  const audioId = 'audio_' + Date.now();
  const audioUrl = `/uploads/${audioFile.filename}`;
  const durSec = (Number(durationMinutes) || 3) * 60;

  let coverImageUrl = coverFile ? `/uploads/${coverFile.filename}` : '/uploads/assets/audio_wukong.png';
  if (!coverFile) {
    if (category === '宇宙科学') coverImageUrl = '/uploads/assets/audio_stars.png';
    else if (category === '国学经典') coverImageUrl = '/uploads/assets/audio_poem.png';
  }

  db.prepare(`
    INSERT INTO audios (id, title, speaker, category, grade_level, cover_image, description, audio_url, duration_seconds, play_count, is_completed, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?)
  `).run(
    audioId,
    title,
    speaker || '小拓AI主播',
    category || '名著有声',
    Number(gradeLevel) || 4,
    coverImageUrl,
    description || '陪伴少年成长的好听音频。',
    audioUrl,
    durSec,
    new Date().toISOString()
  );

  res.json({ success: true, message: `🎉 音频《${title}》已成功发布至有声馆！` });
});

// 音频删除 API
app.delete('/api/admin/audios/:id', (req, res) => {
  db.prepare('DELETE FROM audios WHERE id = ?').run(req.params.id);
  res.json({ success: true, message: '音频已删除' });
});

const PORT = 3300;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[ANti Study Server] Running on port ${PORT}`);
});
