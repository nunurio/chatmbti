revoke delete on table "public"."bot_personas" from "anon";

revoke insert on table "public"."bot_personas" from "anon";

revoke references on table "public"."bot_personas" from "anon";

revoke select on table "public"."bot_personas" from "anon";

revoke trigger on table "public"."bot_personas" from "anon";

revoke truncate on table "public"."bot_personas" from "anon";

revoke update on table "public"."bot_personas" from "anon";

revoke delete on table "public"."mbti_answers" from "anon";

revoke insert on table "public"."mbti_answers" from "anon";

revoke references on table "public"."mbti_answers" from "anon";

revoke select on table "public"."mbti_answers" from "anon";

revoke trigger on table "public"."mbti_answers" from "anon";

revoke truncate on table "public"."mbti_answers" from "anon";

revoke update on table "public"."mbti_answers" from "anon";

revoke delete on table "public"."mbti_compatibilities" from "anon";

revoke insert on table "public"."mbti_compatibilities" from "anon";

revoke references on table "public"."mbti_compatibilities" from "anon";

revoke select on table "public"."mbti_compatibilities" from "anon";

revoke trigger on table "public"."mbti_compatibilities" from "anon";

revoke truncate on table "public"."mbti_compatibilities" from "anon";

revoke update on table "public"."mbti_compatibilities" from "anon";

revoke delete on table "public"."mbti_questions" from "anon";

revoke insert on table "public"."mbti_questions" from "anon";

revoke references on table "public"."mbti_questions" from "anon";

revoke select on table "public"."mbti_questions" from "anon";

revoke trigger on table "public"."mbti_questions" from "anon";

revoke truncate on table "public"."mbti_questions" from "anon";

revoke update on table "public"."mbti_questions" from "anon";

revoke delete on table "public"."mbti_tests" from "anon";

revoke insert on table "public"."mbti_tests" from "anon";

revoke references on table "public"."mbti_tests" from "anon";

revoke select on table "public"."mbti_tests" from "anon";

revoke trigger on table "public"."mbti_tests" from "anon";

revoke truncate on table "public"."mbti_tests" from "anon";

revoke update on table "public"."mbti_tests" from "anon";

revoke delete on table "public"."message_feedback" from "anon";

revoke insert on table "public"."message_feedback" from "anon";

revoke references on table "public"."message_feedback" from "anon";

revoke select on table "public"."message_feedback" from "anon";

revoke trigger on table "public"."message_feedback" from "anon";

revoke truncate on table "public"."message_feedback" from "anon";

revoke update on table "public"."message_feedback" from "anon";

revoke delete on table "public"."messages" from "anon";

revoke insert on table "public"."messages" from "anon";

revoke references on table "public"."messages" from "anon";

revoke select on table "public"."messages" from "anon";

revoke trigger on table "public"."messages" from "anon";

revoke truncate on table "public"."messages" from "anon";

revoke update on table "public"."messages" from "anon";

revoke delete on table "public"."profiles" from "anon";

revoke insert on table "public"."profiles" from "anon";

revoke references on table "public"."profiles" from "anon";

revoke select on table "public"."profiles" from "anon";

revoke trigger on table "public"."profiles" from "anon";

revoke truncate on table "public"."profiles" from "anon";

revoke update on table "public"."profiles" from "anon";

revoke delete on table "public"."sessions" from "anon";

revoke insert on table "public"."sessions" from "anon";

revoke references on table "public"."sessions" from "anon";

revoke select on table "public"."sessions" from "anon";

revoke trigger on table "public"."sessions" from "anon";

revoke truncate on table "public"."sessions" from "anon";

revoke update on table "public"."sessions" from "anon";

revoke delete on table "public"."sse_events" from "anon";

revoke insert on table "public"."sse_events" from "anon";

revoke references on table "public"."sse_events" from "anon";

revoke select on table "public"."sse_events" from "anon";

revoke trigger on table "public"."sse_events" from "anon";

revoke truncate on table "public"."sse_events" from "anon";

revoke update on table "public"."sse_events" from "anon";

revoke delete on table "public"."user_roles" from "anon";

revoke insert on table "public"."user_roles" from "anon";

revoke references on table "public"."user_roles" from "anon";

revoke select on table "public"."user_roles" from "anon";

revoke trigger on table "public"."user_roles" from "anon";

revoke truncate on table "public"."user_roles" from "anon";

revoke update on table "public"."user_roles" from "anon";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  -- clock_timestamp() はトランザクション中でも単調増加
  new.updated_at := clock_timestamp();
  return new;
end $function$
;


