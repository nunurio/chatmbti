-- ===========================================
-- roles.sql: グローバル権限の初期化（警告回避版）
--
-- 目的:
-- - 既存関数（pg_catalog/拡張由来含む）への一括 GRANT/REVOKE を行わない
-- - 代わりに「今後作成されるオブジェクト」に対するデフォルト権限のみ設定
-- - これにより `no privileges could be revoked/granted` 警告を回避
--
-- 注意:
-- - ここでは既存テーブル/関数への直接 GRANT/REVOKE は行いません
-- - テーブル個別のGRANTはマイグレーション側で必要に応じて設定してください
-- ===========================================

-- 将来作成されるオブジェクトのデフォルト権限を、
-- 「現在のロール」に対してのみ設定する（特定ロール指定はしない）
-- これにより権限不足によるエラーを回避

-- 関数のデフォルト実行権限
alter default privileges in schema public revoke execute on functions from public;
alter default privileges in schema public grant execute on functions to authenticated;
alter default privileges in schema public grant execute on functions to service_role;

-- テーブルのデフォルト権限
alter default privileges in schema public revoke all on tables from public;
alter default privileges in schema public revoke all on tables from anon;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant all on tables to service_role;

-- シーケンスのデフォルト権限
alter default privileges in schema public revoke all on sequences from public;
alter default privileges in schema public revoke all on sequences from anon;
alter default privileges in schema public grant usage, select on sequences to authenticated;
alter default privileges in schema public grant all on sequences to service_role;


