import path from "path";
import { writeFile } from "./file-system.js";
import type { MCP } from "../types/mcps.js";

export interface MCPConfig {
  mcps: {
    [key: string]: {
      command: string;
      args?: string[];
      env?: Record<string, string>;
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
  command: string;
  args?: string[];
  env?: Record<string, string>;
} {
  switch (mcp.value) {
    case "playwright":
      return {
        command: "npx",
        args: ["-y", "@playwright/mcp"],
      };
    case "context7":
      return {
        command: "npx",
        args: ["-y", "context7-mcp"],
      };
    case "testsprite":
      return {
        command: "npx",
        args: ["-y", "testsprite-mcp"],
      };
    case "supabase":
      return {
        command: "npx",
        args: ["-y", "supabase-mcp"],
        env: {
          SUPABASE_URL: "your-supabase-url",
          SUPABASE_KEY: "your-supabase-key",
        },
      };
    case "postgres":
      return {
        command: "npx",
        args: ["-y", "@crystaldba/postgres-mcp"],
        env: {
          POSTGRES_URL: "postgresql://user:password@localhost:5432/dbname",
        },
      };
    case "semgrep":
      return {
        command: "npx",
        args: ["-y", "semgrep-mcp"],
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
        args: ["-y", "notion-mcp"],
        env: {
          NOTION_TOKEN: "your-notion-token",
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

1. Set your Supabase URL in the environment variable \`SUPABASE_URL\`
2. Set your Supabase API key in the environment variable \`SUPABASE_KEY\`

You can find these values in your Supabase project settings.
`;
    case "postgres":
      return `### Setup

1. Set your PostgreSQL connection string in the environment variable \`POSTGRES_URL\`
   
   Format: \`postgresql://user:password@localhost:5432/dbname\`
`;
    case "github":
      return `### Setup

1. Create a GitHub Personal Access Token
2. Set it in the environment variable \`GITHUB_TOKEN\`

Generate a token at: https://github.com/settings/tokens
`;
    case "notion":
      return `### Setup

1. Create a Notion Integration
2. Set the integration token in the environment variable \`NOTION_TOKEN\`

Create an integration at: https://www.notion.so/my-integrations
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
