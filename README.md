# Builder CLI

A powerful CLI tool for creating projects with pre-configured skills and Model Context Protocols (MCPs).

## Features

-  **Multi-language support**: TypeScript, JavaScript, Python, Go
-  **Framework selection**: React, Next.js, Svelte, Express, NestJS, FastAPI, and more
-  **Architecture patterns**: MVC, Hexagonal, Layered, Screaming Architecture
-  **AI Skills integration**: Automatically installs relevant skills for your project
-  **MCP support**: Configure Model Context Protocols for AI assistants
-  **Package manager detection**: Automatically detects pnpm, bun, yarn, or npm

**(coming soon)**
## Installation

```bash
npm install -g builder-projects
```

Or use directly with npx:

```bash
npx builder-cli
```

## Usage

Simply run the CLI and follow the interactive prompts:

```bash
builder-cli
```

The CLI will guide you through:

1. **Project Type**: Backend, Frontend, or Fullstack
2. **Language**: Choose your preferred programming language
3. **Framework**: Select from available frameworks
4. **Project Name**: Name your project
5. **Architecture**: (Optional) Choose a specific architecture pattern
6. **MCPs**: (Optional) Configure Model Context Protocols
7. **Skills**: (Optional) Add additional AI skills

## Supported Technologies

### Backend
- **Languages**: TypeScript, JavaScript, Python, Go
- **Frameworks**: Express, NestJS, Fastify, FastAPI, Django, Flask, Fiber, Gin, Echo
- **Architectures**: MVC, Hexagonal, Layered, Layered with Screaming Architecture

### Frontend
- **Languages**: TypeScript, JavaScript
- **Frameworks**: React, Next.js 16, Svelte, Angular
- **Architectures**: Component-based, Feature-based with Screaming Architecture

### Fullstack
- **Languages**: TypeScript, JavaScript
- **Frameworks**: Next.js 16, SvelteKit

## Skills

The CLI automatically installs relevant skills based on your project type:

### Default Skills
- **Frontend**: TypeScript Expert, Frontend Design, Web Design Guidelines, Testing Best Practices, Clean Code
- **Backend**: TypeScript Expert, Clean Code, Performance
- **Fullstack**: Combination of frontend and backend skills

### Framework-Specific Skills
- React Best Practices
- Next.js latest patterns
- Svelte Components
- And more...

### Additional Skills
- E2E Testing Patterns
- Playwright E2E Testing
- UI Animation
- UI Design System
- Vite & Vitest
- Agent Browser
- Subagent Driven Development
- And more...

## MCPs (Model Context Protocols) **(developing)**

Configure MCPs for enhanced AI assistant capabilities:

- **Browser (Playwright)**: Browser automation
- **Context7**: Documentation updates for LLM
- **TestSprite**: Testing automation
- **Supabase**: Supabase integration
- **Postgres**: PostgreSQL management
- **Semgrep**: Code analysis
- **GitHub**: GitHub integration
- **Notion**: Notion workspace integration

## Development

Clone the repository:

```bash
git clone <repository-url>
cd builder-projects
```

Install dependencies:

```bash
pnpm install
```

Run in development mode:

```bash
pnpm dev
```

Build the project:

```bash
pnpm build
```

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
