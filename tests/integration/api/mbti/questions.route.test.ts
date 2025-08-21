import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/mbti/questions/route';
import { NextRequest } from 'next/server';

// Mock the DiagnosisService
vi.mock('@/lib/mbti/diagnosis-service', () => ({
  DiagnosisService: vi.fn().mockImplementation(() => ({
    getTestSession: vi.fn()
  }))
}));

// Mock the questions module
vi.mock('@/lib/mbti/questions', () => ({
  getQuestions: vi.fn()
}));

// Mock Supabase server client
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn()
    }
  }))
}));

import { DiagnosisService } from '@/lib/mbti/diagnosis-service';
import { getQuestions } from '@/lib/mbti/questions';
import { createServerClient } from '@/lib/supabase/server';

describe('/api/mbti/questions', () => {
  let mockDiagnosisService: any;
  let mockGetQuestions: any;
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockGetQuestions = vi.mocked(getQuestions);
    mockSupabase = {
      auth: {
        getUser: vi.fn()
      }
    };
    
    vi.mocked(createServerClient).mockResolvedValue(mockSupabase);
    
    mockDiagnosisService = {
      getTestSession: vi.fn()
    };
    vi.mocked(DiagnosisService).mockImplementation(() => mockDiagnosisService);
  });

  it('should return questions for authenticated user', async () => {
    // Arrange
    const mockUser = { id: 'user-123' };
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    });

    const mockQuestions = [
      { id: 'ei_1', axis: 'EI', prompt: 'I gain energy from people', direction: -1, order: 1 },
      { id: 'ei_2', axis: 'EI', prompt: 'I prefer quiet time', direction: 1, order: 2 }
    ];
    mockGetQuestions.mockReturnValue(mockQuestions);

    mockDiagnosisService.getTestSession.mockResolvedValue({
      success: true,
      testId: null
    });

    const request = new NextRequest('http://localhost:3000/api/mbti/questions');

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.questions).toEqual(mockQuestions);
    expect(data.session).toBeNull();
    expect(mockGetQuestions).toHaveBeenCalledWith('ja'); // default locale
    expect(mockDiagnosisService.getTestSession).toHaveBeenCalledWith(mockUser.id);
  });

  it('should return questions with existing session data', async () => {
    // Arrange
    const mockUser = { id: 'user-123' };
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    });

    const mockQuestions = [
      { id: 'ei_1', axis: 'EI', prompt: 'I gain energy from people', direction: -1, order: 1 }
    ];
    mockGetQuestions.mockReturnValue(mockQuestions);

    const mockSession = {
      success: true,
      testId: 'test-456',
      answers: { 'ei_1': 5 },
      progress: 1
    };
    mockDiagnosisService.getTestSession.mockResolvedValue(mockSession);

    const request = new NextRequest('http://localhost:3000/api/mbti/questions');

    // Act
    const response = await GET(request);
    const data = await response.json();

    // Assert
    expect(response.status).toBe(200);
    expect(data.questions).toEqual(mockQuestions);
    expect(data.session).toEqual({
      testId: 'test-456',
      answers: { 'ei_1': 5 },
      progress: 1
    });
  });

  it('should support locale parameter', async () => {
    // Arrange
    const mockUser = { id: 'user-123' };
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    });

    const mockQuestions = [
      { id: 'ei_1', axis: 'EI', prompt: 'I gain energy from interactions with people', direction: -1, order: 1 }
    ];
    mockGetQuestions.mockReturnValue(mockQuestions);

    mockDiagnosisService.getTestSession.mockResolvedValue({
      success: true,
      testId: null
    });

    const request = new NextRequest('http://localhost:3000/api/mbti/questions?locale=en');

    // Act
    const response = await GET(request);
    
    // Assert
    expect(response.status).toBe(200);
    expect(mockGetQuestions).toHaveBeenCalledWith('en');
  });

  it('should return 401 when user is not authenticated', async () => {
    // Arrange
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null
    });

    const request = new NextRequest('http://localhost:3000/api/mbti/questions');

    // Act
    const response = await GET(request);

    // Assert
    expect(response.status).toBe(401);
    expect(mockGetQuestions).not.toHaveBeenCalled();
    expect(mockDiagnosisService.getTestSession).not.toHaveBeenCalled();
  });

  it('should return 500 when service fails', async () => {
    // Arrange
    const mockUser = { id: 'user-123' };
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    });

    mockGetQuestions.mockReturnValue([]);
    mockDiagnosisService.getTestSession.mockResolvedValue({
      success: false,
      error: 'Database connection failed'
    });

    const request = new NextRequest('http://localhost:3000/api/mbti/questions');

    // Act
    const response = await GET(request);

    // Assert
    expect(response.status).toBe(500);
  });

  it('should fallback to Japanese locale for invalid locale', async () => {
    // Arrange
    const mockUser = { id: 'user-123' };
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    });

    mockGetQuestions.mockReturnValue([]);
    mockDiagnosisService.getTestSession.mockResolvedValue({
      success: true,
      testId: null
    });

    const request = new NextRequest('http://localhost:3000/api/mbti/questions?locale=fr');

    // Act
    const response = await GET(request);

    // Assert
    expect(response.status).toBe(200);
    expect(mockGetQuestions).toHaveBeenCalledWith('ja'); // Fallback to Japanese
  });
});