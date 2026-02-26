import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { copyDirectory, createDirectory } from "./file-system.js";
import type { Skill } from "../types/skills.js";
import {
  DEFAULT_SKILLS,
  FRAMEWORK_SKILLS,
  ADDITIONAL_SKILLS,
} from "../types/skills.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve assets path - try dist first, then fall back to source
function getAssetsPath(): string {
  // When compiled, __dirname is dist/utils
  const distPath = path.join(__dirname, "..", "assets", ".agents", "skills");
  
  // Check if dist/assets exists
  if (fs.existsSync(distPath)) {
    return distPath;
  }
  
  // Fall back to source bin/assets (for dev mode or if assets weren't copied)
  const srcPath = path.join(__dirname, "..", "..", "bin", "assets", ".agents", "skills");
  return srcPath;
}

export async function installSkills(
  projectPath: string,
  skills: Skill[],
): Promise<void> {
  const skillsDir = path.join(projectPath, ".agents", "skills");
  await createDirectory(skillsDir);

  const assetsPath = getAssetsPath();

  for (const skill of skills) {
    const skillSrcPath = path.join(assetsPath, skill.path);
    const skillDestPath = path.join(skillsDir, skill.path);

    try {
      await copyDirectory(skillSrcPath, skillDestPath);
    } catch (error) {
      console.warn(`Warning: Could not copy skill ${skill.name}`);
    }
  }
}

export function getDefaultSkills(projectType: string): Skill[] {
  return DEFAULT_SKILLS[projectType] || [];
}

export function getFrameworkSkills(framework: string): Skill[] {
  return FRAMEWORK_SKILLS[framework] || [];
}

export function getAdditionalSkills(): Skill[] {
  return ADDITIONAL_SKILLS || [];
}

export function combineSkills(
  defaultSkills: Skill[],
  frameworkSkills: Skill[],
  additionalSkills: Skill[],
): Skill[] {
  const allSkills = [...defaultSkills, ...frameworkSkills, ...additionalSkills];
  
  // Remove duplicates based on path
  const uniqueSkills = allSkills.reduce((acc, skill) => {
    if (!acc.find((s) => s.path === skill.path)) {
      acc.push(skill);
    }
    return acc;
  }, [] as Skill[]);

  return uniqueSkills;
}
