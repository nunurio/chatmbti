'use client';

import { createContext, useContext, useCallback, useState } from 'react';
import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { createBrowserClient } from '@/lib/supabase/client';

interface LanguageContextType {
  locale: string;
  switchLanguage: (newLocale: 'ja' | 'en') => Promise<void>;
  isChanging: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isChanging, setIsChanging] = useState(false);

  const switchLanguage = useCallback(async (newLocale: 'ja' | 'en') => {
    if (newLocale === currentLocale || isChanging) {
      return;
    }

    setIsChanging(true);

    try {
      // Try to update user preference in database
      const supabase = createBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ locale: newLocale })
          .eq('id', user.id)
          .select();
        
        if (error) {
          console.error('Failed to update user locale preference:', error);
        }
      }

      // Navigate to new locale
      router.push(pathname, { locale: newLocale });
    } catch (error) {
      console.error('Error switching language:', error);
    } finally {
      setIsChanging(false);
    }
  }, [currentLocale, isChanging, router, pathname]);

  const value: LanguageContextType = {
    locale: currentLocale,
    switchLanguage,
    isChanging,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
}