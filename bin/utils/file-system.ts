import { execSync } from "child_process";
import path from "path";
import fs from "fs/promises";

export async function checkCommandExists(command: string): Promise<boolean> {
  try {
    execSync(`which ${command}`, { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export async function createDirectory(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    console.error(`Error creating directory ${dirPath}:`, error);
    throw error;
  }
}

export async function writeFile(
  filePath: string,
  content: string,
): Promise<void> {
  try {
    const dirPath = path.dirname(filePath);
    await createDirectory(dirPath);
    await fs.writeFile(filePath, content, "utf-8");
  } catch (error) {
    console.error(`Error writing file ${filePath}:`, error);
    throw error;
  }
}

export async function copyDirectory(
  src: string,
  dest: string,
): Promise<void> {
  try {
    await createDirectory(dest);
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  } catch (error) {
    console.error(`Error copying directory ${src} to ${dest}:`, error);
    throw error;
  }
}

export function executeCommand(command: string, cwd?: string): string {
  try {
    return execSync(command, {
      cwd,
      encoding: "utf-8",
      stdio: "pipe",
    });
  } catch (error) {
    throw new Error(`Failed to execute command: ${command}`);
  }
}
