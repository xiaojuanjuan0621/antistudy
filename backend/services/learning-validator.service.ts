/**
 * 学习进度防作弊校验服务 & 业务规则防作弊
 * 确保：
 * 1. 观看时长必须达到真实门槛（防止无脑拖拽进度条刷完）
 * 2. 互动答题节点全部完成方可结算
 * 3. 奖励由服务端计算发放，前端只负责接收状态
 */

export interface VideoHeartbeatPayload {
  childId: string;
  videoId: string;
  currentPlayTimeSeconds: number;
  durationSeconds: number;
  interactionAnswersCompleted: string[]; // 已经答完的 interaction_id 数组
}

export interface VerificationResult {
  valid: boolean;
  reason?: string;
  isLessonCompleted: boolean;
  grantedRewards?: {
    xp: number;
    wishCoins: number;
    unlockedCardId?: string;
    newStreakDays?: number;
  };
}

export class VideoLearningValidationService {
  /**
   * 客户端每次播放上报心跳（如每5秒一次）或触发完成
   */
  public static verifyLessonCompletion(params: {
    actualWatchDurationSeconds: number;
    videoDurationSeconds: number;
    requiredInteractionCount: number;
    completedInteractionCount: number;
    currentStreakDays: number;
    lastStudyDateStr?: string;
  }): VerificationResult {
    const {
      actualWatchDurationSeconds,
      videoDurationSeconds,
      requiredInteractionCount,
      completedInteractionCount,
      currentStreakDays,
      lastStudyDateStr,
    } = params;

    // 1. 检查所有知识互动插题是否都已参与
    if (completedInteractionCount < requiredInteractionCount) {
      return {
        valid: false,
        isLessonCompleted: false,
        reason: `还有 ${requiredInteractionCount - completedInteractionCount} 道知识互动未完成，请继续探索！`,
      };
    }

    // 2. 检查有效观看时长：不能少于视频实际长度的 70%（杜绝直接拖进度条拉满）
    const minRequiredWatchSeconds = Math.max(10, videoDurationSeconds * 0.7);
    if (actualWatchDurationSeconds < minRequiredWatchSeconds) {
      return {
        valid: false,
        isLessonCompleted: false,
        reason: `检测到播放时长过短（实际观看 ${actualWatchDurationSeconds}s / 需至少 ${Math.round(minRequiredWatchSeconds)}s），请认真吸收知识点哦！`,
      };
    }

    // 3. 计算连胜增长逻辑
    const todayStr = new Date().toISOString().split('T')[0];
    let newStreak = currentStreakDays;
    if (lastStudyDateStr !== todayStr) {
      newStreak = currentStreakDays + 1;
    }

    // 4. 服务端生成不可篡改的标准奖励
    return {
      valid: true,
      isLessonCompleted: true,
      grantedRewards: {
        xp: 40,
        wishCoins: 15,
        unlockedCardId: '10000000-0000-0000-0000-000000000001',
        newStreakDays: newStreak,
      },
    };
  }
}
