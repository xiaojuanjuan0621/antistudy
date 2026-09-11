import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { db } from './db';
import { AIPKAdaptiveEngine } from './services/ai-pk.service';
import { VideoLearningValidationService } from './services/learning-validator.service';
import { ParentInsightEngine } from './services/parent-insight.service';
import { uploadBatchVideosMiddleware, processBatchUploadedSeries } from './services/upload-pipeline.service';

const app = express();
app.use(cors());
app.use(express.json());

// 静态托管前端页面与上传的视频媒体文件
const frontendDir = path.join(__dirname, '../frontend');
const uploadsDir = path.join(__dirname, '../uploads');

app.use('/uploads', express.static(uploadsDir));
app.use(express.static(frontendDir));

// ==================== 1. 系列大纲规划 API (无上限支持) ====================

app.get('/api/series/list', (req: Request, res: Response) => {
  const allSeries = db.prepare('SELECT * FROM series ORDER BY created_at DESC').all() as any[];
  
  const seriesWithProgress = allSeries.map((s) => {
    const episodes = db.prepare(`
      SELECT c.*, lr.is_completed, lr.completed_at
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
      coverImage: s.cover_image,
      totalEpisodes: episodes.length,
      completedEpisodes: completedCount,
      progressPercent: episodes.length > 0 ? Math.round((completedCount / episodes.length) * 100) : 0,
      nextEpisode: nextEpisode ? {
        id: nextEpisode.id,
        episodeIndex: nextEpisode.episode_index,
        title: nextEpisode.title,
        durationMinutes: Math.ceil(nextEpisode.duration_seconds / 60),
        isInteractive: nextEpisode.is_interactive === 1,
      } : null,
      episodes: episodes.map((ep) => ({
        id: ep.id,
        episodeIndex: ep.episode_index,
        title: ep.title,
        durationMinutes: Math.ceil(ep.duration_seconds / 60),
        isInteractive: ep.is_interactive === 1,
        isCompleted: ep.is_completed === 1,
      })),
    };
  });

  res.json({ success: true, data: seriesWithProgress });
});

// 获取指定单节课程详情与连播目录
app.get('/api/course/context/:courseId', (req: Request, res: Response) => {
  const { courseId } = req.params;
  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId) as any;

  if (!course) {
    return res.status(404).json({ success: false, message: '未找到指定课程' });
  }

  const series = db.prepare('SELECT * FROM series WHERE id = ?').get(course.series_id) as any;
  const allEpisodes = db.prepare(`
    SELECT c.*, lr.is_completed 
    FROM courses c
    LEFT JOIN learning_records lr ON c.id = lr.course_id AND lr.child_id = 'child_demo_01'
    WHERE c.series_id = ?
    ORDER BY c.episode_index ASC
  `).all(course.series_id) as any[];

  const currentIndex = allEpisodes.findIndex((ep) => ep.id === course.id);
  const prevEpisode = currentIndex > 0 ? allEpisodes[currentIndex - 1] : null;
  const nextEpisode = currentIndex < allEpisodes.length - 1 ? allEpisodes[currentIndex + 1] : null;

  const interactions = db.prepare('SELECT * FROM course_interactions WHERE course_id = ? ORDER BY timestamp_seconds ASC').all(course.id) as any[];

  res.json({
    success: true,
    data: {
      course: {
        id: course.id,
        seriesId: course.series_id,
        episodeIndex: course.episode_index,
        title: course.title,
        videoUrl: course.video_url,
        durationSeconds: course.duration_seconds,
        isInteractive: course.is_interactive === 1,
        interactions: interactions.map((it) => ({
          id: it.id,
          timestampSeconds: it.timestamp_seconds,
          knowledgePoint: it.knowledge_point,
          question: it.question,
          options: JSON.parse(it.options_json),
          correctOptionIndex: it.correct_option_index,
          explanation: it.explanation,
          hint15s: it.hint_15s,
          difficulty: it.difficulty,
        })),
      },
      series: series ? {
        id: series.id,
        title: series.title,
        totalEpisodes: allEpisodes.length,
        currentEpisodeIndex: course.episode_index,
      } : null,
      navigation: {
        hasPrev: !!prevEpisode,
        prevEpisode: prevEpisode ? { id: prevEpisode.id, title: prevEpisode.title, episodeIndex: prevEpisode.episode_index } : null,
        hasNext: !!nextEpisode,
        nextEpisode: nextEpisode ? { id: nextEpisode.id, title: nextEpisode.title, episodeIndex: nextEpisode.episode_index } : null,
      },
      playlist: allEpisodes.map((ep) => ({
        id: ep.id,
        episodeIndex: ep.episode_index,
        title: ep.title,
        durationMinutes: Math.ceil(ep.duration_seconds / 60),
        isCurrent: ep.id === course.id,
        isCompleted: ep.is_completed === 1,
        isInteractive: ep.is_interactive === 1,
      })),
    },
  });
});

// ==================== 2. 学生端主页与成长 API ====================

app.get('/api/student/dashboard', (req: Request, res: Response) => {
  const child = db.prepare('SELECT * FROM children WHERE id = ?').get('child_demo_01') as any;
  const cards = db.prepare('SELECT * FROM cards WHERE child_id = ? ORDER BY unlocked_at DESC').all('child_demo_01');
  const allSeries = db.prepare('SELECT * FROM series ORDER BY created_at DESC').all() as any[];

  const learningPlans = allSeries.map((s) => {
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
      seriesId: s.id,
      title: s.title,
      subject: s.subject === 'math' ? '数学' : s.subject === 'biology' ? '自然科学' : '综合素养',
      totalEpisodes: episodes.length,
      completedEpisodes: completedCount,
      progressPercent: episodes.length > 0 ? Math.round((completedCount / episodes.length) * 100) : 0,
      currentEpisode: nextEpisode ? {
        id: nextEpisode.id,
        episodeIndex: nextEpisode.episode_index,
        title: nextEpisode.title,
        durationMinutes: Math.ceil(nextEpisode.duration_seconds / 60),
        isInteractive: nextEpisode.is_interactive === 1,
      } : null,
    };
  });

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
        cards: cards.map((cd: any) => ({
          id: cd.id,
          title: cd.title,
          rarity: cd.rarity,
          summary: cd.summary_text,
          funFact: cd.fun_fact,
          image: cd.image_url,
        })),
        wishGoal: {
          title: child.wish_goal_title,
          target: child.wish_goal_target,
          current: child.wish_goal_current,
        },
      },
      learningPlans,
      greeting: '今天准备好探索新知识了吗？你的学习地图正在稳步通关中！',
    },
  });
});

// 设置与修改心愿目标 API (随时自由填写)
app.post('/api/student/wish-goal', (req: Request, res: Response) => {
  const { title, targetCoins } = req.body;
  if (!title || !targetCoins) {
    return res.status(400).json({ success: false, message: '请填写心愿标题和目标币数' });
  }

  db.prepare(`
    UPDATE children 
    SET wish_goal_title = ?, wish_goal_target = ?
    WHERE id = 'child_demo_01'
  `).run(title, Number(targetCoins));

  res.json({
    success: true,
    message: '🎉 心愿目标已更新！向着心愿继续出发！',
    data: { title, targetCoins: Number(targetCoins) },
  });
});

// 完成单节课程学习并记录进度
app.post('/api/course/complete', (req: Request, res: Response) => {
  const { courseId, actualWatchDuration } = req.body;
  const child = db.prepare('SELECT * FROM children WHERE id = ?').get('child_demo_01') as any;

  db.prepare(`
    INSERT OR REPLACE INTO learning_records (id, child_id, course_id, actual_watch_seconds, is_completed, completed_at)
    VALUES (?, 'child_demo_01', ?, ?, 1, ?)
  `).run(`rec_${courseId}`, courseId, actualWatchDuration || 300, new Date().toISOString());

  const gainedXP = 40;
  const gainedWishCoins = 15;
  db.prepare(`
    UPDATE children 
    SET xp = xp + ?, wish_coins = wish_coins + ?, wish_goal_current = wish_goal_current + ?
    WHERE id = 'child_demo_01'
  `).run(gainedXP, gainedWishCoins, gainedWishCoins);

  const currentCourse = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId) as any;
  let nextCourse = null;
  if (currentCourse && currentCourse.series_id) {
    nextCourse = db.prepare(`
      SELECT * FROM courses 
      WHERE series_id = ? AND episode_index = ?
    `).get(currentCourse.series_id, currentCourse.episode_index + 1) as any;
  }

  res.json({
    success: true,
    grantedRewards: {
      xp: gainedXP,
      wishCoins: gainedWishCoins,
    },
    nextCourse: nextCourse ? {
      id: nextCourse.id,
      episodeIndex: nextCourse.episode_index,
      title: nextCourse.title,
    } : null,
  });
});

// AI PK 对战模拟
app.post('/api/ai-pk/round', (req: Request, res: Response) => {
  const { opponentId, roundIndex, correctOptionIndex, totalOptions, childStreakCorrect, childStreakWrong, childHp, aiHp } = req.body;
  const sim = AIPKAdaptiveEngine.simulateAIRound({
    opponentId: opponentId || 'scholar',
    roundIndex: roundIndex || 1,
    correctOptionIndex: correctOptionIndex ?? 0,
    totalOptions: totalOptions || 4,
    childStreakCorrect: childStreakCorrect || 0,
    childStreakWrong: childStreakWrong || 0,
    childHp: childHp || 100,
    aiHp: aiHp || 100,
  });
  res.json({ success: true, data: sim });
});

// 家长看板洞察
app.get('/api/parent/insights', (req: Request, res: Response) => {
  const child = db.prepare('SELECT * FROM children WHERE id = ?').get('child_demo_01') as any;
  const report = ParentInsightEngine.generateWeeklyInsight({
    childName: child.nickname,
    totalDurationMinutes: 288,
    completedLessonsCount: 15,
    averageAccuracy: 0.88,
    streakDays: child.streak_days,
    subjectDistribution: { math: 35, biology: 30, history: 20, english: 15 },
    activeInterestEvents: [
      { subject: '生物探索', topic: '人体微观细胞王国', activeClickCount: 18, completedExploration: 8 },
      { subject: '历史文明', topic: '大秦帝国的崛起与制度', activeClickCount: 12, completedExploration: 5 },
    ],
    weakKnowledgePoints: [
      { pointName: '分数与实际生活场景应用题', subject: '数学', errorRate: 0.28, averageResponseSeconds: 38 },
    ],
  });
  res.json({ success: true, data: report });
});

// ==================== 3. 管理后台：批量上传系列视频 API ====================

app.post('/api/admin/series/batch-upload', uploadBatchVideosMiddleware.array('videoFiles', 100), async (req: Request, res: Response) => {
  try {
    const { seriesTitle, subject, gradeLevel, description, mode } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, message: '请至少选择一个视频文件上传！' });
    }

    const isInteractiveAll = mode === 'interactive';

    const result = await processBatchUploadedSeries({
      files,
      seriesTitle: seriesTitle || '新上传系列课程',
      subject: subject || 'math',
      gradeLevel: Number(gradeLevel) || 4,
      description,
      isInteractiveAll,
    });

    res.json({
      success: true,
      message: `🎉 成功批量上传整套《${result.seriesTitle}》（共 ${result.totalEpisodes} 讲）！`,
      data: result,
    });
  } catch (err: any) {
    console.error('Batch upload error:', err);
    res.status(500).json({ success: false, message: '批量上传失败: ' + err.message });
  }
});

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3300;
export default app;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[ANti Study Fullstack Server] Running at http://localhost:${PORT}`);
    console.log(`- 学生端 iPad 工作台: http://localhost:${PORT}/index.html`);
    console.log(`- 管理后台/批量上传: http://localhost:${PORT}/admin.html`);
  });
}
