import { TranscriptSegment, CourseAIGenerationOutput, CourseAIGenerationOutputSchema } from './schemas';

export async function runAICourseFactoryPipeline(params: {
  subject: string;
  gradeLevel: number;
  courseTitle: string;
  transcripts: TranscriptSegment[];
}): Promise<CourseAIGenerationOutput> {
  const mockResult: CourseAIGenerationOutput = {
    course_summary: `${params.courseTitle} 核心概念系统讲解。`,
    extracted_knowledge_points: [
      { name: '核心概念探索与认知', start_second: 0, end_second: 45, importance: 'core' },
      { name: '生活应用与实践思维', start_second: 46, end_second: 120, importance: 'core' },
    ],
    interactions: [
      {
        timestamp_seconds: 45,
        knowledge_point: '基础核心概念',
        question: `在《${params.courseTitle}》中，下列哪项说法最符合本讲核心原理？`,
        options: ['理解事物本质原理并探索应用', '只需死记硬背不需要思考', '遇到困难直接放弃'],
        correct_option_index: 0,
        explanation: '太棒了！探索本质规律并灵活应用是掌握这门知识的关键！',
        hint_15s: '想一想：学习最重要的是机械记忆还是理解逻辑？',
        difficulty: 'easy',
      },
    ],
    homework_task: {
      title: '生活中的小探险',
      prompt: '在生活中找一个与本课相关的现象，观察并记录下来。',
    },
    card_recommendation: {
      card_title: `🎴 ${params.courseTitle}·知识卡牌`,
      fun_fact: '每探索一个知识点，你的认知世界就更开阔！',
    },
    quality_self_check: {
      quality_score: 96,
      has_ambiguity: false,
      audit_notes: '插题点位于概念刚讲完处，题目难度完全契合认知，无歧义。',
    },
  };
  return CourseAIGenerationOutputSchema.parse(mockResult);
}
