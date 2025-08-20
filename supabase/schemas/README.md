# Supabase スキーマファイル構造

このディレクトリには、Supabaseデータベースのスキーマ定義を論理的なグループに分割したファイルが含まれています。

## ファイル構成

- **01-base.sql** - 基本設定
  - PostgreSQL拡張機能 (pgcrypto, citext)
  - ENUM型定義 (mbti_code, message_role, session_status, visibility, role_type, mbti_axis)
  - ユーティリティ関数 (set_updated_at)

- **02-users.sql** - ユーザー管理
  - profiles テーブル
  - user_roles テーブル
  - is_admin() 管理者判定関数

- **03-bot-personas.sql** - ボット・ペルソナ管理
  - bot_personas テーブル
  - 性格パラメータ設定

- **04-sessions.sql** - チャットセッション管理
  - sessions テーブル
  - messages テーブル
  - message_feedback テーブル
  - sse_events テーブル
  - post_user_message() RPC関数

- **05-mbti.sql** - MBTI診断機能
  - mbti_questions テーブル
  - mbti_tests テーブル
  - mbti_answers テーブル
  - mbti_compatibilities テーブル

- **06-rls-policies.sql** - Row Level Security ポリシー
  - 全テーブルのRLSポリシー定義

- **index.sql** - メイン統合ファイル
  - 全ファイルを正しい順序で実行

## 使用方法

### 全スキーマの適用
```sql
-- Supabase SQLエディタで実行
\i 'supabase/schemas/index.sql'
```

### 個別ファイルの適用
依存関係に注意して、必要なファイルを順番に実行してください：
```sql
-- 例：ユーザー関連のみ更新する場合
\i 'supabase/schemas/01-base.sql'  -- 必須：基本設定
\i 'supabase/schemas/02-users.sql'  -- ユーザーテーブル
\i 'supabase/schemas/06-rls-policies.sql'  -- RLSポリシー
```

## 注意事項

1. **依存関係**: ファイルは番号順に依存関係があります。必ず順番通りに実行してください。
2. **RLSポリシー**: `06-rls-policies.sql`は他のテーブル定義の後に実行する必要があります。
3. **既存データ**: スキーマ変更時は、既存データへの影響を考慮してください。
4. **Service Role Key**: `post_user_message()`以外のデータ挿入（assistant/systemメッセージ）にはService Role Keyが必要です。