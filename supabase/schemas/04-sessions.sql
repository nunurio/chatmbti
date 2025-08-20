-- ===========================================
-- 04-sessions.sql: セッション、メッセージ、フィードバック、SSEイベント、RPC関数
-- ===========================================

-- ===========================================
-- セッション / メッセージ / フィードバック
-- ===========================================
create table if not exists sessions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  persona_id     uuid references bot_personas(id) on delete set null,
  title          text,
  model          text,
  temperature    numeric(3,2) not null default 0.70 check (temperature between 0 and 2),
  status         session_status not null default 'active',
  message_count  integer not null default 0,
  last_message_at timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz
);

create index if not exists idx_sessions_user_created on sessions(user_id, created_at desc);
create index if not exists idx_sessions_persona on sessions(persona_id);

drop trigger if exists trg_sessions_updated_at on sessions;
create trigger trg_sessions_updated_at
before update on sessions
for each row execute function set_updated_at();

create table if not exists messages (
  id                uuid primary key default gen_random_uuid(),
  session_id        uuid not null references sessions(id) on delete cascade,
  role              message_role not null,
  content           text not null,
  content_json      jsonb,
  model             text,
  tokens_prompt     integer,
  tokens_completion integer,
  error             text,
  created_at        timestamptz not null default now()
);

create index if not exists idx_messages_session_created on messages(session_id, created_at);
create index if not exists idx_messages_session_id on messages(session_id, id);

-- セッション集計の自動更新
create or replace function bump_session_on_message()
returns trigger language plpgsql as $$
begin
  update sessions
     set message_count = message_count + 1,
         last_message_at = now(),
         updated_at = now()
   where id = new.session_id;
  return new;
end $$;

drop trigger if exists trg_messages_after_insert on messages;
create trigger trg_messages_after_insert
after insert on messages
for each row execute function bump_session_on_message();

-- 任意: メッセージ評価
create table if not exists message_feedback (
  id         uuid primary key default gen_random_uuid(),
  message_id uuid not null references messages(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  rating     smallint not null check (rating in (-1, 1)), -- -1:down, 1:up
  reason     text,
  created_at timestamptz not null default now(),
  unique (message_id, user_id)
);

-- ===========================================
-- SSE/ストリーミング監査ログ
-- ===========================================
create table if not exists sse_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  session_id  uuid references sessions(id) on delete set null,
  event_type  text not null check (event_type in ('start','end','interrupt','error')),
  detail      text,
  request_id  text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_sse_events_user_created on sse_events(user_id, created_at desc);

-- ===========================================
-- RPC（クライアント用安全投稿）
-- ===========================================
create or replace function post_user_message(p_session_id uuid, p_content text)
returns uuid
language plpgsql
as $$
declare
  new_id uuid;
begin
  -- RLS により: セッション所有者のみ insert 可
  insert into messages (id, session_id, role, content)
  values (gen_random_uuid(), p_session_id, 'user', p_content)
  returning id into new_id;
  return new_id;
end $$;

grant execute on function post_user_message(uuid, text) to authenticated;

-- ===========================================
-- RLS 有効化
-- ===========================================
alter table sessions enable row level security;
alter table messages enable row level security;
alter table message_feedback enable row level security;
alter table sse_events enable row level security;