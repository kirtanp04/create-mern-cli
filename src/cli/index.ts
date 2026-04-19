import * as p from "@clack/prompts";
import chalk from "chalk";
import type { ProjectConfig } from "./types";

const BACK = Symbol("BACK");

function cancel(msg = "Operation cancelled."): never {
  p.cancel(chalk.red(msg));
  process.exit(0);
}

type PromptStep = {
  section?: string;
  key: keyof ProjectConfig | (keyof ProjectConfig)[];
  run: (config: Partial<ProjectConfig>, initialName?: string) => Promise<any | typeof BACK>;
};

const steps: PromptStep[] = [
  {
    section: "Project Setup",
    key: "projectName",
    run: async (config, initialName) => {
      const val = await p.text({
        message: chalk.white("Project name"),
        placeholder: "my-mern-app",
        initialValue: config.projectName ?? initialName ?? "",
        validate: (v) => (!v || v.trim() === "" ? "Project name is required" : undefined),
      });
      if (p.isCancel(val)) cancel();
      return val as string;
    },
  },
  {
    key: "packageManager",
    run: async (config) => {
      const val = await p.select({
        message: chalk.white("Package manager"),
        options: [
          { value: "npm",  label: "npm",  hint: "default" },
          { value: "pnpm", label: "pnpm", hint: "recommended — fast & disk-efficient" },
          { value: "yarn", label: "yarn", hint: "classic" },
          { value: BACK,   label: chalk.dim("←  Go Back") },
        ] as any,
        initialValue: config.packageManager ?? "pnpm",
      });
      if (p.isCancel(val)) cancel();
      return val;
    },
  },
  {
    key: "installDeps",
    run: async (config) => {
      const val = await p.select({
        message: chalk.white("Install dependencies now?"),
        options: [
          { value: true,  label: "Yes" },
          { value: false, label: "No" },
          { value: BACK,   label: chalk.dim("←  Go Back") },
        ] as any,
        initialValue: config.installDeps ?? true,
      });
      if (p.isCancel(val)) cancel();
      return val;
    },
  },
  {
    key: "gitInit",
    run: async (config) => {
      const val = await p.select({
        message: chalk.white("Initialise git repository?"),
        options: [
          { value: true,  label: "Yes" },
          { value: false, label: "No" },
          { value: BACK,   label: chalk.dim("←  Go Back") },
        ] as any,
        initialValue: config.gitInit ?? true,
      });
      if (p.isCancel(val)) cancel();
      return val;
    },
  },
  {
    section: "Frontend",
    key: "uiLibrary",
    run: async (config) => {
      const val = await p.select({
        message: chalk.white("UI library"),
        options: [
          { value: "none",   label: "Tailwind CSS",  hint: "utility-first, no component library" },
          { value: "mui",    label: "MUI v6",         hint: "Material UI — full component suite" },
          { value: "shadcn", label: "shadcn/ui",      hint: "Radix primitives + Tailwind" },
          { value: BACK,     label: chalk.dim("←  Go Back") },
        ] as any,
        initialValue: config.uiLibrary ?? "none",
      });
      if (p.isCancel(val)) cancel();
      return val;
    },
  },
  {
    key: "router",
    run: async (config) => {
      const val = await p.select({
        message: chalk.white("Routing"),
        options: [
          { value: "none",           label: "None",             hint: "single-page, no routing" },
          { value: "react-router",   label: "React Router v6",  hint: "industry standard" },
          { value: "tanstack-router",label: "TanStack Router",  hint: "fully type-safe routes" },
          { value: BACK,             label: chalk.dim("←  Go Back") },
        ] as any,
        initialValue: config.router ?? "none",
      });
      if (p.isCancel(val)) cancel();
      return val;
    },
  },
  {
    key: "stateManager",
    run: async (config) => {
      const val = await p.select({
        message: chalk.white("State management"),
        options: [
          { value: "none",          label: "None",           hint: "React Context / local state" },
          { value: "zustand",       label: "Zustand",        hint: "lightweight — recommended" },
          { value: "redux-toolkit", label: "Redux Toolkit",  hint: "battle-tested, verbose" },
          { value: "jotai",         label: "Jotai",          hint: "atomic state" },
          { value: BACK,            label: chalk.dim("←  Go Back") },
        ] as any,
        initialValue: config.stateManager ?? "zustand",
      });
      if (p.isCancel(val)) cancel();
      return val;
    },
  },
  {
    key: "pathAlias",
    run: async (config) => {
      const val = await p.select({
        message: chalk.white("Add @/ path alias (src → @/)"),
        options: [
          { value: true,  label: "Yes" },
          { value: false, label: "No" },
          { value: BACK,  label: chalk.dim("←  Go Back") },
        ] as any,
        initialValue: config.pathAlias ?? true,
      });
      if (p.isCancel(val)) cancel();
      return val;
    },
  },
  {
    section: "Backend",
    key: "database",
    run: async (config) => {
      const val = await p.select({
        message: chalk.white("Database"),
        options: [
          { value: "mongodb",    label: "MongoDB",    hint: "Mongoose ODM" },
          { value: "postgresql", label: "PostgreSQL", hint: "Prisma ORM" },
          { value: "mysql",      label: "MySQL",      hint: "Prisma ORM" },
          { value: "none",       label: "None",       hint: "skip database setup" },
          { value: BACK,         label: chalk.dim("←  Go Back") },
        ] as any,
        initialValue: config.database ?? "mongodb",
      });
      if (p.isCancel(val)) cancel();
      return val;
    },
  },
  {
    key: "authStrategy",
    run: async (config) => {
      const val = await p.select({
        message: chalk.white("Authentication"),
        options: [
          { value: "none",        label: "None" },
          { value: "jwt",         label: "JWT",                 hint: "access token only" },
          { value: "jwt-refresh", label: "JWT + Refresh Token", hint: "recommended for production" },
          { value: BACK,          label: chalk.dim("←  Go Back") },
        ] as any,
        initialValue: config.authStrategy ?? "jwt-refresh",
      });
      if (p.isCancel(val)) cancel();
      return val;
    },
  },
  {
    key: "corsSetup",
    run: async (config) => {
      const val = await p.select({
        message: chalk.white("Configure CORS (env-based origins)"),
        options: [
          { value: true,  label: "Yes" },
          { value: false, label: "No" },
          { value: BACK,  label: chalk.dim("←  Go Back") },
        ] as any,
        initialValue: config.corsSetup ?? true,
      });
      if (p.isCancel(val)) cancel();
      return val;
    },
  },
  {
    key: "logger",
    run: async (config) => {
      const val = await p.select({
        message: chalk.white("Server logger"),
        options: [
          { value: "none",    label: "None" },
          { value: "pino",    label: "Pino",    hint: "fast, structured JSON — recommended" },
          { value: "winston", label: "Winston", hint: "flexible, multi-transport" },
          { value: BACK,      label: chalk.dim("←  Go Back") },
        ] as any,
        initialValue: config.logger ?? "pino",
      });
      if (p.isCancel(val)) cancel();
      return val;
    },
  },
  {
    key: ["rateLimiting", "helmetSecurity", "envValidation"],
    run: async (config) => {
      p.note(chalk.dim("Press Space to select, Enter to submit"), "Security Options");
      const val = await p.multiselect({
        message: chalk.white("Security middleware:") + chalk.dim(" (Choose carefully, type or arrow to move)"),
        options: [
          { value: "rateLimiting",   label: "Rate limiting",      hint: "express-rate-limit" },
          { value: "helmetSecurity", label: "Helmet.js",          hint: "HTTP security headers" },
          { value: "envValidation",  label: "Zod env validation", hint: "fail-fast on bad .env" },
          { value: BACK as any,             label: chalk.yellow("← Go Back to previous question (select ONLY this to go back)") },
        ] as any,
        initialValues: [
          ...(config.rateLimiting !== false ? ["rateLimiting"] : []),
          ...(config.helmetSecurity !== false ? ["helmetSecurity"] : []),
          ...(config.envValidation !== false ? ["envValidation"] : [])
        ] as any,
        required: false,
      });
      if (p.isCancel(val)) cancel();
      const vals = val as string[];
      if (vals.includes(BACK as any) || vals.includes(BACK.toString()) || vals.includes("Symbol(BACK)")) {
        return BACK;
      }
      return {
        rateLimiting: vals.includes("rateLimiting"),
        helmetSecurity: vals.includes("helmetSecurity"),
        envValidation: vals.includes("envValidation"),
      };
    },
  },
  {
    section: "DevOps & Tooling",
    key: "docker",
    run: async (config) => {
      const val = await p.select({
        message: chalk.white("Docker"),
        options: [
          { value: "none",    label: "None" },
          { value: "basic",   label: "Dockerfiles",  hint: "frontend + backend images" },
          { value: "compose", label: "docker-compose", hint: "full stack + DB service" },
          { value: BACK,      label: chalk.dim("←  Go Back") },
        ] as any,
        initialValue: config.docker ?? "none",
      });
      if (p.isCancel(val)) cancel();
      return val;
    },
  },
  {
    key: "testing",
    run: async (config) => {
      const val = await p.select({
        message: chalk.white("Testing"),
        options: [
          { value: "none",   label: "None" },
          { value: "vitest", label: "Vitest",            hint: "frontend unit tests" },
          { value: "full",   label: "Vitest + Supertest", hint: "frontend + backend API tests" },
          { value: BACK,     label: chalk.dim("←  Go Back") },
        ] as any,
        initialValue: config.testing ?? "none",
      });
      if (p.isCancel(val)) cancel();
      return val;
    },
  },
  {
    key: ["eslintPrettier", "husky"],
    run: async (config) => {
      const val = await p.multiselect({
        message: chalk.white("Code quality"),
        options: [
          { value: "eslintPrettier", label: "ESLint + Prettier", hint: "linting & formatting" },
          { value: "husky",          label: "Husky + lint-staged", hint: "pre-commit hooks" },
          { value: BACK as any,             label: chalk.yellow("← Go Back to previous question (select ONLY this to go back)") },
        ] as any,
        initialValues: [
          ...(config.eslintPrettier !== false ? ["eslintPrettier"] : []),
          ...(config.husky !== false ? ["husky"] : []),
        ] as any,
        required: false,
      });
      if (p.isCancel(val)) cancel();
      const vals = val as string[];
      if (vals.includes(BACK as any) || vals.includes(BACK.toString()) || vals.includes("Symbol(BACK)")) {
        return BACK;
      }
      return {
        eslintPrettier: vals.includes("eslintPrettier"),
        husky: vals.includes("husky"),
      };
    },
  },
];

function row(label: string, value: string) {
  return `  ${chalk.dim(label.padEnd(22))} ${chalk.cyan(value)}`;
}

function showSummary(cfg: Partial<ProjectConfig>): void {
  const lines = [
    "",
    chalk.bold.white("  Project Summary"),
    chalk.dim("  " + "─".repeat(38)),
    row("Project name",    cfg.projectName!),
    row("Package manager", cfg.packageManager!),
    "",
    chalk.dim("  Frontend"),
    row("  UI library",     cfg.uiLibrary === "none" ? "Tailwind CSS" : cfg.uiLibrary!),
    row("  Router",         cfg.router!),
    row("  State",          cfg.stateManager!),
    row("  Path alias @/",  cfg.pathAlias ? "yes" : "no"),
    "",
    chalk.dim("  Backend"),
    row("  Database",       cfg.database!),
    row("  Auth",           cfg.authStrategy!),
    row("  Logger",         cfg.logger!),
    row("  CORS",           cfg.corsSetup ? "yes" : "no"),
    row("  Rate limiting",  cfg.rateLimiting  ? "yes" : "no"),
    row("  Helmet",         cfg.helmetSecurity ? "yes" : "no"),
    row("  Zod env",        cfg.envValidation  ? "yes" : "no"),
    "",
    chalk.dim("  DevOps & Tooling"),
    row("  Docker",         cfg.docker!),
    row("  Testing",        cfg.testing!),
    row("  ESLint + Prettier", cfg.eslintPrettier ? "yes" : "no"),
    row("  Husky hooks",    cfg.husky ? "yes" : "no"),
    row("  Git init",       cfg.gitInit ? "yes" : "no"),
    row("  Install deps",   cfg.installDeps ? "yes" : "no"),
    "",
  ].join("\n");

  p.note(lines, chalk.bold("Review your choices"));
}

export async function runPrompts(initialName?: string): Promise<ProjectConfig> {
  p.intro(
    chalk.bgCyan.black.bold("  mern-builder  ") +
    "  " +
    chalk.dim("MERN · Vite · TypeScript")
  );

  const config: Partial<ProjectConfig> = {};
  let i = 0;

  while (i < steps.length) {
    const step = steps[i];

    if (step.section) {
      if (step.section === "Project Setup") p.log.step(chalk.cyan.bold("◆  Project Setup"));
      if (step.section === "Frontend") p.log.step(chalk.yellow.bold("◆  Frontend"));
      if (step.section === "Backend") p.log.step(chalk.blue.bold("◆  Backend"));
      if (step.section === "DevOps & Tooling") p.log.step(chalk.green.bold("◆  DevOps & Tooling"));
    }

    const result = await step.run(config, initialName);

    if (result === BACK) {
      i = Math.max(0, i - 1);
    } else {
      if (Array.isArray(step.key)) {
        Object.assign(config, result);
      } else {
        config[step.key as keyof ProjectConfig] = result;
      }
      i++;
    }
  }

  while (true) {
    showSummary(config);

    const action = await p.select({
      message: chalk.white("Ready to scaffold?"),
      options: [
        { value: "go",       label: chalk.green.bold("✓  Create project!"),       hint: "scaffold everything now" },
        { value: "back",     label: "← Go back to edit configuration" },
      ],
    });
    if (p.isCancel(action)) cancel();

    if (action === "go") {
      return config as ProjectConfig;
    }
    if (action === "back") {
      // Loop backwards until we hit the first edit point or let them walk backwards
      i = steps.length - 1;
      let reviewIndex = i;
      while (reviewIndex < steps.length) {
        const step = steps[reviewIndex];
        const result = await step.run(config, initialName);
        if (result === BACK) {
          reviewIndex = Math.max(0, reviewIndex - 1);
        } else {
          if (Array.isArray(step.key)) {
            Object.assign(config, result);
          } else {
            config[step.key as keyof ProjectConfig] = result;
          }
          reviewIndex++;
        }
      }
    }
  }
}