import { describe, it, expect } from 'vitest';

// This test will fail initially (Red phase)
describe('i18n routing configuration', () => {
  it('should export routing configuration with correct locales', async () => {
    // Import will fail until we create the file
    const { routing } = await import('@/i18n/routing');
    
    expect(routing).toBeDefined();
    expect(routing.locales).toEqual(['ja', 'en']);
  });

  it('should have Japanese as default locale', async () => {
    const { routing } = await import('@/i18n/routing');
    
    expect(routing.defaultLocale).toBe('ja');
  });

  it('should export locale validation function', async () => {
    const { hasLocale } = await import('@/i18n/routing');
    
    expect(hasLocale).toBeTypeOf('function');
    expect(hasLocale(['ja', 'en'], 'ja')).toBe(true);
    expect(hasLocale(['ja', 'en'], 'en')).toBe(true);
    expect(hasLocale(['ja', 'en'], 'fr')).toBe(false);
    expect(hasLocale(['ja', 'en'], undefined)).toBe(false);
  });
});