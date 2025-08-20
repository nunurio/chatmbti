-- ===========================================
-- profiles_locale_update.sql: Add locale support to profiles table
-- ===========================================
-- 
-- This update adds locale support to the profiles table to persist
-- user language preferences for the i18n system. The locale field
-- allows users to choose between Japanese ('ja') and English ('en'),
-- with Japanese as the default to maintain consistency with the
-- application's primary language.
-- 
-- The column is nullable to handle existing users gracefully during
-- migration, with a default value of 'ja' for new profiles.

-- Add locale column to profiles table
-- Pattern follows mbti_questions.locale implementation
alter table profiles
add column locale text default 'ja'
check (locale in ('ja', 'en'));

-- Add comment for documentation
comment on column profiles.locale is 'User language preference for i18n system. Supports "ja" (Japanese) and "en" (English)';

-- Create index for potential locale-based queries (optional optimization)
-- This is useful for future analytics or locale-based filtering
create index if not exists idx_profiles_locale on profiles(locale);