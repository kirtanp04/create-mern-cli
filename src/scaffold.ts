import path from "path";
import * as p from "@clack/prompts";
import chalk from "chalk";
import type { ProjectConfig } from "./cli/types";
import { writeFile, writeJson, ensureDir } from "./utils/files";
import { installDependencies, initGit } from "./utils/spawn";

// Frontend generators
import { generateFrontendPackageJson }    from "./generators/frontend/package-json";
import { generateViteConfig }             from "./generators/frontend/vite-config";
import {
  generateFrontendTsConfig,
  generateTsConfigApp,
  generateTsConfigNode,
} from "./generators/frontend/tsconfig";
import {
  generateIndexHtml,
  generateMainTsx,
  generateAppTsx,
  generateHomePageTsx,
  generateNotFoundPageTsx,
  generateViteEnvDts,
  generateFrontendEnv,
  generateTailwindConfig,
  generatePostcssConfig,
  generateIndexCss,
} from "./generators/frontend/files";
import { generateMuiTheme, generateMuiThemeProvider }   from "./generators/frontend/ui/mui";
import {
  generateShadcnThemeProvider,
  generateShadcnUtils,
  generateShadcnButton,
} from "./generators/frontend/ui/shadcn";

// Backend generators
import { generateBackendPackageJson } from "./generators/backend/package-json";
import {
  generateBackendTsConfig,
  generateServerIndex,
  generateApp,
  generateEnvConfig,
  generateCorsConfig,
  generateErrorHandler,
  generateNotFound,
  generateApiRouter,
  generateUserRoutes,
  generateUserController,
  generateRateLimiter,
} from "./generators/backend/files";
import {
  generateDatabaseConfig,
  generatePrismaSchema,
  generateMongoUserModel,
} from "./generators/backend/db";
import {
  generateJwtUtils,
  generateAuthMiddleware,
  generateAuthRoutes,
  generateAuthController,
} from "./generators/backend/auth";
import { generateLogger } from "./generators/backend/logger";

// Docker
import {
  generateFrontendDockerfile,
  generateNginxConf,
  generateBackendDockerfile,
  generateDockerCompose,
  generateDockerignore,
} from "./generators/docker";

// Root / misc
import {
  generateGitignore,
  generateBackendEnvExample,
  generateEslintConfig,
  generatePrettierConfig,
  generatePrettierIgnore,
  generateLintStagedConfig,
  generateHuskyPreCommit,
  generateVscodeSettings,
  generateVscodeExtensions,
  generateRootPackageJson,
  generateReadme,
} from "./generators/root-files";
import {
  generateApiClient,
  generateZustandStore,
  generateReduxStore,
  generateReduxAuthSlice,
  generateJotaiStore,
  generateVitest,
  generateVitestSetup,
  generateUseApiHook,
  generateUseLocalStorageHook,
  generateTanStackRootRoute,
  generateTanStackIndexRoute,
  generateReactRouterRoutesIndex,
} from "./generators/misc";

// ─────────────────────────────────────────────────────────────────────────────

export async function scaffold(config: ProjectConfig): Promise<void> {
  const root     = path.resolve(process.cwd(), config.projectName);
  const frontend = path.join(root, "frontend");
  const backend  = path.join(root, "backend");

  await ensureDir(root);

  const spin = p.spinner();

  // ── ROOT FILES ──────────────────────────────────────────────────────────────
  spin.start(chalk.dim("Writing root files…"));
  await writeJson(path.join(root, "package.json"), generateRootPackageJson(config));
  await writeFile(path.join(root, ".gitignore"), generateGitignore());
  await writeFile(path.join(root, "README.md"), generateReadme(config));
  await writeJson(
    path.join(root, ".vscode", "settings.json"),
    JSON.parse(generateVscodeSettings())
  );
  await writeJson(
    path.join(root, ".vscode", "extensions.json"),
    JSON.parse(generateVscodeExtensions())
  );

  if (config.docker === "compose") {
    await writeFile(path.join(root, "docker-compose.yml"), generateDockerCompose(config));
  }
  spin.stop(chalk.green("Root files written ✓"));

  // ── FRONTEND ────────────────────────────────────────────────────────────────
  spin.start(chalk.dim("Generating frontend…"));
  await ensureDir(path.join(frontend, "src"));

  // ── Config files ─────────────────────────────────────────────────────────
  await writeJson(path.join(frontend, "package.json"),    generateFrontendPackageJson(config));
  await writeFile(path.join(frontend, "vite.config.ts"),  generateViteConfig(config));
  await writeJson(path.join(frontend, "tsconfig.json"),   generateFrontendTsConfig(config));
  await writeJson(path.join(frontend, "tsconfig.app.json"),  generateTsConfigApp(config));
  await writeJson(path.join(frontend, "tsconfig.node.json"), generateTsConfigNode());
  await writeFile(path.join(frontend, "index.html"),      generateIndexHtml(config));
  await writeFile(path.join(frontend, ".env"),            generateFrontendEnv());
  await writeFile(path.join(frontend, ".env.example"),    generateFrontendEnv());
  await writeFile(path.join(frontend, ".gitignore"),      generateGitignore());
  await writeFile(path.join(frontend, "src", "vite-env.d.ts"), generateViteEnvDts());

  // ── Tailwind (shadcn + none, not MUI) ────────────────────────────────────
  if (config.uiLibrary !== "mui") {
    await writeFile(path.join(frontend, "tailwind.config.js"), generateTailwindConfig(config));
    await writeFile(path.join(frontend, "postcss.config.js"),  generatePostcssConfig());
    await writeFile(path.join(frontend, "src", "index.css"),   generateIndexCss(config));
  }

  // ── ESLint / Prettier ─────────────────────────────────────────────────────
  if (config.eslintPrettier) {
    await writeFile(path.join(frontend, "eslint.config.js"), generateEslintConfig(false));
    await writeFile(path.join(frontend, ".prettierrc"),      generatePrettierConfig());
    await writeFile(path.join(frontend, ".prettierignore"),  generatePrettierIgnore());
  }

  // ── Docker ────────────────────────────────────────────────────────────────
  if (config.docker !== "none") {
    await writeFile(path.join(frontend, "Dockerfile"),    generateFrontendDockerfile());
    await writeFile(path.join(frontend, "nginx.conf"),    generateNginxConf());
    await writeFile(path.join(frontend, ".dockerignore"), generateDockerignore());
  }

  // ── Testing ───────────────────────────────────────────────────────────────
  if (config.testing !== "none") {
    await writeFile(path.join(frontend, "vitest.config.ts"), generateVitest(false));
    await ensureDir(path.join(frontend, "src", "test"));
    await writeFile(
      path.join(frontend, "src", "test", "setup.ts"),
      generateVitestSetup()
    );
  }

  // ── UI Library ────────────────────────────────────────────────────────────
  if (config.uiLibrary === "mui") {
    await writeFile(path.join(frontend, "src", "theme.ts"), generateMuiTheme());
    await ensureDir(path.join(frontend, "src", "providers"));
    await writeFile(
      path.join(frontend, "src", "providers", "ThemeProvider.tsx"),
      generateMuiThemeProvider()
    );
  }
  if (config.uiLibrary === "shadcn") {
    await ensureDir(path.join(frontend, "src", "components", "ui"));
    await ensureDir(path.join(frontend, "src", "lib"));
    await writeFile(
      path.join(frontend, "src", "components", "theme-provider.tsx"),
      generateShadcnThemeProvider()
    );
    await writeFile(
      path.join(frontend, "src", "lib", "utils.ts"),
      generateShadcnUtils()
    );
    await writeFile(
      path.join(frontend, "src", "components", "ui", "button.tsx"),
      generateShadcnButton()
    );
  }

  // ── State management ──────────────────────────────────────────────────────
  await ensureDir(path.join(frontend, "src", "store"));
  if (config.stateManager === "zustand") {
    await writeFile(
      path.join(frontend, "src", "store", "authStore.ts"),
      generateZustandStore()
    );
  } else if (config.stateManager === "redux-toolkit") {
    await writeFile(path.join(frontend, "src", "store", "index.ts"),     generateReduxStore());
    await writeFile(path.join(frontend, "src", "store", "authSlice.ts"), generateReduxAuthSlice());
  } else if (config.stateManager === "jotai") {
    await writeFile(
      path.join(frontend, "src", "store", "atoms.ts"),
      generateJotaiStore()
    );
  } else {
    // None — write a placeholder so the folder is not empty
    await writeFile(
      path.join(frontend, "src", "store", ".gitkeep"),
      "# Add your state management files here\n"
    );
  }

  // ── Hooks (always populated) ──────────────────────────────────────────────
  await ensureDir(path.join(frontend, "src", "hooks"));
  await writeFile(
    path.join(frontend, "src", "hooks", "useApi.ts"),
    generateUseApiHook()
  );
  await writeFile(
    path.join(frontend, "src", "hooks", "useLocalStorage.ts"),
    generateUseLocalStorageHook()
  );
  await writeFile(
    path.join(frontend, "src", "hooks", "index.ts"),
    `export { useApi }          from './useApi'\nexport { useLocalStorage } from './useLocalStorage'\n`
  );

  // ── API client ────────────────────────────────────────────────────────────
  await ensureDir(path.join(frontend, "src", "services"));
  await writeFile(
    path.join(frontend, "src", "services", "api.ts"),
    generateApiClient(config)
  );

  // ── Types ─────────────────────────────────────────────────────────────────
  await ensureDir(path.join(frontend, "src", "types"));
  await writeFile(
    path.join(frontend, "src", "types", "index.ts"),
    "// Shared frontend types\nexport {}\n"
  );

  // ── Components skeleton ───────────────────────────────────────────────────
  await ensureDir(path.join(frontend, "src", "components"));

  // ── Routing ───────────────────────────────────────────────────────────────
  if (config.router === "tanstack-router") {
    await ensureDir(path.join(frontend, "src", "routes"));
    await writeFile(
      path.join(frontend, "src", "routes", "__root.tsx"),
      generateTanStackRootRoute()
    );
    await writeFile(
      path.join(frontend, "src", "routes", "index.tsx"),
      generateTanStackIndexRoute()
    );
  }

  if (config.router === "react-router") {
    await ensureDir(path.join(frontend, "src", "pages"));
    await writeFile(
      path.join(frontend, "src", "pages", "HomePage.tsx"),
      generateHomePageTsx()
    );
    await writeFile(
      path.join(frontend, "src", "pages", "NotFoundPage.tsx"),
      generateNotFoundPageTsx()
    );
  }

  if (config.router === "react-router") {
    // Separate routes barrel for React Router
    await ensureDir(path.join(frontend, "src", "routes"));
    await writeFile(
      path.join(frontend, "src", "routes", "index.ts"),
      generateReactRouterRoutesIndex()
    );
  }

  // ── App entry files ───────────────────────────────────────────────────────
  await writeFile(path.join(frontend, "src", "main.tsx"), generateMainTsx(config));
  await writeFile(path.join(frontend, "src", "App.tsx"),  generateAppTsx(config));

  spin.stop(chalk.green("Frontend generated ✓"));

  // ── BACKEND ─────────────────────────────────────────────────────────────────
  spin.start(chalk.dim("Generating backend…"));
  await ensureDir(path.join(backend, "src"));

  await writeJson(path.join(backend, "package.json"),   generateBackendPackageJson(config));
  await writeJson(path.join(backend, "tsconfig.json"),  generateBackendTsConfig());
  await writeFile(path.join(backend, ".env"),           generateBackendEnvExample(config));
  await writeFile(path.join(backend, ".env.example"),   generateBackendEnvExample(config));
  await writeFile(path.join(backend, ".gitignore"),     generateGitignore());

  if (config.eslintPrettier) {
    await writeFile(path.join(backend, "eslint.config.js"), generateEslintConfig(true));
    await writeFile(path.join(backend, ".prettierrc"),      generatePrettierConfig());
    await writeFile(path.join(backend, ".prettierignore"),  generatePrettierIgnore());
  }

  if (config.docker !== "none") {
    await writeFile(path.join(backend, "Dockerfile"),    generateBackendDockerfile());
    await writeFile(path.join(backend, ".dockerignore"), generateDockerignore());
  }

  if (config.testing === "full") {
    await writeFile(path.join(backend, "jest.config.ts"), generateVitest(true));
  }

  // ── src files ─────────────────────────────────────────────────────────────
  await writeFile(path.join(backend, "src", "index.ts"), generateServerIndex(config));
  await writeFile(path.join(backend, "src", "app.ts"),   generateApp(config));

  // ── Config ────────────────────────────────────────────────────────────────
  await ensureDir(path.join(backend, "src", "config"));
  await writeFile(path.join(backend, "src", "config", "env.ts"), generateEnvConfig(config));
  if (config.database !== "none") {
    await writeFile(
      path.join(backend, "src", "config", "database.ts"),
      generateDatabaseConfig(config)
    );
  }
  if (config.corsSetup) {
    await writeFile(path.join(backend, "src", "config", "cors.ts"), generateCorsConfig());
  }

  // ── Middleware ────────────────────────────────────────────────────────────
  await ensureDir(path.join(backend, "src", "middleware"));
  await writeFile(
    path.join(backend, "src", "middleware", "errorHandler.ts"),
    generateErrorHandler()
  );
  await writeFile(
    path.join(backend, "src", "middleware", "notFound.ts"),
    generateNotFound()
  );
  if (config.rateLimiting) {
    await writeFile(
      path.join(backend, "src", "middleware", "rateLimiter.ts"),
      generateRateLimiter()
    );
  }
  if (config.authStrategy !== "none") {
    await writeFile(
      path.join(backend, "src", "middleware", "auth.ts"),
      generateAuthMiddleware()
    );
  }

  // ── Utils ─────────────────────────────────────────────────────────────────
  await ensureDir(path.join(backend, "src", "utils"));
  if (config.logger !== "none") {
    await writeFile(
      path.join(backend, "src", "utils", "logger.ts"),
      generateLogger(config)
    );
  }
  if (config.authStrategy !== "none") {
    await writeFile(
      path.join(backend, "src", "utils", "jwt.ts"),
      generateJwtUtils(config)
    );
  }

  // ── Routes ────────────────────────────────────────────────────────────────
  await ensureDir(path.join(backend, "src", "routes"));
  await writeFile(
    path.join(backend, "src", "routes", "index.ts"),
    generateApiRouter(config)
  );
  await writeFile(
    path.join(backend, "src", "routes", "user.routes.ts"),
    generateUserRoutes()
  );
  if (config.authStrategy !== "none") {
    await writeFile(
      path.join(backend, "src", "routes", "auth.routes.ts"),
      generateAuthRoutes(config)
    );
  }

  // ── Controllers ───────────────────────────────────────────────────────────
  await ensureDir(path.join(backend, "src", "controllers"));
  await writeFile(
    path.join(backend, "src", "controllers", "user.controller.ts"),
    generateUserController()
  );
  if (config.authStrategy !== "none") {
    await writeFile(
      path.join(backend, "src", "controllers", "auth.controller.ts"),
      generateAuthController(config)
    );
  }

  // ── Models ────────────────────────────────────────────────────────────────
  await ensureDir(path.join(backend, "src", "models"));
  if (config.database === "mongodb" && config.authStrategy !== "none") {
    await writeFile(
      path.join(backend, "src", "models", "User.ts"),
      generateMongoUserModel()
    );
  } else {
    await writeFile(
      path.join(backend, "src", "models", ".gitkeep"),
      "# Add your model files here\n"
    );
  }

  // ── Prisma ────────────────────────────────────────────────────────────────
  if (config.database === "postgresql" || config.database === "mysql") {
    await ensureDir(path.join(backend, "prisma"));
    await writeFile(
      path.join(backend, "prisma", "schema.prisma"),
      generatePrismaSchema(config)
    );
  }

  // ── Types ─────────────────────────────────────────────────────────────────
  await ensureDir(path.join(backend, "src", "types"));
  await writeFile(
    path.join(backend, "src", "types", "index.ts"),
    "// Add shared backend types here\nexport {}\n"
  );

  spin.stop(chalk.green("Backend generated ✓"));

  // ── HUSKY ───────────────────────────────────────────────────────────────────
  if (config.husky && config.eslintPrettier) {
    spin.start(chalk.dim("Setting up Husky…"));
    await writeFile(path.join(root, "lint-staged.config.js"), generateLintStagedConfig());
    await ensureDir(path.join(root, ".husky"));
    await writeFile(
      path.join(root, ".husky", "pre-commit"),
      generateHuskyPreCommit()
    );
    spin.stop(chalk.green("Husky configured ✓"));
  }

  // ── INSTALL DEPS ────────────────────────────────────────────────────────────
  if (config.installDeps) {
    spin.start(chalk.dim(`Installing root deps with ${config.packageManager}…`));
    await installDependencies(root, config.packageManager);
    spin.stop(chalk.green("Root deps installed ✓"));

    spin.start(chalk.dim("Installing frontend deps…"));
    await installDependencies(frontend, config.packageManager);
    spin.stop(chalk.green("Frontend deps installed ✓"));

    spin.start(chalk.dim("Installing backend deps…"));
    await installDependencies(backend, config.packageManager);
    spin.stop(chalk.green("Backend deps installed ✓"));
  }

  // ── GIT ─────────────────────────────────────────────────────────────────────
  if (config.gitInit) {
    spin.start(chalk.dim("Initialising git repository…"));
    try {
      await initGit(root);
      spin.stop(chalk.green("Git initialised ✓"));
    } catch {
      spin.stop(chalk.yellow("Git init skipped (git not found)"));
    }
  }
}