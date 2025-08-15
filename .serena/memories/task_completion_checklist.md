# Task Completion Checklist

When completing any development task in this project, ensure the following steps are performed:

## 1. Code Quality Checks
```bash
# Run linting to check code style
pnpm lint
```

## 2. Type Checking
- TypeScript strict mode is enabled
- Ensure all types are properly defined
- No `any` types unless absolutely necessary

## 3. Build Verification
```bash
# Verify production build works
pnpm build
```

## 4. Testing Approach
- Follow TDD (Test-Driven Development) methodology
- Red-Green-Refactor cycle:
  1. Write failing test first
  2. Write minimal code to pass
  3. Refactor while keeping tests green

## 5. UI Verification
- Use Playwright MCP for UI testing and screenshots
- Verify SSE streaming functionality works correctly
- Check responsive design on different viewports

## 6. Code Review Checklist
- [ ] Types are properly defined (TypeScript strict mode)
- [ ] Following RSC-first approach (minimal 'use client')
- [ ] Using proper Next.js patterns (Image, dynamic imports)
- [ ] Tailwind classes use cn() helper for conditionals
- [ ] No hardcoded values (API keys, URLs)
- [ ] Error handling implemented
- [ ] Loading states handled appropriately

## 7. Documentation
- Update relevant documentation if needed
- Ensure code comments are clear (but minimal)
- Update CLAUDE.md if introducing new patterns

## 8. Git Hygiene
- Clear, descriptive commit messages
- Follow existing commit patterns in the repository

## Important Reminders
- Always use pnpm for package management
- Preserve SSE streaming architecture
- Maintain localStorage-based session management
- Think in English, respond in Japanese