export interface Framework {
  name: string;
  value: string;
  language: string;
}

export const BACKEND_FRAMEWORKS: Record<string, Framework[]> = {
  typescript: [
    { name: "Express", value: "express", language: "typescript" },
    { name: "NestJS", value: "nestjs", language: "typescript" },
    { name: "Fastify", value: "fastify", language: "typescript" },
  ],
  javascript: [
    { name: "Express", value: "express", language: "javascript" },
    { name: "Fastify", value: "fastify", language: "javascript" },
  ],
  python: [
    { name: "FastAPI", value: "fastapi", language: "python" },
    { name: "Django", value: "django", language: "python" },
    { name: "Flask", value: "flask", language: "python" },
  ],
  go: [
    { name: "Fiber", value: "fiber", language: "go" },
    { name: "Gin", value: "gin", language: "go" },
    { name: "Echo", value: "echo", language: "go" },
  ],
};

export const FRONTEND_FRAMEWORKS: Record<string, Framework[]> = {
  typescript: [
    { name: "React", value: "react", language: "typescript" },
    { name: "Next.js 15", value: "nextjs", language: "typescript" },
    { name: "Svelte", value: "svelte", language: "typescript" },
    { name: "Angular", value: "angular", language: "typescript" },
  ],
  javascript: [
    { name: "React", value: "react", language: "javascript" },
    { name: "Svelte", value: "svelte", language: "javascript" },
  ],
};

export const FULLSTACK_FRAMEWORKS: Record<string, Framework[]> = {
  typescript: [
    { name: "Next.js 15", value: "nextjs", language: "typescript" },
    { name: "SvelteKit", value: "sveltekit", language: "typescript" },
  ],
  javascript: [
    { name: "Next.js 15", value: "nextjs", language: "javascript" },
    { name: "SvelteKit", value: "sveltekit", language: "javascript" },
  ],
};
