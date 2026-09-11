import {
  TranscriptSegment,
  CourseAIGenerationOutput,
  CourseAIGenerationOutputSchema,
  AI_COURSE_FACTORY_SYSTEM_PROMPT,
} from './schemas';

/**
 * 模拟调用大语言模型（如 DeepSeek / Claude / GPT-4o），使用结构化输出
 */
export async function runAICourseFactoryPipeline(params: {
  subject: string;
  gradeLevel: number;
  courseTitle: string;
  transcripts: TranscriptSegment[];
  apiKey?: string;
}): Promise<CourseAIGenerationOutput> {
  const { subject, gradeLevel, courseTitle, transcripts } = params;

  // 1. 将带时间戳的字幕格式化为便于 LLM 理解的 Markdown 时间轴
  const formattedTranscriptText = transcripts
    .map((seg) => {
      const startSec = Math.floor(seg.start_ms / 1000);
      const m = Math.floor(startSec / 60)
        .toString()
        .padStart(2, '0');
      const s = (startSec % 60).toString().padStart(2, '0');
      return `[${m}:${s}] ${seg.text}`;
    })
    .join('\n');

  const userPrompt = `
【课程信息】
学科: ${subject}
年级: ${gradeLevel}年级
课程标题: ${courseTitle}

【视频字幕及时间轴 (Transcript)】
${formattedTranscriptText}

请按照系统提示要求，对上述课程内容进行知识点提炼、精准时间戳插题、课后作业生成以及自检评估，返回严格符合 JSON Schema 的结果。
`;

  // 在真实生产环境中，这里会发起 fetch 到 LLM API (例如 DeepSeek-Chat / DeepSeek-V3)
  // 此处提供符合真实场景的高质量 Mock 解析输出，保证管线即开即测
  const mockResult: CourseAIGenerationOutput = {
    course_summary: '本节课通过趣味切披萨的例子，生动讲解了分数的含义、分子与分母各自代表的物理意义，以及单位“1”平均分的核心概念。',
    extracted_knowledge_points: [
      {
        name: '分数的产生与分母的意义',
        start_second: 0,
        end_second: 50,
        importance: 'core',
      },
      {
        name: '分子的意义与比较大小',
        start_second: 51,
        end_second: 130,
        importance: 'core',
      },
    ],
    interactions: [
      {
        timestamp_seconds: 48,
        knowledge_point: '分数的分子与分母',
        question: '小拓把一个大披萨平均切成了 4 份，分给小明其中的 1 份。请问小明拿到的披萨用分数怎么表示？',
        options: ['1/2', '1/4', '1/3', '4/1'],
        correct_option_index: 1,
        explanation: '太棒了！一共平均分成了 4 份，分母写 4；拿了 1 份，分子写 1，所以是 1/4！',
        hint_15s: '想一想：下面的“分母”代表一共切成了多少块，上面的“分子”代表拿了几块？',
        difficulty: 'easy',
      },
      {
        timestamp_seconds: 125,
        knowledge_point: '平均分与单位“1”',
        question: '有两个完全一样大的披萨，A 披萨平均切成 4 块取 1 块，B 披萨平均切成 8 块取 1 块。哪一块更大？',
        options: ['A 披萨的 1 块 (1/4)', 'B 披萨的 1 块 (1/8)', '两块完全一样大'],
        correct_option_index: 0,
        explanation: '完全正确！总大小相同时，分成的份数越少，每一份就越大，所以 1/4 > 1/8。',
        hint_15s: '假设 4 个人分和 8 个人分同样大小的披萨，哪种情况下每个人能吃到更多？',
        difficulty: 'medium',
      },
    ],
    homework_task: {
      title: '生活中的分数侦探',
      prompt: '在家里找一件可以用分数表示的事物（例如一盒牛奶喝了多少、把苹果切成几瓣），拍照并写下一句分数的说明上传。',
    },
    card_recommendation: {
      card_title: '🍕 分数精灵·四分卫',
      fun_fact: '你知道吗？古埃及人最喜欢用“分子是1”的单位分数来解决所有数学难题！',
    },
    quality_self_check: {
      quality_score: 96,
      has_ambiguity: false,
      audit_notes: '所有插题均处于概念刚讲解完毕点，题目难度完全契合四年级认知，选项无歧义。建议直接发布。',
    },
  };

  // 严格验证校验
  const validated = CourseAIGenerationOutputSchema.parse(mockResult);
  return validated;
}
