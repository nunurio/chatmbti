-- ===========================================
-- 05-mbti.sql: MBTI関連テーブル（質問、受検、回答、相性）
-- ===========================================

-- ===========================================
-- MBTI（質問・受検・回答・相性）
-- ===========================================
create table if not exists mbti_questions (
  id         uuid primary key default gen_random_uuid(),
  code       text unique,
  text       text not null,
  axis       mbti_axis not null,          -- EI/SN/TF/JP
  direction  smallint not null default 1 check (direction in (-1, 1)),
  "order"    integer not null,            -- 予約語のため引用符付きで保持
  locale     text not null default 'ja',
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_mbti_questions_updated_at on mbti_questions;
create trigger trg_mbti_questions_updated_at
before update on mbti_questions
for each row execute function set_updated_at();

create table if not exists mbti_tests (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  started_at      timestamptz not null default now(),
  completed_at    timestamptz,
  status          text not null default 'in_progress', -- completed/abandoned
  determined_type mbti_code,
  scores          jsonb,  -- 例: {"EI":12,"SN":-5,"TF":3,"JP":-8}
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_mbti_tests_user_created on mbti_tests(user_id, created_at desc);

drop trigger if exists trg_mbti_tests_updated_at on mbti_tests;
create trigger trg_mbti_tests_updated_at
before update on mbti_tests
for each row execute function set_updated_at();

create table if not exists mbti_answers (
  id           uuid primary key default gen_random_uuid(),
  test_id      uuid not null references mbti_tests(id) on delete cascade,
  question_id  uuid not null references mbti_questions(id) on delete restrict,
  score        smallint not null check (score between 1 and 7), -- Likert 1-7
  created_at   timestamptz not null default now(),
  unique (test_id, question_id)
);

create index if not exists idx_mbti_answers_test on mbti_answers(test_id);

create table if not exists mbti_compatibilities (
  type_a mbti_code not null,
  type_b mbti_code not null,
  score  smallint not null check (score between 0 and 100),
  primary key (type_a, type_b)
);

-- ===========================================
-- RLS 有効化
-- ===========================================
alter table mbti_questions enable row level security;
alter table mbti_tests enable row level security;
alter table mbti_answers enable row level security;
alter table mbti_compatibilities enable row level security;