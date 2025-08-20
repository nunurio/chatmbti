create extension if not exists "citext" with schema "public";

create type "public"."mbti_axis" as enum ('EI', 'SN', 'TF', 'JP');

create type "public"."mbti_code" as enum ('INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP');

create type "public"."message_role" as enum ('user', 'assistant', 'system', 'tool');

create type "public"."role_type" as enum ('user', 'admin');

create type "public"."session_status" as enum ('active', 'archived');

create type "public"."visibility" as enum ('private', 'public');


  create table "public"."bot_personas" (
    "id" uuid not null default gen_random_uuid(),
    "owner_id" uuid,
    "name" text not null,
    "description" text,
    "mbti_type" mbti_code,
    "warmth" smallint not null default 50,
    "formality" smallint not null default 50,
    "brevity" smallint not null default 50,
    "humor" smallint not null default 50,
    "empathy" smallint not null default 50,
    "assertiveness" smallint not null default 50,
    "creativity" smallint not null default 50,
    "rigor" smallint not null default 50,
    "emoji_usage" smallint not null default 25,
    "steps" smallint not null default 1,
    "visibility" visibility not null default 'private'::visibility,
    "system_prompt_template" text,
    "version" integer not null default 1,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."bot_personas" enable row level security;


  create table "public"."mbti_answers" (
    "id" uuid not null default gen_random_uuid(),
    "test_id" uuid not null,
    "question_id" uuid not null,
    "score" smallint not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."mbti_answers" enable row level security;


  create table "public"."mbti_compatibilities" (
    "type_a" mbti_code not null,
    "type_b" mbti_code not null,
    "score" smallint not null
      );


alter table "public"."mbti_compatibilities" enable row level security;


  create table "public"."mbti_questions" (
    "id" uuid not null default gen_random_uuid(),
    "code" text,
    "text" text not null,
    "axis" mbti_axis not null,
    "direction" smallint not null default 1,
    "order" integer not null,
    "locale" text not null default 'ja'::text,
    "is_active" boolean not null default true,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."mbti_questions" enable row level security;


  create table "public"."mbti_tests" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "started_at" timestamp with time zone not null default now(),
    "completed_at" timestamp with time zone,
    "status" text not null default 'in_progress'::text,
    "determined_type" mbti_code,
    "scores" jsonb,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."mbti_tests" enable row level security;


  create table "public"."message_feedback" (
    "id" uuid not null default gen_random_uuid(),
    "message_id" uuid not null,
    "user_id" uuid not null,
    "rating" smallint not null,
    "reason" text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."message_feedback" enable row level security;


  create table "public"."messages" (
    "id" uuid not null default gen_random_uuid(),
    "session_id" uuid not null,
    "role" message_role not null,
    "content" text not null,
    "content_json" jsonb,
    "model" text,
    "tokens_prompt" integer,
    "tokens_completion" integer,
    "error" text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."messages" enable row level security;


  create table "public"."profiles" (
    "id" uuid not null,
    "handle" citext,
    "display_name" text,
    "avatar_url" text,
    "mbti_type" mbti_code,
    "bio" text,
    "preferences" jsonb not null default '{}'::jsonb,
    "is_public" boolean not null default false,
    "last_seen_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."profiles" enable row level security;


  create table "public"."sessions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "persona_id" uuid,
    "title" text,
    "model" text,
    "temperature" numeric(3,2) not null default 0.70,
    "status" session_status not null default 'active'::session_status,
    "message_count" integer not null default 0,
    "last_message_at" timestamp with time zone,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    "deleted_at" timestamp with time zone
      );


alter table "public"."sessions" enable row level security;


  create table "public"."sse_events" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "session_id" uuid,
    "event_type" text not null,
    "detail" text,
    "request_id" text,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."sse_events" enable row level security;


  create table "public"."user_roles" (
    "user_id" uuid not null,
    "role" role_type not null,
    "created_at" timestamp with time zone not null default now()
      );


alter table "public"."user_roles" enable row level security;

CREATE UNIQUE INDEX bot_personas_pkey ON public.bot_personas USING btree (id);

CREATE INDEX idx_bot_personas_owner ON public.bot_personas USING btree (owner_id);

CREATE INDEX idx_bot_personas_visibility ON public.bot_personas USING btree (visibility);

CREATE INDEX idx_mbti_answers_test ON public.mbti_answers USING btree (test_id);

CREATE INDEX idx_mbti_tests_user_created ON public.mbti_tests USING btree (user_id, created_at DESC);

CREATE INDEX idx_messages_session_created ON public.messages USING btree (session_id, created_at);

CREATE INDEX idx_messages_session_id ON public.messages USING btree (session_id, id);

CREATE INDEX idx_sessions_persona ON public.sessions USING btree (persona_id);

CREATE INDEX idx_sessions_user_created ON public.sessions USING btree (user_id, created_at DESC);

CREATE INDEX idx_sse_events_user_created ON public.sse_events USING btree (user_id, created_at DESC);

CREATE UNIQUE INDEX mbti_answers_pkey ON public.mbti_answers USING btree (id);

CREATE UNIQUE INDEX mbti_answers_test_id_question_id_key ON public.mbti_answers USING btree (test_id, question_id);

CREATE UNIQUE INDEX mbti_compatibilities_pkey ON public.mbti_compatibilities USING btree (type_a, type_b);

CREATE UNIQUE INDEX mbti_questions_code_key ON public.mbti_questions USING btree (code);

CREATE UNIQUE INDEX mbti_questions_pkey ON public.mbti_questions USING btree (id);

CREATE UNIQUE INDEX mbti_tests_pkey ON public.mbti_tests USING btree (id);

CREATE UNIQUE INDEX message_feedback_message_id_user_id_key ON public.message_feedback USING btree (message_id, user_id);

CREATE UNIQUE INDEX message_feedback_pkey ON public.message_feedback USING btree (id);

CREATE UNIQUE INDEX messages_pkey ON public.messages USING btree (id);

CREATE UNIQUE INDEX profiles_handle_key ON public.profiles USING btree (handle);

CREATE UNIQUE INDEX profiles_pkey ON public.profiles USING btree (id);

CREATE UNIQUE INDEX sessions_pkey ON public.sessions USING btree (id);

CREATE UNIQUE INDEX sse_events_pkey ON public.sse_events USING btree (id);

CREATE UNIQUE INDEX user_roles_pkey ON public.user_roles USING btree (user_id, role);

alter table "public"."bot_personas" add constraint "bot_personas_pkey" PRIMARY KEY using index "bot_personas_pkey";

alter table "public"."mbti_answers" add constraint "mbti_answers_pkey" PRIMARY KEY using index "mbti_answers_pkey";

alter table "public"."mbti_compatibilities" add constraint "mbti_compatibilities_pkey" PRIMARY KEY using index "mbti_compatibilities_pkey";

alter table "public"."mbti_questions" add constraint "mbti_questions_pkey" PRIMARY KEY using index "mbti_questions_pkey";

alter table "public"."mbti_tests" add constraint "mbti_tests_pkey" PRIMARY KEY using index "mbti_tests_pkey";

alter table "public"."message_feedback" add constraint "message_feedback_pkey" PRIMARY KEY using index "message_feedback_pkey";

alter table "public"."messages" add constraint "messages_pkey" PRIMARY KEY using index "messages_pkey";

alter table "public"."profiles" add constraint "profiles_pkey" PRIMARY KEY using index "profiles_pkey";

alter table "public"."sessions" add constraint "sessions_pkey" PRIMARY KEY using index "sessions_pkey";

alter table "public"."sse_events" add constraint "sse_events_pkey" PRIMARY KEY using index "sse_events_pkey";

alter table "public"."user_roles" add constraint "user_roles_pkey" PRIMARY KEY using index "user_roles_pkey";

alter table "public"."bot_personas" add constraint "bot_personas_assertiveness_check" CHECK (((assertiveness >= 0) AND (assertiveness <= 100))) not valid;

alter table "public"."bot_personas" validate constraint "bot_personas_assertiveness_check";

alter table "public"."bot_personas" add constraint "bot_personas_brevity_check" CHECK (((brevity >= 0) AND (brevity <= 100))) not valid;

alter table "public"."bot_personas" validate constraint "bot_personas_brevity_check";

alter table "public"."bot_personas" add constraint "bot_personas_creativity_check" CHECK (((creativity >= 0) AND (creativity <= 100))) not valid;

alter table "public"."bot_personas" validate constraint "bot_personas_creativity_check";

alter table "public"."bot_personas" add constraint "bot_personas_emoji_usage_check" CHECK (((emoji_usage >= 0) AND (emoji_usage <= 100))) not valid;

alter table "public"."bot_personas" validate constraint "bot_personas_emoji_usage_check";

alter table "public"."bot_personas" add constraint "bot_personas_empathy_check" CHECK (((empathy >= 0) AND (empathy <= 100))) not valid;

alter table "public"."bot_personas" validate constraint "bot_personas_empathy_check";

alter table "public"."bot_personas" add constraint "bot_personas_formality_check" CHECK (((formality >= 0) AND (formality <= 100))) not valid;

alter table "public"."bot_personas" validate constraint "bot_personas_formality_check";

alter table "public"."bot_personas" add constraint "bot_personas_humor_check" CHECK (((humor >= 0) AND (humor <= 100))) not valid;

alter table "public"."bot_personas" validate constraint "bot_personas_humor_check";

alter table "public"."bot_personas" add constraint "bot_personas_owner_id_fkey" FOREIGN KEY (owner_id) REFERENCES auth.users(id) ON DELETE SET NULL not valid;

alter table "public"."bot_personas" validate constraint "bot_personas_owner_id_fkey";

alter table "public"."bot_personas" add constraint "bot_personas_rigor_check" CHECK (((rigor >= 0) AND (rigor <= 100))) not valid;

alter table "public"."bot_personas" validate constraint "bot_personas_rigor_check";

alter table "public"."bot_personas" add constraint "bot_personas_steps_check" CHECK (((steps >= 1) AND (steps <= 20))) not valid;

alter table "public"."bot_personas" validate constraint "bot_personas_steps_check";

alter table "public"."bot_personas" add constraint "bot_personas_warmth_check" CHECK (((warmth >= 0) AND (warmth <= 100))) not valid;

alter table "public"."bot_personas" validate constraint "bot_personas_warmth_check";

alter table "public"."mbti_answers" add constraint "mbti_answers_question_id_fkey" FOREIGN KEY (question_id) REFERENCES mbti_questions(id) ON DELETE RESTRICT not valid;

alter table "public"."mbti_answers" validate constraint "mbti_answers_question_id_fkey";

alter table "public"."mbti_answers" add constraint "mbti_answers_score_check" CHECK (((score >= 1) AND (score <= 7))) not valid;

alter table "public"."mbti_answers" validate constraint "mbti_answers_score_check";

alter table "public"."mbti_answers" add constraint "mbti_answers_test_id_fkey" FOREIGN KEY (test_id) REFERENCES mbti_tests(id) ON DELETE CASCADE not valid;

alter table "public"."mbti_answers" validate constraint "mbti_answers_test_id_fkey";

alter table "public"."mbti_answers" add constraint "mbti_answers_test_id_question_id_key" UNIQUE using index "mbti_answers_test_id_question_id_key";

alter table "public"."mbti_compatibilities" add constraint "mbti_compatibilities_score_check" CHECK (((score >= 0) AND (score <= 100))) not valid;

alter table "public"."mbti_compatibilities" validate constraint "mbti_compatibilities_score_check";

alter table "public"."mbti_questions" add constraint "mbti_questions_code_key" UNIQUE using index "mbti_questions_code_key";

alter table "public"."mbti_questions" add constraint "mbti_questions_direction_check" CHECK ((direction = ANY (ARRAY['-1'::integer, 1]))) not valid;

alter table "public"."mbti_questions" validate constraint "mbti_questions_direction_check";

alter table "public"."mbti_tests" add constraint "mbti_tests_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."mbti_tests" validate constraint "mbti_tests_user_id_fkey";

alter table "public"."message_feedback" add constraint "message_feedback_message_id_fkey" FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE not valid;

alter table "public"."message_feedback" validate constraint "message_feedback_message_id_fkey";

alter table "public"."message_feedback" add constraint "message_feedback_message_id_user_id_key" UNIQUE using index "message_feedback_message_id_user_id_key";

alter table "public"."message_feedback" add constraint "message_feedback_rating_check" CHECK ((rating = ANY (ARRAY['-1'::integer, 1]))) not valid;

alter table "public"."message_feedback" validate constraint "message_feedback_rating_check";

alter table "public"."message_feedback" add constraint "message_feedback_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."message_feedback" validate constraint "message_feedback_user_id_fkey";

alter table "public"."messages" add constraint "messages_session_id_fkey" FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE not valid;

alter table "public"."messages" validate constraint "messages_session_id_fkey";

alter table "public"."profiles" add constraint "profiles_handle_key" UNIQUE using index "profiles_handle_key";

alter table "public"."profiles" add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."profiles" validate constraint "profiles_id_fkey";

alter table "public"."sessions" add constraint "sessions_persona_id_fkey" FOREIGN KEY (persona_id) REFERENCES bot_personas(id) ON DELETE SET NULL not valid;

alter table "public"."sessions" validate constraint "sessions_persona_id_fkey";

alter table "public"."sessions" add constraint "sessions_temperature_check" CHECK (((temperature >= (0)::numeric) AND (temperature <= (2)::numeric))) not valid;

alter table "public"."sessions" validate constraint "sessions_temperature_check";

alter table "public"."sessions" add constraint "sessions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."sessions" validate constraint "sessions_user_id_fkey";

alter table "public"."sse_events" add constraint "sse_events_event_type_check" CHECK ((event_type = ANY (ARRAY['start'::text, 'end'::text, 'interrupt'::text, 'error'::text]))) not valid;

alter table "public"."sse_events" validate constraint "sse_events_event_type_check";

alter table "public"."sse_events" add constraint "sse_events_session_id_fkey" FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL not valid;

alter table "public"."sse_events" validate constraint "sse_events_session_id_fkey";

alter table "public"."sse_events" add constraint "sse_events_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."sse_events" validate constraint "sse_events_user_id_fkey";

alter table "public"."user_roles" add constraint "user_roles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."user_roles" validate constraint "user_roles_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.bump_session_on_message()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  update sessions
     set message_count = message_count + 1,
         last_message_at = now(),
         updated_at = now()
   where id = new.session_id;
  return new;
end $function$
;

CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1 from user_roles
    where user_id = auth.uid() and role = 'admin'
  );
$function$
;

CREATE OR REPLACE FUNCTION public.post_user_message(p_session_id uuid, p_content text)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
declare
  new_id uuid;
begin
  -- RLS により: セッション所有者のみ insert 可
  insert into messages (id, session_id, role, content)
  values (gen_random_uuid(), p_session_id, 'user', p_content)
  returning id into new_id;
  return new_id;
end $function$
;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at := now();
  return new;
end $function$
;

grant delete on table "public"."bot_personas" to "anon";

grant insert on table "public"."bot_personas" to "anon";

grant references on table "public"."bot_personas" to "anon";

grant select on table "public"."bot_personas" to "anon";

grant trigger on table "public"."bot_personas" to "anon";

grant truncate on table "public"."bot_personas" to "anon";

grant update on table "public"."bot_personas" to "anon";

grant delete on table "public"."bot_personas" to "authenticated";

grant insert on table "public"."bot_personas" to "authenticated";

grant references on table "public"."bot_personas" to "authenticated";

grant select on table "public"."bot_personas" to "authenticated";

grant trigger on table "public"."bot_personas" to "authenticated";

grant truncate on table "public"."bot_personas" to "authenticated";

grant update on table "public"."bot_personas" to "authenticated";

grant delete on table "public"."bot_personas" to "service_role";

grant insert on table "public"."bot_personas" to "service_role";

grant references on table "public"."bot_personas" to "service_role";

grant select on table "public"."bot_personas" to "service_role";

grant trigger on table "public"."bot_personas" to "service_role";

grant truncate on table "public"."bot_personas" to "service_role";

grant update on table "public"."bot_personas" to "service_role";

grant delete on table "public"."mbti_answers" to "anon";

grant insert on table "public"."mbti_answers" to "anon";

grant references on table "public"."mbti_answers" to "anon";

grant select on table "public"."mbti_answers" to "anon";

grant trigger on table "public"."mbti_answers" to "anon";

grant truncate on table "public"."mbti_answers" to "anon";

grant update on table "public"."mbti_answers" to "anon";

grant delete on table "public"."mbti_answers" to "authenticated";

grant insert on table "public"."mbti_answers" to "authenticated";

grant references on table "public"."mbti_answers" to "authenticated";

grant select on table "public"."mbti_answers" to "authenticated";

grant trigger on table "public"."mbti_answers" to "authenticated";

grant truncate on table "public"."mbti_answers" to "authenticated";

grant update on table "public"."mbti_answers" to "authenticated";

grant delete on table "public"."mbti_answers" to "service_role";

grant insert on table "public"."mbti_answers" to "service_role";

grant references on table "public"."mbti_answers" to "service_role";

grant select on table "public"."mbti_answers" to "service_role";

grant trigger on table "public"."mbti_answers" to "service_role";

grant truncate on table "public"."mbti_answers" to "service_role";

grant update on table "public"."mbti_answers" to "service_role";

grant delete on table "public"."mbti_compatibilities" to "anon";

grant insert on table "public"."mbti_compatibilities" to "anon";

grant references on table "public"."mbti_compatibilities" to "anon";

grant select on table "public"."mbti_compatibilities" to "anon";

grant trigger on table "public"."mbti_compatibilities" to "anon";

grant truncate on table "public"."mbti_compatibilities" to "anon";

grant update on table "public"."mbti_compatibilities" to "anon";

grant delete on table "public"."mbti_compatibilities" to "authenticated";

grant insert on table "public"."mbti_compatibilities" to "authenticated";

grant references on table "public"."mbti_compatibilities" to "authenticated";

grant select on table "public"."mbti_compatibilities" to "authenticated";

grant trigger on table "public"."mbti_compatibilities" to "authenticated";

grant truncate on table "public"."mbti_compatibilities" to "authenticated";

grant update on table "public"."mbti_compatibilities" to "authenticated";

grant delete on table "public"."mbti_compatibilities" to "service_role";

grant insert on table "public"."mbti_compatibilities" to "service_role";

grant references on table "public"."mbti_compatibilities" to "service_role";

grant select on table "public"."mbti_compatibilities" to "service_role";

grant trigger on table "public"."mbti_compatibilities" to "service_role";

grant truncate on table "public"."mbti_compatibilities" to "service_role";

grant update on table "public"."mbti_compatibilities" to "service_role";

grant delete on table "public"."mbti_questions" to "anon";

grant insert on table "public"."mbti_questions" to "anon";

grant references on table "public"."mbti_questions" to "anon";

grant select on table "public"."mbti_questions" to "anon";

grant trigger on table "public"."mbti_questions" to "anon";

grant truncate on table "public"."mbti_questions" to "anon";

grant update on table "public"."mbti_questions" to "anon";

grant delete on table "public"."mbti_questions" to "authenticated";

grant insert on table "public"."mbti_questions" to "authenticated";

grant references on table "public"."mbti_questions" to "authenticated";

grant select on table "public"."mbti_questions" to "authenticated";

grant trigger on table "public"."mbti_questions" to "authenticated";

grant truncate on table "public"."mbti_questions" to "authenticated";

grant update on table "public"."mbti_questions" to "authenticated";

grant delete on table "public"."mbti_questions" to "service_role";

grant insert on table "public"."mbti_questions" to "service_role";

grant references on table "public"."mbti_questions" to "service_role";

grant select on table "public"."mbti_questions" to "service_role";

grant trigger on table "public"."mbti_questions" to "service_role";

grant truncate on table "public"."mbti_questions" to "service_role";

grant update on table "public"."mbti_questions" to "service_role";

grant delete on table "public"."mbti_tests" to "anon";

grant insert on table "public"."mbti_tests" to "anon";

grant references on table "public"."mbti_tests" to "anon";

grant select on table "public"."mbti_tests" to "anon";

grant trigger on table "public"."mbti_tests" to "anon";

grant truncate on table "public"."mbti_tests" to "anon";

grant update on table "public"."mbti_tests" to "anon";

grant delete on table "public"."mbti_tests" to "authenticated";

grant insert on table "public"."mbti_tests" to "authenticated";

grant references on table "public"."mbti_tests" to "authenticated";

grant select on table "public"."mbti_tests" to "authenticated";

grant trigger on table "public"."mbti_tests" to "authenticated";

grant truncate on table "public"."mbti_tests" to "authenticated";

grant update on table "public"."mbti_tests" to "authenticated";

grant delete on table "public"."mbti_tests" to "service_role";

grant insert on table "public"."mbti_tests" to "service_role";

grant references on table "public"."mbti_tests" to "service_role";

grant select on table "public"."mbti_tests" to "service_role";

grant trigger on table "public"."mbti_tests" to "service_role";

grant truncate on table "public"."mbti_tests" to "service_role";

grant update on table "public"."mbti_tests" to "service_role";

grant delete on table "public"."message_feedback" to "anon";

grant insert on table "public"."message_feedback" to "anon";

grant references on table "public"."message_feedback" to "anon";

grant select on table "public"."message_feedback" to "anon";

grant trigger on table "public"."message_feedback" to "anon";

grant truncate on table "public"."message_feedback" to "anon";

grant update on table "public"."message_feedback" to "anon";

grant delete on table "public"."message_feedback" to "authenticated";

grant insert on table "public"."message_feedback" to "authenticated";

grant references on table "public"."message_feedback" to "authenticated";

grant select on table "public"."message_feedback" to "authenticated";

grant trigger on table "public"."message_feedback" to "authenticated";

grant truncate on table "public"."message_feedback" to "authenticated";

grant update on table "public"."message_feedback" to "authenticated";

grant delete on table "public"."message_feedback" to "service_role";

grant insert on table "public"."message_feedback" to "service_role";

grant references on table "public"."message_feedback" to "service_role";

grant select on table "public"."message_feedback" to "service_role";

grant trigger on table "public"."message_feedback" to "service_role";

grant truncate on table "public"."message_feedback" to "service_role";

grant update on table "public"."message_feedback" to "service_role";

grant delete on table "public"."messages" to "anon";

grant insert on table "public"."messages" to "anon";

grant references on table "public"."messages" to "anon";

grant select on table "public"."messages" to "anon";

grant trigger on table "public"."messages" to "anon";

grant truncate on table "public"."messages" to "anon";

grant update on table "public"."messages" to "anon";

grant delete on table "public"."messages" to "authenticated";

grant insert on table "public"."messages" to "authenticated";

grant references on table "public"."messages" to "authenticated";

grant select on table "public"."messages" to "authenticated";

grant trigger on table "public"."messages" to "authenticated";

grant truncate on table "public"."messages" to "authenticated";

grant update on table "public"."messages" to "authenticated";

grant delete on table "public"."messages" to "service_role";

grant insert on table "public"."messages" to "service_role";

grant references on table "public"."messages" to "service_role";

grant select on table "public"."messages" to "service_role";

grant trigger on table "public"."messages" to "service_role";

grant truncate on table "public"."messages" to "service_role";

grant update on table "public"."messages" to "service_role";

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant references on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant trigger on table "public"."profiles" to "anon";

grant truncate on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant references on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant trigger on table "public"."profiles" to "authenticated";

grant truncate on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant references on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant trigger on table "public"."profiles" to "service_role";

grant truncate on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";

grant delete on table "public"."sessions" to "anon";

grant insert on table "public"."sessions" to "anon";

grant references on table "public"."sessions" to "anon";

grant select on table "public"."sessions" to "anon";

grant trigger on table "public"."sessions" to "anon";

grant truncate on table "public"."sessions" to "anon";

grant update on table "public"."sessions" to "anon";

grant delete on table "public"."sessions" to "authenticated";

grant insert on table "public"."sessions" to "authenticated";

grant references on table "public"."sessions" to "authenticated";

grant select on table "public"."sessions" to "authenticated";

grant trigger on table "public"."sessions" to "authenticated";

grant truncate on table "public"."sessions" to "authenticated";

grant update on table "public"."sessions" to "authenticated";

grant delete on table "public"."sessions" to "service_role";

grant insert on table "public"."sessions" to "service_role";

grant references on table "public"."sessions" to "service_role";

grant select on table "public"."sessions" to "service_role";

grant trigger on table "public"."sessions" to "service_role";

grant truncate on table "public"."sessions" to "service_role";

grant update on table "public"."sessions" to "service_role";

grant delete on table "public"."sse_events" to "anon";

grant insert on table "public"."sse_events" to "anon";

grant references on table "public"."sse_events" to "anon";

grant select on table "public"."sse_events" to "anon";

grant trigger on table "public"."sse_events" to "anon";

grant truncate on table "public"."sse_events" to "anon";

grant update on table "public"."sse_events" to "anon";

grant delete on table "public"."sse_events" to "authenticated";

grant insert on table "public"."sse_events" to "authenticated";

grant references on table "public"."sse_events" to "authenticated";

grant select on table "public"."sse_events" to "authenticated";

grant trigger on table "public"."sse_events" to "authenticated";

grant truncate on table "public"."sse_events" to "authenticated";

grant update on table "public"."sse_events" to "authenticated";

grant delete on table "public"."sse_events" to "service_role";

grant insert on table "public"."sse_events" to "service_role";

grant references on table "public"."sse_events" to "service_role";

grant select on table "public"."sse_events" to "service_role";

grant trigger on table "public"."sse_events" to "service_role";

grant truncate on table "public"."sse_events" to "service_role";

grant update on table "public"."sse_events" to "service_role";

grant delete on table "public"."user_roles" to "anon";

grant insert on table "public"."user_roles" to "anon";

grant references on table "public"."user_roles" to "anon";

grant select on table "public"."user_roles" to "anon";

grant trigger on table "public"."user_roles" to "anon";

grant truncate on table "public"."user_roles" to "anon";

grant update on table "public"."user_roles" to "anon";

grant delete on table "public"."user_roles" to "authenticated";

grant insert on table "public"."user_roles" to "authenticated";

grant references on table "public"."user_roles" to "authenticated";

grant select on table "public"."user_roles" to "authenticated";

grant trigger on table "public"."user_roles" to "authenticated";

grant truncate on table "public"."user_roles" to "authenticated";

grant update on table "public"."user_roles" to "authenticated";

grant delete on table "public"."user_roles" to "service_role";

grant insert on table "public"."user_roles" to "service_role";

grant references on table "public"."user_roles" to "service_role";

grant select on table "public"."user_roles" to "service_role";

grant trigger on table "public"."user_roles" to "service_role";

grant truncate on table "public"."user_roles" to "service_role";

grant update on table "public"."user_roles" to "service_role";


  create policy "bot_personas_admin_all"
  on "public"."bot_personas"
  as permissive
  for all
  to authenticated
using (is_admin())
with check (is_admin());



  create policy "bot_personas_delete_owner"
  on "public"."bot_personas"
  as permissive
  for delete
  to authenticated
using ((owner_id = auth.uid()));



  create policy "bot_personas_insert_owner"
  on "public"."bot_personas"
  as permissive
  for insert
  to authenticated
with check ((owner_id = auth.uid()));



  create policy "bot_personas_select_public_or_owner"
  on "public"."bot_personas"
  as permissive
  for select
  to authenticated
using (((visibility = 'public'::visibility) OR (owner_id = auth.uid())));



  create policy "bot_personas_update_owner"
  on "public"."bot_personas"
  as permissive
  for update
  to authenticated
using ((owner_id = auth.uid()))
with check ((owner_id = auth.uid()));



  create policy "mbti_answers_insert_owner"
  on "public"."mbti_answers"
  as permissive
  for insert
  to authenticated
with check ((EXISTS ( SELECT 1
   FROM mbti_tests t
  WHERE ((t.id = mbti_answers.test_id) AND (t.user_id = auth.uid())))));



  create policy "mbti_answers_rw_owner"
  on "public"."mbti_answers"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM mbti_tests t
  WHERE ((t.id = mbti_answers.test_id) AND (t.user_id = auth.uid())))));



  create policy "mbti_compat_admin_write"
  on "public"."mbti_compatibilities"
  as permissive
  for all
  to authenticated
using (is_admin())
with check (is_admin());



  create policy "mbti_compat_select_all"
  on "public"."mbti_compatibilities"
  as permissive
  for select
  to authenticated
using (true);



  create policy "mbti_questions_admin_write"
  on "public"."mbti_questions"
  as permissive
  for all
  to authenticated
using (is_admin())
with check (is_admin());



  create policy "mbti_questions_select_all"
  on "public"."mbti_questions"
  as permissive
  for select
  to authenticated
using (true);



  create policy "mbti_tests_insert_owner"
  on "public"."mbti_tests"
  as permissive
  for insert
  to authenticated
with check ((user_id = auth.uid()));



  create policy "mbti_tests_rw_owner"
  on "public"."mbti_tests"
  as permissive
  for select
  to authenticated
using ((user_id = auth.uid()));



  create policy "mbti_tests_update_owner"
  on "public"."mbti_tests"
  as permissive
  for update
  to authenticated
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));



  create policy "message_feedback_insert_owner"
  on "public"."message_feedback"
  as permissive
  for insert
  to authenticated
with check ((user_id = auth.uid()));



  create policy "message_feedback_rw_owner"
  on "public"."message_feedback"
  as permissive
  for select
  to authenticated
using ((user_id = auth.uid()));



  create policy "messages_insert_user_role_only"
  on "public"."messages"
  as permissive
  for insert
  to authenticated
with check (((role = 'user'::message_role) AND (EXISTS ( SELECT 1
   FROM sessions s
  WHERE ((s.id = messages.session_id) AND (s.user_id = auth.uid()))))));



  create policy "messages_select_session_owner"
  on "public"."messages"
  as permissive
  for select
  to authenticated
using ((EXISTS ( SELECT 1
   FROM sessions s
  WHERE ((s.id = messages.session_id) AND (s.user_id = auth.uid())))));



  create policy "profiles_admin_select_all"
  on "public"."profiles"
  as permissive
  for select
  to authenticated
using (is_admin());



  create policy "profiles_insert_self"
  on "public"."profiles"
  as permissive
  for insert
  to authenticated
with check ((id = auth.uid()));



  create policy "profiles_select_owner_or_public"
  on "public"."profiles"
  as permissive
  for select
  to authenticated
using (((id = auth.uid()) OR is_public));



  create policy "profiles_update_owner"
  on "public"."profiles"
  as permissive
  for update
  to authenticated
using ((id = auth.uid()))
with check ((id = auth.uid()));



  create policy "sessions_delete_owner"
  on "public"."sessions"
  as permissive
  for delete
  to authenticated
using ((user_id = auth.uid()));



  create policy "sessions_insert_owner"
  on "public"."sessions"
  as permissive
  for insert
  to authenticated
with check ((user_id = auth.uid()));



  create policy "sessions_select_owner"
  on "public"."sessions"
  as permissive
  for select
  to authenticated
using ((user_id = auth.uid()));



  create policy "sessions_update_owner"
  on "public"."sessions"
  as permissive
  for update
  to authenticated
using ((user_id = auth.uid()))
with check ((user_id = auth.uid()));



  create policy "sse_events_admin_read_all"
  on "public"."sse_events"
  as permissive
  for select
  to authenticated
using (is_admin());



  create policy "sse_events_insert_owner"
  on "public"."sse_events"
  as permissive
  for insert
  to authenticated
with check ((user_id = auth.uid()));



  create policy "sse_events_select_owner"
  on "public"."sse_events"
  as permissive
  for select
  to authenticated
using ((user_id = auth.uid()));



  create policy "user_roles_admin_read"
  on "public"."user_roles"
  as permissive
  for select
  to authenticated
using (is_admin());


CREATE TRIGGER trg_bot_personas_updated_at BEFORE UPDATE ON public.bot_personas FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_mbti_questions_updated_at BEFORE UPDATE ON public.mbti_questions FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_mbti_tests_updated_at BEFORE UPDATE ON public.mbti_tests FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_messages_after_insert AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION bump_session_on_message();

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_sessions_updated_at BEFORE UPDATE ON public.sessions FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- 最小限の関数EXECUTE権限（既存関数のみ）
grant execute on function public.is_admin() to authenticated;
grant execute on function public.post_user_message(uuid, text) to authenticated;