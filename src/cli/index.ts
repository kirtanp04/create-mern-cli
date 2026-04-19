import * as p from "@clack/prompts";
import chalk from "chalk";
import type { ProjectConfig } from "./types";

export async function runPrompts(initialName?: string): Promise<ProjectConfig> {
  p.intro(chalk.bold.cyan("⚡ create-mern-app — MERN + Vite + TypeScript"));

  const projectName = initialName
    ? initialName
    : ((await p.text({
        message: "What is your project name?",
        placeholder: "my-mern-app",
        validate: (v) =>
          !v || v.trim() === "" ? "Project name is required" : undefined,
      })) as string);

  if (p.isCancel(projectName)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  const packageManager = (await p.select({
    message: "Which package manager do you prefer?",
    options: [
      { value: "npm", label: "npm" },
      { value: "pnpm", label: "pnpm  (recommended)" },
      { value: "yarn", label: "yarn" },
    ],
  })) as string;

  if (p.isCancel(packageManager)) { p.cancel("Operation cancelled."); process.exit(0); }

  p.log.step(chalk.yellow("🎨 Frontend Configuration"));

  const uiLibrary = (await p.select({
    message: "Which UI library do you want?",
    options: [
      { value: "none", label: "None (plain Tailwind CSS)" },
      { value: "mui", label: "MUI (Material UI v6) — includes theming" },
      { value: "shadcn", label: "shadcn/ui — includes theming + Tailwind" },
    ],
  })) as string;

  if (p.isCancel(uiLibrary)) { p.cancel("Operation cancelled."); process.exit(0); }

  const router = (await p.select({
    message: "Do you need client-side routing?",
    options: [
      { value: "none", label: "No routing" },
      { value: "react-router", label: "React Router v6" },
      { value: "tanstack-router", label: "TanStack Router (type-safe)" },
    ],
  })) as string;

  if (p.isCancel(router)) { p.cancel("Operation cancelled."); process.exit(0); }

  const stateManager = (await p.select({
    message: "State management?",
    options: [
      { value: "none", label: "None (React Context / local state)" },
      { value: "zustand", label: "Zustand (lightweight, recommended)" },
      { value: "redux-toolkit", label: "Redux Toolkit" },
      { value: "jotai", label: "Jotai (atomic)" },
    ],
  })) as string;

  if (p.isCancel(stateManager)) { p.cancel("Operation cancelled."); process.exit(0); }

  const pathAlias = (await p.confirm({
    message: "Add path alias (@/ → src/)? (Recommended)",
    initialValue: true,
  })) as boolean;

  if (p.isCancel(pathAlias)) { p.cancel("Operation cancelled."); process.exit(0); }

  p.log.step(chalk.yellow("🛠  Backend Configuration"));

  const database = (await p.select({
    message: "Which database?",
    options: [
      { value: "mongodb", label: "MongoDB (Mongoose ODM)" },
      { value: "postgresql", label: "PostgreSQL (Prisma ORM)" },
      { value: "mysql", label: "MySQL (Prisma ORM)" },
      { value: "none", label: "None (no database)" },
    ],
  })) as string;

  if (p.isCancel(database)) { p.cancel("Operation cancelled."); process.exit(0); }

  const authStrategy = (await p.select({
    message: "Authentication strategy?",
    options: [
      { value: "none", label: "None" },
      { value: "jwt", label: "JWT (access token)" },
      { value: "jwt-refresh", label: "JWT + Refresh Token (recommended)" },
    ],
  })) as string;

  if (p.isCancel(authStrategy)) { p.cancel("Operation cancelled."); process.exit(0); }

  const corsSetup = (await p.confirm({
    message: "Setup CORS with environment-based origins?",
    initialValue: true,
  })) as boolean;

  if (p.isCancel(corsSetup)) { p.cancel("Operation cancelled."); process.exit(0); }

  const logger = (await p.select({
    message: "Server-side logger?",
    options: [
      { value: "none", label: "None" },
      { value: "pino", label: "Pino (fast, structured JSON — recommended)" },
      { value: "winston", label: "Winston (flexible, multi-transport)" },
    ],
  })) as string;

  if (p.isCancel(logger)) { p.cancel("Operation cancelled."); process.exit(0); }

  const securityGroup = (await p.multiselect({
    message: "Security & middleware features?",
    options: [
      { value: "rateLimiting", label: "Rate limiting (express-rate-limit)", selected: true },
      { value: "helmetSecurity", label: "Helmet.js (HTTP security headers)", selected: true },
      { value: "envValidation", label: "Env validation with Zod", selected: true },
    ],
    required: false,
  })) as string[];

  if (p.isCancel(securityGroup)) { p.cancel("Operation cancelled."); process.exit(0); }

  p.log.step(chalk.yellow("🐳 DevOps & Tooling"));

  const docker = (await p.select({
    message: "Docker setup?",
    options: [
      { value: "none", label: "None" },
      { value: "basic", label: "Dockerfiles for frontend & backend" },
      { value: "compose", label: "docker-compose (frontend + backend + DB)" },
    ],
  })) as string;

  if (p.isCancel(docker)) { p.cancel("Operation cancelled."); process.exit(0); }

  const testing = (await p.select({
    message: "Testing setup?",
    options: [
      { value: "none", label: "None" },
      { value: "vitest", label: "Vitest (frontend unit tests)" },
      { value: "full", label: "Vitest + Supertest (frontend + API tests)" },
    ],
  })) as string;

  if (p.isCancel(testing)) { p.cancel("Operation cancelled."); process.exit(0); }

  const toolingGroup = (await p.multiselect({
    message: "Code quality tools?",
    options: [
      { value: "eslintPrettier", label: "ESLint + Prettier", selected: true },
      { value: "husky", label: "Husky + lint-staged (pre-commit hooks)", selected: true },
      { value: "gitInit", label: "Initialize git repo", selected: true },
    ],
    required: false,
  })) as string[];

  if (p.isCancel(toolingGroup)) { p.cancel("Operation cancelled."); process.exit(0); }

  const installDeps = (await p.confirm({
    message: "Install dependencies now?",
    initialValue: true,
  })) as boolean;

  if (p.isCancel(installDeps)) { p.cancel("Operation cancelled."); process.exit(0); }

  return {
    projectName: (projectName as string).trim(),
    packageManager: packageManager as any,
    uiLibrary: uiLibrary as any,
    router: router as any,
    stateManager: stateManager as any,
    pathAlias: pathAlias as boolean,
    database: database as any,
    authStrategy: authStrategy as any,
    corsSetup: corsSetup as boolean,
    logger: logger as any,
    rateLimiting: securityGroup.includes("rateLimiting"),
    helmetSecurity: securityGroup.includes("helmetSecurity"),
    envValidation: securityGroup.includes("envValidation"),
    docker: docker as any,
    testing: testing as any,
    eslintPrettier: toolingGroup.includes("eslintPrettier"),
    husky: toolingGroup.includes("husky"),
    gitInit: toolingGroup.includes("gitInit"),
    installDeps: installDeps as boolean,
  };
}
