export type PackageManager = "npm" | "yarn" | "pnpm";
export type UILibrary = "none" | "mui" | "shadcn";
export type Router = "none" | "react-router" | "tanstack-router";
export type StateManager = "none" | "redux-toolkit" | "zustand" | "jotai";
export type Database = "none" | "mongodb" | "postgresql" | "mysql";
export type AuthStrategy = "none" | "jwt" | "jwt-refresh";
export type Logger = "none" | "winston" | "pino";
export type DockerMode = "none" | "basic" | "compose";
export type TestingSetup = "none" | "vitest" | "full";

export interface ProjectConfig {
  projectName: string;
  packageManager: PackageManager;
  // Frontend
  uiLibrary: UILibrary;
  router: Router;
  stateManager: StateManager;
  pathAlias: boolean;
  // Backend
  database: Database;
  authStrategy: AuthStrategy;
  corsSetup: boolean;
  logger: Logger;
  rateLimiting: boolean;
  helmetSecurity: boolean;
  envValidation: boolean;
  // DevOps
  docker: DockerMode;
  testing: TestingSetup;
  eslintPrettier: boolean;
  husky: boolean;
  // Meta
  gitInit: boolean;
  installDeps: boolean;
}
