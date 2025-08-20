import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock next-intl middleware
const mockCreateMiddleware = vi.fn();
vi.mock('next-intl/middleware', () => ({
  default: mockCreateMiddleware
}));

describe('i18n middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create middleware with routing configuration', async () => {
    // This will fail initially until we implement the middleware
    await import('@/middleware');
    
    expect(mockCreateMiddleware).toHaveBeenCalledWith(
      expect.objectContaining({
        locales: ['ja', 'en'],
        defaultLocale: 'ja'
      })
    );
  });

  it('should export correct matcher configuration', async () => {
    const middlewareModule = await import('@/middleware');
    
    expect(middlewareModule.config).toBeDefined();
    expect(middlewareModule.config.matcher).toBeDefined();
    expect(Array.isArray(middlewareModule.config.matcher)).toBe(true);
  });

  it('should exclude api routes from matcher', async () => {
    const middlewareModule = await import('@/middleware');
    
    const matcher = middlewareModule.config.matcher;
    const hasApiExclusion = matcher.some((pattern: string) => 
      pattern.includes('api') || pattern.includes('(?!') && pattern.includes('api')
    );
    
    expect(hasApiExclusion).toBe(true);
  });
});