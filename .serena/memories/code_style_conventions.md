# Code Style and Conventions

## TypeScript Configuration
- **Strict Mode**: Enabled - all types must be properly defined
- **Target**: ES2017
- **Module**: ESNext with bundler resolution
- **Path Alias**: `@/*` points to `./src/*`

## Code Style Patterns
- **Export Style**: Named exports preferred (`export function`, `export const`)
- **Component Structure**: Functional components with TypeScript interfaces/types
- **File Naming**: 
  - Components: PascalCase (e.g., `Chat.tsx`, `PromptEditor.tsx`)
  - Utilities/Hooks: kebab-case (e.g., `use-local-storage.ts`)
  - API Routes: lowercase (e.g., `route.ts`)

## React/Next.js Patterns
- **RSC First**: Default to React Server Components, use `'use client'` only when needed
- **Server Actions**: Prefer for data mutations over API routes
- **Data Fetching**:
  - Server: Use `fetch` in RSCs
  - Client: Use SWR (`useSWR`)
- **Special Files**: Use `loading.tsx`, `error.tsx`, `not-found.tsx` for UI states
- **Images**: Always use `next/image`
- **Dynamic Imports**: Use `next/dynamic`, not `React.lazy`
- **useEffect**: Avoid for data fetching, limit to DOM manipulation

## UI Component Library
- **shadcn/ui**: Component-based architecture with Radix UI primitives
- **Styling**: Tailwind CSS v4 with utility classes
- **Class Management**: Use `cn()` helper from `lib/utils.ts` for conditional classes

## State Management
- **Local State**: React hooks (useState, useEffect)
- **Persistence**: localStorage via custom `useLocalStorage` hook
- **Session Schema**: Typed interfaces for chat sessions and messages

## TDD Approach
Following t-wada style Test-Driven Development:
- **Red**: Write failing test for desired behavior
- **Green**: Write simplest code to pass test
- **Refactor**: Clean up while keeping tests green

## Linting & Formatting
- ESLint 9 with Flat Config
- TypeScript ESLint recommended rules
- Next.js core-web-vitals rules

## Process Requirements
- Think in English, respond in Japanese
- Use Serena MCP for project structure understanding
- Use Playwright MCP for UI verification