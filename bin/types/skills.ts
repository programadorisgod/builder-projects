export interface Skill {
  name: string;
  path: string;
  description: string;
  isDefault?: boolean;
}

export const DEFAULT_SKILLS: Record<string, Skill[]> = {
  frontend: [
    {
      name: "TypeScript Expert",
      path: "typescript-expert",
      description: "TypeScript best practices and patterns",
      isDefault: true,
    },
    {
      name: "Frontend Design",
      path: "frontend-design",
      description: "UI/UX design principles",
      isDefault: true,
    },
    {
      name: "Web Design Guidelines",
      path: "web-design-guidelines",
      description: "Web design best practices",
      isDefault: true,
    },
    {
      name: "Frontend Testing Best Practices",
      path: "frontend-testing-best-practices",
      description: "Testing strategies for frontend",
      isDefault: true,
    },
    {
      name: "Clean Code",
      path: "clean-code",
      description: "Clean code principles",
      isDefault: true,
    },
  ],
  backend: [
    {
      name: "TypeScript Expert",
      path: "typescript-expert",
      description: "TypeScript best practices and patterns",
      isDefault: true,
    },
    {
      name: "Clean Code",
      path: "clean-code",
      description: "Clean code principles",
      isDefault: true,
    },
    {
      name: "Performance",
      path: "performance",
      description: "Performance optimization",
      isDefault: true,
    },
  ],
  fullstack: [
    {
      name: "TypeScript Expert",
      path: "typescript-expert",
      description: "TypeScript best practices and patterns",
      isDefault: true,
    },
    {
      name: "Frontend Design",
      path: "frontend-design",
      description: "UI/UX design principles",
      isDefault: true,
    },
    {
      name: "Clean Code",
      path: "clean-code",
      description: "Clean code principles",
      isDefault: true,
    },
    {
      name: "Performance",
      path: "performance",
      description: "Performance optimization",
      isDefault: true,
    },
  ],
};

export const FRAMEWORK_SKILLS: Record<string, Skill[]> = {
  react: [
    {
      name: "React Best Practices",
      path: "react-best-practices",
      description: "React patterns and best practices",
    },
  ],
  nextjs: [
    {
      name: "Next.js 15",
      path: "nextjs-15",
      description: "Next.js 15 best practices",
    },
  ],
  svelte: [
    {
      name: "Svelte Components",
      path: "svelte-components",
      description: "Svelte component patterns",
    },
    {
      name: "Svelte Frontend",
      path: "svelte-frontend",
      description: "Svelte frontend best practices",
    },
  ],
  angular: [],
  express: [],
  nestjs: [],
  fastify: [],
  fastapi: [],
  django: [],
  flask: [],
  fiber: [],
  gin: [],
  echo: [],
  sveltekit: [
    {
      name: "Svelte Components",
      path: "svelte-components",
      description: "Svelte component patterns",
    },
    {
      name: "Svelte Frontend",
      path: "svelte-frontend",
      description: "Svelte frontend best practices",
    },
  ],
};

export const ADDITIONAL_SKILLS: Skill[] = [
  {
    name: "E2E Testing Patterns",
    path: "e2e-testing-patterns",
    description: "End-to-end testing patterns",
  },
  {
    name: "Playwright E2E Testing",
    path: "playwright-e2e-testing",
    description: "Playwright testing patterns",
  },
  {
    name: "UI Animation",
    path: "ui-animation",
    description: "UI animation patterns",
  },
  {
    name: "UI Design System",
    path: "ui-design-system",
    description: "Design system patterns",
  },
  {
    name: "Vite",
    path: "vite",
    description: "Vite configuration and optimization",
  },
  {
    name: "Vitest",
    path: "vitest",
    description: "Vitest testing patterns",
  },
  {
    name: "Agent Browser",
    path: "agent-browser",
    description: "Browser automation patterns",
  },
  {
    name: "Audit Website",
    path: "audit-website",
    description: "Website audit patterns",
  },
  {
    name: "Context7",
    path: "context7",
    description: "Documentation update for LLM",
  },
  {
    name: "Executing Plans",
    path: "executing-plans",
    description: "Plan execution patterns",
  },
  {
    name: "Writing Plans",
    path: "writing-plans",
    description: "Plan writing patterns",
  },
  {
    name: "Subagent Driven Development",
    path: "subagent-driven-development",
    description: "Subagent development patterns",
  },
];
