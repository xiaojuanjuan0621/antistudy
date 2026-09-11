cat << 'EOF' > ~/antistudy/app.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

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

// 根路径直接重定向到 index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

// ==================== 纯 JS 生产级持久化 JSON 数据库 (0 原生依赖，100% 稳定) ====================
const dbFilePath = path.join(dataDir, 'antistudy_store.json');

function loadDB() {
  if (!fs.existsSync(dbFilePath)) {
    const defaultData = {
      child: {
        id: 'child_demo_01',
        name: '张安泽',
        grade_level: 4,
        xp: 1850,
        level: 3,
        streak_days: 18,
        wish_coins: 680,
        wish_goal_title: '《DK 青少年科学大百科》全套',
        wish_goal_target: 1000,
        wish_goal_current: 680
      },
      series: [
        {
          id: 'series_math_g4',
          title: '小学四年级数学·分数的奥秘全集',
          subject: 'math',
          grade_level: 4,
          description: '系统梳理分数的产生、分子分母的意义与生活应用题。',
          total_episodes: 4,
          created_at: new Date().toISOString()
        },
        {
          id: 'series_bio_g4',
          title: '少年探索课·人体微观细胞与免疫王国',
          subject: 'biology',
          grade_level: 4,
          description: '像看动画一样探索人体微观细胞与免疫防御大战！',
          total_episodes: 2,
          created_at: new Date().toISOString()
        }
      ],
      courses: [
        {
          id: 'course_math_01',
          series_id: 'series_math_g4',
          episode_index: 1,
          title: '第1讲：分数的初体验（分披萨与分数的意义）',
          subject: 'math',
          grade_level: 4,
          video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          duration_seconds: 360,
          is_completed: 1
        },
        {
          id: 'course_math_02',
          series_id: 'series_math_g4',
          episode_index: 2,
          title: '第2讲：真分数与假分数的秘密（大于1的思考）',
          subject: 'math',
          grade_level: 4,
          video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          duration_seconds: 420,
          is_completed: 0
        },
        {
          id: 'course_math_03',
          series_id: 'series_math_g4',
          episode_index: 3,
          title: '第3讲：分数通分与同分母加减法',
          subject: 'math',
          grade_level: 4,
          video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          duration_seconds: 480,
          is_completed: 0
        },
        {
          id: 'course_math_04',
          series_id: 'series_math_g4',
          episode_index: 4,
          title: '第4讲：生活中的分数应用题大通关',
          subject: 'math',
          grade_level: 4,
          video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
          duration_seconds: 520,
          is_completed: 0
        },
        {
          id: 'course_bio_01',
          series_id: 'series_bio_g4',
          episode_index: 1,
          title: '第1讲：细胞城堡的司令部（认识细胞核）',
          subject: 'biology',
          grade_level: 4,
          video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
          duration_seconds: 390,
          is_completed: 0
        },
        {
          id: 'course_bio_02',
          series_id: 'series_bio_g4',
          episode_index: 2,
          title: '第2讲：白细胞卫士出动！人体免疫防线大战',
          subject: 'biology',
          grade_level: 4,
          video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
          duration_seconds: 450,
          is_completed: 0
        }
      ],
      records: {
        'course_math_01': { is_completed: 1, actual_watch_seconds: 360 }
      }
    };
    fs.writeFileSync(dbFilePath, JSON.stringify(defaultData, null, 2), 'utf8');
    return defaultData;
  }
  try {
    return JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));
  } catch (e) {
    return {};
  }
}

function saveDB(data) {
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf8');
}

// ==================== 业务 API ====================
app.get('/api/student/dashboard', (req, res) => {
  const db = loadDB();
  res.json({
    success: true,
    data: {
      child: {
        id: db.child.id,
        name: db.child.name,
        grade: db.child.grade_level,
        xp: db.child.xp,
        level: db.child.level,
        streakDays: db.child.streak_days,
        wishBalance: db.child.wish_coins,
        wishGoal: {
          title: db.child.wish_goal_title,
          target: db.child.wish_goal_target,
          current: db.child.wish_goal_current,
        },
      },
    },
  });
});

app.get('/api/series/list', (req, res) => {
  const db = loadDB();
  const seriesWithProgress = (db.series || []).map((s) => {
    const episodes = (db.courses || []).filter((c) => c.series_id === s.id).sort((a, b) => a.episode_index - b.episode_index);
    const completedCount = episodes.filter((ep) => db.records[ep.id] && db.records[ep.id].is_completed === 1).length;
    const nextEpisode = episodes.find((ep) => !db.records[ep.id] || db.records[ep.id].is_completed !== 1) || episodes[episodes.length - 1];

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
        isCompleted: db.records[ep.id] && db.records[ep.id].is_completed === 1,
      })),
    };
  });
  res.json({ success: true, data: seriesWithProgress });
});

app.get('/api/course/context/:courseId', (req, res) => {
  const db = loadDB();
  const { courseId } = req.params;
  const course = (db.courses || []).find((c) => c.id === courseId);
  if (!course) return res.status(404).json({ success: false, message: '未找到课程' });

  const series = (db.series || []).find((s) => s.id === course.series_id);
  const allEpisodes = (db.courses || []).filter((c) => c.series_id === course.series_id).sort((a, b) => a.episode_index - b.episode_index);

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
        isCompleted: db.records[ep.id] && db.records[ep.id].is_completed === 1,
      })),
    },
  });
});

app.post('/api/course/complete', (req, res) => {
  const db = loadDB();
  const { courseId, actualWatchDuration } = req.body;
  if (!db.records) db.records = {};
  db.records[courseId] = {
    is_completed: 1,
    actual_watch_seconds: actualWatchDuration || 300,
    completed_at: new Date().toISOString()
  };

  db.child.xp += 40;
  db.child.wish_coins += 15;
  db.child.wish_goal_current += 15;
  saveDB(db);

  const currentCourse = (db.courses || []).find((c) => c.id === courseId);
  let nextCourse = null;
  if (currentCourse && currentCourse.series_id) {
    nextCourse = (db.courses || []).find((c) => c.series_id === currentCourse.series_id && c.episode_index === currentCourse.episode_index + 1);
  }

  res.json({
    success: true,
    grantedRewards: { xp: 40, wishCoins: 15 },
    nextCourse,
  });
});

app.post('/api/student/wish-goal', (req, res) => {
  const db = loadDB();
  const { title, targetCoins } = req.body;
  db.child.wish_goal_title = title;
  db.child.wish_goal_target = Number(targetCoins);
  saveDB(db);
  res.json({ success: true, message: '🎉 心愿已更新！' });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, 'video-' + Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname)),
});
const upload = multer({ storage });

app.post('/api/admin/series/batch-upload', upload.array('videoFiles', 100), (req, res) => {
  const db = loadDB();
  const { seriesTitle, subject, gradeLevel, description } = req.body;
  const files = req.files || [];
  const seriesId = 'series_' + Date.now();

  const newSeries = {
    id: seriesId,
    title: seriesTitle,
    subject: subject || 'math',
    grade_level: Number(gradeLevel) || 4,
    description: description || '',
    total_episodes: files.length,
    created_at: new Date().toISOString()
  };
  if (!db.series) db.series = [];
  db.series.unshift(newSeries);

  const sortedFiles = [...files].sort((a, b) => a.originalname.localeCompare(b.originalname, undefined, { numeric: true }));
  if (!db.courses) db.courses = [];

  for (let i = 0; i < sortedFiles.length; i++) {
    const f = sortedFiles[i];
    const epIdx = i + 1;
    let epTitle = path.parse(f.originalname).name;
    if (!epTitle.startsWith('第')) epTitle = `第${epIdx}讲：${epTitle}`;

    db.courses.push({
      id: `course_${seriesId}_${epIdx}`,
      series_id: seriesId,
      episode_index: epIdx,
      title: epTitle,
      subject: subject || 'math',
      grade_level: Number(gradeLevel) || 4,
      video_filename: f.filename,
      video_url: `/uploads/${f.filename}`,
      duration_seconds: 300,
      is_interactive: 0,
      is_published: 1,
      created_at: new Date().toISOString()
    });
  }

  saveDB(db);
  res.json({ success: true, message: `🎉 成功上传《${seriesTitle}》（共 ${files.length} 讲）！` });
});

const PORT = 3300;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[ANti Study Server] Running on http://0.0.0.0:${PORT}`);
});
EOF

pm2 delete all 2>/dev/null || true
pm2 start ~/antistudy/app.js --name antistudy
pm2 save
echo "🎉 启动成功！"
