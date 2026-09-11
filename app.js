const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
app.use(cors());
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

const dataDir = path.join(__dirname, 'data');
const uploadsDir = path.join(__dirname, 'uploads');
const frontendDir = path.join(__dirname, 'frontend');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
    }
  }
}));
app.use(express.static(frontendDir));

app.get('/', (req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

// GitHub Webhook 自动静默部署
app.post('/api/webhook/deploy', (req, res) => {
  console.log('⚡ [Webhook] 收到 GitHub 推送，开始自动拉取并重启...');
  exec('git pull origin main && pm2 restart antistudy', { cwd: __dirname }, (err, stdout, stderr) => {
    if (err) {
      console.error('Webhook error:', stderr);
      return res.status(500).json({ success: false, error: stderr });
    }
    console.log('Webhook updated successfully:', stdout);
    res.json({ success: true, output: stdout });
  });
});

// ==================== 纯 JS 生产级持久化 JSON 数据库 (支持 视频 / 书籍 / 音乐多媒体) ====================
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
          coverImage: 'https://iili.io/nfESWL7.webp',
          media_type: 'video',
          grade_level: 4,
          description: '系统梳理分数的产生、分子分母的意义与生活应用题。',
          total_episodes: 4,
          created_at: new Date().toISOString()
        },
        {
          id: 'series_bio_g4',
          title: '少年探索课·人体微观细胞与免疫王国',
          subject: 'biology',
          coverImage: 'https://iili.io/nfESVXS.webp',
          media_type: 'video',
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
          media_type: 'video',
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
          media_type: 'video',
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
          media_type: 'video',
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
          media_type: 'video',
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
          media_type: 'video',
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
          media_type: 'video',
          grade_level: 4,
          video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
          duration_seconds: 450,
          is_completed: 0
        }
      ],
      books: [
        {
          id: 'book_01',
          title: '昆虫记·神奇的蜣螂与夏日蝉鸣',
          author: '法布尔 (法)',
          category: '自然探索',
          grade_level: 4,
          cover_image: 'https://iili.io/nfESx5v.webp',
          read_minutes: 10,
          summary: '跟随伟大的昆虫学家法布尔，观察大自然中微小生命的智慧与坚韧。',
          content_text: `【第一章：聪明的蜣螂工程师】\n\n阳光洒满南法的荒原，微风中夹杂着百里香的气息。在厚厚的泥土下，一个微小的生命正在忙碌。\n\n这就是蜣螂——大自然中最勤勉的清道夫。它们用扁平如铲子的头部和强劲有力的前足，将散落的有机碎屑一点一点聚集起来。在它的灵巧制作下，一个圆滚滚的小球逐渐成型。\n\n这不仅仅是一个小泥球，这是它们精心培育后代的庇护所与粮仓。86螂用倒推的方式，在崎岖不平的土地上推动着比自己重数倍的泥球前行。即使遇到陡坡跌落，它也从不放弃，重新爬起继续前行。\n\n【第二章：夏日树梢的歌唱家】\n\n“知了——知了——”，盛夏的阳光把大地烤得滚烫，而在高高的白杨树上，蝉正在不知疲倦地放声高歌。\n\n很多人以为蝉的歌声只是为了热闹，其实这是雄蝉独特的发声器官在振动。在泥土黑暗深处蛰伏了四年甚至更久的蝉蛹，只有在这个夏天短短的几个星期里，才能在阳光下尽情飞翔和歌唱。生命虽短，却绚烂无比！`,
          read_count: 36,
          is_completed: 1,
          created_at: new Date().toISOString()
        },
        {
          id: 'book_02',
          title: '中国古代神话·后羿射日与女娲补天',
          author: '传统神话整理',
          category: '国学经典',
          grade_level: 4,
          cover_image: 'https://iili.io/nfESuzN.webp',
          read_minutes: 8,
          summary: '感受中华上古先民战胜自然、勇于担当的英雄史诗。',
          content_text: `【上篇：女娲炼石补苍天】\n\n往古之时，四极废，九州裂，天不兼覆，地不周载。烈火炎炎不熄，洪水浩浩不息。\n\n女娲目睹人类受难，心生慈悲。她踏遍三山五岳，寻找五色神石。经过九九八十一天的熔炼，终于将苍天补好。天地重归宁静，万物生机勃勃。\n\n【下篇：后羿神箭挽狂澜】\n\n相传尧帝之时，十日并出，焦禾稼，杀草木，而民无所食。\n\n英雄后羿挺身而出，手持红色的神弓，搭上白色的神箭。他登上昆仑之巅，凝神聚气，“嗖！嗖！嗖！”九支神箭破空而出，九个太阳化作金乌坠落，留下一轮温和的太阳造福人间。百姓欢呼雀跃，大地重现生机！`,
          read_count: 24,
          is_completed: 0,
          created_at: new Date().toISOString()
        },
        {
          id: 'book_03',
          title: '海底两万里·潜入神秘的鹦鹉螺号',
          author: '儒勒·凡尔纳',
          category: '科幻冒险',
          grade_level: 4,
          cover_image: 'https://iili.io/nfES7qX.webp',
          read_minutes: 12,
          summary: '尼摩船长带着阿龙纳斯教授，在深邃莫测的太平洋深处展开了一场壮丽的大冒险。',
          content_text: `【第一章：来自深海的怪兽】\n\n1866年，全世界的航海界都被一件不可思议的怪事震惊了。几艘远洋轮船在公海上遇到了一头巨大而神秘的“海怪”，它不仅身形庞大，而且速度极快，甚至能发出奇异的冷光。\n\n阿龙纳斯教授登上了“林肯号”驱逐舰前往探寻真相。然而在一场激烈的遭遇战中，教授与仆人康塞尔不幸落水，意外爬上了这个怪物的脊背——他们惊讶地发现，这根本不是什么海怪，而是一艘由坚硬钢板打造的钢铁巨潜艇！\n\n【第二章：尼摩船长的奇幻世界】\n\n舱门缓缓打开，神秘的尼摩船长出现在他们面前。“欢迎登上鹦鹉螺号，”船长目光深邃而坚定，“在这片广袤无垠的深海之中，我们拥有绝对的自由与宁静！”\n\n透过巨大的水晶舷窗，海底世界如梦如幻：发光的珊瑚林、五彩斑斓的热带鱼群、沉睡千年的古城遗迹……一场震撼心灵的深海科幻之旅正式开启！`,
          read_count: 18,
          is_completed: 0,
          created_at: new Date().toISOString()
        }
      ],
      audios: [
        {
          id: 'audio_01',
          title: '大闹天宫：齐天大圣勇闯南天门',
          speaker: '小拓AI播音员',
          category: '名著故事',
          grade_level: 4,
          cover_image: 'https://iili.io/nfESB0g.webp',
          duration_seconds: 240,
          play_count: 42,
          audio_url: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Sevish_-__nbsp_.mp3',
          is_completed: 1,
          created_at: new Date().toISOString()
        },
        {
          id: 'audio_02',
          title: '宇宙探秘：黑洞到底有多神奇？',
          speaker: '科学探索号',
          category: '宇宙科学',
          grade_level: 4,
          cover_image: 'https://iili.io/nfESKs1.webp',
          duration_seconds: 180,
          play_count: 29,
          audio_url: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Kangaroo_MusiQue_-_The_Neverending_Story.mp3',
          is_completed: 0,
          created_at: new Date().toISOString()
        },
        {
          id: 'audio_03',
          title: '早读古诗：春晓 & 望庐山瀑布 (配乐朗诵)',
          speaker: '国学雅韵',
          category: '国学经典',
          grade_level: 4,
          cover_image: 'https://iili.io/nfESJOQ.webp',
          duration_seconds: 210,
          play_count: 35,
          audio_url: 'https://commondatastorage.googleapis.com/codeskulptor-demos/DDR_assets/Sevish_-__nbsp_.mp3',
          is_completed: 0,
          created_at: new Date().toISOString()
        }
      ],
      records: {
        'course_math_01': { is_completed: 1, actual_watch_seconds: 360 },
        'book_01': { is_completed: 1, read_count: 1 },
        'audio_01': { is_completed: 1 }
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
      stats: {
        booksTotal: (db.books || []).length,
        audiosTotal: (db.audios || []).length,
        coursesTotal: (db.courses || []).length
      }
    },
  });
});

app.get('/api/series/list', (req, res) => {
  const db = loadDB();
  const filterType = req.query.type; // video | book | audio | all
  let allSeries = db.series || [];
  if (filterType && filterType !== 'all') {
    allSeries = allSeries.filter(s => s.media_type === filterType);
  }

  const seriesWithProgress = allSeries.map((s) => {
    const episodes = (db.courses || []).filter((c) => c.series_id === s.id).sort((a, b) => a.episode_index - b.episode_index);
    const completedCount = episodes.filter((ep) => db.records && db.records[ep.id] && db.records[ep.id].is_completed === 1).length;
    const nextEpisode = episodes.find((ep) => !db.records || !db.records[ep.id] || db.records[ep.id].is_completed !== 1) || episodes[episodes.length - 1];

    return {
      id: s.id,
      title: s.title,
      subject: s.subject,
      coverImage: s.coverImage || (s.subject === 'math' ? 'https://iili.io/nfESWL7.webp' : 'https://iili.io/nfESVXS.webp'),
      mediaType: s.media_type || 'video',
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
        isCompleted: !!(db.records && db.records[ep.id] && db.records[ep.id].is_completed === 1),
      })),
    };
  });
  res.json({ success: true, data: seriesWithProgress });
});

app.get('/api/course/context/:courseId', (req, res) => {
  const db = loadDB();
  const { courseId } = req.params;
  const course = (db.courses || []).find((c) => c.id === courseId);
  if (!course) return res.status(404).json({ success: false, message: '未找到资源' });

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
        isCompleted: !!(db.records && db.records[ep.id] && db.records[ep.id].is_completed === 1),
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

// ==================== 📖 书籍/绘本相关 API ====================
app.get('/api/books/list', (req, res) => {
  const db = loadDB();
  const books = (db.books || []).map(b => ({
    ...b,
    is_completed: db.records && db.records[b.id] && db.records[b.id].is_completed === 1 ? 1 : 0
  }));
  res.json({ success: true, data: books });
});

app.get('/api/books/:id', (req, res) => {
  const db = loadDB();
  const book = (db.books || []).find(b => b.id === req.params.id);
  if (!book) return res.status(404).json({ success: false, message: '书籍不存在' });
  
  book.read_count = (book.read_count || 0) + 1;
  saveDB(db);
  res.json({ success: true, data: book });
});

app.post('/api/books/complete', (req, res) => {
  const db = loadDB();
  const { bookId } = req.body;
  if (!db.records) db.records = {};
  db.records[bookId] = {
    is_completed: 1,
    completed_at: new Date().toISOString()
  };

  db.child.xp += 30;
  db.child.wish_coins += 10;
  db.child.wish_goal_current += 10;
  saveDB(db);

  res.json({
    success: true,
    message: '🎉 恭喜读完本书！获得 +30 XP 和 +10 心愿币！',
    grantedRewards: { xp: 30, wishCoins: 10 }
  });
});

// ==================== 🎧 有声音频相关 API ====================
app.get('/api/audios/list', (req, res) => {
  const db = loadDB();
  const audios = (db.audios || []).map(a => ({
    ...a,
    is_completed: db.records && db.records[a.id] && db.records[a.id].is_completed === 1 ? 1 : 0
  }));
  res.json({ success: true, data: audios });
});

app.get('/api/audios/:id', (req, res) => {
  const db = loadDB();
  const audio = (db.audios || []).find(a => a.id === req.params.id);
  if (!audio) return res.status(404).json({ success: false, message: '音频不存在' });

  audio.play_count = (audio.play_count || 0) + 1;
  saveDB(db);
  res.json({ success: true, data: audio });
});

app.post('/api/audios/complete', (req, res) => {
  const db = loadDB();
  const { audioId } = req.body;
  if (!db.records) db.records = {};
  db.records[audioId] = {
    is_completed: 1,
    completed_at: new Date().toISOString()
  };

  db.child.xp += 25;
  db.child.wish_coins += 8;
  db.child.wish_goal_current += 8;
  saveDB(db);

  res.json({
    success: true,
    message: '🎉 恭喜听完本期音频故事！获得 +25 XP 和 +8 心愿币！',
    grantedRewards: { xp: 25, wishCoins: 8 }
  });
});

// Multer 文件上传配置（支持视频、音频、PDF图书文档）
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, 'media-' + Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname)),
});
const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 500, // 单文件最大 500MB
    fieldSize: 1024 * 1024 * 500
  }
});

// 批量上传：支持新建系列 / 追加到现有系列，支持视频、书本(PDF)、音乐音频
app.post('/api/admin/series/batch-upload', upload.array('videoFiles', 100), (req, res) => {
  const db = loadDB();
  let { seriesId, seriesTitle, subject, gradeLevel, description, mediaType } = req.body;
  const files = req.files || [];

  if (!files || files.length === 0) {
    return res.status(400).json({ success: false, message: '请选择要上传的文件！' });
  }

  const detectedType = mediaType || 'video'; // video | book | audio
  if (!db.series) db.series = [];
  if (!db.courses) db.courses = [];
  if (!db.books) db.books = [];
  if (!db.audios) db.audios = [];

  let targetSeries = null;
  if (seriesId && seriesId !== 'new') {
    targetSeries = db.series.find(s => s.id === seriesId);
  }

  if (targetSeries) {
    seriesId = targetSeries.id;
    seriesTitle = targetSeries.title;
    subject = targetSeries.subject;
    gradeLevel = targetSeries.grade_level;
    description = targetSeries.description;
  } else {
    seriesId = 'series_' + Date.now();
    targetSeries = {
      id: seriesId,
      title: seriesTitle || '未命名系列',
      subject: subject || 'chinese',
      coverImage: detectedType === 'book' ? 'https://iili.io/nfESx5v.webp' : detectedType === 'audio' ? 'https://iili.io/nfESB0g.webp' : 'https://iili.io/nfESWL7.webp',
      media_type: detectedType,
      grade_level: Number(gradeLevel) || 4,
      description: description || '',
      total_episodes: 0,
      created_at: new Date().toISOString()
    };
    db.series.unshift(targetSeries);
  }

  // 获取该系列现有的最高讲数序号
  const existingEpisodes = db.courses.filter(c => c.series_id === seriesId);
  let startIdx = existingEpisodes.length;

  const sortedFiles = [...files].sort((a, b) => a.originalname.localeCompare(b.originalname, undefined, { numeric: true }));

  for (let i = 0; i < sortedFiles.length; i++) {
    const f = sortedFiles[i];
    // 彻底解决 UTF-8 中文字符乱码
    let rawFilename = f.originalname;
    try {
      rawFilename = Buffer.from(f.originalname, 'latin1').toString('utf8');
      if (rawFilename.includes('')) {
        rawFilename = f.originalname;
      }
    } catch (e) {
      rawFilename = f.originalname;
    }

    const epIdx = startIdx + i + 1;
    let epTitle = path.parse(rawFilename).name;
    const prefix = detectedType === 'book' ? '第' + epIdx + '回：' : detectedType === 'audio' ? '第' + epIdx + '首：' : '第' + epIdx + '讲：';
    if (!epTitle.startsWith('第')) epTitle = `${prefix}${epTitle}`;

    db.courses.push({
      id: `item_${seriesId}_${epIdx}_${Date.now()}_${i}`,
      series_id: seriesId,
      episode_index: epIdx,
      title: epTitle,
      subject: subject || 'chinese',
      media_type: detectedType,
      grade_level: Number(gradeLevel) || 4,
      video_filename: f.filename,
      video_url: `/uploads/${f.filename}`,
      duration_seconds: detectedType === 'audio' ? 180 : 300,
      is_interactive: 0,
      is_published: 1,
      created_at: new Date().toISOString()
    });

    if (detectedType === 'book') {
      db.books.unshift({
        id: `book_${seriesId}_${epIdx}_${Date.now()}_${i}`,
        series_id: seriesId,
        title: `${seriesTitle} · ${epTitle}`,
        author: '名师精编',
        category: subject === 'chinese' ? '国学经典' : '自然探索',
        grade_level: Number(gradeLevel) || 4,
        cover_image: 'https://iili.io/nfESx5v.webp',
        read_minutes: 8,
        summary: description || `《${seriesTitle}》配套阅读读物。`,
        content_text: `【${epTitle}】\n\n已成功载入《${seriesTitle}》电子读物内容！\n文件：${rawFilename}\n\n请在宽屏或平板上尽情阅读，探索更多知识！`,
        file_url: `/uploads/${f.filename}`,
        read_count: 0,
        is_completed: 0,
        created_at: new Date().toISOString()
      });
    }

    if (detectedType === 'audio') {
      db.audios.unshift({
        id: `audio_${seriesId}_${epIdx}_${Date.now()}_${i}`,
        series_id: seriesId,
        title: `${seriesTitle} · ${epTitle}`,
        speaker: '小拓AI主播',
        category: subject === 'chinese' ? '国学经典' : '名著故事',
        grade_level: Number(gradeLevel) || 4,
        cover_image: 'https://iili.io/nfESB0g.webp',
        duration_seconds: 180,
        play_count: 0,
        audio_url: `/uploads/${f.filename}`,
        is_completed: 0,
        created_at: new Date().toISOString()
      });
    }
  }

  // 更新总集数
  targetSeries.total_episodes = db.courses.filter(c => c.series_id === seriesId).length;

  saveDB(db);
  res.json({ success: true, message: `🎉 成功上传/追加至《${seriesTitle}》（新增 ${files.length} 个文件，当前共 ${targetSeries.total_episodes} 讲/回）！` });
});

// ==================== 🗑️ 删除系列/专辑 API ====================
app.delete('/api/admin/series/:id', (req, res) => {
  const db = loadDB();
  const seriesId = req.params.id;

  // 1. 删除系列中的所有课程/章节文件
  const toDeleteCourses = (db.courses || []).filter(c => c.series_id === seriesId);
  toDeleteCourses.forEach(c => {
    if (c.video_filename) {
      const p = path.join(uploadsDir, c.video_filename);
      if (fs.existsSync(p)) {
        try { fs.unlinkSync(p); } catch (e) {}
      }
    }
  });

  db.series = (db.series || []).filter(s => s.id !== seriesId);
  db.courses = (db.courses || []).filter(c => c.series_id !== seriesId);
  db.books = (db.books || []).filter(b => b.series_id !== seriesId && b.id !== seriesId);
  db.audios = (db.audios || []).filter(a => a.series_id !== seriesId && a.id !== seriesId);

  saveDB(db);
  res.json({ success: true, message: '🎉 系列专辑及关联资料已全部删除！' });
});

// ==================== 🗑️ 删除单本图书 API ====================
app.delete('/api/admin/books/:id', (req, res) => {
  const db = loadDB();
  const bookId = req.params.id;
  const book = (db.books || []).find(b => b.id === bookId);
  if (book && book.file_url && book.file_url.startsWith('/uploads/')) {
    const fn = path.basename(book.file_url);
    const p = path.join(uploadsDir, fn);
    if (fs.existsSync(p)) {
      try { fs.unlinkSync(p); } catch (e) {}
    }
  }
  db.books = (db.books || []).filter(b => b.id !== bookId);
  saveDB(db);
  res.json({ success: true, message: '🎉 图书已成功删除！' });
});

// ==================== 🗑️ 删除单个音频 API ====================
app.delete('/api/admin/audios/:id', (req, res) => {
  const db = loadDB();
  const audioId = req.params.id;
  const audio = (db.audios || []).find(a => a.id === audioId);
  if (audio && audio.audio_url && audio.audio_url.startsWith('/uploads/')) {
    const fn = path.basename(audio.audio_url);
    const p = path.join(uploadsDir, fn);
    if (fs.existsSync(p)) {
      try { fs.unlinkSync(p); } catch (e) {}
    }
  }
  db.audios = (db.audios || []).filter(a => a.id !== audioId);
  saveDB(db);
  res.json({ success: true, message: '🎉 音频已成功删除！' });
});

// 全局异常与文件过大错误拦截
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, message: '文件体积超出限制（单个文件最大支持500MB）' });
  }
  res.status(500).json({ success: false, message: err.message || '服务器内部错误' });
});

const PORT = 3300;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[ANti Study Server] Running on http://0.0.0.0:${PORT}`);
});
