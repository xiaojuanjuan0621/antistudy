import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from '../db';
import { runAICourseFactoryPipeline } from '../../ai-pipeline/course-generator';

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置 Multer 支持多文件批量上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'video-' + uniqueSuffix + ext);
  },
});

export const uploadBatchVideosMiddleware = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 1024 }, // 限制 1GB
});

/**
 * 批量处理上传的整套视频，自动归纳为一个专辑系列（Series）并排序
 */
export async function processBatchUploadedSeries(params: {
  files?: Express.Multer.File[];
  seriesTitle: string;
  subject: string;
  gradeLevel: number;
  description?: string;
  isInteractiveAll?: boolean; // 是否全部开启 AI 互动
}) {
  const seriesId = 'series_' + Date.now();
  const files = params.files || [];

  const totalEpisodes = files.length > 0 ? files.length : 1;

  // 1. 创建系列专辑记录
  db.prepare(`
    INSERT INTO series (id, title, subject, grade_level, description, cover_image, total_episodes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    seriesId,
    params.seriesTitle,
    params.subject,
    params.gradeLevel,
    params.description || `包含全部 ${totalEpisodes} 节系统视频，已为你规划好学习路径！`,
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
    totalEpisodes,
    new Date().toISOString()
  );

  const insertedCourses = [];

  // 2. 遍历每个上传的视频，按文件名自然排序并入库
  // 对文件名进行自然排序 (例如: 01-分数的意义.mp4, 02-真假分数.mp4)
  const sortedFiles = [...files].sort((a, b) => a.originalname.localeCompare(b.originalname, undefined, { numeric: true }));

  for (let i = 0; i < sortedFiles.length; i++) {
    const file = sortedFiles[i];
    const episodeIndex = i + 1;
    const courseId = `course_${seriesId}_ep${episodeIndex}`;
    
    // 清理文件名作为小节标题 (去除扩展名和常见前缀)
    let episodeTitle = path.parse(file.originalname).name;
    if (!episodeTitle.startsWith('第')) {
      episodeTitle = `第${episodeIndex}讲：${episodeTitle}`;
    }

    const videoUrl = `/uploads/${file.filename}`;
    const isInteractive = params.isInteractiveAll ? 1 : (episodeIndex === 1 ? 1 : 0); // 默认首讲互动，其余直接看

    // 插入课程表
    db.prepare(`
      INSERT INTO courses (id, series_id, episode_index, title, subject, grade_level, video_filename, video_url, duration_seconds, is_interactive, is_published, ai_quality_score, card_title, card_fun_fact, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 95, ?, ?, ?)
    `).run(
      courseId,
      seriesId,
      episodeIndex,
      episodeTitle,
      params.subject,
      params.gradeLevel,
      file.filename,
      videoUrl,
      300, // 默认5分钟
      isInteractive,
      `🎴 探索卡牌·第${episodeIndex}课`,
      '每看完一节课，知识世界就更丰富一点！',
      new Date().toISOString()
    );

    // 如果开启了互动模式，为该节课自动生成 1 道基础思考题
    if (isInteractive) {
      db.prepare(`
        INSERT INTO course_interactions (id, course_id, timestamp_seconds, knowledge_point, question, options_json, correct_option_index, explanation, hint_15s, difficulty)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        `int_${courseId}_1`,
        courseId,
        15,
        '本节核心概念',
        `在《${episodeTitle}》中，下列哪项说法最符合本讲核心原理？`,
        JSON.stringify(['理解事物本质原理并应用', '只需要死记硬背不需要理解', '遇到困难直接放弃']),
        0,
        '太棒了！抓住核心原理与应用是学好这门知识的关键！',
        '想一想：学习最重要的是探索逻辑还是机械记忆？',
        'easy'
      );
    }

    insertedCourses.push({
      id: courseId,
      episodeIndex,
      title: episodeTitle,
      videoUrl,
      isInteractive,
    });
  }

  return {
    seriesId,
    seriesTitle: params.seriesTitle,
    totalEpisodes,
    courses: insertedCourses,
  };
}
