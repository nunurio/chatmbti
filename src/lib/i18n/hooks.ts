import { useLocale } from 'next-intl';
import { usePathname } from '@/i18n/navigation';
import { useLanguage } from '@/components/i18n/LanguageProvider';

/**
 * Get the current locale
 */
export function useCurrentLocale() {
  return useLocale();
}

/**
 * Get language switching function with loading state
 */
export function useSwitchLanguage() {
  const { switchLanguage, isChanging } = useLanguage();
  
  return {
    switchLanguage,
    isChanging,
  };
}

/**
 * Generate localized paths for the current route
 */
export function useLocalizedPath() {
  const pathname = usePathname();
  
  const getLocalizedPath = (locale: string) => {
    return `/${locale}${pathname}`;
  };
  
  return { getLocalizedPath };
}

/**
 * Get all available locales
 */
export function useAvailableLocales() {
  return ['ja', 'en'] as const;
}

/**
 * Check if a locale is supported
 */
export function useIsLocaleSupported() {
  const availableLocales = useAvailableLocales();
  
  const isSupported = (locale: string): locale is 'ja' | 'en' => {
    return (availableLocales as readonly string[]).includes(locale);
  };
  
  return { isSupported };
}

/**
 * Get locale display name
 */
export function useLocaleDisplayName() {
  const getDisplayName = (locale: string): string => {
    switch (locale) {
      case 'ja':
        return '日本語';
      case 'en':
        return 'English';
      default:
        return locale;
    }
  };
  
  return { getDisplayName };
}