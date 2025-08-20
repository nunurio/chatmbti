'use client';

import { useTranslations } from 'next-intl';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLanguage } from './LanguageProvider';

const LANGUAGES = [
  { code: 'ja', name: '日本語' },
  { code: 'en', name: 'English' },
] as const;

export function LanguageToggle() {
  const t = useTranslations('Common');
  const { locale, switchLanguage, isChanging } = useLanguage();

  const currentLanguage = LANGUAGES.find(lang => lang.code === locale);
  const currentLanguageName = currentLanguage?.name || locale;

  const handleLanguageChange = async (newLocale: string) => {
    if (newLocale === 'ja' || newLocale === 'en') {
      await switchLanguage(newLocale);
    }
  };

  return (
    <Select
      value={locale}
      onValueChange={(value) => { void handleLanguageChange(value); }}
      disabled={isChanging}
    >
      <SelectTrigger 
        className="w-auto min-w-[120px]"
        aria-label={t('selectLanguage')}
      >
        <SelectValue placeholder={currentLanguageName}>
          {currentLanguageName}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map((language) => (
          <SelectItem
            key={language.code}
            value={language.code}
          >
            {language.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}