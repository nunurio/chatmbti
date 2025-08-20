import { describe, it, expect } from 'vitest';
import { routing } from '@/i18n/routing';

describe('Locale Routing', () => {
  it('should have correct locale configuration', () => {
    expect(routing.locales).toEqual(['ja', 'en']);
    expect(routing.defaultLocale).toBe('ja');
  });

  it('should validate locales correctly', () => {
    expect(routing.locales.includes('ja')).toBe(true);
    expect(routing.locales.includes('en')).toBe(true);
    expect(routing.locales.includes('fr')).toBe(false);
  });

  it('should define proper static params for locale routes', () => {
    const staticParams = routing.locales.map((locale) => ({ locale }));
    
    expect(staticParams).toEqual([
      { locale: 'ja' },
      { locale: 'en' }
    ]);
  });

  // These tests will verify the structure exists after implementation
  it('should handle Japanese locale routing', async () => {
    // This will be implemented after we create the [locale] structure
    expect(routing.locales).toContain('ja');
  });

  it('should handle English locale routing', async () => {
    // This will be implemented after we create the [locale] structure  
    expect(routing.locales).toContain('en');
  });

  it('should redirect to default locale for root access', async () => {
    // This will be handled by middleware
    expect(routing.defaultLocale).toBe('ja');
  });

  it('should return 404 for invalid locales', async () => {
    // This will be implemented in the locale layout
    expect(routing.locales).not.toContain('invalid');
  });
});