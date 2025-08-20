-- ===========================================
-- 06-rls-policies.sql: 全テーブルのRLSポリシー
-- ===========================================

-- ===========================================
-- RLS ポリシー
--     文法: CREATE POLICY <name> ON <table> FOR <cmd> TO <role> USING ... WITH CHECK ...
-- ===========================================

-- profiles
drop policy if exists "profiles_select_owner_or_public" on profiles;
create policy "profiles_select_owner_or_public"
on profiles
for select
to authenticated
using ( id = auth.uid() or is_public );

drop policy if exists "profiles_update_owner" on profiles;
create policy "profiles_update_owner"
on profiles
for update
to authenticated
using ( id = auth.uid() )
with check ( id = auth.uid() );

drop policy if exists "profiles_insert_self" on profiles;
create policy "profiles_insert_self"
on profiles
for insert
to authenticated
with check ( id = auth.uid() );

drop policy if exists "profiles_admin_select_all" on profiles;
create policy "profiles_admin_select_all"
on profiles
for select
to authenticated
using ( is_admin() );

-- user_roles（通常は不可視、管理者のみ読取）
drop policy if exists "user_roles_admin_read" on user_roles;
create policy "user_roles_admin_read"
on user_roles
for select
to authenticated
using ( is_admin() );

-- bot_personas
drop policy if exists "bot_personas_select_public_or_owner" on bot_personas;
create policy "bot_personas_select_public_or_owner"
on bot_personas
for select
to authenticated
using ( visibility = 'public' or owner_id = auth.uid() );

drop policy if exists "bot_personas_insert_owner" on bot_personas;
create policy "bot_personas_insert_owner"
on bot_personas
for insert
to authenticated
with check ( owner_id = auth.uid() );

drop policy if exists "bot_personas_update_owner" on bot_personas;
create policy "bot_personas_update_owner"
on bot_personas
for update
to authenticated
using ( owner_id = auth.uid() )
with check ( owner_id = auth.uid() );

drop policy if exists "bot_personas_delete_owner" on bot_personas;
create policy "bot_personas_delete_owner"
on bot_personas
for delete
to authenticated
using ( owner_id = auth.uid() );

drop policy if exists "bot_personas_admin_all" on bot_personas;
create policy "bot_personas_admin_all"
on bot_personas
for all
to authenticated
using ( is_admin() )
with check ( is_admin() );

-- sessions
drop policy if exists "sessions_select_owner" on sessions;
create policy "sessions_select_owner"
on sessions
for select
to authenticated
using ( user_id = auth.uid() );

drop policy if exists "sessions_insert_owner" on sessions;
create policy "sessions_insert_owner"
on sessions
for insert
to authenticated
with check ( user_id = auth.uid() );

drop policy if exists "sessions_update_owner" on sessions;
create policy "sessions_update_owner"
on sessions
for update
to authenticated
using ( user_id = auth.uid() )
with check ( user_id = auth.uid() );

drop policy if exists "sessions_delete_owner" on sessions;
create policy "sessions_delete_owner"
on sessions
for delete
to authenticated
using ( user_id = auth.uid() );

-- messages
drop policy if exists "messages_select_session_owner" on messages;
create policy "messages_select_session_owner"
on messages
for select
to authenticated
using (
  exists (
    select 1 from sessions s
    where s.id = session_id and s.user_id = auth.uid()
  )
);

drop policy if exists "messages_insert_user_role_only" on messages;
create policy "messages_insert_user_role_only"
on messages
for insert
to authenticated
with check (
  role = 'user' and
  exists (
    select 1 from sessions s
    where s.id = session_id and s.user_id = auth.uid()
  )
);
-- assistant/system の書込は server 側（service_role）専用

-- message_feedback
drop policy if exists "message_feedback_rw_owner" on message_feedback;
create policy "message_feedback_rw_owner"
on message_feedback
for select
to authenticated
using ( user_id = auth.uid() );

drop policy if exists "message_feedback_insert_owner" on message_feedback;
create policy "message_feedback_insert_owner"
on message_feedback
for insert
to authenticated
with check ( user_id = auth.uid() );

-- mbti_questions / mbti_compatibilities
drop policy if exists "mbti_questions_select_all" on mbti_questions;
create policy "mbti_questions_select_all"
on mbti_questions
for select
to authenticated
using ( true );

drop policy if exists "mbti_questions_admin_write" on mbti_questions;
create policy "mbti_questions_admin_write"
on mbti_questions
for all
to authenticated
using ( is_admin() )
with check ( is_admin() );

drop policy if exists "mbti_compat_select_all" on mbti_compatibilities;
create policy "mbti_compat_select_all"
on mbti_compatibilities
for select
to authenticated
using ( true );

drop policy if exists "mbti_compat_admin_write" on mbti_compatibilities;
create policy "mbti_compat_admin_write"
on mbti_compatibilities
for all
to authenticated
using ( is_admin() )
with check ( is_admin() );

-- mbti_tests / mbti_answers
drop policy if exists "mbti_tests_rw_owner" on mbti_tests;
create policy "mbti_tests_rw_owner"
on mbti_tests
for select
to authenticated
using ( user_id = auth.uid() );

drop policy if exists "mbti_tests_insert_owner" on mbti_tests;
create policy "mbti_tests_insert_owner"
on mbti_tests
for insert
to authenticated
with check ( user_id = auth.uid() );

drop policy if exists "mbti_tests_update_owner" on mbti_tests;
create policy "mbti_tests_update_owner"
on mbti_tests
for update
to authenticated
using ( user_id = auth.uid() )
with check ( user_id = auth.uid() );

drop policy if exists "mbti_answers_rw_owner" on mbti_answers;
create policy "mbti_answers_rw_owner"
on mbti_answers
for select
to authenticated
using (
  exists (
    select 1 from mbti_tests t
    where t.id = test_id and t.user_id = auth.uid()
  )
);

drop policy if exists "mbti_answers_insert_owner" on mbti_answers;
create policy "mbti_answers_insert_owner"
on mbti_answers
for insert
to authenticated
with check (
  exists (
    select 1 from mbti_tests t
    where t.id = test_id and t.user_id = auth.uid()
  )
);

-- sse_events
drop policy if exists "sse_events_select_owner" on sse_events;
create policy "sse_events_select_owner"
on sse_events
for select
to authenticated
using ( user_id = auth.uid() );

drop policy if exists "sse_events_insert_owner" on sse_events;
create policy "sse_events_insert_owner"
on sse_events
for insert
to authenticated
with check ( user_id = auth.uid() );

drop policy if exists "sse_events_admin_read_all" on sse_events;
create policy "sse_events_admin_read_all"
on sse_events
for select
to authenticated
using ( is_admin() );