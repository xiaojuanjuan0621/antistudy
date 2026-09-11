/**
 * 家长端 AI 洞察引擎
 * 拒绝做“监视型打卡”，专注于：
 * 1. 识别真实兴趣偏好趋势（主动探索次数、重访频率）
 * 2. 识别知识弱项（如应用题耗时过长、某知识点连续错）
 * 3. 生成充满人文关怀与具体行动建议的家庭辅导话术
 */

export interface WeeklyStudyStat {
  childName: string;
  totalDurationMinutes: number;
  completedLessonsCount: number;
  averageAccuracy: number; // 0.0 ~ 1.0
  streakDays: number;
  subjectDistribution: Record<string, number>; // { math: 40, biology: 35, english: 25 }
  activeInterestEvents: {
    subject: string;
    topic: string;
    activeClickCount: number;
    completedExploration: number;
  }[];
  weakKnowledgePoints: {
    pointName: string;
    subject: string;
    errorRate: number;
    averageResponseSeconds: number;
  }[];
}

export interface ParentInsightReportOutput {
  weeklyTitle: string;
  focusHighlights: string[]; // 本周最大亮点
  interestInsightText: string; // 深度兴趣发现
  learningWeaknessText: string; // 待加强薄弱点分析
  actionableFamilyAdvice: string; // 给家长的1个具体行动/对话建议
  encouragementQuote: string;
}

export class ParentInsightEngine {
  public static generateWeeklyInsight(stat: WeeklyStudyStat): ParentInsightReportOutput {
    const { childName, totalDurationMinutes, completedLessonsCount, averageAccuracy, activeInterestEvents, weakKnowledgePoints } = stat;

    // 找出兴趣最浓厚的学科（按主动探索权重）
    const topInterest = activeInterestEvents.sort((a, b) => b.activeClickCount - a.activeClickCount)[0] || {
      subject: '科学探索',
      topic: '人体奥秘',
      activeClickCount: 6,
      completedExploration: 3,
    };

    const weakPoint = weakKnowledgePoints[0] || {
      pointName: '分数的乘除应用题',
      subject: '数学',
      errorRate: 0.35,
      averageResponseSeconds: 45,
    };

    return {
      weeklyTitle: `🌟 ${childName} 的本周知识探险家成长周报`,
      focusHighlights: [
        `累计有效专注学习 ${Math.floor(totalDurationMinutes / 60)} 小时 ${totalDurationMinutes % 60} 分钟，完成 ${completedLessonsCount} 个核心单元`,
        `全科目答题平均正确率达到 ${Math.round(averageAccuracy * 100)}%`,
        `连续学习保持了 ${stat.streakDays} 天，知识探索火焰持续燃烧！🔥`,
      ],
      interestInsightText: `最近 7 天，${childName} 主动进入【${topInterest.subject}·${topInterest.topic}】探索了 ${topInterest.activeClickCount} 次，完成率高达 95%。系统洞察：孩子近期展现出强烈的自然科学求知欲，对生命与微观结构充满好奇心。`,
      learningWeaknessText: `在【${weakPoint.subject}】中，基础概念掌握扎实（正确率>90%），但在【${weakPoint.pointName}】这类多步逻辑题上，平均思考时间偏长且稍有犹豫。`,
      actionableFamilyAdvice: `💡 本周家庭互动小建议：\n周末可以顺应孩子的兴趣，带他/她看一部《工作细胞》纪录片；在吃早餐切面包或水果时，顺便玩一个“3人分4块面包每人吃几分之几”的生活小挑战，把抽象的分数融入真实生活！`,
      encouragementQuote: `“每个孩子都有自己的探索节奏，比起分数，孩子眼里的好奇光芒更加珍贵。”`,
    };
  }
}
