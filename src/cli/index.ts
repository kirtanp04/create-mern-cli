import * as p from "@clack/prompts";
import chalk from "chalk";
import type { ProjectConfig } from "./types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function cancel(msg = "Operation cancelled."): never {
  p.cancel(chalk.red(msg));
  process.exit(0);
}

function guard<T>(value: T | symbol): T {
  if (p.isCancel(value)) cancel();
  return value as T;
}

// ─── Section prompts ──────────────────────────────────────────────────────────

type GeneralConfig = Pick<
  ProjectConfig,
  "projectName" | "packageManager" | "installDeps" | "gitInit"
>;

type FrontendConfig = Pick<
  ProjectConfig,
  "uiLibrary" | "router" | "stateManager" | "pathAlias"
>;

type BackendConfig = Pick<
  ProjectConfig,
  | "database"
  | "authStrategy"
  | "corsSetup"
  | "logger"
  | "rateLimiting"
  | "helmetSecurity"
  | "envValidation"
>;

type DevopsConfig = Pick<
  ProjectConfig,
  "docker" | "testing" | "eslintPrettier" | "husky"
>;

async function promptGeneral(defaults?: Partial<GeneralConfig>, initialName?: string): Promise<GeneralConfig> {
  p.log.step(chalk.cyan.bold("◆  Project Setup"));

  const projectName = guard(
    await p.text({
      message: chalk.white("Project name"),
      placeholder: "my-mern-app",
      initialValue: defaults?.projectName ?? initialName ?? "",
      validate: (v) => (!v || v.trim() === "" ? "Project name is required" : undefined),
    })
  ) as string;

  const packageManager = guard(
    await p.select({
      message: chalk.white("Package manager"),
      options: [
        { value: "npm",  label: "npm",  hint: "default" },
        { value: "pnpm", label: "pnpm", hint: "recommended — fast & disk-efficient" },
        { value: "yarn", label: "yarn", hint: "classic" },
      ],
      initialValue: defaults?.packageManager ?? "pnpm",
    })
  ) as string;

  const installDeps = guard(
    await p.confirm({
      message: chalk.white("Install dependencies now?"),
      initialValue: defaults?.installDeps ?? true,
    })
  ) as boolean;

  const gitInit = guard(
    await p.confirm({
      message: chalk.white("Initialise git repository?"),
      initialValue: defaults?.gitInit ?? true,
    })
  ) as boolean;

  return {
    projectName: projectName.trim(),
    packageManager: packageManager as any,
    installDeps,
    gitInit,
  };
}

async function promptFrontend(defaults?: Partial<FrontendConfig>): Promise<FrontendConfig> {
  p.log.step(chalk.yellow.bold("◆  Frontend"));

  const uiLibrary = guard(
    await p.select({
      message: chalk.white("UI library"),
      options: [
        { value: "none",   label: "Tailwind CSS",  hint: "utility-first, no component library" },
        { value: "mui",    label: "MUI v6",         hint: "Material UI — full component suite" },
        { value: "shadcn", label: "shadcn/ui",      hint: "Radix primitives + Tailwind" },
      ],
      initialValue: defaults?.uiLibrary ?? "none",
    })
  ) as string;

  const router = guard(
    await p.select({
      message: chalk.white("Routing"),
      options: [
        { value: "none",           label: "None",             hint: "single-page, no routing" },
        { value: "react-router",   label: "React Router v6",  hint: "industry standard" },
        { value: "tanstack-router",label: "TanStack Router",  hint: "fully type-safe routes" },
      ],
      initialValue: defaults?.router ?? "none",
    })
  ) as string;

  const stateManager = guard(
    await p.select({
      message: chalk.white("State management"),
      options: [
        { value: "none",          label: "None",           hint: "React Context / local state" },
        { value: "zustand",       label: "Zustand",        hint: "lightweight — recommended" },
        { value: "redux-toolkit", label: "Redux Toolkit",  hint: "battle-tested, verbose" },
        { value: "jotai",         label: "Jotai",          hint: "atomic state" },
      ],
      initialValue: defaults?.stateManager ?? "zustand",
    })
  ) as string;

  const pathAlias = guard(
    await p.confirm({
      message: chalk.white("Add @/ path alias  (src → @/)"),
      initialValue: defaults?.pathAlias ?? true,
    })
  ) as boolean;

  return {
    uiLibrary:    uiLibrary    as any,
    router:       router       as any,
    stateManager: stateManager as any,
    pathAlias,
  };
}

async function promptBackend(defaults?: Partial<BackendConfig>): Promise<BackendConfig> {
  p.log.step(chalk.blue.bold("◆  Backend"));

  const database = guard(
    await p.select({
      message: chalk.white("Database"),
      options: [
        { value: "mongodb",    label: "MongoDB",    hint: "Mongoose ODM" },
        { value: "postgresql", label: "PostgreSQL", hint: "Prisma ORM" },
        { value: "mysql",      label: "MySQL",      hint: "Prisma ORM" },
        { value: "none",       label: "None",       hint: "skip database setup" },
      ],
      initialValue: defaults?.database ?? "mongodb",
    })
  ) as string;

  const authStrategy = guard(
    await p.select({
      message: chalk.white("Authentication"),
      options: [
        { value: "none",        label: "None" },
        { value: "jwt",         label: "JWT",                 hint: "access token only" },
        { value: "jwt-refresh", label: "JWT + Refresh Token", hint: "recommended for production" },
      ],
      initialValue: defaults?.authStrategy ?? "jwt-refresh",
    })
  ) as string;

  const corsSetup = guard(
    await p.confirm({
      message: chalk.white("Configure CORS  (env-based origins)"),
      initialValue: defaults?.corsSetup ?? true,
    })
  ) as boolean;

  const logger = guard(
    await p.select({
      message: chalk.white("Server logger"),
      options: [
        { value: "none",    label: "None" },
        { value: "pino",    label: "Pino",    hint: "fast, structured JSON — recommended" },
        { value: "winston", label: "Winston", hint: "flexible, multi-transport" },
      ],
      initialValue: defaults?.logger ?? "pino",
    })
  ) as string;

  const security = guard(
    await p.multiselect({
      message: chalk.white("Security middleware"),
      options: [
        { value: "rateLimiting",   label: "Rate limiting",      hint: "express-rate-limit", selected: defaults?.rateLimiting   ?? true },
        { value: "helmetSecurity", label: "Helmet.js",          hint: "HTTP security headers", selected: defaults?.helmetSecurity ?? true },
        { value: "envValidation",  label: "Zod env validation", hint: "fail-fast on bad .env",  selected: defaults?.envValidation  ?? true },
      ],
      required: false,
    })
  ) as string[];

  return {
    database:      database      as any,
    authStrategy:  authStrategy  as any,
    corsSetup,
    logger:        logger        as any,
    rateLimiting:   security.includes("rateLimiting"),
    helmetSecurity: security.includes("helmetSecurity"),
    envValidation:  security.includes("envValidation"),
  };
}

async function promptDevops(defaults?: Partial<DevopsConfig>): Promise<DevopsConfig> {
  p.log.step(chalk.green.bold("◆  DevOps & Tooling"));

  const docker = guard(
    await p.select({
      message: chalk.white("Docker"),
      options: [
        { value: "none",    label: "None" },
        { value: "basic",   label: "Dockerfiles",  hint: "frontend + backend images" },
        { value: "compose", label: "docker-compose", hint: "full stack + DB service" },
      ],
      initialValue: defaults?.docker ?? "none",
    })
  ) as string;

  const testing = guard(
    await p.select({
      message: chalk.white("Testing"),
      options: [
        { value: "none",   label: "None" },
        { value: "vitest", label: "Vitest",            hint: "frontend unit tests" },
        { value: "full",   label: "Vitest + Supertest", hint: "frontend + backend API tests" },
      ],
      initialValue: defaults?.testing ?? "none",
    })
  ) as string;

  const tooling = guard(
    await p.multiselect({
      message: chalk.white("Code quality"),
      options: [
        { value: "eslintPrettier", label: "ESLint + Prettier",          hint: "linting & formatting",  selected: defaults?.eslintPrettier ?? true },
        { value: "husky",          label: "Husky + lint-staged",         hint: "pre-commit hooks",      selected: defaults?.husky          ?? true },
      ],
      required: false,
    })
  ) as string[];

  return {
    docker:        docker   as any,
    testing:       testing  as any,
    eslintPrettier: tooling.includes("eslintPrettier"),
    husky:          tooling.includes("husky"),
  };
}

// ─── Summary display ──────────────────────────────────────────────────────────

function row(label: string, value: string) {
  return `  ${chalk.dim(label.padEnd(22))} ${chalk.cyan(value)}`;
}

function showSummary(cfg: ProjectConfig): void {
  const lines = [
    "",
    chalk.bold.white("  Project Summary"),
    chalk.dim("  " + "─".repeat(38)),
    row("Project name",    cfg.projectName),
    row("Package manager", cfg.packageManager),
    "",
    chalk.dim("  Frontend"),
    row("  UI library",     cfg.uiLibrary === "none" ? "Tailwind CSS" : cfg.uiLibrary),
    row("  Router",         cfg.router),
    row("  State",          cfg.stateManager),
    row("  Path alias @/",  cfg.pathAlias ? "yes" : "no"),
    "",
    chalk.dim("  Backend"),
    row("  Database",       cfg.database),
    row("  Auth",           cfg.authStrategy),
    row("  Logger",         cfg.logger),
    row("  CORS",           cfg.corsSetup ? "yes" : "no"),
    row("  Rate limiting",  cfg.rateLimiting  ? "yes" : "no"),
    row("  Helmet",         cfg.helmetSecurity ? "yes" : "no"),
    row("  Zod env",        cfg.envValidation  ? "yes" : "no"),
    "",
    chalk.dim("  DevOps & Tooling"),
    row("  Docker",         cfg.docker),
    row("  Testing",        cfg.testing),
    row("  ESLint + Prettier", cfg.eslintPrettier ? "yes" : "no"),
    row("  Husky hooks",    cfg.husky ? "yes" : "no"),
    row("  Git init",       cfg.gitInit ? "yes" : "no"),
    row("  Install deps",   cfg.installDeps ? "yes" : "no"),
    "",
  ].join("\n");

  p.note(lines, chalk.bold("Review your choices"));
}

// ─── Main entry ───────────────────────────────────────────────────────────────

export async function runPrompts(initialName?: string): Promise<ProjectConfig> {
  p.intro(
    chalk.bgCyan.black.bold("  mern-builder  ") +
    "  " +
    chalk.dim("MERN · Vite · TypeScript")
  );

  // ── Gather all sections ──
  let general  = await promptGeneral(undefined, initialName);
  let frontend = await promptFrontend();
  let backend  = await promptBackend();
  let devops   = await promptDevops();

  // ── Review + edit loop ──
  while (true) {
    const cfg: ProjectConfig = { ...general, ...frontend, ...backend, ...devops };
    showSummary(cfg);

    const action = guard(
      await p.select({
        message: chalk.white("Ready to scaffold?"),
        options: [
          { value: "go",       label: chalk.green.bold("✓  Create project!"),       hint: "scaffold everything now" },
          { value: "general",  label: "← Edit project setup",  hint: "name, package manager, git…" },
          { value: "frontend", label: "← Edit frontend",        hint: "UI, routing, state…" },
          { value: "backend",  label: "← Edit backend",         hint: "DB, auth, logger…" },
          { value: "devops",   label: "← Edit DevOps & tooling",hint: "docker, testing, linting…" },
        ],
      })
    ) as string;

    if (action === "go") {
      return cfg;
    }
    if (action === "general")  general  = await promptGeneral(general);
    if (action === "frontend") frontend = await promptFrontend(frontend);
    if (action === "backend")  backend  = await promptBackend(backend);
    if (action === "devops")   devops   = await promptDevops(devops);
  }
}