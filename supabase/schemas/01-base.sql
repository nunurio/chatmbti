-- ===========================================
-- 01-base.sql: 拡張機能、ENUM型、ユーティリティ関数
-- ===========================================

-- ===========================================
-- 拡張機能
-- ===========================================
create extension if not exists pgcrypto;
create extension if not exists citext;

-- ===========================================
-- ENUM 型
-- ===========================================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'mbti_code') then
    create type mbti_code as enum (
      'INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP',
      'ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'message_role') then
    create type message_role as enum ('user','assistant','system','tool');
  end if;

  if not exists (select 1 from pg_type where typname = 'session_status') then
    create type session_status as enum ('active','archived');
  end if;

  if not exists (select 1 from pg_type where typname = 'visibility') then
    create type visibility as enum ('private','public');
  end if;

  if not exists (select 1 from pg_type where typname = 'role_type') then
    create type role_type as enum ('user','admin');
  end if;

  if not exists (select 1 from pg_type where typname = 'mbti_axis') then
    create type mbti_axis as enum ('EI','SN','TF','JP');
  end if;
end $$;

-- ===========================================
-- ユーティリティ関数
-- ===========================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  -- clock_timestamp() はトランザクション中でも単調増加
  new.updated_at := clock_timestamp();
  return new;
end $$;