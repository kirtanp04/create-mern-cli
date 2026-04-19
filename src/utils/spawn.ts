import { execa } from "execa";
import type { PackageManager } from "../cli/types";

export async function runCommand(
  command: string,
  args: string[],
  cwd: string
): Promise<void> {
  await execa(command, args, { cwd, stdio: "inherit" });
}

export async function installDependencies(
  cwd: string,
  pm: PackageManager
): Promise<void> {
  const cmd = pm === "yarn" ? "yarn" : pm === "pnpm" ? "pnpm" : "npm";
  const args = pm === "yarn" ? [] : ["install"];
  await execa(cmd, args, { cwd, stdio: "inherit" });
}

export async function initGit(cwd: string): Promise<void> {
  await execa("git", ["init"], { cwd, stdio: "pipe" });
  await execa("git", ["add", "-A"], { cwd, stdio: "pipe" });
  await execa("git", ["commit", "-m", "chore: initial commit from create-mern-app"], {
    cwd,
    stdio: "pipe",
  });
}
