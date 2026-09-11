/**
 * AI PK 对战自适应难度与数值引擎
 * 核心设计目标：保持青少年对战胜率在 40% ~ 60% 之间，既有挑战性，又有成就感，严禁让孩子持续挫败或无脑连赢。
 */

export interface AIPKOpponentConfig {
  id: string;
  name: string;
  avatar: string;
  baseDifficulty: 'easy' | 'medium' | 'hard' | 'master';
  baseAccuracy: number; // 0.0 ~ 1.0 基础命中率
  baseResponseTimeMs: number; // 毫秒
  dialoguePraise: string[];
  dialogueEncourage: string[];
}

export const AI_OPPONENTS: Record<string, AIPKOpponentConfig> = {
  assistant: {
    id: 'assistant',
    name: '小拓助手',
    avatar: '🤖',
    baseDifficulty: 'easy',
    baseAccuracy: 0.55,
    baseResponseTimeMs: 7000,
    dialoguePraise: ['哇，你答得好快！', '这道题你掌握得太稳了！'],
    dialogueEncourage: ['别灰心，下一道我们再来！', '再仔细看看题目中的关键词哦～'],
  },
  scholar: {
    id: 'scholar',
    name: '学霸AI',
    avatar: '🦊',
    baseDifficulty: 'medium',
    baseAccuracy: 0.75,
    baseResponseTimeMs: 4500,
    dialoguePraise: ['你的思维敏捷度已经超过我了！', '漂亮的逻辑推理！'],
    dialogueEncourage: ['稍微有点小陷阱，下次就能避开了。', '我也经常在这类题上思考很久呢。'],
  },
  master: {
    id: 'master',
    name: '星际专家AI',
    avatar: '🐼',
    baseDifficulty: 'hard',
    baseAccuracy: 0.88,
    baseResponseTimeMs: 3200,
    dialoguePraise: ['太震撼了，你的知识深度令我赞叹！', '不愧是知识探险家！'],
    dialogueEncourage: ['这是高难度挑战，能坚持答完就很棒！', '知识的奥秘就在不断探索中！'],
  },
};

export interface RoundSimulationResult {
  aiSelectedOption: number;
  aiIsCorrect: boolean;
  aiResponseTimeMs: number;
  damageToChild: number;
  damageToAI: number;
  dialogue: string;
}

export class AIPKAdaptiveEngine {
  /**
   * 根据对局动态状态（学生连对/连错数、当前血量差）动态模拟 AI 本轮答题决策
   */
  public static simulateAIRound(params: {
    opponentId: string;
    roundIndex: number;
    correctOptionIndex: number;
    totalOptions: number;
    childStreakCorrect: number;
    childStreakWrong: number;
    childHp: number;
    aiHp: number;
  }): RoundSimulationResult {
    const opponent = AI_OPPONENTS[params.opponentId] || AI_OPPONENTS.assistant;

    // 1. 动态自适应调节因子
    // 孩子连对越多，AI稍变强（但不超上限）；孩子连错，AI主动“露破绽/降速”
    let adaptiveAccuracy = opponent.baseAccuracy;
    let adaptiveSpeedMs = opponent.baseResponseTimeMs;

    if (params.childStreakCorrect >= 2) {
      adaptiveAccuracy = Math.min(0.92, opponent.baseAccuracy + 0.15);
      adaptiveSpeedMs = Math.max(2500, opponent.baseResponseTimeMs * 0.85);
    } else if (params.childStreakWrong >= 2 || params.childHp <= 30) {
      // 触发 AI “拟人化思考迟缓”与“易错状态”
      adaptiveAccuracy = Math.max(0.35, opponent.baseAccuracy - 0.25);
      adaptiveSpeedMs = opponent.baseResponseTimeMs * 1.3;
    }

    // 2. 判定 AI 本轮是否答对
    const roll = Math.random();
    const aiIsCorrect = roll < adaptiveAccuracy;

    let aiSelectedOption = params.correctOptionIndex;
    if (!aiIsCorrect) {
      // 随机挑选一个干扰项
      const wrongOptions = Array.from({ length: params.totalOptions }, (_, i) => i).filter(
        (i) => i !== params.correctOptionIndex
      );
      aiSelectedOption = wrongOptions[Math.floor(Math.random() * wrongOptions.length)] ?? 0;
    }

    // 3. 随机浮动反应时间 (±15%)
    const jitter = (Math.random() * 0.3 - 0.15) * adaptiveSpeedMs;
    const finalResponseTimeMs = Math.round(adaptiveSpeedMs + jitter);

    // 4. 计算扣血（默认基础扣血 20 点）
    const baseDamage = 20;

    // 5. 对话气泡
    const dialogueList = aiIsCorrect ? opponent.dialogueEncourage : opponent.dialoguePraise;
    const dialogue = dialogueList[Math.floor(Math.random() * dialogueList.length)];

    return {
      aiSelectedOption,
      aiIsCorrect,
      aiResponseTimeMs: finalResponseTimeMs,
      damageToChild: aiIsCorrect ? baseDamage : 0,
      damageToAI: 0, // 由学生答对时扣除
      dialogue,
    };
  }

  /**
   * 结算胜负奖励
   */
  public static settlePKSafeRewards(isChildWin: boolean, aiDifficulty: string) {
    if (isChildWin) {
      const xpMultiplier = aiDifficulty === 'hard' ? 50 : aiDifficulty === 'medium' ? 35 : 20;
      return {
        result: 'win',
        rewardXP: xpMultiplier,
        rewardCoin: 10, // 适度心愿币
        rewardCardChance: true,
        message: '🎉 挑战成功！你赢过了 AI 伙伴！',
      };
    } else {
      return {
        result: 'loss',
        rewardXP: 10, // 即使未获胜也给坚持探索的基础XP，不挫败
        rewardCoin: 2,
        rewardCardChance: false,
        message: '💪 精彩的对决！你的每一次尝试都在积累智慧！',
      };
    }
  }
}
