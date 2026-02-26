import path from "path";
import { createDirectory, writeFile, executeCommand, checkCommandExists } from "./file-system.js";
import type { Project } from "../types/projects.js";
import type { Language } from "../types/languages.js";
import { execSync } from "child_process";
import { detectPackageManager } from "./package-manager.js";

interface ProjectConfig {
  projectName: string;
  projectType: Project;
  language: Language;
  framework: string;
  architecture: string;
  projectPath: string;
}

// Frameworks that have official CLIs
const FRAMEWORK_CLIS: Record<string, { command: string; checkCommand: string }> = {
  nestjs: { command: "nest", checkCommand: "nest --version" },
  nextjs: { command: "npx", checkCommand: "npx --version" },
  react: { command: "npx", checkCommand: "npx --version" },
  angular: { command: "ng", checkCommand: "ng version" },
  sveltekit: { command: "npx", checkCommand: "npx --version" },
};

// Some CLIs normalize project names - we need to match their conventions
function normalizeProjectName(framework: string, projectName: string): string {
  switch (framework) {
    case "nestjs":
      // NestJS CLI converts to kebab-case and lowercase
      return projectName.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    case "angular":
      // Angular CLI also uses kebab-case
      return projectName.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    default:
      return projectName;
  }
}

export async function shouldUseFrameworkCLI(framework: string): Promise<boolean> {
  const cliInfo = FRAMEWORK_CLIS[framework];
  if (!cliInfo) return false;
  
  try {
    execSync(cliInfo.checkCommand, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export async function createProjectWithCLI(
  config: ProjectConfig,
): Promise<string | null> {
  const { framework, projectName, language } = config;
  const packageManager = detectPackageManager();
  const parentDir = path.dirname(config.projectPath);
  
  // Normalize the project name according to framework conventions
  const normalizedName = normalizeProjectName(framework, projectName);
  const actualProjectPath = path.join(parentDir, normalizedName);
  
  try {
    switch (framework) {
      case "nestjs":
        console.log("\nUsing NestJS CLI to create project...");
        if (normalizedName !== projectName) {
          console.log(`Note: Project name normalized to "${normalizedName}" (NestJS convention)\n`);
        }
        execSync(`npx -y @nestjs/cli new ${normalizedName} --package-manager=${packageManager}`, {
          cwd: parentDir,
          stdio: "inherit",
        });
        return actualProjectPath;
        
      case "nextjs":
        console.log("\nUsing Next.js CLI to create project...");
        const nextCmd = language === "typescript" 
          ? `npx create-next-app@latest ${normalizedName} --typescript --app --eslint --tailwind --src-dir --no-turbopack`
          : `npx create-next-app@latest ${normalizedName} --javascript --app --eslint --tailwind --src-dir --no-turbopack`;
        execSync(nextCmd, {
          cwd: parentDir,
          stdio: "inherit",
        });
        return actualProjectPath;
        
      case "react":
        console.log("\nUsing Vite to create React project...");
        const reactTemplate = language === "typescript" ? "react-ts" : "react";
        const reactCmd = packageManager === "npm" 
          ? `npm create vite@latest ${normalizedName} -- --template ${reactTemplate}`
          : packageManager === "pnpm"
          ? `pnpm create vite ${normalizedName} --template ${reactTemplate}`
          : packageManager === "bun"
          ? `bun create vite ${normalizedName} --template ${reactTemplate}`
          : `yarn create vite ${normalizedName} --template ${reactTemplate}`;
        execSync(reactCmd, {
          cwd: parentDir,
          stdio: "inherit",
        });
        return actualProjectPath;
        
      case "svelte":
        console.log("\nUsing Vite to create Svelte project...");
        const svelteTemplate = language === "typescript" ? "svelte-ts" : "svelte";
        const svelteCmd = packageManager === "npm" 
          ? `npm create vite@latest ${normalizedName} -- --template ${svelteTemplate}`
          : packageManager === "pnpm"
          ? `pnpm create vite ${normalizedName} --template ${svelteTemplate}`
          : packageManager === "bun"
          ? `bun create vite ${normalizedName} --template ${svelteTemplate}`
          : `yarn create vite ${normalizedName} --template ${svelteTemplate}`;
        execSync(svelteCmd, {
          cwd: parentDir,
          stdio: "inherit",
        });
        return actualProjectPath;
        
      case "sveltekit":
        console.log("\nUsing SvelteKit CLI to create project...");
        execSync(`npx sv create ${normalizedName}`, {
          cwd: parentDir,
          stdio: "inherit",
        });
        return actualProjectPath;
        
      case "angular":
        console.log("\nUsing Angular CLI to create project...");
        const hasAngularCLI = await checkCommandExists("ng");
        if (!hasAngularCLI) {
          console.log("Angular CLI not found. Installing globally...");
          execSync(`npm install -g @angular/cli`, { stdio: "inherit" });
        }
        if (normalizedName !== projectName) {
          console.log(`Note: Project name normalized to "${normalizedName}" (Angular convention)\n`);
        }
        execSync(`ng new ${normalizedName} --routing --style=scss --skip-git`, {
          cwd: parentDir,
          stdio: "inherit",
        });
        return actualProjectPath;
        
      default:
        return null;
    }
  } catch (error) {
    console.error(`Error creating project with CLI: ${error}`);
    return null;
  }
}

export async function createProjectStructure(
  config: ProjectConfig,
): Promise<string | null> {
  const { projectPath, architecture, projectType, framework } = config;

  // Check if framework has a CLI and use it
  const actualPath = await createProjectWithCLI(config);
  if (actualPath) {
    console.log("✓ Project created with framework CLI\n");
    return actualPath; // Return the actual path created by CLI
  }

  // Create base directory
  await createDirectory(projectPath);

  // Create structure based on architecture
  if (projectType === "backend") {
    await createBackendStructure(config);
  } else if (projectType === "frontend") {
    await createFrontendStructure(config);
  } else if (projectType === "fullstack") {
    await createFullstackStructure(config);
  }
  
  return projectPath; // Return the created path
}

async function createBackendStructure(config: ProjectConfig): Promise<void> {
  const { projectPath, architecture, language } = config;

  switch (architecture) {
    case "mvc":
      await createMVCStructure(projectPath, language);
      break;
    case "hexagonal":
      await createHexagonalStructure(projectPath, language);
      break;
    case "layered":
      await createLayeredStructure(projectPath, language);
      break;
    case "layered-screaming":
      await createLayeredScreamingStructure(projectPath, language);
      break;
    default:
      await createLayeredStructure(projectPath, language);
  }
}

async function createFrontendStructure(config: ProjectConfig): Promise<void> {
  const { projectPath, architecture } = config;

  if (architecture === "feature-based") {
    await createFeatureBasedStructure(projectPath);
  } else {
    await createComponentBasedStructure(projectPath);
  }
}

async function createFullstackStructure(config: ProjectConfig): Promise<void> {
  const { projectPath, architecture } = config;

  // Fullstack typically follows framework conventions
  // We'll create a minimal structure here
  await createDirectory(path.join(projectPath, "src"));
  await createDirectory(path.join(projectPath, "public"));
}

async function createMVCStructure(
  projectPath: string,
  language: Language,
): Promise<void> {
  const srcDir = language === "python" ? projectPath : path.join(projectPath, "src");
  
  await createDirectory(path.join(srcDir, "models"));
  await createDirectory(path.join(srcDir, "views"));
  await createDirectory(path.join(srcDir, "controllers"));
  await createDirectory(path.join(srcDir, "routes"));
  await createDirectory(path.join(srcDir, "config"));
  await createDirectory(path.join(srcDir, "middlewares"));
  await createDirectory(path.join(srcDir, "utils"));

  if (language !== "python") {
    await createDirectory(path.join(projectPath, "tests"));
  } else {
    await createDirectory(path.join(projectPath, "tests"));
  }
}

async function createHexagonalStructure(
  projectPath: string,
  language: Language,
): Promise<void> {
  const srcDir = language === "python" ? projectPath : path.join(projectPath, "src");

  await createDirectory(path.join(srcDir, "domain", "entities"));
  await createDirectory(path.join(srcDir, "domain", "repositories"));
  await createDirectory(path.join(srcDir, "domain", "services"));
  await createDirectory(path.join(srcDir, "application", "use-cases"));
  await createDirectory(path.join(srcDir, "application", "dto"));
  await createDirectory(path.join(srcDir, "infrastructure", "adapters"));
  await createDirectory(path.join(srcDir, "infrastructure", "persistence"));
  await createDirectory(path.join(srcDir, "infrastructure", "http"));
  await createDirectory(path.join(projectPath, "tests"));
}

async function createLayeredStructure(
  projectPath: string,
  language: Language,
): Promise<void> {
  const srcDir = language === "python" ? projectPath : path.join(projectPath, "src");

  await createDirectory(path.join(srcDir, "presentation"));
  await createDirectory(path.join(srcDir, "business"));
  await createDirectory(path.join(srcDir, "data"));
  await createDirectory(path.join(srcDir, "config"));
  await createDirectory(path.join(projectPath, "tests"));
}

async function createLayeredScreamingStructure(
  projectPath: string,
  language: Language,
): Promise<void> {
  const srcDir = language === "python" ? projectPath : path.join(projectPath, "src");

  await createDirectory(path.join(srcDir, "features", "example-feature", "presentation"));
  await createDirectory(path.join(srcDir, "features", "example-feature", "business"));
  await createDirectory(path.join(srcDir, "features", "example-feature", "data"));
  await createDirectory(path.join(srcDir, "shared", "config"));
  await createDirectory(path.join(srcDir, "shared", "utils"));
  await createDirectory(path.join(projectPath, "tests"));
}

async function createComponentBasedStructure(projectPath: string): Promise<void> {
  await createDirectory(path.join(projectPath, "src", "components", "common"));
  await createDirectory(path.join(projectPath, "src", "components", "layout"));
  await createDirectory(path.join(projectPath, "src", "pages"));
  await createDirectory(path.join(projectPath, "src", "hooks"));
  await createDirectory(path.join(projectPath, "src", "utils"));
  await createDirectory(path.join(projectPath, "src", "styles"));
  await createDirectory(path.join(projectPath, "src", "assets"));
  await createDirectory(path.join(projectPath, "public"));
}

async function createFeatureBasedStructure(projectPath: string): Promise<void> {
  await createDirectory(path.join(projectPath, "src", "features", "example-feature", "components"));
  await createDirectory(path.join(projectPath, "src", "features", "example-feature", "hooks"));
  await createDirectory(path.join(projectPath, "src", "features", "example-feature", "utils"));
  await createDirectory(path.join(projectPath, "src", "shared", "components"));
  await createDirectory(path.join(projectPath, "src", "shared", "hooks"));
  await createDirectory(path.join(projectPath, "src", "shared", "utils"));
  await createDirectory(path.join(projectPath, "src", "styles"));
  await createDirectory(path.join(projectPath, "src", "assets"));
  await createDirectory(path.join(projectPath, "public"));
}

export async function initializeProject(config: ProjectConfig): Promise<void> {
  const { projectPath, language, framework } = config;

  // Skip initialization if framework CLI was used (it already initialized the project)
  if (FRAMEWORK_CLIS[framework]) {
    return;
  }

  if (language === "python") {
    await initializePythonProject(projectPath, framework);
  } else if (language === "typescript" || language === "javascript") {
    await initializeNodeProject(projectPath, language, framework);
  } else if (language === "go") {
    await initializeGoProject(projectPath);
  }
}

async function initializePythonProject(
  projectPath: string,
  framework: string,
): Promise<void> {
  // Create pyproject.toml
  const pyprojectContent = `[project]
name = "${path.basename(projectPath)}"
version = "0.1.0"
description = "A Python project with ${framework}"
requires-python = ">=3.11"
dependencies = []

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.uv]
dev-dependencies = [
    "pytest>=8.0.0",
    "pytest-cov>=4.1.0",
]
`;

  await writeFile(path.join(projectPath, "pyproject.toml"), pyprojectContent);

  // Create main.py
  const mainContent = `"""Main application entry point."""

def main() -> None:
    """Run the application."""
    print("Hello from ${framework}!")

if __name__ == "__main__":
    main()
`;

  await writeFile(path.join(projectPath, "main.py"), mainContent);

  // Create .python-version
  await writeFile(path.join(projectPath, ".python-version"), "3.11\n");
}

async function initializeNodeProject(
  projectPath: string,
  language: Language,
  framework: string,
): Promise<void> {
  const isTypeScript = language === "typescript";
  const ext = isTypeScript ? "ts" : "js";

  // Create package.json
  const packageJson = {
    name: path.basename(projectPath),
    version: "1.0.0",
    description: `A ${language} project with ${framework}`,
    main: `src/index.${ext}`,
    type: "module",
    scripts: {
      dev: "tsx watch src/index.ts",
      build: isTypeScript ? "tsc" : "echo 'No build needed'",
      start: `node dist/index.js`,
    },
    keywords: [],
    author: "",
    license: "ISC",
    dependencies: {},
    devDependencies: isTypeScript
      ? {
          typescript: "^5.9.3",
          "@types/node": "^25.3.0",
          tsx: "^4.19.2",
        }
      : {},
  };

  await writeFile(
    path.join(projectPath, "package.json"),
    JSON.stringify(packageJson, null, 2),
  );

  // Create tsconfig.json for TypeScript
  if (isTypeScript) {
    const tsconfigContent = {
      compilerOptions: {
        target: "ES2022",
        module: "ESNext",
        lib: ["ES2022"],
        moduleResolution: "bundler",
        outDir: "./dist",
        rootDir: "./src",
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        resolveJsonModule: true,
        allowSyntheticDefaultImports: true,
      },
      include: ["src/**/*"],
      exclude: ["node_modules", "dist"],
    };

    await writeFile(
      path.join(projectPath, "tsconfig.json"),
      JSON.stringify(tsconfigContent, null, 2),
    );
  }

  // Create main file
  const srcDir = path.join(projectPath, "src");
  await createDirectory(srcDir);

  const mainContent = `console.log("Hello from ${framework}!");\n`;
  await writeFile(path.join(srcDir, `index.${ext}`), mainContent);
}

async function initializeGoProject(projectPath: string): Promise<void> {
  const moduleName = path.basename(projectPath);

  // Initialize go module
  try {
    executeCommand(`go mod init ${moduleName}`, projectPath);
  } catch (error) {
    console.warn("Could not initialize Go module. Make sure Go is installed.");
  }

  // Create main.go
  const mainContent = `package main

import "fmt"

func main() {
    fmt.Println("Hello from Go!")
}
`;

  await writeFile(path.join(projectPath, "main.go"), mainContent);
}
