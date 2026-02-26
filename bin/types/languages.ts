export const LANGUAGES = {
  JAVASCRIPT: "javascript",
  TYPESCRIPT: "typescript",
  PYTHON: "python",
  GO: "go",
} as const;

export type Language = (typeof LANGUAGES)[keyof typeof LANGUAGES];

export const BACKEND_LANGUAGES = [
  { name: "TypeScript", value: "typescript" },
  { name: "JavaScript", value: "javascript" },
  { name: "Python", value: "python" },
  { name: "Go", value: "go" },
];

export const FRONTEND_LANGUAGES = [
  { name: "TypeScript", value: "typescript" },
  { name: "JavaScript", value: "javascript" },
];
