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

export async function readDirectory(dirPath: string): Promise<string[]> {
  try {
    return await fs.readdir(dirPath);
  } catch (error) {
    console.error(`Error reading directory ${dirPath}:`, error);
    return [];
  }
}

export async function moveFile(src: string, dest: string): Promise<void> {
  try {
    const destDir = path.dirname(dest);
    await createDirectory(destDir);
    await fs.rename(src, dest);
  } catch (error) {
    console.error(`Error moving file ${src} to ${dest}:`, error);
    throw error;
  }
}

export async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function removeDirectory(dirPath: string): Promise<void> {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
  } catch (error) {
    console.error(`Error removing directory ${dirPath}:`, error);
  }
}
