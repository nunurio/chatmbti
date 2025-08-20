import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ja', 'en'] as const,
  defaultLocale: 'ja'
});

// Type definitions for better type safety
export type Locale = (typeof routing.locales)[number];

// Export locale validation function with proper typing
export function hasLocale(locales: readonly string[], locale: string | undefined): locale is string {
  if (!locale) return false;
  return locales.includes(locale);
}

// Re-export routing properties for convenience
export const { locales, defaultLocale } = routing;