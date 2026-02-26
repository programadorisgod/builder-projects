export const PROJECTS = {
  BACKEND: "backend",
  FRONTEND: "frontend",
  FULLSTACK: "fullstack",
} as const;

export type Project = (typeof PROJECTS)[keyof typeof PROJECTS];
