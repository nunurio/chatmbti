import type { Database, TablesInsert, Enums } from '@/lib/database.types';
import { calculateMBTIType } from './calculator';
import type { SupabaseClient } from '@supabase/supabase-js';

type MbtiAnswerInsert = TablesInsert<'mbti_answers'>;
type MbtiCode = Enums<'mbti_code'>;

type TypedSupabaseClient = SupabaseClient<Database>;

interface StartTestResult {
  success: boolean;
  testId?: string;
  error?: string;
}

interface SaveAnswerResult {
  success: boolean;
  error?: string;
}

interface CompleteTestResult {
  success: boolean;
  mbtiType?: MbtiCode;
  scores?: { EI: number; SN: number; TF: number; JP: number };
  confidence?: number;
  error?: string;
}

interface GetTestSessionResult {
  success: boolean;
  testId?: string | null;
  answers?: Record<string, number>;
  progress?: number;
  error?: string;
}

export class DiagnosisService {
  constructor(private supabase: TypedSupabaseClient) {}

  /**
   * Validates that a score value is within the valid Likert scale range (1-7)
   */
  private validateScore(score: number): boolean {
    return Number.isInteger(score) && score >= 1 && score <= 7;
  }

  /**
   * Maps database error codes to user-friendly messages
   */
  private mapErrorMessage(error: { code?: string; message?: string }): string {
    if (error.code === '23505') {
      return 'Duplicate entry detected';
    }
    if (error.code === '23503') {
      return 'Invalid reference to related data';
    }
    return error.message || 'An unexpected error occurred';
  }

  async startTest(userId: string): Promise<StartTestResult> {
    try {
      const { data, error } = await this.supabase
        .from('mbti_tests')
        .insert({
          user_id: userId,
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, testId: data.id };
    } catch {
      return { success: false, error: 'Failed to start test' };
    }
  }

  async saveAnswer(testId: string, questionId: string, score: number): Promise<SaveAnswerResult> {
    // Validate score range
    if (!this.validateScore(score)) {
      return { success: false, error: 'Score must be between 1 and 7' };
    }

    try {
      const { error } = await this.supabase
        .from('mbti_answers')
        .upsert({
          test_id: testId,
          question_id: questionId,
          score
        } as MbtiAnswerInsert);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch {
      return { success: false, error: 'Failed to save answer' };
    }
  }

  async completeTest(testId: string): Promise<CompleteTestResult> {
    try {
      // Get all answers for this test
      const { data: answers, error: answersError } = await this.supabase
        .from('mbti_answers')
        .select('question_id, score')
        .eq('test_id', testId);

      if (answersError || !answers || answers.length === 0) {
        return { success: false, error: 'Insufficient answers for diagnosis' };
      }

      // Calculate MBTI type using existing calculator
      const calculatorAnswers = answers.map((answer: { question_id: string; score: number }) => ({
        questionId: answer.question_id,
        value: answer.score
      }));

      const result = calculateMBTIType(calculatorAnswers);

      // Update test record with results
      const { error: updateError } = await this.supabase
        .from('mbti_tests')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          determined_type: result.type as MbtiCode,
          scores: result.scores
        })
        .eq('id', testId);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      return {
        success: true,
        mbtiType: result.type as MbtiCode,
        scores: result.scores,
        confidence: result.confidence
      };
    } catch {
      return { success: false, error: 'Failed to complete test' };
    }
  }

  async getTestSession(userId: string): Promise<GetTestSessionResult> {
    try {
      const { data, error } = await this.supabase
        .from('mbti_tests')
        .select(`
          id,
          user_id,
          status,
          mbti_answers(question_id, score)
        `)
        .eq('user_id', userId)
        .eq('status', 'in_progress')
        .single();

      if (error && error.code === 'PGRST116') {
        // No rows returned - no active session
        return { success: true, testId: null };
      }

      if (error) {
        return { success: false, error: error.message };
      }

      // Convert answers to Record format
      const answers: Record<string, number> = {};
      if (data.mbti_answers) {
        for (const answer of data.mbti_answers) {
          answers[answer.question_id] = answer.score;
        }
      }

      return {
        success: true,
        testId: data.id,
        answers,
        progress: Object.keys(answers).length
      };
    } catch {
      return { success: false, error: 'Failed to get test session' };
    }
  }
}