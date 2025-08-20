# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Install dependencies (using pnpm)
pnpm install

# Run development server with Turbopack
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linting
pnpm lint
```

## Architecture Overview

This is a Next.js 15 chat application with AI integration using LangChain/LangGraph and OpenAI. It aligns with the MBTI chatbot system design defined in `.kiro/specs/mbti-chatbot-system/design.md`, including Supabase-based authentication and persistence, MBTI diagnosis, personas, and data migration.

### Tech Stack
- **Framework**: Next.js 15.4.6 (App Router, Turbopack)
- **Runtime**: React 19.1.0
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI based)
- **AI Integration**: LangChain/LangGraph with OpenAI
- **Backend Services**: Supabase (Auth + PostgreSQL with RLS)
- **Package Manager**: pnpm 10.12.1

### Project Structure

```
supabase/
├── schemas/                           # 宣言的データベーススキーマ定義
└── migrations/                        # 自動生成マイグレーション（変更禁止）

src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx              # ログイン画面
│   │   ├── signup/
│   │   │   └── page.tsx              # サインアップ画面
│   │   └── profile/
│   │       └── page.tsx              # プロフィール設定
│   ├── (dashboard)/
│   │   ├── chat/
│   │   │   └── page.tsx              # メインチャット画面
│   │   ├── personas/
│   │   │   └── page.tsx              # ボット管理画面
│   │   └── settings/
│   │       └── page.tsx              # 設定画面
│   ├── mbti/
│   │   ├── diagnosis/
│   │   │   └── page.tsx              # MBTI診断画面
│   │   └── result/
│   │       └── page.tsx              # 診断結果画面
│   └── api/
│       ├── auth/
│       │   └── route.ts              # 認証API
│       ├── chat/
│       │   └── route.ts              # チャットAPI
│       ├── personas/
│       │   └── route.ts              # ボット管理API
│       ├── mbti/
│       │   ├── diagnosis/
│       │   │   └── route.ts          # 診断API
│       │   └── types/
│       │       └── route.ts          # MBTIタイプAPI
│       └── migrate/
│           └── route.ts              # データ移行API
├── components/
│   ├── auth/
│   │   ├── AuthProvider.tsx          # 認証プロバイダー
│   │   ├── LoginForm.tsx             # ログインフォーム
│   │   └── ProtectedRoute.tsx        # 認証ガード
│   ├── mbti/
│   │   ├── DiagnosisForm.tsx         # 診断フォーム
│   │   ├── TypeSelector.tsx          # タイプ選択
│   │   └── RecommendationCard.tsx    # 推奨ボット表示
│   ├── personas/
│   │   ├── PersonaEditor.tsx         # 性格パラメータエディタ
│   │   ├── PersonaList.tsx           # ボット一覧
│   │   └── ParameterSlider.tsx       # パラメータスライダー
│   ├── chat/
│   │   ├── Chat.tsx                  # メインチャット
│   │   ├── SessionManager.tsx        # セッション管理
│   │   └── MessageBubble.tsx         # メッセージ表示
│   ├── migration/
│   │   ├── ImportModal.tsx           # データインポートモーダル
│   │   └── MigrationStatus.tsx       # 移行状況表示
│   ├── i18n/
│   │   ├── LanguageProvider.tsx      # 多言語プロバイダー
│   │   └── LanguageToggle.tsx        # 言語切替
│   └── ui/                           # shadcn/ui components
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── scroll-area.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       └── textarea.tsx
├── ai/
│   └── graph.ts                       # LangGraph workflow (AI state machine)
├── hooks/
│   └── use-local-storage.ts
└── lib/
    ├── database.types.ts              # DB型定義（Supabase自動生成）
    ├── supabase/
    │   ├── client.ts                 # Supabaseクライアント
    │   └── auth.ts                   # 認証ヘルパー
    ├── mbti/
    │   ├── calculator.ts             # MBTI判定ロジック
    │   ├── recommendations.ts        # 推奨アルゴリズム
    │   └── questions.ts              # 診断設問データ
    ├── personas/
    │   ├── templates.ts              # プロンプトテンプレート
    │   └── parameters.ts             # パラメータ定義
    └── i18n/
        ├── config.ts                 # 多言語設定
        ├── translations/
        │   ├── ja.json               # 日本語翻訳
        │   └── en.json               # 英語翻訳
        └── hooks.ts                  # 多言語フック
```

### Test Directory Structure

```
chat-mvp/
├── src/
│   └── ...
├── tests/
│   ├── unit/
│   │   ├── lib/
│   │   │   └── mbti/
│   │   │       └── calculator.test.ts        # src/lib/mbti/calculator.ts に対応
│   │   └── components/
│   │       └── chat/
│   │           └── Chat.test.tsx             # src/components/chat/Chat.tsx に対応
│   ├── integration/
│   │   └── api/
│   │       └── chat.route.test.ts            # API統合テスト
│   ├── e2e/
│   │   └── chat.e2e.spec.ts                  # E2E（任意: Playwrightなど）
│   ├── mocks/
│   │   ├── server.ts                          # MSW サーバ初期化
│   │   └── handlers.ts                        # ハンドラー定義
│   ├── fixtures/
│   │   └── messages.json
│   └── utils/
│       └── test-utils.tsx                     # RTL ヘルパ
├── vitest.setup.ts                            # グローバルセットアップ
└── playwright.config.ts                       # E2E（使用時のみ）
```

- テストはすべて `tests/` 以下に配置し、`src/` 配下には置かない（ソースツリーのミラー構成）。
- 推奨設定例（`vitest.config.ts`）: `include: ['tests/**/*.{test,spec}.{ts,tsx}']`、`environment: 'jsdom'`、`environmentMatchGlobs` で integration/e2e を `node` に切り替え、`setupFiles: ['./vitest.setup.ts']`、`globals: true`。

### Key Architectural Patterns

1. **Client-Server Communication**: Server-Sent Events (SSE) for real-time streaming responses (LangGraph `streamEvents` v2)
2. **Data Persistence**: Supabase PostgreSQL as the source of truth for sessions/messages/personas/profiles with strict Row Level Security (RLS). Local Storage is used only for legacy data migration and optional offline fallback.
3. **AI Pipeline**: LangGraph StateGraph workflow with configurable, persona-aware system prompts
4. **API Design**: Multiple API routes per design:
   - `/api/chat` (SSE streaming)
   - `/api/auth`
   - `/api/personas`
   - `/api/mbti/diagnosis`, `/api/mbti/types`
   - `/api/migrate`

### Environment Variables

Required in `.env.local`:
```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_ANON_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# For server-side secured operations only (never expose to client)
# SUPABASE_SERVICE_ROLE_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Important Implementation Details

1. **Runtime**: Use Node.js runtime for streaming Chat API and Supabase server SDK compatibility. Other routes may run on Node as well. Edge Functions can be considered for availability, but Chat SSE should remain on Node.

2. **SSE Event Format**: The API returns the following event types (extended per design):
   - `{ type: "token", text: string }` - Streaming text chunks
   - `{ type: "error", message: string }` - Error notifications
   - `{ type: "done" }` - Stream completion signal
   - `{ type: "progress", node: string }` - LangGraph node progress
   - `{ type: "usage", tokens_out: number }` - Token usage summary

3. **Legacy Local Storage Schema (for migration only)**: Legacy chat sessions in localStorage follow this structure and are imported via `/api/migrate` on first login:
   ```typescript
   {
     id: string,          // nanoid generated
     title: string,       // auto-generated or user-edited
     createdAt: number,   // Unix timestamp
     updatedAt: number,   // Unix timestamp
     messages: Message[]  // conversation history
   }
   ```

4. **Path Aliases**: TypeScript configured with `@/*` alias pointing to `./src/*`

5. **RLS & Security**: All Supabase tables enable RLS with policies defined in the design. Client inserts are restricted (e.g., only `role='user'` messages). Server-side writes for `assistant/system` messages use service role.

6. **SSE Headers**: Set `Content-Type: text/event-stream`, `Cache-Control: no-cache, no-transform`, `Connection: keep-alive` and `export const dynamic = 'force-dynamic'` in route handlers.

### Database Management

**重要な制約事項:**
- **データベース構造**: Supabaseを使用。`supabase/schemas/`に保存されている宣言的スキーマファイルをDB構造の参照元として使用すること
- **マイグレーション**: `migrations/`フォルダの内容は**絶対に変更しないこと**（自動生成されたマイグレーションファイル）
- **型定義**: `@/lib/database.types.ts`にデータベースの型情報が定義されている
- **DB変更ポリシー**: データベース構造の変更は極力避けること。変更が必要な場合は、まずユーザーに確認を求め、適切な手順を案内すること

### Development Notes

- Always use pnpm for package management
- The project uses Turbopack for faster development builds
- TypeScript strict mode is enabled - ensure all types are properly defined
- Follow existing patterns for component structure and state management (Supabase for persistence; Local Storage only for migration/offline)
- Preserve the SSE streaming architecture for real-time responses

### Next.js Best Practices

- **RSC (React Server Components) First**: Default to RSC. Use `'use client'` only when necessary (hooks, event handlers).
- **API Routes for Back-end Logic**: Use Next.js API Routes for SSE streaming and backend endpoints as defined in the design (`/api/chat`, `/api/auth`, `/api/personas`, `/api/mbti/**`, `/api/migrate`). Server Actions may be used selectively for simple form submissions that do not require SSE.
- **Data Fetching**:
    - **Server**: Use `fetch` within RSCs, controlling cache with `next: { revalidate: ... }`.
    - **Client**: Use SWR (`useSWR`) for client-side data fetching.
- **UI States**: Utilize special files for UI states:
    - `loading.tsx` for loading UI.
    - `error.tsx` for error boundaries.
    - `not-found.tsx` for 404 pages.
- **Performance Optimization**:
    - **Images**: Always use `<Image>` from `next/image`.
    - **Fonts**: Optimize fonts with `next/font`.
    - **Dynamic Imports**: Use `dynamic` from `next/dynamic`, not `React.lazy`.
- **`useEffect` Usage**: Avoid `useEffect` for data fetching. Limit its use to client-side specific logic (like DOM manipulation) and encapsulate it within custom hooks.

### Performance Targets (per design)

- **First token latency**: < 700ms
- **Streaming throughput**: > 25 tokens/second
- Implement monitoring for latency and token rate; log warnings if thresholds are not met and store metrics per session.

## TDD (Test-Driven Development)

This project follows the TDD approach, inspired by the methodology of Takuto Wada (@t-wada), using the "Red-Green-Refactor" cycle. This ensures we build a robust and maintainable codebase.
- **Red**: Write a failing test that specifies the desired behavior.
- **Green**: Write the simplest code to make the test pass.
- **Refactor**: Clean up and improve the code while ensuring tests remain green.


- **Thinking Process**: Please conduct your thinking process in English.
- **Responses**: Please provide all responses in Japanese.

- All operations to understand the project structure, implementation details, and read files must be performed using Serena MCP.
- Use the Playwright MCP to verify implementation details, especially for UI-related tasks by taking screenshots.