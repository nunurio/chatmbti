import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSession, getUser, signOut } from '@/lib/supabase/auth';

// Mock @/lib/supabase/client
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
    getSession: vi.fn(),
    signOut: vi.fn(),
  },
};

vi.mock('@/lib/supabase/client', () => ({
  createServerClient: vi.fn(() => Promise.resolve(mockSupabaseClient)),
}));

describe('getSession', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return session when user is authenticated', async () => {
    const mockSession = {
      access_token: 'test-token',
      user: { id: 'user-123', email: 'test@example.com' },
    };
    
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    const result = await getSession();
    expect(result).toEqual(mockSession);
  });

  it('should return null when no session exists', async () => {
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const result = await getSession();
    expect(result).toBeNull();
  });

  it('should handle auth errors', async () => {
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: { message: 'Auth error' },
    });

    await expect(getSession()).rejects.toThrow('Auth error');
  });
});

describe('getUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return user when authenticated', async () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
    
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    });

    const result = await getUser();
    expect(result).toEqual(mockUser);
  });

  it('should return null when no user exists', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const result = await getUser();
    expect(result).toBeNull();
  });

  it('should handle auth errors', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid token' },
    });

    await expect(getUser()).rejects.toThrow('Invalid token');
  });
});

describe('signOut', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should sign out successfully', async () => {
    mockSupabaseClient.auth.signOut.mockResolvedValue({
      error: null,
    });

    await expect(signOut()).resolves.toBeUndefined();
    expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
  });

  it('should handle sign out errors', async () => {
    mockSupabaseClient.auth.signOut.mockResolvedValue({
      error: { message: 'Sign out failed' },
    });

    await expect(signOut()).rejects.toThrow('Sign out failed');
  });
});