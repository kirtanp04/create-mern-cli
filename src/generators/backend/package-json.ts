import type { ProjectConfig } from "../../cli/types";

export function generateBackendPackageJson(config: ProjectConfig): object {
  const deps: Record<string, string> = {
    express: "^4.21.1",
    "express-async-errors": "^3.1.1",
    dotenv: "^16.4.5",
    zod: "^3.23.8",
    "http-status-codes": "^2.3.0",
  };
  const devDeps: Record<string, string> = {
    "@types/express": "^5.0.0",
    "@types/node": "^22.8.0",
    typescript: "^5.6.3",
    "ts-node": "^10.9.2",
    "ts-node-dev": "^2.0.0",
    nodemon: "^3.1.7",
  };

  // Database
  if (config.database === "mongodb") {
    deps["mongoose"] = "^8.7.0";
    deps["@types/mongoose"] = "^5.11.97";
  }
  if (config.database === "postgresql" || config.database === "mysql") {
    deps["@prisma/client"] = "^5.21.1";
    devDeps["prisma"] = "^5.21.1";
  }

  // Auth
  if (config.authStrategy !== "none") {
    deps["jsonwebtoken"] = "^9.0.2";
    deps["bcryptjs"] = "^2.4.3";
    devDeps["@types/jsonwebtoken"] = "^9.0.7";
    devDeps["@types/bcryptjs"] = "^2.4.6";
  }
  if (config.authStrategy === "jwt-refresh") {
    deps["cookie-parser"] = "^1.4.7";
    devDeps["@types/cookie-parser"] = "^1.4.7";
  }

  // CORS
  if (config.corsSetup) {
    deps["cors"] = "^2.8.5";
    devDeps["@types/cors"] = "^2.8.17";
  }

  // Logger
  if (config.logger === "winston") {
    deps["winston"] = "^3.15.0";
    deps["winston-daily-rotate-file"] = "^5.0.0";
    deps["morgan"] = "^1.10.0";
    devDeps["@types/morgan"] = "^1.9.9";
  }
  if (config.logger === "pino") {
    deps["pino"] = "^9.4.0";
    deps["pino-http"] = "^10.3.0";
    devDeps["pino-pretty"] = "^11.2.2";
  }

  // Security
  if (config.helmetSecurity) {
    deps["helmet"] = "^8.0.0";
  }
  if (config.rateLimiting) {
    deps["express-rate-limit"] = "^7.4.1";
  }

  // Testing
  if (config.testing === "full") {
    devDeps["jest"] = "^29.7.0";
    devDeps["ts-jest"] = "^29.2.5";
    devDeps["supertest"] = "^7.0.0";
    devDeps["@types/supertest"] = "^6.0.2";
    devDeps["@types/jest"] = "^29.5.13";
  }

  // Linting
  if (config.eslintPrettier) {
    devDeps["eslint"] = "^9.13.0";
    devDeps["@eslint/js"] = "^9.13.0";
    devDeps["typescript-eslint"] = "^8.11.0";
    devDeps["prettier"] = "^3.3.3";
    devDeps["eslint-config-prettier"] = "^9.1.0";
  }

  const scripts: Record<string, string> = {
    dev: "ts-node-dev --respawn --transpile-only src/index.ts",
    build: "tsc",
    start: "node dist/index.js",
    "type-check": "tsc --noEmit",
  };

  if (config.database === "postgresql" || config.database === "mysql") {
    scripts["db:generate"] = "prisma generate";
    scripts["db:migrate"] = "prisma migrate dev";
    scripts["db:studio"] = "prisma studio";
    scripts["db:push"] = "prisma db push";
  }

  if (config.testing === "full") {
    scripts["test"] = "jest";
    scripts["test:watch"] = "jest --watch";
    scripts["test:coverage"] = "jest --coverage";
  }

  if (config.eslintPrettier) {
    scripts["lint"] = "eslint .";
    scripts["lint:fix"] = "eslint . --fix";
    scripts["format"] = "prettier --write .";
  }

  return {
    name: `${config.projectName}-backend`,
    version: "0.1.0",
    private: true,
    scripts,
    dependencies: deps,
    devDependencies: devDeps,
  };
}
