# Suggested Commands for Chat MVP Project

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

## System Commands (Darwin/macOS)
- `git` - Version control
- `ls` - List directory contents
- `cd` - Change directory
- `grep` / `rg` (ripgrep) - Search within files
- `find` - Find files and directories

## Development URLs
- Development server: http://localhost:3000
- API endpoint: http://localhost:3000/api/chat

## Environment Setup
Create `.env.local` file with:
```
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxx
```

## Important Notes
- Always use pnpm for package management (version 10.12.1)
- Development server uses Turbopack for faster builds
- Project uses Node.js runtime for API routes