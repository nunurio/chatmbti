# Chat MVP - プロジェクト技術概要書

## 1. エグゼクティブサマリー

本プロジェクトは、最新のWeb技術とAI技術を融合させた次世代チャットアプリケーションのMVP（Minimum Viable Product）です。Next.js 15とReact 19を基盤とし、LangChain/LangGraphフレームワークを通じてOpenAI APIと統合された、リアルタイムストリーミング対応のAIチャットシステムを実装しています。

### 主要特徴
- **リアルタイムストリーミング**: Server-Sent Events (SSE) による低レイテンシの応答
- **完全ローカルストレージ**: プライバシーファーストのセッション管理
- **モダンUI/UX**: shadcn/ui コンポーネントライブラリによる洗練されたインターフェース
- **高度なAI統合**: LangGraphによる拡張可能なAIワークフロー

## 2. 技術スタック詳細

### 2.1 フロントエンド技術

#### Core Framework
- **Next.js 15.4.6**: App Router採用、Turbopack対応
- **React 19.1.0**: 最新の並行レンダリング機能活用
- **TypeScript 5.x**: 厳密な型安全性を提供

#### スタイリング・UI
- **Tailwind CSS v4**: 最新のユーティリティファーストCSS
- **shadcn/ui**: Radix UIベースの再利用可能コンポーネント
- **Radix UI Primitives**: アクセシブルなUIプリミティブ
  - Dialog, Label, ScrollArea, Separator, Slot
- **lucide-react**: モダンなアイコンセット

#### 状態管理・ユーティリティ
- **localStorage**: セッション永続化
- **nanoid**: 高性能UUID生成
- **sonner**: トースト通知システム
- **clsx + tailwind-merge**: 動的クラス名管理

### 2.2 AI/ML統合

#### LangChain エコシステム
- **@langchain/core 0.3.70**: コアフレームワーク
- **@langchain/langgraph 0.4.4**: ステートフルAIワークフロー
- **@langchain/openai 0.6.7**: OpenAI統合アダプター
- **openai 5.12.2**: 直接API統合用クライアント

### 2.3 開発環境

#### ビルドツール
- **pnpm 10.12.1**: 高速パッケージマネージャー
- **PostCSS**: CSS変換パイプライン
- **ESLint 9**: コード品質管理

## 3. アーキテクチャ設計

### 3.1 システム全体構成

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser)                     │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Next.js App (React 19)              │   │
│  │  ┌──────────────┐  ┌──────────────────────┐    │   │
│  │  │ Chat UI      │  │ Local Storage        │    │   │
│  │  │ Components   │  │ (Session Management) │    │   │
│  │  └──────┬───────┘  └──────────────────────┘    │   │
│  └─────────┼────────────────────────────────────────┘   │
└────────────┼────────────────────────────────────────────┘
             │ SSE Stream
┌────────────┼────────────────────────────────────────────┐
│            ▼                                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Next.js API Route (/api/chat)            │  │
│  │  ┌──────────────────┐  ┌────────────────────┐   │  │
│  │  │ Request Handler  │  │ SSE Stream        │   │  │
│  │  │ & Validation     │  │ Transformer       │   │  │
│  │  └────────┬─────────┘  └────────▲───────────┘   │  │
│  └───────────┼──────────────────────┼───────────────┘  │
│              │                      │                   │
│  ┌───────────▼──────────────────────┴───────────────┐  │
│  │           LangGraph State Machine                │  │
│  │  ┌─────────────┐  ┌─────────────────────────┐   │  │
│  │  │ StateGraph  │  │ MessagesAnnotation      │   │  │
│  │  │ Workflow    │  │ (Conversation History)  │   │  │
│  │  └──────┬──────┘  └─────────────────────────┘   │  │
│  └─────────┼────────────────────────────────────────┘  │
│            │                       Server               │
└────────────┼────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│                   OpenAI API                            │
│                  (GPT Models)                           │
└─────────────────────────────────────────────────────────┘
```

### 3.2 データフロー設計

#### リクエスト/レスポンスフロー
1. **ユーザー入力**: React コンポーネントでメッセージ作成
2. **API呼び出し**: POST /api/chat へメッセージ履歴とシステムプロンプト送信
3. **LangGraph処理**: ステートマシンによるコンテキスト管理
4. **OpenAI通信**: ストリーミングレスポンス取得
5. **SSE変換**: LangGraphイベントをSSEフォーマットに変換
6. **UIレンダリング**: リアルタイムトークン表示

#### ストリーミングアーキテクチャ
```typescript
// SSEイベントフォーマット
type SSEEvent = 
  | { type: "token", text: string }      // テキストストリーム
  | { type: "error", message: string }   // エラー通知
  | { type: "done" }                     // 完了シグナル
```

### 3.3 状態管理アーキテクチャ

#### ローカルストレージスキーマ
```typescript
// セッション管理
localStorage["chat-mvp:sessions"]: ChatSession[]
localStorage["chat-mvp:system"]: string  // システムプロンプト
localStorage["chat-mvp:theme"]: "light" | "dark"

// データモデル
interface ChatSession {
  id: string;           // nanoid生成
  title: string;        // 自動生成/ユーザー編集可能
  createdAt: number;    // Unix timestamp
  updatedAt: number;    // Unix timestamp
  messages: Message[];
}

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}
```

## 4. コンポーネント構造

### 4.1 コンポーネント階層

```
src/
├── app/
│   ├── layout.tsx         # ルートレイアウト（フォント、メタデータ）
│   ├── page.tsx           # ホームページ（Chat コンポーネント表示）
│   └── api/
│       └── chat/
│           └── route.ts   # チャットAPIエンドポイント
├── components/
│   ├── ThemeToggle.tsx    # ダークモード切替
│   ├── chat/
│   │   ├── Chat.tsx       # メインチャットコンテナ
│   │   └── PromptEditor.tsx # システムプロンプト編集
│   └── ui/                # shadcn/ui 基本コンポーネント
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── scroll-area.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       └── textarea.tsx
├── ai/
│   └── graph.ts           # LangGraph ワークフロー定義
├── hooks/
│   └── use-local-storage.ts # localStorage カスタムフック
└── lib/
    ├── sse.ts             # SSEパーサー
    ├── types.ts           # 型定義
    └── utils.ts           # ユーティリティ関数
```

### 4.2 主要コンポーネントの責務

#### Chat.tsx (278行)
- **責務**: チャットセッション全体の管理
- **機能**:
  - セッション作成/切替/保存
  - メッセージ送受信管理
  - ストリーミングレスポンス処理
  - UI状態管理（送信中、エラー処理）
- **統合要素**:
  - localStorage によるデータ永続化
  - SSEパーサーによるストリーム処理
  - トースト通知によるユーザーフィードバック

#### graph.ts (49行)
- **責務**: AI処理パイプライン定義
- **実装**:
  - LangGraph StateGraph によるワークフロー
  - ChatOpenAI モデル統合
  - 動的システムプロンプト注入
  - メッセージ履歴管理

#### route.ts (134行)
- **責務**: APIエンドポイント実装
- **機能**:
  - リクエスト検証
  - 環境変数チェック
  - LangGraphイベントのSSE変換
  - エラーハンドリング
  - ストリーム管理

## 5. API設計詳細

### 5.1 チャットエンドポイント

**エンドポイント**: `POST /api/chat`

**リクエストボディ**:
```typescript
{
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
  systemPrompt?: string;
  verbosity?: "low" | "medium" | "high";       // 未実装
  reasoning_effort?: "minimal" | "medium" | "high"; // 未実装
}
```

**レスポンス**: Server-Sent Events Stream
```
event: data
data: {"type":"token","text":"こんにちは"}

event: data
data: {"type":"token","text":"、"}

event: error
data: {"type":"error","message":"API key not found"}

event: done
data: {}
```

### 5.2 エラーハンドリング戦略

1. **環境変数検証**: OPENAI_API_KEY の事前チェック
2. **ストリームエラー**: try-catch による包括的エラー捕捉
3. **クライアント通知**: SSE経由のエラーイベント送信
4. **UIフィードバック**: Sonnerトースト通知

## 6. セキュリティとパフォーマンス

### 6.1 セキュリティ考慮事項

#### 実装済み
- **APIキー管理**: 環境変数による秘匿化
- **クライアントサイド検証**: 入力値のサニタイゼーション
- **エラー情報制限**: スタックトレースの非公開

#### 改善推奨事項
- **レート制限**: API呼び出し頻度制限の実装
- **入力検証強化**: Zodによるスキーマ検証
- **CSP設定**: Content Security Policy の適用
- **認証機能**: ユーザー認証システムの追加

### 6.2 パフォーマンス最適化

#### 実装済み
- **Turbopack**: 高速開発サーバー
- **ストリーミング**: チャンクベースレスポンス
- **ローカルストレージ**: サーバー負荷軽減
- **React 19最適化**: 並行レンダリング活用

#### 最適化候補
- **仮想スクロール**: 長大な会話履歴の効率的表示
- **メッセージ圧縮**: localStorage容量最適化
- **ワーカー活用**: Web Worker によるSSE処理
- **キャッシング**: レスポンスキャッシュ戦略

## 7. 開発環境セットアップ

### 7.1 必要条件

- Node.js 18.x以上
- pnpm 10.12.1
- OpenAI APIキー

### 7.2 環境変数設定

`.env.local` ファイルを作成:
```bash
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
```

### 7.3 インストールと起動

```bash
# 依存関係インストール
pnpm install

# 開発サーバー起動（Turbopack使用）
pnpm dev

# プロダクションビルド
pnpm build
pnpm start

# リント実行
pnpm lint
```

### 7.4 開発URL

- 開発環境: http://localhost:3000
- APIエンドポイント: http://localhost:3000/api/chat

## 8. 既知の問題と改善提案

### 8.1 現在の技術的債務

#### 緊急度：高
1. **誤ったモデル指定**: `graph.ts:26` で "gpt-5" が指定されている
   - **修正案**: "gpt-4-turbo-preview" または "gpt-3.5-turbo" に変更

2. **型安全性の欠如**: SSEイベント処理での any型使用
   - **修正案**: 完全な型定義とtype guard実装

#### 緊急度：中
1. **エラーリカバリー不足**: ネットワーク断絶時の再接続機能なし
2. **メモリリーク可能性**: AbortController の不適切な管理
3. **アクセシビリティ**: スクリーンリーダー対応が不完全

### 8.2 機能拡張提案

#### 短期（1-2週間）
1. **メッセージ編集/削除**: 既存メッセージの修正機能
2. **エクスポート機能**: 会話履歴のMarkdown/JSON出力
3. **検索機能**: メッセージ内容の全文検索
4. **ショートカットキー**: キーボード操作の充実

#### 中期（1-2ヶ月）
1. **マルチモーダル対応**: 画像/ファイルアップロード
2. **会話ブランチング**: 複数の会話経路管理
3. **プロンプトテンプレート**: 事前定義プロンプト集
4. **コラボレーション**: リアルタイム共同編集

#### 長期（3ヶ月以上）
1. **プラグインシステム**: 拡張機能アーキテクチャ
2. **複数LLM対応**: Claude、Gemini等の統合
3. **音声入出力**: Web Speech API統合
4. **分析ダッシュボード**: 使用統計と洞察

### 8.3 アーキテクチャ改善案

1. **状態管理の集約化**: Zustand/Jotai導入検討
2. **API層の抽象化**: tRPC導入によるタイプセーフAPI
3. **テスト戦略**: Vitest + Testing Library導入
4. **CI/CD パイプライン**: GitHub Actions設定
5. **モニタリング**: Sentry/Vercel Analytics統合

## 9. 技術的特記事項

### 9.1 LangGraph実装の特徴

- **ステートマシンベース**: 会話フローの明示的管理
- **拡張可能性**: ノード追加による機能拡張容易
- **ストリーミング対応**: ネイティブストリーミングサポート

### 9.2 SSE実装の工夫

- **バッファリング制御**: X-Accel-Buffering ヘッダー
- **接続維持**: Connection: keep-alive
- **エラー復旧**: 自動再接続ロジック（未実装）

### 9.3 UI/UXデザイン原則

- **レスポンシブ設計**: モバイルファースト
- **アクセシビリティ**: ARIA属性の適切な使用
- **パフォーマンス**: 遅延ローディングとコード分割
- **プログレッシブエンハンスメント**: JavaScript無効時の考慮

## 10. まとめ

本プロジェクトは、最新のWeb技術とAI技術を効果的に組み合わせた、プロダクションレディなチャットアプリケーションMVPです。Next.js 15とReact 19の最新機能を活用し、LangChain/LangGraphによる高度なAI統合を実現しています。

現状では基本的なチャット機能が完成しており、適切な改善を加えることで、エンタープライズグレードのアプリケーションへと発展させることが可能です。特に、リアルタイムストリーミングとローカルファーストのアーキテクチャは、ユーザープライバシーとパフォーマンスの両立を実現する優れた設計となっています。

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-08-13  
**Author**: AI Technical Documentation System  
**Status**: Production MVP