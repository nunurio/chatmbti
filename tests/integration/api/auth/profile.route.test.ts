import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
};

const mockProfile = {
  id: 'test-user-id',
  display_name: 'Test User',
  mbti_type: 'INTJ' as const,
  avatar_url: null,
  bio: null,
  handle: null,
  is_public: false,
  last_seen_at: null,
  preferences: {},
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
};

const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
};

const mockFrom = {
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  eq: vi.fn(),
  single: vi.fn(),
};

vi.mock('@/lib/supabase/client', () => ({
  createServerClient: vi.fn().mockResolvedValue(mockSupabase),
}));

describe('/api/auth/profile Route Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockSupabase.from.mockReturnValue(mockFrom);
    mockFrom.select.mockReturnValue(mockFrom);
    mockFrom.insert.mockReturnValue(mockFrom);
    mockFrom.update.mockReturnValue(mockFrom);
    mockFrom.eq.mockReturnValue(mockFrom);
    mockFrom.single.mockReturnValue(mockFrom);
  });

  describe('GET /api/auth/profile', () => {
    it('should return user profile when authenticated', async () => {
      const { GET } = await import('@/app/api/auth/profile/route');
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockFrom.single.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(mockProfile);
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
      expect(mockFrom.select).toHaveBeenCalledWith('*');
      expect(mockFrom.eq).toHaveBeenCalledWith('id', mockUser.id);
    });

    it('should return 401 when not authenticated', async () => {
      const { GET } = await import('@/app/api/auth/profile/route');
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 404 when profile not found', async () => {
      const { GET } = await import('@/app/api/auth/profile/route');
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockFrom.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116' },
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Profile not found');
    });
  });

  describe('POST /api/auth/profile', () => {
    it('should create new profile successfully', async () => {
      const { POST } = await import('@/app/api/auth/profile/route');
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockFrom.single.mockResolvedValue({
        data: mockProfile,
        error: null,
      });

      const request = new NextRequest('http://localhost/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: 'Test User',
          mbti_type: 'INTJ',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data).toEqual(mockProfile);
      expect(mockFrom.insert).toHaveBeenCalledWith({
        id: mockUser.id,
        display_name: 'Test User',
        mbti_type: 'INTJ',
      });
    });

    it('should return 401 when not authenticated', async () => {
      const { POST } = await import('@/app/api/auth/profile/route');
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const request = new NextRequest('http://localhost/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: 'Test User',
          mbti_type: 'INTJ',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should validate request body', async () => {
      const { POST } = await import('@/app/api/auth/profile/route');
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const request = new NextRequest('http://localhost/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request body');
    });
  });

  describe('PATCH /api/auth/profile', () => {
    it('should update profile successfully', async () => {
      const { PATCH } = await import('@/app/api/auth/profile/route');
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const updatedProfile = {
        ...mockProfile,
        display_name: 'Updated User',
        mbti_type: 'ENTP' as const,
      };

      mockFrom.single.mockResolvedValue({
        data: updatedProfile,
        error: null,
      });

      const request = new NextRequest('http://localhost/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: 'Updated User',
          mbti_type: 'ENTP',
        }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toEqual(updatedProfile);
      expect(mockFrom.update).toHaveBeenCalledWith({
        display_name: 'Updated User',
        mbti_type: 'ENTP',
        updated_at: expect.any(String),
      });
      expect(mockFrom.eq).toHaveBeenCalledWith('id', mockUser.id);
    });

    it('should return 401 when not authenticated', async () => {
      const { PATCH } = await import('@/app/api/auth/profile/route');
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const request = new NextRequest('http://localhost/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: 'Updated User',
        }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should validate request body for updates', async () => {
      const { PATCH } = await import('@/app/api/auth/profile/route');
      
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const request = new NextRequest('http://localhost/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invalid_field: 'value',
        }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request body');
    });
  });
});