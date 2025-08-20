-- ===========================================
-- 03-bot-personas.sql: ボット・ペルソナテーブル
-- ===========================================

-- ===========================================
-- ボット・ペルソナ
-- ===========================================
create table if not exists bot_personas (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid references auth.users(id) on delete set null, -- null=プリセット
  name          text not null,
  description   text,
  mbti_type     mbti_code,
  warmth        smallint not null default 50 check (warmth between 0 and 100),
  formality     smallint not null default 50 check (formality between 0 and 100),
  brevity       smallint not null default 50 check (brevity between 0 and 100),
  humor         smallint not null default 50 check (humor between 0 and 100),
  empathy       smallint not null default 50 check (empathy between 0 and 100),
  assertiveness smallint not null default 50 check (assertiveness between 0 and 100),
  creativity    smallint not null default 50 check (creativity between 0 and 100),
  rigor         smallint not null default 50 check (rigor between 0 and 100),
  emoji_usage   smallint not null default 25 check (emoji_usage between 0 and 100),
  steps         smallint not null default 1  check (steps between 1 and 20),
  visibility    visibility not null default 'private',
  system_prompt_template text,
  version       integer not null default 1,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_bot_personas_owner on bot_personas(owner_id);
create index if not exists idx_bot_personas_visibility on bot_personas(visibility);

drop trigger if exists trg_bot_personas_updated_at on bot_personas;
create trigger trg_bot_personas_updated_at
before update on bot_personas
for each row execute function set_updated_at();

-- ===========================================
-- RLS 有効化
-- ===========================================
alter table bot_personas enable row level security;