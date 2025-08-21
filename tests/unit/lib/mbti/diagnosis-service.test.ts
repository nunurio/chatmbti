import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DiagnosisService } from '@/lib/mbti/diagnosis-service';

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn()
  }
};

const mockQuery = {
  insert: vi.fn(),
  select: vi.fn(),
  upsert: vi.fn(),
  update: vi.fn(),
  eq: vi.fn(),
  single: vi.fn(),
};

describe('DiagnosisService', () => {
  let service: DiagnosisService;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Chain mock methods
    mockQuery.insert.mockReturnValue(mockQuery);
    mockQuery.select.mockReturnValue(mockQuery);
    mockQuery.upsert.mockReturnValue(mockQuery);
    mockQuery.update.mockReturnValue(mockQuery);
    mockQuery.eq.mockReturnValue(mockQuery);
    mockQuery.single.mockReturnValue(mockQuery);
    
    mockSupabaseClient.from.mockReturnValue(mockQuery);
    
    service = new DiagnosisService(mockSupabaseClient);
  });

  describe('startTest', () => {
    it('should create a new MBTI test session', async () => {
      // Arrange
      const userId = 'user-123';
      const expectedTestId = 'test-456';
      mockQuery.single.mockResolvedValue({
        data: { id: expectedTestId, user_id: userId, status: 'in_progress' },
        error: null
      });

      // Act
      const result = await service.startTest(userId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.testId).toBe(expectedTestId);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('mbti_tests');
      expect(mockQuery.insert).toHaveBeenCalledWith({
        user_id: userId,
        status: 'in_progress',
        started_at: expect.any(String)
      });
    });

    it('should return error when database insertion fails', async () => {
      // Arrange
      const userId = 'user-123';
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { message: 'Database error' }
      });

      // Act
      const result = await service.startTest(userId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('saveAnswer', () => {
    it('should save an answer to the database', async () => {
      // Arrange
      const testId = 'test-123';
      const questionId = 'ei_1';
      const score = 5;
      
      mockQuery.eq.mockResolvedValue({
        data: [{ id: 'answer-789', test_id: testId, question_id: questionId, score }],
        error: null
      });

      // Act
      const result = await service.saveAnswer(testId, questionId, score);

      // Assert
      expect(result.success).toBe(true);
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('mbti_answers');
      expect(mockQuery.upsert).toHaveBeenCalledWith({
        test_id: testId,
        question_id: questionId,
        score
      });
    });

    it('should validate score range', async () => {
      // Arrange
      const testId = 'test-123';
      const questionId = 'ei_1';
      const invalidScore = 8; // Should be 1-7

      // Act
      const result = await service.saveAnswer(testId, questionId, invalidScore);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Score must be between 1 and 7');
    });
  });

  describe('completeTest', () => {
    it('should calculate MBTI type and update test record', async () => {
      // Arrange
      const testId = 'test-123';
      const userId = 'user-456';
      const mockAnswers = [
        { question_id: 'ei_1', score: 2 },
        { question_id: 'ei_2', score: 6 },
        { question_id: 'sn_1', score: 3 },
        { question_id: 'sn_2', score: 5 }
      ];

      // Mock answers query
      mockQuery.eq.mockResolvedValueOnce({
        data: mockAnswers,
        error: null
      });

      // Mock test update
      mockQuery.single.mockResolvedValue({
        data: { 
          id: testId, 
          determined_type: 'ESTJ', // Based on the scores ei_1=2, ei_2=6, sn_1=3, sn_2=5
          scores: { EI: -34, SN: 0, TF: 0, JP: 0 },
          status: 'completed' 
        },
        error: null
      });

      // Act
      const result = await service.completeTest(testId, userId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.mbtiType).toBe('ESTJ');
      expect(result.scores).toBeDefined();
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('mbti_answers');
      expect(mockSupabaseClient.from).toHaveBeenCalledWith('mbti_tests');
    });

    it('should return error when insufficient answers', async () => {
      // Arrange
      const testId = 'test-123';
      const userId = 'user-456';
      
      mockQuery.eq.mockResolvedValue({
        data: [], // No answers
        error: null
      });

      // Act
      const result = await service.completeTest(testId, userId);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toContain('Insufficient answers');
    });
  });

  describe('getTestSession', () => {
    it('should retrieve existing test session with answers', async () => {
      // Arrange
      const userId = 'user-123';
      const mockTest = {
        id: 'test-456',
        user_id: userId,
        status: 'in_progress',
        mbti_answers: [
          { question_id: 'ei_1', score: 5 },
          { question_id: 'ei_2', score: 3 }
        ]
      };

      mockQuery.single.mockResolvedValue({
        data: mockTest,
        error: null
      });

      // Act
      const result = await service.getTestSession(userId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.testId).toBe('test-456');
      expect(result.answers).toEqual({ 'ei_1': 5, 'ei_2': 3 });
      expect(result.progress).toBe(2);
    });

    it('should return null when no active test session exists', async () => {
      // Arrange
      const userId = 'user-123';
      
      mockQuery.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' } // No rows returned
      });

      // Act
      const result = await service.getTestSession(userId);

      // Assert
      expect(result.success).toBe(true);
      expect(result.testId).toBe(null);
    });
  });
});