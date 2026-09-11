import { z } from 'zod';

/**
 * 视频时间戳字幕条目
 */
export const TranscriptSegmentSchema = z.object({
  start_ms: z.number().describe('起始时间毫秒'),
  end_ms: z.number().describe('结束时间毫秒'),
  text: z.string().describe('语音转文字内容'),
});

export type TranscriptSegment = z.infer<typeof TranscriptSegmentSchema>;

/**
 * 互动选择题 Schema (带严格结构化约束)
 */
export const InteractionQuestionSchema = z.object({
  timestamp_seconds: z.number().describe('精准暂停插题时间戳（秒），必须在对应知识点讲完的句末'),
  knowledge_point: z.string().describe('考核的核心知识点名称'),
  question: z.string().describe('问题题干，清晰通俗，符合青少年认知，优先考理解而非机械死记'),
  options: z.array(z.string()).min(3).max(4).describe('选项列表（3~4项），有且仅有一个正确答案，干扰项具备合理迷惑性'),
  correct_option_index: z.number().min(0).max(3).describe('正确答案在 options 中的索引 (0-based)'),
  explanation: z.string().describe('答案解析，指出核心原理，语气正面鼓励'),
  hint_15s: z.string().describe('15秒思维支架/提示语，用于孩子答错时启发思考，不直接给出答案'),
  difficulty: z.enum(['easy', 'medium', 'hard']).describe('题目难度等级'),
});

export type InteractionQuestion = z.infer<typeof InteractionQuestionSchema>;

/**
 * 课程 AI 分析与出题全量输出 Schema
 */
export const CourseAIGenerationOutputSchema = z.object({
  course_summary: z.string().describe('本视频课程核心摘要（100字以内）'),
  extracted_knowledge_points: z.array(z.object({
    name: z.string().describe('知识点名称'),
    start_second: z.number().describe('讲解开始时间（秒）'),
    end_second: z.number().describe('讲解结束时间（秒）'),
    importance: z.enum(['core', 'extended']),
  })).describe('视频中拆解出的知识点列表'),
  interactions: z.array(InteractionQuestionSchema).describe('生成的互动插题列表（20分钟视频通常3~5题，间隔不小于150秒）'),
  homework_task: z.object({
    title: z.string().describe('课后动手/思维实践作业标题'),
    prompt: z.string().describe('作业任务指引（如：画一个生命细胞图/找生活中的分数）'),
  }),
  card_recommendation: z.object({
    card_title: z.string().describe('本节课配套解锁的知识卡牌名称'),
    fun_fact: z.string().describe('该卡牌附带的趣味冷知识'),
  }),
  quality_self_check: z.object({
    quality_score: z.number().min(0).max(100).describe('AI自评分数（>=90分建议一键通过）'),
    has_ambiguity: z.boolean().describe('是否存在歧义或多解可能'),
    audit_notes: z.string().describe('给运营/教师审核员的提示说明'),
  }),
});

export type CourseAIGenerationOutput = z.infer<typeof CourseAIGenerationOutputSchema>;

/**
 * System Prompt for AI 课程工厂 (严谨出题角色)
 */
export const AI_COURSE_FACTORY_SYSTEM_PROMPT = `
你是一位精通中国中小学新课标（义务教育阶段）的“青少年 AI 课程教学设计专家与出题引擎”。
你的任务是：根据输入的视频文字转写稿（带精准毫秒时间戳）以及年级学科背景，为该视频自动设计“节点交互式学习流程”。

【出题与交互设计的十大黄金铁律】：
1. 【精准插题时机】：题目必须出现在某个知识点刚讲解完毕的关键句末（timestamp_seconds），绝不能在知识点讲到一半中断视频。
2. 【间隔控制】：20分钟以内的视频设计 3~5 道互动题，相邻两题时间间隔不少于 120 秒，避免干扰观课连贯性。
3. 【理解优先】：题目优先考核对概念、原理和逻辑的理解与应用，严禁考视频中无意义的琐碎字眼或机械记忆。
4. 【唯一正确性】：必须有且仅有一个确凿无疑的正确答案，数学/理科必须保证绝对准确。
5. 【优质干扰项】：错误选项不能有荒谬明显的低级错误，应当基于孩子常见的认知误区（思维陷阱）来设计。
6. 【正向且启发的支架】：hint_15s 必须是启发性的思维脚手架（Socratic Questioning），引导孩子自己想出答案，绝不能直接报答案。
7. 【语言青少年化】：避免枯燥刻板的成人说教，采用亲和、科技探索感、有活力的语气，匹配小学高年级～初中生心智。
8. 【卡牌与趣味结合】：提取该课程最核心、最酷的 1 个概念生成“知识卡牌”建议。
9. 【质量自检】：AI 必须自检是否存在多解、时间戳漂移、题目超纲等问题，并在 audit_notes 中坦诚说明。
10. 【纯 JSON 输出】：必须严格按照给定的 JSON Schema 格式输出，不要包含任何多余的 Markdown 说明。
`;
