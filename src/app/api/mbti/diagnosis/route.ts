import { NextRequest } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { DiagnosisService } from '@/lib/mbti/diagnosis-service';
import type { Enums } from '@/lib/database.types';

export const runtime = 'nodejs';

type DiagnosisAction = 'start' | 'answer' | 'complete';

interface DiagnosisRequest {
  action: DiagnosisAction;
  testId?: string;
  questionId?: string;
  value?: number;
}

interface StartResponse {
  success: boolean;
  testId?: string;
  error?: string;
}

interface AnswerResponse {
  success: boolean;
  error?: string;
}

interface CompleteResponse {
  success: boolean;
  mbtiType?: Enums<'mbti_code'>;
  scores?: { EI: number; SN: number; TF: number; JP: number };
  confidence?: number;
  error?: string;
}

/**
 * Validates that a Likert scale value is in the correct range (1-7)
 */
function validateLikertValue(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= 7;
}

/**
 * Determines appropriate HTTP status code based on error type
 */
function getErrorStatusCode(error: string | undefined): number {
  if (!error) return 500;
  if (error.includes('Insufficient answers') || error.includes('Invalid')) return 400;
  if (error.includes('Unauthorized') || error.includes('permission')) return 401;
  return 500;
}

/**
 * Handles the 'start' action - creates a new test session
 */
async function handleStartAction(
  service: DiagnosisService, 
  userId: string
): Promise<Response> {
  const result = await service.startTest(userId);
  
  if (!result.success) {
    return Response.json(
      { success: false, error: result.error },
      { status: getErrorStatusCode(result.error) }
    );
  }

  const response: StartResponse = {
    success: true,
    testId: result.testId
  };

  return Response.json(response);
}

/**
 * Handles the 'answer' action - saves an answer to a question
 */
async function handleAnswerAction(
  service: DiagnosisService,
  testId: string | undefined,
  questionId: string | undefined,
  value: number | undefined
): Promise<Response> {
  // Validate required fields
  if (!testId || !questionId || value === undefined) {
    return Response.json(
      { error: 'Missing required fields: testId, questionId, value' },
      { status: 400 }
    );
  }

  // Validate value range
  if (!validateLikertValue(value)) {
    return Response.json(
      { error: 'Value must be between 1 and 7' },
      { status: 400 }
    );
  }

  const result = await service.saveAnswer(testId, questionId, value);

  if (!result.success) {
    return Response.json(
      { success: false, error: result.error },
      { status: getErrorStatusCode(result.error) }
    );
  }

  const response: AnswerResponse = { success: true };
  return Response.json(response);
}

/**
 * Handles the 'complete' action - finalizes test and returns MBTI type
 */
async function handleCompleteAction(
  service: DiagnosisService,
  testId: string | undefined
): Promise<Response> {
  // Validate required fields
  if (!testId) {
    return Response.json(
      { error: 'Missing required field: testId' },
      { status: 400 }
    );
  }

  const result = await service.completeTest(testId);

  if (!result.success) {
    return Response.json(
      { success: false, error: result.error },
      { status: getErrorStatusCode(result.error) }
    );
  }

  const response: CompleteResponse = {
    success: true,
    mbtiType: result.mbtiType,
    scores: result.scores,
    confidence: result.confidence
  };

  return Response.json(response);
}

/**
 * POST /api/mbti/diagnosis
 * 
 * Handles MBTI diagnosis lifecycle operations.
 * Requires authentication.
 * 
 * Actions:
 * - start: Creates a new test session
 * - answer: Saves an answer to a question
 * - complete: Finalizes test and returns MBTI type
 */
export async function POST(request: NextRequest): Promise<Response> {
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

    // Parse and validate request body
    let body: DiagnosisRequest;
    try {
      body = await request.json() as DiagnosisRequest;
    } catch {
      return Response.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { action, testId, questionId, value } = body;

    // Validate action
    if (!action || !['start', 'answer', 'complete'].includes(action)) {
      return Response.json(
        { error: 'Invalid action. Must be one of: start, answer, complete' },
        { status: 400 }
      );
    }

    const diagnosisService = new DiagnosisService(supabase);

    // Handle different actions
    switch (action) {
      case 'start':
        return handleStartAction(diagnosisService, user.id);
        
      case 'answer':
        return handleAnswerAction(diagnosisService, testId, questionId, value);
        
      case 'complete':
        return handleCompleteAction(diagnosisService, testId);
        
      default:
        return Response.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error in /api/mbti/diagnosis:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}