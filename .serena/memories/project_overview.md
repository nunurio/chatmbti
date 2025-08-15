# Chat MVP Project Overview

## Purpose
A Next.js 15-based chat application MVP with AI integration using LangChain/LangGraph and OpenAI. Features real-time streaming responses through Server-Sent Events (SSE).

## Tech Stack
- **Framework**: Next.js 15.4.6 (App Router, Turbopack)
- **Runtime**: React 19.1.0
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (Radix UI based)
- **AI Integration**: LangChain/LangGraph with OpenAI
- **Package Manager**: pnpm 10.12.1
- **Icons**: lucide-react
- **Utilities**: nanoid (ID generation), sonner (toasts), clsx + tailwind-merge

## Architecture
- **Client-Server Communication**: Server-Sent Events (SSE) for streaming
- **State Management**: localStorage for session persistence
- **AI Pipeline**: LangGraph StateGraph workflow
- **API Design**: Single POST endpoint `/api/chat` with SSE response

## Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/chat/route.ts  # Chat API endpoint
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── ai/
│   └── graph.ts           # LangGraph workflow
├── components/
│   ├── chat/              # Chat components
│   └── ui/                # shadcn/ui components
├── hooks/
│   └── use-local-storage.ts
└── lib/
    ├── sse.ts             # SSE parser
    ├── types.ts           # Type definitions
    └── utils.ts           # Utilities
```

## Environment Setup
Required: `OPENAI_API_KEY` in `.env.local`

## Known Issues
- Line 26 in `src/ai/graph.ts`: Uses "gpt-5" model (should be updated to valid model)