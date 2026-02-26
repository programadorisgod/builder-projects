export interface MCP {
  name: string;
  value: string;
  description: string;
  package?: string;
  url: string;
}

export const AVAILABLE_MCPS: MCP[] = [
  {
    name: "Browser (Playwright)",
    value: "playwright",
    description: "Browser automation with Playwright",
    package: "@playwright/mcp",
    url: "https://github.com/microsoft/playwright-mcp",
  },
  {
    name: "Context7",
    value: "context7",
    description: "Update documentation for LLM",
    url: "https://context7.com/",
  },
  {
    name: "TestSprite",
    value: "testsprite",
    description: "Testing automation",
    url: "https://www.testsprite.com/solutions/mcp",
  },
  {
    name: "Supabase",
    value: "supabase",
    description: "Supabase integration",
    url: "https://supabase.com/docs/guides/getting-started/mcp",
  },
  {
    name: "Postgres",
    value: "postgres",
    description: "PostgreSQL database management",
    package: "@crystaldba/postgres-mcp",
    url: "https://github.com/crystaldba/postgres-mcp",
  },
  {
    name: "Semgrep",
    value: "semgrep",
    description: "Code analysis tool",
    url: "https://semgrep.dev/docs/mcp",
  },
  {
    name: "GitHub",
    value: "github",
    description: "GitHub integration",
    package: "@github/mcp-server",
    url: "https://github.com/github/github-mcp-server",
  },
  {
    name: "Notion",
    value: "notion",
    description: "Notion workspace integration",
    url: "https://www.notion.com/es-es/help/notion-mcp",
  },
];
