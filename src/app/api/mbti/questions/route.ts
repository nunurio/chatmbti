import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { getQuestions } from '@/lib/mbti/questions';
import { DiagnosisService } from '@/lib/mbti/diagnosis-service';

export const runtime = 'nodejs';

interface QuestionsResponse {
  questions: Array<{
    id: string;
    axis: 'EI' | 'SN' | 'TF' | 'JP';
    prompt: string;
    direction: -1 | 1;
    order: number;
  }>;
  session: {
    testId: string;
    answers: Record<string, number>;
    progress: number;
  } | null;
}

type SupportedLocale = 'ja' | 'en';

/**
 * Validates and normalizes locale parameter
 */
function validateLocale(locale: string | null): SupportedLocale {
  if (locale === 'en') return 'en';
  return 'ja'; // Default to Japanese for any other value
}

/**
 * GET /api/mbti/questions
 * 
 * Returns MBTI diagnosis questions and current test session if exists.
 * Requires authentication.
 * 
 * Query Parameters:
 * - locale: 'ja' | 'en' (defaults to 'ja')
 */
export async function GET(request: NextRequest): Promise<Response> {
  try {
    // Authentication check
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate locale parameter
    const { searchParams } = new URL(request.url);
    const locale = validateLocale(searchParams.get('locale'));

    // Get questions
    const questions = getQuestions(locale);

    // Check for existing test session
    const diagnosisService = new DiagnosisService(supabase);
    const sessionResult = await diagnosisService.getTestSession(user.id);

    if (!sessionResult.success) {
      console.error('Failed to retrieve test session:', sessionResult.error);
      return Response.json(
        { error: 'Failed to retrieve session data' },
        { status: 500 }
      );
    }

    // Format response data
    const response: QuestionsResponse = {
      questions,
      session: sessionResult.testId ? {
        testId: sessionResult.testId,
        answers: sessionResult.answers || {},
        progress: sessionResult.progress || 0
      } : null
    };

    return Response.json(response);

  } catch (error) {
    console.error('Error in /api/mbti/questions:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}