import path from "path";
import { 
  createDirectory, 
  writeFile, 
  executeCommand, 
  checkCommandExists,
  readDirectory,
  moveFile,
  pathExists,
  removeDirectory 
} from "./file-system.js";
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
  svelte: { command: "npx", checkCommand: "npx --version" },
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
        // Use non-interactive mode and don't install dependencies yet
        const reactCmd = `npx --yes create-vite@latest ${normalizedName} --template ${reactTemplate}`;
        execSync(reactCmd, {
          cwd: parentDir,
          stdio: "pipe", // Suppress output to avoid confusion
        });
        console.log("✓ Project scaffolded\n");
        return actualProjectPath;
        
      case "svelte":
        console.log("\nUsing Vite to create Svelte project...");
        const svelteTemplate = language === "typescript" ? "svelte-ts" : "svelte";
        // Use non-interactive mode and don't install dependencies yet
        const svelteCmd = `npx --yes create-vite@latest ${normalizedName} --template ${svelteTemplate}`;
        execSync(svelteCmd, {
          cwd: parentDir,
          stdio: "pipe", // Suppress output to avoid confusion
        });
        console.log("✓ Project scaffolded\n");
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
    
    // For React and Svelte, reorganize structure based on architecture
    if (framework === "react" || framework === "svelte") {
      await reorganizeViteProject(actualPath, architecture, framework);
    }
    
    // Configure $lib alias for Svelte
    if (framework === "svelte") {
      await configureSvelteAliases(actualPath);
    }
    
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

// Reorganize Vite projects (React/Svelte) after creation
async function reorganizeViteProject(
  projectPath: string,
  architecture: string,
  framework: string
): Promise<void> {
  console.log("🔄 Reorganizing project structure based on architecture...\n");
  
  const srcPath = path.join(projectPath, "src");
  
  // Svelte uses src/lib/ structure
  if (framework === "svelte") {
    await reorganizeSvelteProject(srcPath, architecture);
  } else {
    // React uses src/ directly
    await reorganizeReactProject(srcPath, architecture);
  }
  
  console.log("✓ Project structure reorganized\n");
}

// Configure $lib aliases for Svelte in vite.config.ts and tsconfig.app.json
async function configureSvelteAliases(projectPath: string): Promise<void> {
  console.log("🔧 Configuring $lib aliases for Svelte...\n");
  
  const fs = await import("fs/promises");
  
  // Update vite.config.ts
  const viteConfigPath = path.join(projectPath, "vite.config.ts");
  const viteConfigExists = await pathExists(viteConfigPath);
  
  if (viteConfigExists) {
    let viteContent = await fs.readFile(viteConfigPath, "utf-8");
    
    // Add path import if not present
    if (!viteContent.includes('import path from')) {
      viteContent = viteContent.replace(
        /import\s+{[^}]+}\s+from\s+['"]@sveltejs\/vite-plugin-svelte['"]/,
        `import { svelte } from "@sveltejs/vite-plugin-svelte";\nimport path from "node:path"`
      );
    }
    
    // Add resolve.alias configuration
    if (!viteContent.includes('resolve:')) {
      viteContent = viteContent.replace(
        /plugins:\s*\[svelte\(\)\],/,
        `plugins: [svelte()],\n  resolve: {\n    alias: {\n      $lib: path.resolve("src/lib/"),\n    },\n  },`
      );
    }
    
    await fs.writeFile(viteConfigPath, viteContent, "utf-8");
  }
  
  // Update tsconfig.app.json
  const tsconfigAppPath = path.join(projectPath, "tsconfig.app.json");
  const tsconfigAppExists = await pathExists(tsconfigAppPath);
  
  if (tsconfigAppExists) {
    let tsconfigContent = await fs.readFile(tsconfigAppPath, "utf-8");
    
    // Check if paths is already configured
    if (!tsconfigContent.includes('"paths"')) {
      // Find compilerOptions and add paths after it
      tsconfigContent = tsconfigContent.replace(
        /"compilerOptions":\s*{/,
        `"compilerOptions": {\n    "paths": {\n      "$lib/*": ["src/lib/*"]\n    },`
      );
      
      await fs.writeFile(tsconfigAppPath, tsconfigContent, "utf-8");
    }
  }
  
  console.log("✓ $lib aliases configured\n");
}

// Reorganize React project
async function reorganizeReactProject(
  srcPath: string,
  architecture: string
): Promise<void> {
  const files = await readDirectory(srcPath);
  
  if (architecture === "feature-based") {
    // Feature-based architecture
    await createDirectory(path.join(srcPath, "features", "example", "components"));
    await createDirectory(path.join(srcPath, "features", "example", "hooks"));
    await createDirectory(path.join(srcPath, "features", "example", "utils"));
    await createDirectory(path.join(srcPath, "features", "example", "styles"));
    await createDirectory(path.join(srcPath, "shared", "components"));
    await createDirectory(path.join(srcPath, "shared", "hooks"));
    await createDirectory(path.join(srcPath, "shared", "utils"));
    await createDirectory(path.join(srcPath, "shared", "styles"));
    
    // Move CSS files only - keep App.tsx and main.tsx in src root
    for (const file of files) {
      const filePath = path.join(srcPath, file);
      const exists = await pathExists(filePath);
      
      if (!exists || file === "assets") continue;
      
      if (file === "App.css") {
        await moveFile(filePath, path.join(srcPath, "features", "example", "styles", file));
      } else if (file === "index.css") {
        await moveFile(filePath, path.join(srcPath, "shared", "styles", file));
      }
    }
    
    // Update CSS imports
    await updateAppCssImports(srcPath, "features/example/styles", architecture);
    await updateMainCssImports(srcPath, architecture);
    
  } else {
    // Component-based architecture (default)
    await createDirectory(path.join(srcPath, "components", "common"));
    await createDirectory(path.join(srcPath, "components", "layout"));
    await createDirectory(path.join(srcPath, "hooks"));
    await createDirectory(path.join(srcPath, "utils"));
    await createDirectory(path.join(srcPath, "styles"));
    
    // Move CSS files only
    for (const file of files) {
      const filePath = path.join(srcPath, file);
      const exists = await pathExists(filePath);
      
      if (!exists || file === "assets") continue;
      
      if (file === "App.css") {
        await moveFile(filePath, path.join(srcPath, "styles", file));
      } else if (file === "index.css") {
        await moveFile(filePath, path.join(srcPath, "styles", file));
      }
    }
    
    // Update CSS imports
    await updateAppCssImports(srcPath, "styles", architecture);
    await updateMainCssImports(srcPath, architecture);
  }
}

// Reorganize Svelte project (uses src/lib/ structure)
async function reorganizeSvelteProject(
  srcPath: string,
  architecture: string
): Promise<void> {
  const libPath = path.join(srcPath, "lib");
  const libFiles = await readDirectory(libPath);
  
  if (architecture === "feature-based") {
    // Feature-based architecture: features in src/, shared in lib/
    await createDirectory(path.join(srcPath, "features", "example", "components"));
    await createDirectory(path.join(srcPath, "features", "example", "stores"));
    await createDirectory(path.join(srcPath, "features", "example", "utils"));
    await createDirectory(path.join(libPath, "shared", "components"));
    await createDirectory(path.join(libPath, "shared", "stores"));
    await createDirectory(path.join(libPath, "shared", "utils"));
    await createDirectory(path.join(libPath, "shared", "styles"));
    
    // Move Counter.svelte to lib/shared/components/
    for (const file of libFiles) {
      const filePath = path.join(libPath, file);
      const exists = await pathExists(filePath);
      
      if (!exists) continue;
      
      if (file === "Counter.svelte") {
        await moveFile(filePath, path.join(libPath, "shared", "components", file));
      }
    }
    
    // Update imports in App.svelte
    await updateSvelteAppImports(srcPath, "lib/shared/components");
    
  } else {
    // Component-based architecture (default) in lib/
    await createDirectory(path.join(libPath, "components", "common"));
    await createDirectory(path.join(libPath, "components", "layout"));
    await createDirectory(path.join(libPath, "stores"));
    await createDirectory(path.join(libPath, "utils"));
    await createDirectory(path.join(libPath, "styles"));
    
    // Move Counter.svelte to components/common/
    for (const file of libFiles) {
      const filePath = path.join(libPath, file);
      const exists = await pathExists(filePath);
      
      if (!exists) continue;
      
      if (file === "Counter.svelte") {
        await moveFile(filePath, path.join(libPath, "components", "common", file));
      }
    }
    
    // Update imports in App.svelte
    await updateSvelteAppImports(srcPath, "lib/components/common");
  }
  
  // Move root CSS files
  const srcFiles = await readDirectory(srcPath);
  for (const file of srcFiles) {
    const filePath = path.join(srcPath, file);
    const exists = await pathExists(filePath);
    
    if (!exists || file === "assets" || file === "lib" || file === "features") continue;
    
    if (file === "app.css") {
      const targetPath = path.join(libPath, "shared", "styles", file);
      await moveFile(filePath, targetPath);
      
      // Update import in main.ts
      await updateSvelteCssImport(srcPath, architecture);
    }
  }
}

// Update CSS imports in main.tsx/jsx after reorganization
async function updateMainCssImports(
  srcPath: string,
  architecture: string
): Promise<void> {
  const fs = await import("fs/promises");
  
  // Check for main.tsx or main.jsx
  const mainFiles = ["main.tsx", "main.jsx"];
  
  for (const mainFile of mainFiles) {
    const mainPath = path.join(srcPath, mainFile);
    const exists = await pathExists(mainPath);
    
    if (exists) {
      let content = await fs.readFile(mainPath, "utf-8");
      
      // Update CSS imports only
      if (architecture === "feature-based") {
        content = content.replace(
          /import ['"]\.\/index\.css['"]/g,
          `import './shared/styles/index.css'`
        );
      } else {
        content = content.replace(
          /import ['"]\.\/index\.css['"]/g,
          `import './styles/index.css'`
        );
      }
      
      await fs.writeFile(mainPath, content, "utf-8");
      break;
    }
  }
}

// Update CSS imports in App component after reorganization
async function updateAppCssImports(
  srcPath: string,
  cssPath: string,
  architecture: string
): Promise<void> {
  const fs = await import("fs/promises");
  
  // Check for App.tsx, App.jsx, or App.svelte
  const appFiles = ["App.tsx", "App.jsx", "App.svelte"];
  
  for (const appFile of appFiles) {
    const appPath = path.join(srcPath, appFile);
    const exists = await pathExists(appPath);
    
    if (exists) {
      let content = await fs.readFile(appPath, "utf-8");
      
      // Update App.css import path
      content = content.replace(
        /import ['"]\.\/App\.css['"]/g,
        `import './${cssPath}/App.css'`
      );
      
      await fs.writeFile(appPath, content, "utf-8");
      break;
    }
  }
}

// Update imports in Svelte App.svelte for Counter component
async function updateSvelteAppImports(
  srcPath: string,
  counterRelativePath: string
): Promise<void> {
  const fs = await import("fs/promises");
  const appPath = path.join(srcPath, "App.svelte");
  const exists = await pathExists(appPath);
  
  if (exists) {
    let content = await fs.readFile(appPath, "utf-8");
    
    // Svelte uses $lib alias for src/lib/
    // counterRelativePath comes as "lib/components/common" or "lib/features/example/components"
    // We need to change it to "$lib/components/common" format
    const libPath = counterRelativePath.replace(/^lib\//, '');
    
    // Update Counter import
    content = content.replace(
      /import\s+Counter\s+from\s+['"]\.\/lib\/Counter\.svelte['"]/g,
      `import Counter from '$lib/${libPath}/Counter.svelte'`
    );
    
    // Also handle if it's already using $lib
    content = content.replace(
      /import\s+Counter\s+from\s+['"]\$lib\/Counter\.svelte['"]/g,
      `import Counter from '$lib/${libPath}/Counter.svelte'`
    );
    
    await fs.writeFile(appPath, content, "utf-8");
  }
}

// Update CSS import in Svelte main.ts
async function updateSvelteCssImport(
  srcPath: string,
  architecture: string
): Promise<void> {
  const fs = await import("fs/promises");
  const mainPath = path.join(srcPath, "main.ts");
  const exists = await pathExists(mainPath);
  
  if (exists) {
    let content = await fs.readFile(mainPath, "utf-8");
    
    const cssPath = architecture === "feature-based"
      ? "$lib/shared/styles/app.css"
      : "$lib/styles/app.css";
    
    content = content.replace(
      /import ['"]\.\/app\.css['"]/g,
      `import '${cssPath}'`
    );
    
    await fs.writeFile(mainPath, content, "utf-8");
  }
}


async function createBackendStructure(config: ProjectConfig): Promise<void> {
  const { projectPath, architecture, language, framework } = config;

  // Django creates its own structure with django-admin
  if (framework === "django") {
    return; // Skip manual structure creation
  }

  // Go has its own structure conventions
  if (language === "go") {
    await createGoStructure(projectPath, architecture);
    return;
  }

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

// Go-specific structures following Go conventions
async function createGoStructure(projectPath: string, architecture: string): Promise<void> {
  switch (architecture) {
    case "mvc":
      await createGoMVCStructure(projectPath);
      break;
    case "hexagonal":
      await createGoHexagonalStructure(projectPath);
      break;
    case "layered":
      await createGoLayeredStructure(projectPath);
      break;
    case "layered-screaming":
      await createGoLayeredScreamingStructure(projectPath);
      break;
    default:
      await createGoLayeredStructure(projectPath);
  }
}

async function createGoLayeredStructure(projectPath: string): Promise<void> {
  // Standard Go project layout with layered architecture
  await createDirectory(path.join(projectPath, "cmd", "api"));
  await createDirectory(path.join(projectPath, "internal", "delivery", "http", "handler"));
  await createDirectory(path.join(projectPath, "internal", "delivery", "http", "middleware"));
  await createDirectory(path.join(projectPath, "internal", "business"));
  await createDirectory(path.join(projectPath, "internal", "data", "repository"));
  await createDirectory(path.join(projectPath, "internal", "infrastructure", "database"));
  await createDirectory(path.join(projectPath, "internal", "infrastructure", "config"));
  await createDirectory(path.join(projectPath, "pkg"));
}

async function createGoMVCStructure(projectPath: string): Promise<void> {
  // Go MVC structure
  await createDirectory(path.join(projectPath, "cmd", "api"));
  await createDirectory(path.join(projectPath, "internal", "models"));
  await createDirectory(path.join(projectPath, "internal", "views"));
  await createDirectory(path.join(projectPath, "internal", "controllers"));
  await createDirectory(path.join(projectPath, "internal", "routes"));
  await createDirectory(path.join(projectPath, "internal", "middleware"));
  await createDirectory(path.join(projectPath, "internal", "infrastructure", "database"));
  await createDirectory(path.join(projectPath, "internal", "infrastructure", "config"));
  await createDirectory(path.join(projectPath, "pkg"));
}

async function createGoHexagonalStructure(projectPath: string): Promise<void> {
  // Go Hexagonal/Clean Architecture
  await createDirectory(path.join(projectPath, "cmd", "api"));
  await createDirectory(path.join(projectPath, "internal", "domain", "entity"));
  await createDirectory(path.join(projectPath, "internal", "domain", "repository"));
  await createDirectory(path.join(projectPath, "internal", "usecase"));
  await createDirectory(path.join(projectPath, "internal", "delivery", "http", "handler"));
  await createDirectory(path.join(projectPath, "internal", "delivery", "http", "middleware"));
  await createDirectory(path.join(projectPath, "internal", "infrastructure", "database"));
  await createDirectory(path.join(projectPath, "internal", "infrastructure", "config"));
  await createDirectory(path.join(projectPath, "pkg"));
}

async function createGoLayeredScreamingStructure(projectPath: string): Promise<void> {
  // Go Layered with Feature-based organization
  await createDirectory(path.join(projectPath, "cmd", "api"));
  await createDirectory(path.join(projectPath, "internal", "features", "example", "handler"));
  await createDirectory(path.join(projectPath, "internal", "features", "example", "business"));
  await createDirectory(path.join(projectPath, "internal", "features", "example", "repository"));
  await createDirectory(path.join(projectPath, "internal", "shared", "middleware"));
  await createDirectory(path.join(projectPath, "internal", "shared", "utils"));
  await createDirectory(path.join(projectPath, "internal", "infrastructure", "database"));
  await createDirectory(path.join(projectPath, "internal", "infrastructure", "config"));
  await createDirectory(path.join(projectPath, "pkg"));
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
    await initializeGoProject(projectPath, framework);
  }
}

async function initializePythonProject(
  projectPath: string,
  framework: string,
): Promise<void> {
  // Django requires special initialization
  if (framework === "django") {
    await initializeDjangoProject(projectPath);
    return;
  }

  // Standard Python project initialization for other frameworks
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

async function initializeDjangoProject(projectPath: string): Promise<void> {
  const projectName = path.basename(projectPath);

  // Create .python-version
  await writeFile(path.join(projectPath, ".python-version"), "3.11\n");

  // Create .gitignore for Django
  const gitignoreContent = `# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
.venv/
venv/
ENV/
env/

# Django
*.log
local_settings.py
db.sqlite3
db.sqlite3-journal
media/
staticfiles/

# IDEs
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db
`;

  await writeFile(path.join(projectPath, ".gitignore"), gitignoreContent);

  // Create requirements.txt (will be filled after Django installation)
  await writeFile(path.join(projectPath, "requirements.txt"), "# Dependencies will be added via: uv pip freeze > requirements.txt\n");

  // Create README.md with setup instructions
  const readmeContent = `# ${projectName}

Django project created with builder-cli.

## 🚀 Setup

### 1️⃣ Activate virtual environment

**Linux/macOS:**
\`\`\`bash
source .venv/bin/activate
\`\`\`

**Windows (PowerShell):**
\`\`\`powershell
.venv\\Scripts\\Activate.ps1
\`\`\`

### 2️⃣ Install Django

\`\`\`bash
uv pip install Django
\`\`\`

### 3️⃣ Create Django project

\`\`\`bash
django-admin startproject config .
\`\`\`

### 4️⃣ Run migrations

\`\`\`bash
python manage.py migrate
\`\`\`

### 5️⃣ Create superuser (optional)

\`\`\`bash
python manage.py createsuperuser
\`\`\`

### 6️⃣ Run development server

\`\`\`bash
python manage.py runserver
\`\`\`

Visit: http://127.0.0.1:8000

Admin panel: http://127.0.0.1:8000/admin

## 📦 Creating Django Apps

Django works with modular apps:

\`\`\`bash
python manage.py startapp core
\`\`\`

Register the app in \`config/settings.py\`:

\`\`\`python
INSTALLED_APPS = [
    ...
    "core",
]
\`\`\`

## 🧠 Good Practices

- ✅ Always use virtual environment
- ✅ Keep \`.venv/\` in \`.gitignore\`
- ✅ Pin dependencies with: \`uv pip freeze > requirements.txt\`
- ✅ Never install Django globally

## 📁 Expected Structure

After running \`django-admin startproject config .\`:

\`\`\`
${projectName}/
 ├── .venv/
 ├── manage.py
 ├── config/
 │   ├── settings.py
 │   ├── urls.py
 │   ├── asgi.py
 │   └── wsgi.py
 ├── .gitignore
 ├── requirements.txt
 └── README.md
\`\`\`
`;

  await writeFile(path.join(projectPath, "README.md"), readmeContent);
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
      dev: isTypeScript ? "tsx watch src/index.ts" : "node src/index.js",
      build: isTypeScript ? "tsc" : "echo 'No build needed'",
      start: isTypeScript ? `node dist/index.js` : "node src/index.js",
    },
    keywords: [],
    author: "",
    license: "ISC",
    dependencies: framework === "fastify" ? { fastify: "^5.2.0" } : {},
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

  let mainContent = `console.log("Hello from ${framework}!");\n`;
  
  // Fastify-specific starter code
  if (framework === "fastify" && isTypeScript) {
    mainContent = `// Import the framework and instantiate it
import Fastify from 'fastify'
const fastify = Fastify({
  logger: true
})

// Declare a route
fastify.get('/', async function handler (request, reply) {
  return { hello: 'world' }
})

// Run the server!
try {
  await fastify.listen({ port: 3000 })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
`;
  } else if (framework === "fastify" && !isTypeScript) {
    mainContent = `// Import the framework and instantiate it
import Fastify from 'fastify'
const fastify = Fastify({
  logger: true
})

// Declare a route
fastify.get('/', async function handler (request, reply) {
  return { hello: 'world' }
})

// Run the server!
try {
  await fastify.listen({ port: 3000 })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
`;
  }
  
  await writeFile(path.join(srcDir, `index.${ext}`), mainContent);
}

async function initializeGoProject(projectPath: string, framework: string): Promise<void> {
  const moduleName = path.basename(projectPath);

  // Initialize go module
  try {
    executeCommand(`go mod init ${moduleName}`, projectPath);
  } catch (error) {
    console.warn("Could not initialize Go module. Make sure Go is installed.");
  }

  // Create main.go in cmd/api directory
  const mainPath = path.join(projectPath, "cmd", "api", "main.go");
  let mainContent = "";
  
  switch (framework) {
    case "fiber":
      mainContent = `package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	app := fiber.New(fiber.Config{
		AppName: "${moduleName}",
	})

	// Middleware
	app.Use(logger.New())

	// Routes
	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message": "Hello from Fiber!",
		})
	})

	// Start server
	log.Fatal(app.Listen(":3000"))
}
`;
      break;
      
    case "gin":
      mainContent = `package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	// Routes
	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Hello from Gin!",
		})
	})

	// Start server
	if err := r.Run(":3000"); err != nil {
		panic(err)
	}
}
`;
      break;
      
    case "echo":
      mainContent = `package main

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	// Routes
	e.GET("/", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{
			"message": "Hello from Echo!",
		})
	})

	// Start server
	e.Logger.Fatal(e.Start(":3000"))
}
`;
      break;
      
    default:
      mainContent = `package main

import "fmt"

func main() {
	fmt.Println("Hello from Go!")
}
`;
  }

  await writeFile(mainPath, mainContent);
}
