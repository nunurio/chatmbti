# MBTI チャットボットシステム 実装タスク

**最終更新日:** 2025-08-21

## 実装フェーズ

- **Phase 1 (MVP基盤): 0-30日** - 基本的なMBTI診断と多言語対応
- **Phase 2 (コア機能): 31-60日** - 完全なMBTIベースパーソナライゼーション
- **Phase 3 (プロダクション): 61-90日** - 安定性・拡張性・ユーザー満足度

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
  - [x] next-intl@3.28.2統合
  - [x] [locale]ルーティング実装
  - [x] i18n設定とLanguageProviderコンポーネント作成
  - [x] 日本語・英語翻訳ファイル作成（133個の翻訳キー、7つのネームスペース）
  - [x] 言語切替機能とブラウザ言語自動検出実装
  - [x] 全UIコンポーネントの多言語化対応
  - [x] profiles.localeカラム追加
  - _要件: 9.1, 9.2, 9.3, 9.4_ ✅

- [ ] 4. MBTI診断システム実装
- [x] 4.1 MBTI診断データとロジック実装 ✅ **2025-08-21完了**
  - ✅ 診断設問データ作成（24問・日英バイリンガル対応、各軸6問、direction制御）
  - ✅ MBTI判定計算ロジック実装（Likert 1-7スケール、軸別スコア計算、-100～+100正規化）
  - ✅ 相性計算アルゴリズム実装（認知機能ベース、対称性保証、Top3推奨選出）
  - ✅ TDD手法による25テストケース（97%カバレッジ）
  - 📅 残作業: DBシードデータ投入、UI統合
  - _要件: 5.2, 5.3, 5.4, 5.5_ ✅

- [x] 4.2 MBTI診断UI実装 **[Phase 1]** ✅ 2025-08-21完了
  - 診断画面コンポーネント作成（DiagnosisForm.tsx）
  - 7段階評価UI実装（1–7 Likert）と回答状態管理
  - 診断結果表示画面実装
  - 診断API実装（/api/mbti/diagnosis, /api/mbti/questions）。内部で`mbti_tests`/`mbti_answers`を更新し、完了時に`determined_type`と`scores`を保存
  - テストライフサイクル管理（開始→回答→完了：`mbti_tests.status/started_at/completed_at`）
  - _要件: 5.1, 5.6, 5.7_

- [ ] 5. 性格パラメータシステム実装
- [x] 5.1 性格パラメータ定義と管理 ✅ **2025-08-21完了**
  - ✅ PersonalityParametersインターフェース定義（8パラメータ：warmth, formality, brevity, humor, empathy, assertiveness, creativity, rigor）
  - ✅ 0-100レンジ・バリデーション定義（Low: 0-33, Moderate: 34-66, High: 67-100）
  - ✅ MBTIタイプ→パラメータマッピング実装（16タイプ対応、認知機能ベース）
  - ✅ 動的プロンプト生成エンジン実装（階層化構造：人格記述→スタイル→行動ルール）
  - ✅ TDD手法による18テストケース（84-100%カバレッジ）
  - _要件: 3.4, 3.5_ ✅

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

- [x] 7.2 ストリーミング機能強化 ✅ **基盤完了（2025-08-21）**
  - [x] Node ランタイム指定（`export const runtime = "nodejs"`）**完了済み**
  - [x] SSE 基本実装（`token`/`error`/`done` の最小配信。`Content-Type`, `Cache-Control`, `Connection`, `X-Accel-Buffering` ヘッダ）**完了済み**
  - [x] LangGraph ストリーミング統合（`app.streamEvents({ version: "v2" })`）**完了済み**
  - [x] `export const dynamic = "force-dynamic"` を追加（API応答のキャッシュ回避）**2025-08-21完了**
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