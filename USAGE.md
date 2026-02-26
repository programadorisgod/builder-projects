# Builder CLI - Usage Guide

## Quick Start

### Option 1: Local Development

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Or build and run
pnpm build
node dist/index.js
```

### Option 2: Global Installation

```bash
# Build the project
pnpm build

# Link globally (for testing)
npm link

# Now you can use it from anywhere
builder-cli
```

### Option 3: NPM Package

```bash
# Publish to npm (make sure to update package.json with your details first)
npm publish

# Then install globally
npm install -g builder-projects

# Use it
builder-cli
```

## CLI Flow

The CLI will guide you through the following steps:

### 1. Project Type Selection
Choose between:
- 🔙 Backend
- 🎨 Frontend
- 🔄 Fullstack

### 2. Language Selection
Available options depend on project type:
- **Backend**: TypeScript, JavaScript, Python, Go
- **Frontend**: TypeScript, JavaScript
- **Fullstack**: TypeScript, JavaScript

### 3. Framework Selection
Available frameworks based on language:

**TypeScript/JavaScript Backend:**
- Express
- NestJS
- Fastify

**Python:**
- FastAPI
- Django
- Flask

**Go:**
- Fiber
- Gin
- Echo

**TypeScript/JavaScript Frontend:**
- React
- Next.js 15
- Svelte
- Angular

**Fullstack:**
- Next.js 15
- SvelteKit

### 4. Project Name
Enter your project name (letters, numbers, hyphens, and underscores only)

### 5. Architecture (Optional)
Choose a specific architecture pattern:

**Backend:**
- MVC (Model-View-Controller)
- Hexagonal (Ports & Adapters)
- Layered Architecture
- Layered with Screaming Architecture

**Frontend:**
- Component-based (Default)
- Feature-based with Screaming Architecture

### 6. MCP Configuration (Optional)
Select Model Context Protocols to configure:
- Browser (Playwright) - Browser automation
- Context7 - Documentation updates for LLM
- TestSprite - Testing automation
- Supabase - Supabase integration
- Postgres - PostgreSQL management
- Semgrep - Code analysis
- GitHub - GitHub integration
- Notion - Notion workspace integration

### 7. Additional Skills (Optional)
Add extra skills beyond the defaults:
- E2E Testing Patterns
- Playwright E2E Testing
- UI Animation
- UI Design System
- Vite & Vitest
- Agent Browser
- Audit Website
- Context7
- Executing Plans
- Writing Plans
- Subagent Driven Development

## Project Structure

### Backend (Layered Architecture Example)
```
my-project/
├── src/
│   ├── presentation/
│   ├── business/
│   ├── data/
│   └── config/
├── tests/
├── .agents/
│   └── skills/
├── .mcp/ (if MCPs configured)
└── package.json or pyproject.toml
```

### Frontend (Component-based Example)
```
my-project/
├── src/
│   ├── components/
│   │   ├── common/
│   │   └── layout/
│   ├── pages/
│   ├── hooks/
│   ├── utils/
│   ├── styles/
│   └── assets/
├── public/
├── .agents/
│   └── skills/
└── package.json
```

## Default Skills by Project Type

### Frontend Projects
- TypeScript Expert
- Frontend Design
- Web Design Guidelines
- Frontend Testing Best Practices
- Clean Code

### Backend Projects
- TypeScript Expert
- Clean Code
- Performance

### Fullstack Projects
- Combination of frontend and backend skills

## Framework-Specific Skills

### React
- React Best Practices

### Next.js 15
- Next.js 15 patterns and best practices

### Svelte/SvelteKit
- Svelte Components
- Svelte Frontend

## Post-Creation Steps

### For Python Projects
```bash
cd my-project
source .venv/bin/activate  # Activate virtual environment
uv pip install -e .        # Install dependencies (if using UV)
# or
pip install -e .           # Install dependencies (standard pip)
```

### For Node.js Projects
```bash
cd my-project
pnpm install              # Install dependencies (or npm/bun/yarn)
pnpm dev                  # Start development server
```

### For Go Projects
```bash
cd my-project
go mod tidy               # Download dependencies
go run main.go            # Run the application
```

## MCP Configuration

If you configured MCPs, check the `.mcp/README.md` file in your project for:
- Setup instructions for each MCP
- Required environment variables
- Usage examples

## Troubleshooting

### Python UV not found
If UV is not installed, install it:
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Package manager detection
The CLI automatically detects:
1. pnpm (preferred)
2. bun
3. yarn
4. npm (fallback)

To force a specific package manager, install it globally.

## Examples

### Create a React TypeScript Frontend
```bash
builder-cli
# Select: Frontend
# Select: TypeScript
# Select: React
# Name: my-react-app
# Architecture: Component-based (default)
# MCPs: None or select as needed
# Additional Skills: UI Design System, UI Animation
```

### Create a FastAPI Backend
```bash
builder-cli
# Select: Backend
# Select: Python
# Select: FastAPI
# Name: my-api
# Architecture: Hexagonal
# MCPs: Postgres, Semgrep
# Additional Skills: None or as needed
```

### Create a Next.js Fullstack App
```bash
builder-cli
# Select: Fullstack
# Select: TypeScript
# Select: Next.js 15
# Name: my-nextjs-app
# Architecture: Default
# MCPs: Supabase, GitHub
# Additional Skills: E2E Testing Patterns
```

## Notes

- All projects include a `.agents/skills` directory with AI assistant skills
- TypeScript projects include a properly configured `tsconfig.json`
- Python projects use UV for faster dependency management
- Skills are automatically copied from the `bin/assets/.agents/skills` directory
- The CLI respects your existing package manager installations

## Support

For issues or questions, please check the README.md or contact the maintainer.
