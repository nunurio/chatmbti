# Supabase データベーススキーマ実装とMBTIチャットボットシステム設計更新

**Date**: 2025-08-19 14:30:45
**Author**: 開発チーム

## Summary

Chat MVPプロジェクトにおけるSupabaseデータベーススキーマの包括的な実装とMBTIチャットボットシステム設計の大幅な更新を実施しました。PostgreSQL拡張機能の有効化、ENUM型の定義、11個のテーブル作成、Row Level Security (RLS)ポリシーの実装、管理者判定関数の作成など、データベース基盤の完全な構築を行いました。また、2025年のベストプラクティスに準拠した技術設計への全面的な改訂も実施しました。

## Changes Made

### データベーススキーマ実装

#### 1. PostgreSQL拡張機能の有効化
- **pgcrypto**: UUIDの生成とハッシュ機能のため
- **citext**: 大文字小文字を区別しないテキスト型のため

#### 2. ENUM型の定義
以下のENUM型を新規作成：
- `mbti_code`: 16のMBTIタイプ（INTJ、INTP、ENTJ等）
- `message_role`: メッセージ役割（user、assistant、system、tool）
- `session_status`: セッション状態（active、archived）
- `visibility`: 可視性設定（private、public）
- `role_type`: ユーザー役割（user、admin）
- `mbti_axis`: MBTI軸（EI、SN、TF、JP）

#### 3. コアテーブルの作成

**プロフィール・権限管理**
- `profiles`: ユーザープロフィール情報（auth.usersと連携）
- `user_roles`: ユーザー権限管理

**ボット・ペルソナシステム**
- `bot_personas`: AIボットの性格設定（10個のパラメータ）
  - warmth, formality, brevity, humor, empathy
  - assertiveness, creativity, rigor, emoji_usage, steps

**チャット機能**
- `sessions`: チャットセッション管理
- `messages`: メッセージ履歴
- `message_feedback`: メッセージ評価機能

**MBTI診断システム**
- `mbti_questions`: 診断設問（多言語対応）
- `mbti_tests`: 診断テスト管理
- `mbti_answers`: 診断回答データ
- `mbti_compatibilities`: MBTIタイプ間の相性スコア

**監視・ログ**
- `sse_events`: SSEストリーミングの監査ログ

#### 4. セキュリティ機能実装

**管理者判定関数**
```sql
create or replace function is_admin()
returns boolean
security definer
set search_path = public
stable
language sql
```
- SECURITY DEFINERによる安全な権限確認
- 認証ユーザーのみアクセス可能

**RPC関数**
```sql
create or replace function post_user_message(p_session_id uuid, p_content text)
returns uuid
```
- クライアントからの安全なメッセージ投稿
- RLSポリシーとの連携

#### 5. Row Level Security (RLS) ポリシー実装

**包括的なRLSポリシー**
- 全11テーブルでRLS有効化
- オーナーシップベースのアクセス制御
- 管理者権限の適切な分離
- メッセージ投稿の制限（クライアントはuser roleのみ）

**主要なポリシー例**
- `profiles`: 自分のプロフィールまたは公開プロフィールのみ参照可能
- `bot_personas`: 公開ボットまたは自分のボットのみアクセス可能
- `sessions/messages`: セッションオーナーのみアクセス可能
- `mbti_questions`: 全認証ユーザーが参照可能、管理者のみ編集可能

### システム設計の大幅更新

#### 1. 2025年ベストプラクティス適用
- **SSR認証**: `@supabase/ssr`によるクッキー連携・自動リフレッシュ
- **型付きSSE**: `event`/`id`/`retry`と15秒ハートビート
- **API堅牢化**: RFC 9457 Problem Details準拠とZodバリデーション
- **レート制限**: `@upstash/ratelimit`によるEdge Middleware実装
- **観測性**: OpenTelemetryによるトレース・指標収集
- **i18n**: `next-intl`によるApp Routerネイティブ多言語対応

#### 2. アーキテクチャ設計の改訂
- Next.js 15 + React 19を基盤とした現代的な構成
- Edge/Middlewareレイヤーの追加
- Vercel AI SDK v5との統合
- 非対称JWT/JWKS対応

#### 3. データフローの詳細化
以下の4つの主要フローを詳細に設計：
- 認証フロー（Magic Link + SSR）
- MBTI診断フロー（1-7スケール統一）
- チャットストリーミングフロー（SSE仕様）
- ローカルデータ移行フロー（チャンク分割対応）

#### 4. APIインターフェース拡張
- 全APIでZodバリデーション実装
- Problem Details形式でのエラー応答統一
- SSE再接続機能（Last-Event-ID対応）
- 分割インポート機能（大規模データ対応）

### セキュリティ強化

#### 1. 認証セキュリティ
- HttpOnly/Secure/SameSiteクッキー管理
- 非対称JWT検証のRLS委譲
- service_roleキーのサーバ専用制限

#### 2. ヘッダーセキュリティ
- Content-Security-Policy実装
- Strict-Transport-Security設定
- X-Frame-Options（DENY）設定

#### 3. レート制限
- IP/ユーザー単位の二段階しきい値
- 429エラーのProblem Details対応

### パフォーマンス要件

#### 1. 性能目標設定
- 初回トークン < 700ms
- トークンレート > 25 tok/s

#### 2. 実装指針
- TransformStreamによるバックプレッシャ対応
- 15秒ハートビートによる接続維持
- OpenTelemetryによる性能監視

#### 3. 可用性設計
- 99.5%可用性目標
- Vercel Edge Functions地理的分散
- Circuit Breaker Pattern実装

## Technical Details

### データベース設計の特徴

**スケーラビリティ**
- UUID主キーによる分散対応
- JSONBフィールドによる柔軟な設定管理
- インデックス最適化による高速クエリ

**整合性**
- 外部キー制約による参照整合性
- CHECK制約による値域制限
- トリガーによる自動フィールド更新

**セキュリティ**
- 行レベルセキュリティによる細粒度アクセス制御
- SECURITY DEFINERによる権限エスカレーション制御
- サービスロール分離による権限境界

### API設計の改善点

**型安全性**
- Zodスキーマによる実行時型検証
- TypeScript型定義との整合性
- スナップショットテストによる後方互換性確保

**エラーハンドリング**
- RFC 9457準拠の統一エラー形式
- 多言語エラーメッセージ対応
- 再試行可能性の明示

**ストリーミング**
- EventSourceによる標準準拠実装
- 自動再接続機能
- プログレス・使用量の詳細レポート

## Lessons Learned

### データベース設計の教訓

**RLS設計の複雑性**
- マルチテナント環境でのRLSポリシー設計は慎重な検討が必要
- 管理者権限とユーザー権限の適切な分離が重要
- SECURITY DEFINER関数は最小権限の原則で実装

**性格パラメータのモデリング**
- 0-100の数値範囲による直感的なパラメータ設定
- JSONBとリレーショナルの適切な使い分け
- 将来的な拡張性を考慮した柔軟なスキーマ設計

### 技術選択の意思決定

**Next.js 15 + React 19の採用**
- App Routerによるサーバーサイドレンダリング最適化
- React 19の新機能を活用した性能向上
- RSCファーストの設計による効率的なデータフェッチング

**Supabase + PostgreSQLの組み合わせ**
- RLSによる細粒度セキュリティ制御
- リアルタイム機能の活用可能性
- TypeScript連携による開発効率向上

### セキュリティ実装の課題

**権限管理の複雑性**
- 複数の権限レベル（匿名、認証済み、管理者）の適切な処理
- クライアント・サーバー間の権限境界の明確化
- サービスロールキーの安全な管理

**SSEセキュリティ**
- ストリーミング中の認証状態維持
- レート制限とDDoS対策
- エラー情報の適切なマスキング

## Future Considerations

### データベース拡張性

**シャーディング対応**
- 将来的なユーザー数増加に備えたシャーディング戦略
- UUIDベース設計によるシャード分散の容易性
- リードレプリカによる読み取り性能向上

**分析機能**
- ユーザー行動分析のためのデータウェアハウス連携
- MBTI診断結果の統計分析機能
- チャット品質メトリクスの収集

### 技術負債の管理

**マイグレーション戦略**
- データベーススキーマのバージョン管理
- ローリングアップデートによる無停止マイグレーション
- バックワード互換性の維持

**監視・アラート**
- データベース性能監視の強化
- 異常検知によるプロアクティブな対応
- コスト監視による運用最適化

### 機能拡張の方向性

**AIモデル多様化**
- 複数のAIモデルサポート
- モデル切り替え機能
- コスト最適化のためのモデル選択

**ソーシャル機能**
- ボット共有機能
- コミュニティ投票による推奨システム
- ユーザー間のコラボレーション機能

### 運用考慮事項

**スケーリング戦略**
- 負荷に応じた自動スケーリング
- データベース接続プールの最適化
- CDNによる静的リソース配信

**災害復旧**
- 定期バックアップの自動化
- 複数リージョンでの冗長化
- 障害時の自動フェイルオーバー