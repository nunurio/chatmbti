# Next.js & LangGraphによるチャットMVP実装

**日付**: 2025-08-13 20:49:06  
**作成者**: Claude Code Assistant

## 概要

Next.js 15を用いて構築した、OpenAIモデル（LangGraph経由）によるリアルタイムAIチャットアプリのMVPを実装しました。本アプリは、セッション管理・システムプロンプトのカスタマイズ・リアルタイムストリーミング応答など、現代的なチャット体験を提供します。全チャットセッションはlocalStorageにローカル保存されます。

## 変更内容

### コアアプリケーションファイル
- **変更**: `src/app/page.tsx` - Next.jsデフォルトページをChatコンポーネントに置換
- **変更**: `src/app/layout.tsx` - Sonnerトースト通知と日本語設定を追加
- **変更**: `src/app/globals.css` - shadcn/ui互換・Tailwind v4対応のデザインシステムを実装

### AI連携レイヤー
- **新規作成**: `src/ai/graph.ts` - OpenAI GPT-5モデルを用いたLangGraph会話フロー
- **新規作成**: `src/app/api/chat/route.ts` - サーバーサイドSSEストリーミングAPIエンドポイント

### チャットUIコンポーネント
- **新規作成**: `src/components/chat/Chat.tsx` - セッション管理・メッセージ表示・ストリーミング対応のメインチャットUI
- **新規作成**: `src/components/chat/PromptEditor.tsx` - システムプロンプト編集ダイアログ
- **新規作成**: `src/components/ThemeToggle.tsx` - テーマ切り替え機能

### UIコンポーネントライブラリ
- **新規作成**: shadcn/uiコンポーネント一式
  - `src/components/ui/button.tsx`
  - `src/components/ui/dialog.tsx`
  - `src/components/ui/input.tsx`
  - `src/components/ui/label.tsx`
  - `src/components/ui/scroll-area.tsx`
  - `src/components/ui/separator.tsx`
  - `src/components/ui/sheet.tsx`
  - `src/components/ui/textarea.tsx`

### ユーティリティライブラリ
- **新規作成**: `src/hooks/use-local-storage.ts` - localStorage永続化用カスタムフック
- **新規作成**: `src/lib/sse.ts` - ストリーミング応答用SSEパーサ
- **新規作成**: `src/lib/types.ts` - チャットエンティティ用TypeScript型定義
- **新規作成**: `src/lib/utils.ts` - Tailwindクラス結合ユーティリティ

### 設定ファイル
- **新規作成**: `components.json` - shadcn/uiのNew Yorkスタイル・パスエイリアス設定
- **変更**: `eslint.config.mjs` - Flat Config形式・TypeScript/Next.jsルール対応
- **変更**: `package.json` - AI・UI・開発用依存パッケージ追加
- **変更**: `pnpm-lock.yaml` - 依存関係ロックファイル更新

## 技術詳細

### アーキテクチャのポイント
1. **LangGraph連携**: AI会話フロー管理にLangGraphを採用し、構造化状態管理とストリーミングを実現
2. **SSE（サーバー送信イベント）**: カスタムSSEパーサでAI応答のリアルタイムストリーミングを実装
3. **ローカルストレージ永続化**: 全チャットセッションをクライアント側に保存し、プライバシーとオフライン対応を両立
4. **コンポーネント分割設計**: Reactの責務分離に基づくモジュール構成
5. **shadcn/ui統合**: 一貫したスタイリングとアクセシビリティを備えたUIコンポーネントシステム

### 主な実装機能
- ストリーミング対応のリアルタイムAIチャット
- 自動タイトル生成付きの複数会話セッション
- AIの性格調整用システムプロンプト編集
- モバイルファーストのレスポンシブデザイン
- 日本語対応・適切なタイポグラフィ
- テーマ切り替え機能
- ユーザー/アシスタント区別のメッセージバブル
- 自動スクロールメッセージエリア
- ブラウザ間での会話状態永続化

### 追加依存パッケージ

#### コア依存
- **@langchain/core**: ^0.3.70 - LangChainコア機能
- **@langchain/langgraph**: ^0.4.4 - グラフ型会話フロー
- **@langchain/openai**: ^0.6.7 - OpenAIモデル連携
- **openai**: ^5.12.2 - 公式OpenAI SDK
- **next**: 15.4.6 - Next.jsフレームワーク
- **react**: 19.1.0 - Reactライブラリ
- **zod**: ^4.0.17 - 実行時型バリデーション

#### UI依存
- **@radix-ui/react-***: Radix UIプリミティブ一式
- **lucide-react**: ^0.539.0 - アイコンライブラリ
- **sonner**: ^2.0.7 - トースト通知
- **class-variance-authority**: ^0.7.1 - コンポーネントバリアント管理
- **tailwind-merge**: ^3.3.1 - Tailwindクラス結合

#### 開発依存
- **tailwindcss**: ^4 - 最新Tailwind CSS
- **typescript**: ^5 - TypeScript
- **eslint**: ^9 - Flat Config対応ESLint

## 得られた知見

### 実装上のポイント
1. **LangGraphストリーミング**: LangGraphのイベントストリーミングをNext.js APIルートと統合し、リアルタイムチャットを実現
2. **SSE実装**: カスタムSSEパーサで多様なイベント形式に対応し、ネットワーク中断時も堅牢に動作
3. **状態管理**: React状態とlocalStorageの組み合わせで、外部依存なしのシームレスな永続化を実現
4. **コンポーネント設計**: モジュール化により機能拡張・保守性を向上

### 技術的課題と解決
1. **ストリーミング応答処理**: LangGraphイベントからの堅牢なテキスト抽出で多様な応答形式に対応
2. **型安全性**: TypeScript型定義を徹底し、全体の型安全性を担保
3. **エラー処理**: API失敗・ネットワーク障害・環境変数不足時も優雅にエラー処理
4. **パフォーマンス最適化**: 効率的な再レンダリングとチャット履歴のメモリ管理

### デザインシステム統合
1. **Tailwind v4移行**: 新@theme構文・パフォーマンス向上を含むTailwind v4へ移行
2. **shadcn/ui互換**: shadcn/uiデザインシステムと完全互換を維持しつつチャット向けにカスタマイズ
3. **レスポンシブ設計**: モバイルファーストで全デバイス一貫した体験を実現

## 今後の検討事項

### 機能拡張案
- 会話のエクスポート/インポート機能
- 会話検索・フィルタリング
- メッセージ編集・再生成
- ドキュメント会話用のファイルアップロード対応
- 複数端末同期のためのユーザー認証

### パフォーマンス最適化
- 長大な会話履歴向けのバーチャルスクロール
- 大規模チャット履歴の圧縮
- オフライン対応のService Worker実装

### セキュリティ考慮
- APIエンドポイントのレートリミット
- システムプロンプト入力のサニタイズ
- 機密用途向けの会話暗号化

### スケーラビリティ
- 現状のlocalStorageは単一ブラウザ/端末に限定
- 複数端末対応のためのクラウドストレージ連携検討
- データベース統合によるユーザー管理・会話共有の実現