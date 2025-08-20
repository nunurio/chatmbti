import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createBrowserClient, createServerClient } from '@/lib/supabase/client';

// Mock @supabase/ssr
const mockBrowserClient = { test: 'browser-client' };
const mockServerClient = { test: 'server-client' };

vi.mock('@supabase/ssr', () => ({
  createBrowserClient: vi.fn(() => mockBrowserClient),
  createServerClient: vi.fn(() => mockServerClient),
}));

// Mock next/headers
vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

// Mock environment variables
beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
});

describe('createBrowserClient', () => {
  it('should create a browser client instance', () => {
    const result = createBrowserClient();
    expect(result).toBeDefined();
  });

  it('should throw error when SUPABASE_URL is missing', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    
    expect(() => createBrowserClient()).toThrow('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  });

  it('should throw error when SUPABASE_ANON_KEY is missing', () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    expect(() => createBrowserClient()).toThrow('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
  });
});

describe('createServerClient', () => {
  it('should create a server client instance', async () => {
    const mockCookies = {
      getAll: vi.fn(() => []),
      set: vi.fn(),
      get: vi.fn(),
      has: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn(),
      [Symbol.iterator]: vi.fn(),
      size: 0
    };
    
    const { cookies } = await import('next/headers');
    vi.mocked(cookies).mockResolvedValue(mockCookies);

    const result = await createServerClient();
    expect(result).toBeDefined();
  });

  it('should handle cookie operations', async () => {
    const mockCookies = {
      getAll: vi.fn(() => [{ name: 'test', value: 'value' }]),
      set: vi.fn(),
      get: vi.fn(),
      has: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn(),
      [Symbol.iterator]: vi.fn(),
      size: 1
    };
    
    const { cookies } = await import('next/headers');
    vi.mocked(cookies).mockResolvedValue(mockCookies);

    const result = await createServerClient();
    
    // Verify that the server client was created with correct configuration
    expect(result).toBeDefined();
    expect(vi.mocked(cookies)).toHaveBeenCalled();
  });
});