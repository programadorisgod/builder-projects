import { execSync } from "child_process";

export type PackageManager = "pnpm" | "bun" | "npm" | "yarn";

export function detectPackageManager(): PackageManager {
  const managers: PackageManager[] = ["pnpm", "bun", "yarn", "npm"];

  for (const manager of managers) {
    try {
      execSync(`${manager} --version`, { stdio: "ignore" });
      return manager;
    } catch {
      continue;
    }
  }

  return "npm";
}

export function getInstallCommand(packageManager: PackageManager): string {
  const commands = {
    pnpm: "pnpm install",
    bun: "bun install",
    npm: "npm install",
    yarn: "yarn install",
  };

  return commands[packageManager];
}

export function getRunCommand(
  packageManager: PackageManager,
  script: string,
): string {
  const commands = {
    pnpm: `pnpm ${script}`,
    bun: `bun ${script}`,
    npm: `npm run ${script}`,
    yarn: `yarn ${script}`,
  };

  return commands[packageManager];
}
