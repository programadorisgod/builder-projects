import type { Project } from "../types/projects.js";

const BACKEND_FRAMEWORKS = ["Express", "Fiber", "NestJS", "FastAPI"];
const FRONTEND_FRAMEWORKS = ["React", "Svelte", "Angular"];
const FULLSTACK_FRAMEWORKS = ["Next.js", "SvelteKit"];

const FRAMEWORKS = {
  backend: BACKEND_FRAMEWORKS,
  frontend: FRONTEND_FRAMEWORKS,
  fullstack: FULLSTACK_FRAMEWORKS,
};

export const selectListByProject = (projectType: Project) => {
  return FRAMEWORKS[projectType];
};
