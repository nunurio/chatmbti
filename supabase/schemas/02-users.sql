-- ===========================================
-- 02-users.sql: プロフィール、役割テーブル、管理者判定関数
-- ===========================================

-- ===========================================
-- プロフィール / 役割テーブル
-- ===========================================
create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  handle        citext unique,
  display_name  text,
  avatar_url    text,
  mbti_type     mbti_code,
  bio           text,
  preferences   jsonb not null default '{}',
  is_public     boolean not null default false,
  last_seen_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated_at on profiles;
create trigger trg_profiles_updated_at
before update on profiles
for each row execute function set_updated_at();

create table if not exists user_roles (
  user_id   uuid not null references auth.users(id) on delete cascade,
  role      role_type not null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

-- ===========================================
-- 管理者判定関数（SECURITY DEFINER）
--    ※ user_roles 作成後に定義すること！
-- ===========================================
drop function if exists is_admin();
create or replace function is_admin()
returns boolean
security definer
set search_path = public
stable
language sql
as $$
  select exists (
    select 1 from user_roles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

revoke all on function is_admin() from public;
grant execute on function is_admin() to authenticated;
-- 必要なら anon にも: grant execute on function is_admin() to anon;

-- ===========================================
-- RLS 有効化
-- ===========================================
alter table profiles enable row level security;
alter table user_roles enable row level security;