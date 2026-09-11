import { z } from 'zod';

export const TranscriptSegmentSchema = z.object({
  start_ms: z.number(),
  end_ms: z.number(),
  text: z.string(),
});
export type TranscriptSegment = z.infer<typeof TranscriptSegmentSchema>;

export const InteractionQuestionSchema = z.object({
  timestamp_seconds: z.number(),
  knowledge_point: z.string(),
  question: z.string(),
  options: z.array(z.string()).min(3).max(4),
  correct_option_index: z.number().min(0).max(3),
  explanation: z.string(),
  hint_15s: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});
export type InteractionQuestion = z.infer<typeof InteractionQuestionSchema>;

export const CourseAIGenerationOutputSchema = z.object({
  course_summary: z.string(),
  extracted_knowledge_points: z.array(z.object({
    name: z.string(),
    start_second: z.number(),
    end_second: z.number(),
    importance: z.enum(['core', 'extended']),
  })),
  interactions: z.array(InteractionQuestionSchema),
  homework_task: z.object({
    title: z.string(),
    prompt: z.string(),
  }),
  card_recommendation: z.object({
    card_title: z.string(),
    fun_fact: z.string(),
  }),
  quality_self_check: z.object({
    quality_score: z.number().min(0).max(100),
    has_ambiguity: z.boolean(),
    audit_notes: z.string(),
  }),
});
export type CourseAIGenerationOutput = z.infer<typeof CourseAIGenerationOutputSchema>;
