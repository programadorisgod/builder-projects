#!/usr/bin/env node

import { Command } from "commander";
import ora from "ora";
import figlet from "figlet";
import inquirer from "inquirer";
import chalk from "chalk";
import path from "path";
import { execSync } from "child_process";
import type { Project } from "./types/projects.js";
import type { Language } from "./types/languages.js";
import { BACKEND_LANGUAGES, FRONTEND_LANGUAGES } from "./types/languages.js";
import {
  BACKEND_FRAMEWORKS,
  FRONTEND_FRAMEWORKS,
  FULLSTACK_FRAMEWORKS,
} from "./types/frameworks.js";
import {
  BACKEND_ARCHITECTURES,
  FRONTEND_ARCHITECTURES,
} from "./types/architecture.js";
import { AVAILABLE_MCPS } from "./types/mcps.js";
import {
  DEFAULT_SKILLS,
  FRAMEWORK_SKILLS,
  ADDITIONAL_SKILLS,
} from "./types/skills.js";
import {
  detectPackageManager,
  getInstallCommand,
} from "./utils/package-manager.js";
import { checkCommandExists } from "./utils/file-system.js";
import {
  createProjectStructure,
  initializeProject,
} from "./utils/project-scaffolding.js";
import { installSkills, combineSkills } from "./utils/skills.js";
import { createMCPConfig, getMCPInstallInstructions } from "./utils/mcp-config.js";

const program = new Command();

console.log(
  chalk.bold.italic.blueBright(
    figlet.textSync("Builder CLI", { horizontalLayout: "full" }),
  ),
);

program
  .version("1.0.0")
  .description("A CLI tool for building projects")
  .action(async () => {
    console.log(chalk.italic.blue(`User: ${process.env.USER}\n`));

    try {
      // Step 1: Project Type
      const { projectType } = await inquirer.prompt([
        {
          type: "rawlist",
          name: "projectType",
          message: "What type of project do you want to create?",
          choices: [
            { name: "🔙 Backend", value: "backend" },
            { name: "🎨 Frontend", value: "frontend" },
            { name: "🔄 Fullstack", value: "fullstack" },
          ],
        },
      ]);

      // Step 2: Language Selection
      const languageChoices =
        projectType === "backend"
          ? BACKEND_LANGUAGES
          : FRONTEND_LANGUAGES;

      const { language } = await inquirer.prompt([
        {
          type: "rawlist",
          name: "language",
          message: "Which language do you want to use?",
          choices: languageChoices,
        },
      ]);

      // Step 3: Framework Selection
      let frameworkChoices: any[] = [];
      if (projectType === "backend") {
        frameworkChoices = BACKEND_FRAMEWORKS[language] || [];
      } else if (projectType === "frontend") {
        frameworkChoices = FRONTEND_FRAMEWORKS[language] || [];
      } else {
        frameworkChoices = FULLSTACK_FRAMEWORKS[language] || [];
      }

      const { framework } = await inquirer.prompt([
        {
          type: "rawlist",
          name: "framework",
          message: "Which framework do you want to use?",
          choices: frameworkChoices.map((f) => ({
            name: f.name,
            value: f.value,
          })),
        },
      ]);

      // Step 4: Project Name
      const { projectName } = await inquirer.prompt([
        {
          type: "input",
          name: "projectName",
          message: "What is the name of your project?",
          default: "my-project",
          validate: (input: string) => {
            if (!input || input.trim().length === 0) {
              return "Project name cannot be empty";
            }
            if (!/^[a-z0-9-_]+$/i.test(input)) {
              return "Project name can only contain letters, numbers, hyphens, and underscores";
            }
            return true;
          },
        },
      ]);

      // Step 5: Architecture Selection
      const { wantsArchitecture } = await inquirer.prompt([
        {
          type: "confirm",
          name: "wantsArchitecture",
          message: "Do you want to choose a specific architecture?",
          default: false,
        },
      ]);

      let architecture = "default";
      if (wantsArchitecture) {
        const architectureChoices =
          projectType === "backend" || projectType === "fullstack"
            ? BACKEND_ARCHITECTURES
            : FRONTEND_ARCHITECTURES;

        const { selectedArchitecture } = await inquirer.prompt([
          {
            type: "rawlist",
            name: "selectedArchitecture",
            message: "Which architecture do you want to use?",
            choices: architectureChoices.map((a) => ({
              name: `${a.name} - ${a.description}`,
              value: a.value,
            })),
          },
        ]);

        architecture = selectedArchitecture;
      } else {
        // Set default architecture
        if (projectType === "backend") {
          architecture = "layered";
        } else {
          architecture = "component-based";
        }
      }

      // Step 6: MCP Selection
      const { wantsMCP } = await inquirer.prompt([
        {
          type: "confirm",
          name: "wantsMCP",
          message: "Do you want to configure Model Context Protocols (MCPs)?",
          default: false,
        },
      ]);

      let selectedMCPs: any[] = [];
      if (wantsMCP) {
        const { mcps } = await inquirer.prompt([
          {
            type: "checkbox",
            name: "mcps",
            message: "Select the MCPs you want to use:",
            choices: AVAILABLE_MCPS.map((mcp) => ({
              name: `${mcp.name} - ${mcp.description}`,
              value: mcp,
            })),
          },
        ]);

        selectedMCPs = mcps;
      }

      // Step 7: Additional Skills
      const { wantsAdditionalSkills } = await inquirer.prompt([
        {
          type: "confirm",
          name: "wantsAdditionalSkills",
          message: "Do you want to add additional skills?",
          default: false,
        },
      ]);

      let selectedAdditionalSkills: any[] = [];
      if (wantsAdditionalSkills) {
        const { skills } = await inquirer.prompt([
          {
            type: "checkbox",
            name: "skills",
            message: "Select additional skills:",
            choices: ADDITIONAL_SKILLS.map((skill) => ({
              name: `${skill.name} - ${skill.description}`,
              value: skill,
            })),
          },
        ]);

        selectedAdditionalSkills = skills;
      }

      // Create project
      let spinner = ora("Creating project...").start();

      const projectPath = path.join(process.cwd(), projectName);

      // Create project structure
      spinner.stop();
      const actualProjectPath = await createProjectStructure({
        projectName,
        projectType: projectType as Project,
        language: language as Language,
        framework,
        architecture,
        projectPath,
      });

      // Use the actual path returned (might be different due to normalization)
      const finalProjectPath = actualProjectPath || projectPath;
      const finalProjectName = path.basename(finalProjectPath);

      // Initialize project
      await initializeProject({
        projectName: finalProjectName,
        projectType: projectType as Project,
        language: language as Language,
        framework,
        architecture,
        projectPath: finalProjectPath,
      });

      spinner = ora("Installing skills...").start();

      // Install skills
      const defaultSkills = DEFAULT_SKILLS[projectType] || [];
      const frameworkSkills = FRAMEWORK_SKILLS[framework] || [];
      const allSkills = combineSkills(
        defaultSkills,
        frameworkSkills,
        selectedAdditionalSkills,
      );

      await installSkills(finalProjectPath, allSkills);

      // Configure MCPs
      if (selectedMCPs.length > 0) {
        spinner.text = "Configuring MCPs...";
        await createMCPConfig(finalProjectPath, selectedMCPs);
      }

      // Handle Python venv
      if (language === "python") {
        spinner.text = "Creating Python virtual environment...";
        const hasUV = await checkCommandExists("uv");

        if (hasUV) {
          try {
            execSync("uv venv", { cwd: finalProjectPath, stdio: "ignore" });
            spinner.succeed("Python virtual environment created with UV!");
          } catch (error) {
            spinner.warn("Could not create virtual environment automatically");
          }
        } else {
          spinner.warn(
            "UV is not installed. Please install it: https://github.com/astral-sh/uv",
          );
        }
      }

      spinner.succeed(chalk.green("✨ Project created successfully!\n"));

      // Show next steps
      console.log(chalk.bold.cyan("📋 Next Steps:\n"));
      console.log(chalk.white(`   cd ${finalProjectName}`));

      if (language === "python") {
        const hasUV = await checkCommandExists("uv");
        if (hasUV) {
          console.log(chalk.white("   source .venv/bin/activate  # Activate virtual environment"));
          console.log(chalk.white("   uv pip install -e .        # Install dependencies"));
        } else {
          console.log(chalk.white("   python -m venv .venv       # Create virtual environment"));
          console.log(chalk.white("   source .venv/bin/activate  # Activate virtual environment"));
          console.log(chalk.white("   pip install -e .           # Install dependencies"));
        }
      } else if (
        language === "typescript" ||
        language === "javascript" ||
        language === "go"
      ) {
        if (language === "go") {
          console.log(chalk.white("   go mod tidy                # Download dependencies"));
          console.log(chalk.white("   go run main.go             # Run the application"));
        } else {
          const packageManager = detectPackageManager();
          const installCmd = getInstallCommand(packageManager);
          
          // Frameworks with CLI already install dependencies
          const cliFrameworks = ["nestjs", "nextjs", "react", "svelte", "sveltekit", "angular"];
          if (!cliFrameworks.includes(framework)) {
            console.log(chalk.white(`   ${installCmd}              # Install dependencies`));
          }
          
          // Show appropriate dev command based on framework
          if (framework === "nestjs") {
            console.log(chalk.white(`   ${packageManager === "npm" ? "npm run" : packageManager} start:dev         # Start development server`));
          } else if (framework === "nextjs") {
            console.log(chalk.white(`   ${packageManager === "npm" ? "npm run" : packageManager} dev                # Start development server`));
          } else {
            console.log(
              chalk.white(
                `   ${packageManager === "npm" ? "npm run" : packageManager} dev                # Start development server`,
              ),
            );
          }
        }
      }

      console.log();
      console.log(chalk.bold.cyan("📦 Skills Installed:"));
      for (const skill of allSkills) {
        console.log(chalk.white(`   - ${skill.name}`));
      }

      if (selectedMCPs.length > 0) {
        console.log(getMCPInstallInstructions(selectedMCPs));
      }

      console.log(chalk.bold.green("\n🎉 Happy coding!\n"));
    } catch (error: any) {
      if (error.message === "User force closed the prompt") {
        console.log(chalk.yellow("\n👋 Setup cancelled by user"));
        process.exit(0);
      }
      console.error(chalk.red(`\n❌ Error: ${error.message}`));
      process.exit(1);
    }
  });

program.parse(process.argv);

process.on("uncaughtException", (err) => {
  console.error(chalk.red(`Uncaught Exception: ${err.message}`));
  process.exit(1);
});
