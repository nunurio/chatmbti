-- supabase/tests/app_spec.sql
BEGIN;

-- pgTAP を利用
CREATE EXTENSION IF NOT EXISTS pgtap;

-- 明示的な search_path（auth を参照するため）
SET search_path = public, auth, extensions;

-- テスト数を事前に固定しない
SELECT no_plan();

------------------------------
-- 1) スキーマ・オブジェクトの存在確認
------------------------------
SELECT has_extension('citext', 'citext extension exists');
SELECT has_type('public', 'mbti_axis', 'enum type mbti_axis exists');
SELECT has_type('public', 'mbti_code', 'enum type mbti_code exists');
SELECT has_table('public', 'sessions', 'table sessions exists');
SELECT ok(to_regprocedure('public.is_admin()') IS NOT NULL, 'function is_admin() exists');
SELECT ok(to_regprocedure('public.post_user_message(uuid, text)') IS NOT NULL, 'function post_user_message(uuid,text) exists');
SELECT has_trigger('public','messages','trg_messages_after_insert','messages AFTER INSERT trigger exists');
SELECT has_trigger('public','sessions','trg_sessions_updated_at','sessions BEFORE UPDATE trigger exists');
SELECT has_index('public','messages','idx_messages_session_id','messages has idx(session_id,id)');
-- CITEXT 列型の確認
SELECT col_type_is('public','profiles','handle','citext','profiles.handle is citext');

------------------------------
-- 2) フィクスチャ（ダミーユーザー作成）
------------------------------
-- 設定変数に UUID を保持（トランザクションローカル）
SELECT set_config('test.u_admin', gen_random_uuid()::text, TRUE);
SELECT set_config('test.u1',     gen_random_uuid()::text, TRUE);
SELECT set_config('test.u2',     gen_random_uuid()::text, TRUE);

-- auth.users に最低限のレコードを作成
INSERT INTO auth.users (id, email)
VALUES
  (current_setting('test.u_admin')::uuid, 'admin@example.com'),
  (current_setting('test.u1')::uuid,     'u1@example.com'),
  (current_setting('test.u2')::uuid,     'u2@example.com');

-- 管理者ロールを付与（RLS は superuser で挿入）
INSERT INTO public.user_roles (user_id, role)
VALUES (current_setting('test.u_admin')::uuid, 'admin');

------------------------------
-- 3) is_admin() の挙動
------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', current_setting('test.u1'), TRUE);
SELECT is(public.is_admin(), FALSE, 'u1 is not admin');

SELECT set_config('request.jwt.claim.sub', current_setting('test.u_admin'), TRUE);
SELECT is(public.is_admin(), TRUE, 'u_admin is admin');

RESET ROLE;

------------------------------
-- 4) sessions の RLS
------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', current_setting('test.u1'), TRUE);

-- 本人なら作成可
SELECT lives_ok($$
  INSERT INTO public.sessions (user_id, title)
  VALUES (current_setting('test.u1')::uuid, 'u1 session 1')
$$, 'u1 can insert own session');

-- 直近のセッションIDを保存
SELECT set_config(
  'test.s1',
  (SELECT id::text
     FROM public.sessions
    WHERE user_id = current_setting('test.u1')::uuid
    ORDER BY created_at DESC LIMIT 1),
  TRUE
);

-- 他人の user_id で作成は不可
SELECT throws_like($$
  INSERT INTO public.sessions (user_id, title)
  VALUES (current_setting('test.u2')::uuid, 'bad')
$$, '%row-level security policy%', 'cannot insert session for another user');

------------------------------
-- 5) messages の RLS とトリガ
------------------------------
-- 役割が 'assistant' は WITH CHECK により拒否
SELECT throws_like($$
  INSERT INTO public.messages (session_id, role, content)
  VALUES (current_setting('test.s1')::uuid, 'assistant', 'not allowed')
$$, '%row-level security policy%', 'cannot insert message with non-user role');

-- post_user_message() 経由（role='user'）で挿入し、トリガでカウント更新
SELECT lives_ok($$
  SELECT public.post_user_message(current_setting('test.s1')::uuid, 'hello')
$$, 'post_user_message works for owner');

-- カウントと last_message_at の更新を検証
SELECT results_eq(
  $$ SELECT message_count FROM public.sessions WHERE id = current_setting('test.s1')::uuid $$,
  ARRAY[1],
  'message_count bumped to 1'
);

SELECT ok(
  (SELECT last_message_at IS NOT NULL FROM public.sessions WHERE id = current_setting('test.s1')::uuid),
  'last_message_at set'
);

-- 他ユーザーからは参照不可
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', current_setting('test.u2'), TRUE);

SELECT results_eq(
  $$ SELECT COUNT(*)::int
       FROM public.messages
      WHERE session_id = current_setting('test.s1')::uuid $$,
  ARRAY[0],
  'u2 cannot read u1 messages'
);

RESET ROLE;

------------------------------
-- 6) bot_personas の RLS（オーナー/公開）
------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', current_setting('test.u1'), TRUE);

-- 所有者として作成
SELECT lives_ok($$
  INSERT INTO public.bot_personas (owner_id, name, description, visibility)
  VALUES (current_setting('test.u1')::uuid, 'p1', 'owned by u1', 'private')
$$, 'u1 can create own persona');

SELECT set_config(
  'test.p1',
  (SELECT id::text
     FROM public.bot_personas
    WHERE owner_id = current_setting('test.u1')::uuid
      AND name = 'p1'
    LIMIT 1),
  TRUE
);

-- 別ユーザーは更新不可
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', current_setting('test.u2'), TRUE);

SELECT results_eq($$
  WITH upd AS (
    UPDATE public.bot_personas
       SET name = 'hacked'
     WHERE id = current_setting('test.p1')::uuid
     RETURNING 1
  )
  SELECT COUNT(*)::int FROM upd
$$, ARRAY[0], 'u2 cannot update u1 persona');

-- オーナーが public に変更 → 第三者は参照可
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', current_setting('test.u1'), TRUE);

SELECT lives_ok($$
  UPDATE public.bot_personas
     SET visibility = 'public'
   WHERE id = current_setting('test.p1')::uuid
$$, 'owner can publish persona');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', current_setting('test.u2'), TRUE);

SELECT results_eq(
  $$ SELECT COUNT(*)::int
       FROM public.bot_personas
      WHERE id = current_setting('test.p1')::uuid $$,
  ARRAY[1],
  'u2 can read public persona'
);

RESET ROLE;

------------------------------
-- 7) mbti_questions は管理者のみ書込
------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', current_setting('test.u1'), TRUE);

SELECT throws_like($$
  INSERT INTO public.mbti_questions (code, text, axis, direction, "order", locale)
  VALUES ('Q_TEST_1','text','EI', 1, 1, 'ja')
$$, '%row-level security policy%', 'non-admin cannot insert mbti_questions');

-- 管理者なら成功
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', current_setting('test.u_admin'), TRUE);

SELECT lives_ok($$
  INSERT INTO public.mbti_questions (code, text, axis, direction, "order", locale)
  VALUES ('Q_TEST_1','text','EI', 1, 1, 'ja')
$$, 'admin can insert mbti_questions');

SELECT set_config(
  'test.q1',
  (SELECT id::text FROM public.mbti_questions WHERE code = 'Q_TEST_1'),
  TRUE
);

-- direction は -1 or 1 のみ
SELECT throws_like($$
  INSERT INTO public.mbti_questions (code, text, axis, direction, "order", locale)
  VALUES ('Q_BAD','bad','SN', 0, 2, 'ja')
$$, '%violates check constraint "mbti_questions_direction_check"%', 'direction must be -1 or 1');

RESET ROLE;

------------------------------
-- 8) mbti_tests と mbti_answers のフロー
------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', current_setting('test.u1'), TRUE);

-- 自ユーザーのテスト作成
SELECT lives_ok($$
  INSERT INTO public.mbti_tests (user_id, status)
  VALUES (current_setting('test.u1')::uuid, 'in_progress')
$$, 'u1 can create own mbti_test');

SELECT set_config(
  'test.t1',
  (SELECT id::text
     FROM public.mbti_tests
    WHERE user_id = current_setting('test.u1')::uuid
    ORDER BY created_at DESC LIMIT 1),
  TRUE
);

-- 回答（1..7 の範囲）
SELECT lives_ok($$
  INSERT INTO public.mbti_answers (test_id, question_id, score)
  VALUES (current_setting('test.t1')::uuid, current_setting('test.q1')::uuid, 5)
$$, 'u1 can add answer to own test');

-- 同一 (test_id, question_id) の一意制約
SELECT throws_like($$
  INSERT INTO public.mbti_answers (test_id, question_id, score)
  VALUES (current_setting('test.t1')::uuid, current_setting('test.q1')::uuid, 6)
$$, 'duplicate key value violates unique constraint "mbti_answers_test_id_question_id_key"', 'duplicate answer prevented');

-- スコア範囲チェック
SELECT throws_like($$
  INSERT INTO public.mbti_answers (test_id, question_id, score)
  VALUES (current_setting('test.t1')::uuid, current_setting('test.q1')::uuid, 0)
$$, '%violates check constraint "mbti_answers_score_check"%', 'score must be 1..7');

RESET ROLE;

------------------------------
-- 9) message_feedback の RLS と CHECK
------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', current_setting('test.u1'), TRUE);

-- 最初のメッセージIDを保持
SELECT set_config(
  'test.m1',
  (SELECT id::text
     FROM public.messages
    WHERE session_id = current_setting('test.s1')::uuid
    ORDER BY created_at ASC LIMIT 1),
  TRUE
);

-- 本人のフィードバックは可
SELECT lives_ok($$
  INSERT INTO public.message_feedback (message_id, user_id, rating, reason)
  VALUES (current_setting('test.m1')::uuid, current_setting('test.u1')::uuid, 1, 'good')
$$, 'u1 can insert own feedback');

-- rating は -1 or 1 のみ
SELECT throws_like($$
  INSERT INTO public.message_feedback (message_id, user_id, rating)
  VALUES (current_setting('test.m1')::uuid, current_setting('test.u1')::uuid, 0)
$$, '%violates check constraint "message_feedback_rating_check"%', 'rating must be -1 or 1');

-- 他ユーザーは参照不可
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', current_setting('test.u2'), TRUE);

SELECT results_eq(
  $$ SELECT COUNT(*)::int
       FROM public.message_feedback
      WHERE user_id = current_setting('test.u1')::uuid $$,
  ARRAY[0],
  'u2 cannot read u1 feedback'
);

RESET ROLE;

------------------------------
-- 10) sse_events の CHECK と RLS
------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', current_setting('test.u1'), TRUE);

SELECT lives_ok($$
  INSERT INTO public.sse_events (user_id, session_id, event_type, detail)
  VALUES (current_setting('test.u1')::uuid, current_setting('test.s1')::uuid, 'start', 'ok')
$$, 'u1 can insert own sse_event');

SELECT throws_like($$
  INSERT INTO public.sse_events (user_id, session_id, event_type)
  VALUES (current_setting('test.u1')::uuid, current_setting('test.s1')::uuid, 'foo')
$$, '%violates check constraint "sse_events_event_type_check"%', 'sse_events.event_type constrained');

RESET ROLE;

------------------------------
-- 11) updated_at トリガ（sessions）
------------------------------
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', current_setting('test.u1'), TRUE);

SELECT lives_ok($$
  UPDATE public.sessions
     SET title = 'retitled'
   WHERE id = current_setting('test.s1')::uuid
$$, 'can update own session');

-- updated_at が created_at を上回る
SELECT ok(
  (SELECT updated_at > created_at
     FROM public.sessions
    WHERE id = current_setting('test.s1')::uuid),
  'sessions.updated_at advanced after update'
);

RESET ROLE;

------------------------------
-- 12) 代表的な CHECK 範囲（service_role で RLS回避）
------------------------------
SET LOCAL ROLE service_role;

-- bot_personas.warmth 0..100
SELECT throws_like($$
  INSERT INTO public.bot_personas (name, warmth)
  VALUES ('bad warmth', 200)
$$, '%violates check constraint "bot_personas_warmth_check"%', 'bot_personas.warmth range enforced');

-- sessions.temperature 0..2
SELECT throws_like($$
  INSERT INTO public.sessions (user_id, temperature)
  VALUES (current_setting('test.u1')::uuid, 2.50)
$$, '%violates check constraint "sessions_temperature_check"%', 'sessions.temperature range enforced');

RESET ROLE;

------------------------------
-- 終了
------------------------------
SELECT * FROM finish();
ROLLBACK;