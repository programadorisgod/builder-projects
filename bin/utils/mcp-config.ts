import path from "path";
import { writeFile } from "./file-system.js";
import type { MCP } from "../types/mcps.js";

export interface MCPConfig {
  mcps: {
    [key: string]: {
      command?: string;
      args?: string[];
      env?: Record<string, string>;
      type?: string;
      url?: string;
      headers?: Record<string, string>;
    };
  };
}

export async function createMCPConfig(
  projectPath: string,
  selectedMCPs: MCP[],
): Promise<void> {
  const config: MCPConfig = {
    mcps: {},
  };

  for (const mcp of selectedMCPs) {
    config.mcps[mcp.value] = getMCPConfiguration(mcp);
  }

  const configPath = path.join(projectPath, ".mcp", "config.json");
  await writeFile(configPath, JSON.stringify(config, null, 2));

  // Create README with MCP instructions
  const readmeContent = generateMCPReadme(selectedMCPs);
  await writeFile(path.join(projectPath, ".mcp", "README.md"), readmeContent);
}

function getMCPConfiguration(mcp: MCP): {
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  type?: string;
  url?: string;
  headers?: Record<string, string>;
} {
  switch (mcp.value) {
    case "playwright":
      return {
        command: "npx",
        args: ["-y", "@playwright/mcp"],
      };
    case "context7":
      return {
        url: "https://mcp.context7.com/mcp",
        headers: {
          CONTEXT7_API_KEY: "YOUR_API_KEY",
        },
      };
    case "testsprite":
      return {
        command: "npx",
        args: ["@testsprite/testsprite-mcp@latest"],
        env: {
          API_KEY: "your-api-key",
        },
      };
    case "supabase":
      return {
        type: "http",
        url: "https://mcp.supabase.com/mcp",
      };
    case "postgres":
      return {
        command: "uvx",
        args: ["postgres-mcp", "--access-mode=unrestricted"],
        env: {
          DATABASE_URI: "postgresql://username:password@localhost:5432/dbname",
        },
      };
    case "semgrep":
      return {
        command: "semgrep",
        args: ["mcp"],
        env: {
          SEMGREP_APP_TOKEN: "<token>",
        },
      };
    case "github":
      return {
        command: "npx",
        args: ["-y", "@github/mcp-server"],
        env: {
          GITHUB_TOKEN: "your-github-token",
        },
      };
    case "notion":
      return {
        command: "npx",
        args: ["-y", "@notionhq/notion-mcp-server"],
        env: {
          NOTION_TOKEN: "ntn_****",
        },
      };
    default:
      return {
        command: "npx",
        args: ["-y", mcp.package || `${mcp.value}-mcp`],
      };
  }
}

function generateMCPReadme(mcps: MCP[]): string {
  let content = `# Model Context Protocol (MCP) Configuration

This project has been configured with the following MCPs:

`;

  for (const mcp of mcps) {
    content += `## ${mcp.name}

**Description:** ${mcp.description}

**URL:** ${mcp.url}

`;

    if (mcp.package) {
      content += `**Package:** \`${mcp.package}\`

`;
    }

    // Add specific instructions based on MCP
    content += getSpecificInstructions(mcp);
    content += "\n---\n\n";
  }

  content += `## Configuration

The MCP configuration is stored in \`.mcp/config.json\`. You can edit this file to customize the MCP settings.

## Usage

MCPs are automatically loaded when you use AI assistants that support the Model Context Protocol (like Claude Desktop, Cline, etc.).

Make sure to set up any required environment variables before using the MCPs.
`;

  return content;
}

function getSpecificInstructions(mcp: MCP): string {
  switch (mcp.value) {
    case "supabase":
      return `### Setup

No additional setup required. The Supabase MCP uses OAuth 2.1 authentication.

Your MCP client will automatically prompt you to log in to Supabase during setup.
Be sure to choose the organization that contains the project you wish to work with.

**Note:** If you're running Supabase locally with Supabase CLI, you can access the MCP server at http://localhost:54321/mcp
`;
    case "postgres":
      return `### Setup

1. Install Postgres MCP Pro:
   - Using pipx: \`pipx install postgres-mcp\`
   - Using uv: \`uv pip install postgres-mcp\`
   - Using Docker: \`docker pull crystaldba/postgres-mcp\`

2. Set your PostgreSQL connection URI in the environment variable \`DATABASE_URI\`
   
   Format: \`postgresql://username:password@localhost:5432/dbname\`

**Access Modes:**
- \`--access-mode=unrestricted\`: Full read/write access (development)
- \`--access-mode=restricted\`: Read-only access (production)

**Alternative Configurations:**

Using pipx:
\`\`\`json
{
  "command": "postgres-mcp",
  "args": ["--access-mode=unrestricted"]
}
\`\`\`

Using Docker:
\`\`\`json
{
  "command": "docker",
  "args": ["run", "-i", "--rm", "-e", "DATABASE_URI", "crystaldba/postgres-mcp", "--access-mode=unrestricted"]
}
\`\`\`

Using SSE Transport (remote server):
\`\`\`json
{
  "type": "sse",
  "url": "http://localhost:8000/sse"
}
\`\`\`
`;
    case "github":
      return `### Setup

1. Create a GitHub Personal Access Token
2. Set it in the environment variable \`GITHUB_TOKEN\`

Generate a token at: https://github.com/settings/tokens
`;
    case "notion":
      return `### Setup

1. Create a Notion Integration at: https://www.notion.so/my-integrations
2. Copy the integration secret (starts with \`ntn_\`)
3. Replace \`ntn_****\` in the configuration with your actual integration secret
4. Share the Notion pages/databases you want to access with your integration

**Alternative Configuration:**

Using Docker:
\`\`\`json
{
  "command": "docker",
  "args": ["run", "--rm", "-i", "-e", "NOTION_TOKEN", "mcp/notion"],
  "env": { "NOTION_TOKEN": "ntn_****" }
}
\`\`\`

For advanced use cases with custom headers, you can use \`OPENAPI_MCP_HEADERS\` environment variable.
`;
    case "context7":
      return `### Setup

1. Get your Context7 API key from https://context7.com
2. Replace \`YOUR_API_KEY\` in the configuration with your actual API key

**Alternative Local Setup:**
You can also run Context7 locally by changing the configuration to:
\`\`\`json
{
  "command": "npx",
  "args": ["-y", "@upstash/context7-mcp", "--api-key", "YOUR_API_KEY"]
}
\`\`\`
`;
    case "testsprite":
      return `### Setup

1. Get your TestSprite API key from https://testsprite.com
2. Set the API key in the environment variable \`API_KEY\` in the configuration file

Replace \`your-api-key\` with your actual TestSprite API key.
`;
    case "semgrep":
      return `### Setup

1. Install Semgrep: \`pip install semgrep\` or see https://semgrep.dev/docs/getting-started/
2. Get your Semgrep App Token from https://semgrep.dev/orgs/-/settings/tokens
3. Replace \`<token>\` in the configuration with your actual Semgrep App Token

**Cursor Integration:**
Add this instruction to your \`.cursor/rules\` file for automatic scanning:

\`\`\`
Always scan code generated using Semgrep for security vulnerabilities
\`\`\`
`;
    case "playwright":
      return `### Setup

No additional setup required. The Playwright MCP provides browser automation capabilities.
`;
    default:
      return `### Setup

Please refer to the official documentation for setup instructions.
`;
  }
}

export function getMCPInstallInstructions(mcps: MCP[]): string {
  if (mcps.length === 0) {
    return "";
  }

  let instructions = "\n📦 MCP Configuration:\n";
  instructions += "   The following MCPs have been configured:\n";

  for (const mcp of mcps) {
    instructions += `   - ${mcp.name}\n`;
  }

  instructions += "\n   Check .mcp/README.md for setup instructions.\n";

  return instructions;
}
