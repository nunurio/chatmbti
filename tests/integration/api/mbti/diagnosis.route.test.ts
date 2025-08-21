import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/mbti/diagnosis/route';
import { NextRequest } from 'next/server';

// Mock the DiagnosisService
vi.mock('@/lib/mbti/diagnosis-service', () => ({
  DiagnosisService: vi.fn().mockImplementation(() => ({
    startTest: vi.fn(),
    saveAnswer: vi.fn(),
    completeTest: vi.fn()
  }))
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
import { createServerClient } from '@/lib/supabase/server';

describe('/api/mbti/diagnosis', () => {
  let mockDiagnosisService: any;
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockSupabase = {
      auth: {
        getUser: vi.fn()
      }
    };
    
    vi.mocked(createServerClient).mockResolvedValue(mockSupabase);
    
    mockDiagnosisService = {
      startTest: vi.fn(),
      saveAnswer: vi.fn(),
      completeTest: vi.fn()
    };
    vi.mocked(DiagnosisService).mockImplementation(() => mockDiagnosisService);
  });

  describe('action: start', () => {
    it('should start a new MBTI test', async () => {
      // Arrange
      const mockUser = { id: 'user-123' };
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      mockDiagnosisService.startTest.mockResolvedValue({
        success: true,
        testId: 'test-456'
      });

      const request = new NextRequest('http://localhost:3000/api/mbti/diagnosis', {
        method: 'POST',
        body: JSON.stringify({
          action: 'start'
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.testId).toBe('test-456');
      expect(mockDiagnosisService.startTest).toHaveBeenCalledWith(mockUser.id);
    });

    it('should return error when test creation fails', async () => {
      // Arrange
      const mockUser = { id: 'user-123' };
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      mockDiagnosisService.startTest.mockResolvedValue({
        success: false,
        error: 'Database error'
      });

      const request = new NextRequest('http://localhost:3000/api/mbti/diagnosis', {
        method: 'POST',
        body: JSON.stringify({ action: 'start' })
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Database error');
    });
  });

  describe('action: answer', () => {
    it('should save an answer', async () => {
      // Arrange
      const mockUser = { id: 'user-123' };
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      mockDiagnosisService.saveAnswer.mockResolvedValue({
        success: true
      });

      const request = new NextRequest('http://localhost:3000/api/mbti/diagnosis', {
        method: 'POST',
        body: JSON.stringify({
          action: 'answer',
          testId: 'test-456',
          questionId: 'ei_1',
          value: 5
        })
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockDiagnosisService.saveAnswer).toHaveBeenCalledWith('test-456', 'ei_1', 5);
    });

    it('should validate required fields for answer action', async () => {
      // Arrange
      const mockUser = { id: 'user-123' };
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const request = new NextRequest('http://localhost:3000/api/mbti/diagnosis', {
        method: 'POST',
        body: JSON.stringify({
          action: 'answer',
          testId: 'test-456'
          // Missing questionId and value
        })
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toContain('Missing required fields');
      expect(mockDiagnosisService.saveAnswer).not.toHaveBeenCalled();
    });

    it('should validate value range for answers', async () => {
      // Arrange
      const mockUser = { id: 'user-123' };
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const request = new NextRequest('http://localhost:3000/api/mbti/diagnosis', {
        method: 'POST',
        body: JSON.stringify({
          action: 'answer',
          testId: 'test-456',
          questionId: 'ei_1',
          value: 8 // Invalid - should be 1-7
        })
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toContain('Value must be between 1 and 7');
      expect(mockDiagnosisService.saveAnswer).not.toHaveBeenCalled();
    });
  });

  describe('action: complete', () => {
    it('should complete test and return MBTI type', async () => {
      // Arrange
      const mockUser = { id: 'user-123' };
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      mockDiagnosisService.completeTest.mockResolvedValue({
        success: true,
        mbtiType: 'INTJ',
        scores: { EI: 75, SN: 50, TF: -25, JP: -60 },
        confidence: 85
      });

      const request = new NextRequest('http://localhost:3000/api/mbti/diagnosis', {
        method: 'POST',
        body: JSON.stringify({
          action: 'complete',
          testId: 'test-456'
        })
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.mbtiType).toBe('INTJ');
      expect(data.scores).toEqual({ EI: 75, SN: 50, TF: -25, JP: -60 });
      expect(data.confidence).toBe(85);
      expect(mockDiagnosisService.completeTest).toHaveBeenCalledWith('test-456');
    });

    it('should return error when completion fails due to insufficient answers', async () => {
      // Arrange
      const mockUser = { id: 'user-123' };
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      mockDiagnosisService.completeTest.mockResolvedValue({
        success: false,
        error: 'Insufficient answers for diagnosis'
      });

      const request = new NextRequest('http://localhost:3000/api/mbti/diagnosis', {
        method: 'POST',
        body: JSON.stringify({
          action: 'complete',
          testId: 'test-456'
        })
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Insufficient answers for diagnosis');
    });

    it('should validate testId is provided for complete action', async () => {
      // Arrange
      const mockUser = { id: 'user-123' };
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const request = new NextRequest('http://localhost:3000/api/mbti/diagnosis', {
        method: 'POST',
        body: JSON.stringify({
          action: 'complete'
          // Missing testId
        })
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toContain('Missing required field: testId');
      expect(mockDiagnosisService.completeTest).not.toHaveBeenCalled();
    });
  });

  describe('general validation', () => {
    it('should return 401 when user is not authenticated', async () => {
      // Arrange
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      });

      const request = new NextRequest('http://localhost:3000/api/mbti/diagnosis', {
        method: 'POST',
        body: JSON.stringify({ action: 'start' })
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(401);
      expect(mockDiagnosisService.startTest).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid action', async () => {
      // Arrange
      const mockUser = { id: 'user-123' };
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const request = new NextRequest('http://localhost:3000/api/mbti/diagnosis', {
        method: 'POST',
        body: JSON.stringify({
          action: 'invalid'
        })
      });

      // Act
      const response = await POST(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid action');
    });

    it('should return 400 for malformed JSON', async () => {
      // Arrange
      const mockUser = { id: 'user-123' };
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const request = new NextRequest('http://localhost:3000/api/mbti/diagnosis', {
        method: 'POST',
        body: 'invalid json'
      });

      // Act
      const response = await POST(request);

      // Assert
      expect(response.status).toBe(400);
    });
  });
});