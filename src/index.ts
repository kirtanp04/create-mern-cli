#!/usr/bin/env node

import * as p from "@clack/prompts";
import chalk from "chalk";
import gradientString from "gradient-string";
import { runPrompts } from "./cli/index";
import { scaffold } from "./scaffold";

async function main(): Promise<void> {
  console.clear();

  // Banner
  const banner = gradientString(["#00b4d8", "#0077b6", "#023e8a"])(
    `
  ██████╗ ██████╗ ███████╗ █████╗ ████████╗███████╗    ███╗   ███╗███████╗██████╗ ███╗   ██╗
  ██╔════╝██╔══██╗██╔════╝██╔══██╗╚══██╔══╝██╔════╝    ████╗ ████║██╔════╝██╔══██╗████╗  ██║
  ██║     ██████╔╝█████╗  ███████║   ██║   █████╗      ██╔████╔██║█████╗  ██████╔╝██╔██╗ ██║
  ██║     ██╔══██╗██╔══╝  ██╔══██║   ██║   ██╔══╝      ██║╚██╔╝██║██╔══╝  ██╔══██╗██║╚██╗██║
  ╚██████╗██║  ██║███████╗██║  ██║   ██║   ███████╗    ██║ ╚═╝ ██║███████╗██║  ██║██║ ╚████║
   ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   ╚═╝   ╚══════╝    ╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝
  `
  );

  console.log(banner);
  console.log(
    chalk.dim("  The fastest way to scaffold a production-ready MERN stack\n")
  );

  const initialName = process.argv[2];

  try {
    const config = await runPrompts(initialName);

    console.log("\n");

    await scaffold(config);

    const pm = config.packageManager;
    const runDev = pm === "npm" ? "npm run dev" : pm === "yarn" ? "yarn dev" : "pnpm dev";

    p.outro(
      chalk.green.bold(`\n✅ Your MERN app is ready!\n\n`) +
        chalk.white(
          [
            `  ${chalk.cyan("Next steps:")}`,
            ``,
            `  ${chalk.gray("$")} cd ${config.projectName}`,
            !config.installDeps
              ? `  ${chalk.gray("$")} ${pm === "npm" ? "npm install" : pm === "yarn" ? "yarn" : "pnpm install"}`
              : "",
            `  ${chalk.gray("$")} cp backend/.env.example backend/.env`,
            `  ${chalk.gray("$")} ${runDev}`,
            ``,
            `  ${chalk.dim(`Frontend → http://localhost:5173`)}`,
            `  ${chalk.dim(`Backend  → http://localhost:5000`)}`,
            `  ${chalk.dim(`API      → http://localhost:5000/api/v1`)}`,
            ``,
            `  ${chalk.dim("Happy building! 🚀")}`,
          ]
            .filter((l) => l !== undefined)
            .join("\n")
        )
    );
  } catch (err) {
    p.cancel("Something went wrong.");
    console.error(err);
    process.exit(1);
  }
}

main();
