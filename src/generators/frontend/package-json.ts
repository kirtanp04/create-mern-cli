import type { ProjectConfig } from "../../cli/types";

export function generateFrontendPackageJson(config: ProjectConfig): object {
  const deps: Record<string, string> = {
    react: "^18.3.1",
    "react-dom": "^18.3.1",
  };
  const devDeps: Record<string, string> = {
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@types/node": "^25.6.0",
    "@vitejs/plugin-react": "^4.3.1",
    typescript: "^5.5.3",
    vite: "^5.3.4",
  };

  // UI Library
  if (config.uiLibrary === "mui") {
    deps["@mui/material"] = "^6.1.0";
    deps["@mui/icons-material"] = "^6.1.0";
    deps["@emotion/react"] = "^11.13.3";
    deps["@emotion/styled"] = "^11.13.0";
  }
  if (config.uiLibrary === "shadcn") {
    deps["class-variance-authority"] = "^0.7.0";
    deps["clsx"] = "^2.1.1";
    deps["lucide-react"] = "^0.460.0";
    deps["tailwind-merge"] = "^2.5.4";
    deps["tailwindcss-animate"] = "^1.0.7";
    deps["@radix-ui/react-slot"] = "^1.1.0";
    deps["@radix-ui/react-dialog"] = "^1.1.2";
    deps["@radix-ui/react-dropdown-menu"] = "^2.1.2";
    deps["@radix-ui/react-label"] = "^2.1.0";
    deps["@radix-ui/react-separator"] = "^1.1.0";
    deps["@radix-ui/react-toast"] = "^1.2.2";
    devDeps["tailwindcss"] = "^3.4.14";
    devDeps["autoprefixer"] = "^10.4.20";
    devDeps["postcss"] = "^8.4.47";
  }
  if (config.uiLibrary === "none") {
    devDeps["tailwindcss"] = "^3.4.14";
    devDeps["autoprefixer"] = "^10.4.20";
    devDeps["postcss"] = "^8.4.47";
  }

  // Router
  if (config.router === "react-router") {
    deps["react-router-dom"] = "^6.27.0";
  }
  if (config.router === "tanstack-router") {
    deps["@tanstack/react-router"] = "^1.58.0";
    devDeps["@tanstack/router-plugin"] = "^1.58.0";
    devDeps["@tanstack/router-devtools"] = "^1.58.0";
  }

  // State
  if (config.stateManager === "zustand") deps["zustand"] = "^5.0.1";
  if (config.stateManager === "redux-toolkit") {
    deps["@reduxjs/toolkit"] = "^2.3.0";
    deps["react-redux"] = "^9.1.2";
  }
  if (config.stateManager === "jotai") deps["jotai"] = "^2.10.0";

  // API Client
  deps["axios"] = "^1.7.7";

  // Testing
  if (config.testing !== "none") {
    devDeps["vitest"] = "^2.1.3";
    devDeps["@vitest/ui"] = "^2.1.3";
    devDeps["@testing-library/react"] = "^16.0.0";
    devDeps["@testing-library/jest-dom"] = "^6.5.0";
    devDeps["@testing-library/user-event"] = "^14.5.2";
    devDeps["jsdom"] = "^25.0.1";
  }

  // Linting
  if (config.eslintPrettier) {
    devDeps["eslint"] = "^9.11.1";
    devDeps["@eslint/js"] = "^9.11.1";
    devDeps["eslint-plugin-react-hooks"] = "^5.1.0";
    devDeps["eslint-plugin-react-refresh"] = "^0.4.12";
    devDeps["typescript-eslint"] = "^8.8.1";
    devDeps["prettier"] = "^3.3.3";
    devDeps["eslint-config-prettier"] = "^9.1.0";
  }

  const scripts: Record<string, string> = {
    dev: "vite",
    build: "tsc -b && vite build",
    preview: "vite preview",
    "type-check": "tsc --noEmit",
  };
  if (config.testing !== "none") {
    scripts["test"] = "vitest";
    scripts["test:ui"] = "vitest --ui";
    scripts["test:coverage"] = "vitest run --coverage";
  }
  if (config.eslintPrettier) {
    scripts["lint"] = "eslint .";
    scripts["lint:fix"] = "eslint . --fix";
    scripts["format"] = "prettier --write .";
    scripts["format:check"] = "prettier --check .";
  }

  return {
    name: `${config.projectName}-frontend`,
    version: "0.1.0",
    private: true,
    type: "module",
    scripts,
    dependencies: deps,
    devDependencies: devDeps,
  };
}
