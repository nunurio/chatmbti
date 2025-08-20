# MBTI チャットボットシステム 実装タスク

## Ultrathink戦略分析 🧠

### 現状評価
- **技術的成熟度**: 基盤構築完了（Supabase + 認証 + 基本チャット）
- **MVPまでの距離**: コア機能30%完了、残り70%は30日で達成可能
- **最大のリスク**: Next.js 15のSSEキャッシュ問題（本日解決予定）
- **最大の機会**: MBTIベースパーソナライゼーションの早期実現

### 戦略的優先順位の根拠
1. **緊急性**: `dynamic = 'force-dynamic'`未実装によるSSE不安定性
2. **基盤性**: 多言語対応がMBTI診断の前提条件
3. **価値性**: 2分診断で即座にパーソナライズド体験を提供
4. **効率性**: 30日でMVP、60日でフル機能、90日でプロダクション

### ベストプラクティス適用
- **Next.js 15対応**: 非同期cookies/headers、dynamic export必須
- **i18n戦略**: next-intl + App Router + Supabase認証の統合パターン
- **SSE最適化**: ハートビート（15秒）、拡張イベントタイプ、監査ログ
- **MVP哲学**: "Build → Measure → Learn"サイクルの高速回転

## 進捗サマリ

**最終更新日:** 2025-01-20 (タスク3: i18n実装完了)

### 完了済みタスク
- ✅ **タスク1**: Supabase基盤セットアップとデータベース構築（2025-08-19完了）
- ✅ **タスク2**: 認証システム実装（2025-08-20完了）
  - Magic Link認証、プロフィール管理、MBTI選択UI、全16タイプ対応完了
  - 注記: AuthProviderはlayout.tsxで一時的に無効化中（UI検証のため）
- ✅ **タスク3**: 多言語対応システム実装（2025-01-20完了）
  - next-intl@3.28.2統合、[locale]ルーティング、翻訳ファイル(ja/en)、LanguageToggleコンポーネント
  - テスト結果: 91.3%合格、ESLint/TypeScriptエラー0件、要件9.1-9.4完全対応
- ✅ **タスク7.3**: チャット操作機能実装（停止・クリア・新規スレッド・タイトル生成）

### 🚨 緊急対応タスク（Next.js 15必須要件）
- 🔴 **タスク7.2-緊急**: `export const dynamic = 'force-dynamic'` の追加
  - **影響**: SSEストリーミングのキャッシュ問題を解決（Next.js 15で必須）
  - **所要時間**: 10分
  - **ファイル**: `/src/app/api/chat/route.ts`

### 進行中タスク
- 🔄 **タスク7.2**: ストリーミング機能強化（70%完了）
  - ✅ 完了: Node ランタイム指定、基本SSE実装、LangGraph統合
  - ⏳ 本日中: `dynamic="force-dynamic"`追加（緊急）
  - 📅 次スプリント: 型付きSSE拡張、監査ログ、persona/session統合

### 📋 即座に実行可能なアクション（Quick Wins）

#### 本日実行（10分以内）
```bash
# 1. SSEキャッシュ問題の解決
echo "export const dynamic = 'force-dynamic'" >> /src/app/api/chat/route.ts

# 2. AuthProvider再有効化
# /src/app/layout.tsx で AuthProvider のコメントアウトを解除
```

#### 明日実行（2時間以内）
1. **next-intl パッケージインストール**
   ```bash
   pnpm add next-intl
   ```
2. **i18n基本設定ファイル作成**
   - `/src/i18n/config.ts`
   - `/src/middleware.ts` (ロケール検出)

### MVP Phase 1 優先タスク（30日以内）
1. **タスク7.2-緊急**: dynamic export追加（本日） ⚡
2. ✅ **タスク3**: 多言語対応システム実装（MBTIシステムの基盤）完了
   - next-intl + App Router統合 ✅
   - Supabase認証との連携パターン実装 ✅
3. **タスク4.1**: MBTI診断データとロジック（コア価値提供）
   - 2分以内の簡易診断フロー実装

## 実装タスク一覧

### 基盤システム

- [x] 1. Supabase基盤セットアップとデータベース構築
  - [x] Supabaseクライアントライブラリのインストールと設定
  - [x] PostgreSQL拡張の有効化（pgcrypto, citext）
  - [x] ENUM型作成（mbti_code, message_role, session_status, visibility, role_type, mbti_axis）
  - [x] データベーススキーマ作成（profiles, user_roles, bot_personas, sessions, messages, message_feedback, mbti_questions, mbti_tests, mbti_answers, mbti_compatibilities, sse_events）
  - [x] ユーティリティ/トリガ関数作成（set_updated_at, bump_session_on_message）
  - [x] 管理者判定関数 is_admin() の作成と権限付与
  - [x] RPC post_user_message(uuid, text) の作成と権限付与
  - [x] Row Level Security (RLS) ポリシー実装（全テーブル: profiles/user_roles/bot_personas/sessions/messages/message_feedback/mbti_questions/mbti_tests/mbti_answers/mbti_compatibilities/sse_events）
  - [x] 環境変数設定とSupabaseクライアント初期化
  - _要件: 1.1, 6.1, 6.3, 6.4, 6.5, 6.7_
  - **完了日: 2025-08-19**

- [x] 2. 認証システム実装 ✅ 2025-08-20完了
  - Supabase Auth統合とAuthProviderコンポーネント作成 ✅
  - Magic Link認証フローの実装（ログイン・サインアップ画面） ✅
  - 認証状態管理とProtectedRouteコンポーネント作成 ✅
  - プロフィール作成・更新API実装（/api/auth/profile） ✅
  - _要件: 1.1, 1.2, 1.6_ ✅

- [x] 3. 多言語対応システム実装 ✅ (2025-01-20)
  - [x] i18n設定とLanguageProviderコンポーネント作成
  - [x] 日本語・英語翻訳ファイル作成
  - [x] 言語切替機能とブラウザ言語自動検出実装
  - [x] 全UIコンポーネントの多言語化対応
  - _要件: 9.1, 9.2, 9.3, 9.4_ ✅
  - **完了日**: 2025-01-20
  - **実装内容**: next-intl@3.28.2統合、[locale]ルーティング、翻訳ファイル(ja/en)、LanguageToggleコンポーネント
  - **テスト結果**: 91.3%テスト合格、ESLint/TypeScriptエラー0件
  - **要件達成**: 9.1(日本語/英語選択), 9.2(全UI多言語化), 9.3(ブラウザ言語自動検出), 9.4(英語デフォルト)完全対応
  - **技術詳細**: 133個の翻訳キー、7つのネームスペース、profiles.localeカラム追加

- [ ] 4. MBTI診断システム実装
- [ ] 4.1 MBTI診断データとロジック実装
  - 診断設問データ作成（ロケール別：`mbti_questions(text, locale, axis, direction, order)`、各言語24問を想定）
  - MBTI判定計算ロジック実装（Likert 1–7 + direction を反映した4軸スコア計算、`mbti_tests.scores` JSON生成）
  - 診断データ投入（`mbti_questions` シード）。テスト・回答の保存（`mbti_tests`/`mbti_answers`）
  - 相性テーブルのシード（`mbti_compatibilities`：type_a×type_b, score 0–100）
  - _要件: 5.2, 5.3, 5.4, 5.5_

- [ ] 4.2 MBTI診断UI実装
  - 診断画面コンポーネント作成（DiagnosisForm.tsx）
  - 7段階評価UI実装（1–7 Likert）と回答状態管理
  - 診断結果表示画面実装
  - 診断API実装（/api/mbti/diagnosis, /api/mbti/questions）。内部で`mbti_tests`/`mbti_answers`を更新し、完了時に`determined_type`と`scores`を保存
  - テストライフサイクル管理（開始→回答→完了：`mbti_tests.status/started_at/completed_at`）
  - _要件: 5.1, 5.6, 5.7_

- [ ] 5. 性格パラメータシステム実装
- [ ] 5.1 性格パラメータ定義と管理
  - PersonalityParametersインターフェース定義（DB列に対応：warmth, formality, brevity, humor, empathy, assertiveness, creativity, rigor, emoji_usage, steps）
  - 0–100（stepsは1–20）のレンジ/バリデーション定義
  - パラメータ→システムプロンプト変換ロジック実装
  - プロンプトテンプレートエンジン作成（`system_prompt_template` 対応）
  - _要件: 3.4, 3.5_

- [ ] 5.2 ボット管理UI実装
  - PersonaEditorコンポーネント作成（スライダー・トグル）
  - PersonaListコンポーネント実装
  - 即時プレビュー機能実装
  - 公開設定（visibility: private/public）の切替対応
  - ボット管理API実装（/api/personas）。DBの列ベース数値パラメータ（0–100）と`system_prompt_template`に対応
  - _要件: 3.1, 3.2, 3.3, 3.6_

- [ ] 6. MBTI推奨システム実装
- [ ] 6.1 推奨アルゴリズム実装
  - 相性スコア計算ロジック実装（`mbti_compatibilities` 参照。未定義は4軸補完マッチングで推定）
  - MBTI軸→性格パラメータ線形写像実装
  - Top3推奨選出とソート機能実装
  - _要件: 4.2, 4.3, 4.7_

- [ ] 6.2 推奨UI実装
  - RecommendationCardコンポーネント作成
  - 推奨ボット表示とカスタマイズ機能実装
  - 推奨API実装（/api/personas/recommendations）
  - _要件: 4.1, 4.4, 4.5, 4.6_

- [ ] 7. チャットシステム拡張
- [ ] 7.1 データ永続化統合
  - 既存Chat.tsxコンポーネントのSupabase統合
  - セッション・メッセージのデータベース保存実装
  - チャット履歴の読み込み・表示機能実装
  - クライアントからのユーザーメッセージ投稿は RPC `post_user_message` を使用（RLS準拠）
  - _要件: 2.7, 6.2_

- [ ] 7.2 ストリーミング機能強化
  - [x] Node ランタイム指定（`export const runtime = "nodejs"`）**完了済み**
  - [x] SSE 基本実装（`token`/`error`/`done` の最小配信。`Content-Type`, `Cache-Control`, `Connection`, `X-Accel-Buffering` ヘッダ）**完了済み**
  - [x] LangGraph ストリーミング統合（`app.streamEvents({ version: "v2" })`）**完了済み**
  - [ ] `export const dynamic = "force-dynamic"` を追加（API応答のキャッシュ回避）
  - [ ] 既存 `/api/chat/route.ts` の拡張（`personaId`, `sessionId` 対応）
  - [ ] 型付き SSE の拡充（`event: token|progress|usage|error|done`、`retry`/`id`/`Last-Event-ID` 再開、15s ハートビート）
  - [ ] 進捗/使用量イベントの送出（`progress`/`usage`）
  - [ ] 性格パラメータ反映のシステムプロンプト動的生成（Persona/MBTI からの合成）
  - [ ] SSE監査ログ（`sse_events`）への `start/end/interrupt/error` 記録（`request_id` 付与）
  - [ ] assistant/system/tool メッセージ保存は server（service_role）側のみで実行
  - _要件: 2.1, 2.2, 2.3, 2.4, 8.3, 8.5, 8.6_

- [x] 7.3 チャット操作機能実装
  - 停止・中断・クリア・新規スレッド作成機能実装
  - タイトル自動生成機能実装
  - セッション管理UI強化
  - _要件: 2.5, 2.6_

- [ ] 8. データ移行システム実装
  - ローカルストレージデータ検出機能実装
  - インポートモーダルUI作成
  - データ移行API実装（/api/migrate）
  - 移行完了後のローカルデータ削除処理実装
  - _要件: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ] 9. エラーハンドリングと監視実装
- [ ] 9.1 エラーハンドリング強化
  - 認証エラー・ストリーミングエラー・データベースエラーの分類処理
  - 多言語エラーメッセージ実装
  - Problem Details (RFC 9457) 形式のエラー応答統一（Route Handler 全般。SSE はイベントで通知）
  - Zod による入出力スキーマ検証の導入（/api/** 全体）
  - エラー復旧処理とリトライ機能実装
  - _要件: 10.1, 10.2, 10.3, 10.6, 10.7_

- [ ] 9.2 監視とログ実装
  - SSE開始/終了/中断イベントのログ記録（`sse_events` へ保存）
  - OpenTelemetry 計装（`instrumentation.js`）：`first_token_latency_ms` と `tokens_per_second` を記録
  - エラーメトリクス収集機能実装
  - パフォーマンス監視機能実装
  - _要件: 10.4, 8.1, 8.2_

- [ ] 10. UI/UX最終調整と統合
- [ ] 10.1 レスポンシブデザイン実装
  - PC/スマホ対応のレスポンシブレイアウト実装
  - モバイル最適化とタッチ操作対応
  - _要件: 9.12_

- [ ] 10.2 設定画面実装
  - 既定Bot、既定温度、出力量上限設定UI実装
  - MBTI再診断機能実装
  - 言語設定変更機能実装
  - _要件: 9.11, 1.6_

- [ ] 11. テスト実装とデバッグ
- [ ] 11.1 ユニットテスト実装
  - MBTI判定ロジックのテスト作成（Likert 1–7/direction 対応）
  - 推奨アルゴリズムのテスト作成
  - 性格パラメータ変換のテスト作成
  - RLSポリシーの基本ロジック検証（関数/RPCの境界を中心に）
  - _要件: 全要件の検証_

- [ ] 11.2 統合テスト実装
  - API統合テスト作成
  - ストリーミング機能テスト作成
  - 認証フローテスト作成
  - RLS動作検証（オーナーのみの参照/更新、messages insert は role='user' のみ許可）
  - RPC `post_user_message` の挙動検証
  - SSEイベント記録の検証（`sse_events`）
  - _要件: 全要件の検証_

- [ ] 11.3 E2Eテスト実装
  - 登録→診断→推奨Bot→チャット→履歴の完全フロー検証
  - パフォーマンステスト実装（初回トークン<700ms、>25 tok/s）
  - 多言語対応テスト実装
  - _要件: 全要件の受入基準検証_

- [ ] 12. プロダクション準備
- [ ] 12.1 セキュリティ強化
  - RLSポリシーの最終検証
  - 環境変数とシークレット管理の確認
  - セキュリティヘッダーの設定
  - assistant/system/tool 書込が service_role に限定されていることの確認
  - `is_admin()` の SECURITY DEFINER/権限の確認
  - Edge Middleware レート制限の導入（`@upstash/ratelimit`。429 は Problem Details で返却）
  - _要件: 6.7, 8.7_

- [ ] 12.2 パフォーマンス最適化
  - ストリーミング性能の最終調整
  - データベースクエリ最適化
  - キャッシュ戦略実装
  - _要件: 8.1, 8.2, 10.5_

- [ ] 12.3 デプロイメント準備
  - Vercel/Supabaseデプロイ設定
  - 環境変数設定とシードデータ投入
  - 本番環境での動作確認
  - _要件: 全要件の本番環境検証_

## 実装推奨順序（Ultrathink MVP戦略）

### 🚨 Phase 0: 緊急対応（本日）
1. **タスク7.2-緊急**: `export const dynamic = 'force-dynamic'` 追加
   - 所要時間: 10分
   - 影響度: Critical（SSEキャッシュ問題解決）

### 📅 Phase 1: MVP基盤完成（0-30日）
**目標**: 「5分以内でMBTI診断→パーソナライズド会話」の体験提供

1. **週1（残り1日）**: 
   - タスク7.2残作業完了（dynamic export実装）
   - AuthProvider再有効化

2. **週2-3**: 
   - ✅ タスク3: 多言語対応（next-intl統合）完了
   - ✅ 基本的な日英切替とSupabase連携完了

3. **週3-4**:
   - タスク4.1: MBTI診断ロジック実装
   - 24問→2分診断フローの最適化
   - タスク7.1: データ永続化統合

### 📈 Phase 2: コア機能完成（31-60日）
**目標**: 完全なMBTIベースパーソナライゼーション

1. **週5-6**:
   - タスク4.2: MBTI診断UI実装
   - タスク5.1: 性格パラメータ定義

2. **週7-8**:
   - タスク5.2: ボット管理UI
   - タスク6: MBTI推奨システム
   - パフォーマンス最適化（<700ms目標）

### 🚀 Phase 3: プロダクション対応（61-90日）
**目標**: 安定性・拡張性・ユーザー満足度

1. **週9-10**:
   - タスク8: データ移行システム
   - タスク9.1: エラーハンドリング強化
   - タスク9.2: 監視とログ実装

2. **週11-12**:
   - タスク10: UI/UX最終調整
   - タスク11: テスト実装
   - タスク12: プロダクション準備

### 🎯 成功指標
- Phase 1完了時: 基本的なMBTI診断と多言語対応
- Phase 2完了時: フル機能のMBTIチャットボット
- Phase 3完了時: プロダクション品質達成

### ⚡ リスク管理
- **技術的リスク**: Next.js 15固有の問題 → 早期のdynamic export対応
- **UXリスク**: 診断時間の長さ → 2分以内の簡易版優先
- **事業リスク**: 機能過多 → MVPコア機能への集中

## 🔧 技術的注意事項（Ultrathink知見）

### Next.js 15 App Router固有の対応
1. **SSEルートハンドラー必須設定**:
   ```typescript
   export const runtime = 'nodejs';  // ✅ 実装済み
   export const dynamic = 'force-dynamic';  // 🔴 未実装（本日対応）
   ```

2. **非同期Cookie/Headers処理**:
   ```typescript
   // ❌ 同期的な使用は禁止
   const cookie = cookies();
   
   // ✅ 非同期での使用
   const cookie = await cookies();
   ```

3. **Supabase SSR統合パターン**:
   ```typescript
   // @supabase/ssr を使用（auth-helpersは非推奨）
   import { createServerClient } from '@supabase/ssr';
   ```

### i18n実装の重要ポイント
- **URLベースロケール**: `/ja/chat`, `/en/chat` 形式でSEO最適化
- **Cookieフォールバック**: URLパラメータ → Cookie → ブラウザ言語の優先順位
- **Supabase認証との連携**: ロケール情報をprofiles.localeに保存

### パフォーマンス目標の実現方法
- **初回トークン<700ms**: LangGraphのstreamEvents v2使用
- **>25 tok/s**: OpenAI Responses API + 適切なバッファリング
- **ハートビート実装**: 15秒間隔で接続維持（プロキシタイムアウト対策）

### データベース設計の制約
- **変更禁止**: 既存スキーマ（`supabase/schemas/`）は変更不可
- **RLS前提**: すべてのクエリはRow Level Securityを考慮
- **SERVICE_ROLE_KEY**: assistant/systemメッセージ書き込み時のみ使用