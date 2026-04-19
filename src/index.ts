#!/usr/bin/env node

import * as p from "@clack/prompts";
import chalk from "chalk";
import gradientString from "gradient-string";
import { runPrompts } from "./cli/index";
import { scaffold } from "./scaffold";

async function main(): Promise<void> {
  console.clear();

  // ── Banner ────────────────────────────────────────────────────────────────
  const banner = gradientString(["#00d4ff", "#0077b6", "#023e8a"])(
    [
      "",
      "  ███╗   ███╗███████╗██████╗ ███╗   ██╗    ██████╗ ██╗   ██╗██╗██╗     ██████╗ ███████╗██████╗ ",
      "  ████╗ ████║██╔════╝██╔══██╗████╗  ██║    ██╔══██╗██║   ██║██║██║     ██╔══██╗██╔════╝██╔══██╗",
      "  ██╔████╔██║█████╗  ██████╔╝██╔██╗ ██║    ██████╔╝██║   ██║██║██║     ██║  ██║█████╗  ██████╔╝",
      "  ██║╚██╔╝██║██╔══╝  ██╔══██╗██║╚██╗██║    ██╔══██╗██║   ██║██║██║     ██║  ██║██╔══╝  ██╔══██╗",
      "  ██║ ╚═╝ ██║███████╗██║  ██║██║ ╚████║    ██████╔╝╚██████╔╝██║███████╗██████╔╝███████╗██║  ██║",
      "  ╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝    ╚═════╝  ╚═════╝ ╚═╝╚══════╝╚═════╝ ╚══════╝╚═╝  ╚═╝",
      "",
    ].join("\n")
  );

  console.log(banner);
  console.log(
    chalk.dim("  Scaffold a production-ready MERN stack in seconds.\n")
  );

  const initialName = process.argv[2];

  try {
    const config = await runPrompts(initialName);

    console.log();

    await scaffold(config);

    const pm  = config.packageManager;
    const run = pm === "npm" ? "npm run dev" : pm === "yarn" ? "yarn dev" : "pnpm dev";
    const inst = pm === "npm" ? "npm install" : pm === "yarn" ? "yarn" : "pnpm install";

    const steps = [
      `  ${chalk.cyan("cd")} ${config.projectName}`,
      !config.installDeps ? `  ${chalk.cyan(inst)}` : "",
      `  ${chalk.cyan("cp")} backend/.env.example backend/.env`,
      `  ${chalk.cyan(run)}`,
    ].filter(Boolean);

    p.outro(
      [
        chalk.green.bold("  ✓ Project scaffolded successfully!\n"),
        chalk.white.bold("  Next steps:\n"),
        steps.join("\n"),
        "",
        chalk.dim("  Frontend →  http://localhost:5173"),
        chalk.dim("  Backend  →  http://localhost:5000"),
        chalk.dim("  API      →  http://localhost:5000/api/v1"),
        "",
        chalk.dim("  Happy building! 🚀"),
      ].join("\n")
    );
  } catch (err) {
    if (err instanceof Error && err.message === "cancelled") {
      process.exit(0);
    }
    p.cancel(chalk.red("Something went wrong."));
    console.error(err);
    process.exit(1);
  }
}

main();