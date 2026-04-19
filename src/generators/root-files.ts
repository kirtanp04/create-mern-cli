import type { ProjectConfig } from "../cli/types";

export function generateGitignore(): string {
  return `# Dependencies
node_modules/
.pnp
.pnp.js

# Build outputs
dist/
build/
out/

# Environment
.env
.env.local
.env.*.local

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Testing
coverage/
.nyc_output/

# OS
.DS_Store
Thumbs.db

# Editor
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
.idea/

# Misc
*.tsbuildinfo
`;
}

export function generateBackendEnvExample(config: ProjectConfig): string {
  const lines: string[] = [
    `PORT=5000`,
    `NODE_ENV=development`,
    `LOG_LEVEL=debug`,
  ];

  if (config.database === "mongodb") {
    lines.push(`MONGODB_URI=mongodb://localhost:27017/${config.projectName}`);
  }
  if (config.database === "postgresql") {
    lines.push(
      `DATABASE_URL=postgresql://postgres:secret@localhost:5432/${config.projectName}?schema=public`
    );
  }
  if (config.database === "mysql") {
    lines.push(`DATABASE_URL=mysql://root:secret@localhost:3306/${config.projectName}`);
  }
  if (config.authStrategy !== "none") {
    lines.push(`JWT_SECRET=your-super-secret-jwt-key-change-in-production-32chars`);
    lines.push(`JWT_EXPIRES_IN=15m`);
  }
  if (config.authStrategy === "jwt-refresh") {
    lines.push(
      `JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production-32chars`
    );
    lines.push(`JWT_REFRESH_EXPIRES_IN=7d`);
  }
  if (config.corsSetup) {
    lines.push(`ALLOWED_ORIGINS=http://localhost:5173`);
  }

  return lines.join("\n") + "\n";
}

export function generateEslintConfig(isBackend = false): string {
  return `import js from '@eslint/js'
import tseslint from 'typescript-eslint'
${
  isBackend
    ? ""
    : "import reactHooks from 'eslint-plugin-react-hooks'\nimport reactRefresh from 'eslint-plugin-react-refresh'\n"
}
export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    ${
      isBackend
        ? `rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    },`
        : `plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    },`
    }
  }
)
`;
}

export function generatePrettierConfig(): string {
  return `{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always",
  "endOfLine": "lf"
}
`;
}

export function generatePrettierIgnore(): string {
  return `dist/
node_modules/
*.min.js
pnpm-lock.yaml
package-lock.json
yarn.lock
`;
}

export function generateLintStagedConfig(): string {
  return `export default {
  '**/*.{ts,tsx}': ['eslint --fix', 'prettier --write'],
  '**/*.{json,md,yml,yaml}': ['prettier --write'],
}
`;
}

export function generateHuskyPreCommit(): string {
  return `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
`;
}

export function generateVscodeSettings(): string {
  return `{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "explicit"
  },
  "typescript.preferences.importModuleSpecifier": "shortest",
  "typescript.suggest.autoImports": true,
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true
  }
}
`;
}

export function generateVscodeExtensions(): string {
  return `{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-azuretools.vscode-docker",
    "eamodio.gitlens"
  ]
}
`;
}

export function generateRootPackageJson(config: ProjectConfig): object {
  const pm = config.packageManager;
  const run = pm === "npm" ? "npm run" : pm === "yarn" ? "yarn" : "pnpm";

  const scripts: Record<string, string> = {
    "dev:frontend":       `cd frontend && ${run} dev`,
    "dev:backend":        `cd backend && ${run} dev`,
    dev:                  `concurrently "${run} dev:frontend" "${run} dev:backend"`,
    "build:frontend":     `cd frontend && ${run} build`,
    "build:backend":      `cd backend && ${run} build`,
    build:                `${run} build:frontend && ${run} build:backend`,
    "type-check":         `${run} type-check:frontend && ${run} type-check:backend`,
    "type-check:frontend":`cd frontend && ${run} type-check`,
    "type-check:backend": `cd backend && ${run} type-check`,
  };

  if (config.eslintPrettier) {
    scripts["lint"]            = `${run} lint:frontend && ${run} lint:backend`;
    scripts["lint:frontend"]   = `cd frontend && ${run} lint`;
    scripts["lint:backend"]    = `cd backend && ${run} lint`;
    scripts["format"]          = `${run} format:frontend && ${run} format:backend`;
    scripts["format:frontend"] = `cd frontend && ${run} format`;
    scripts["format:backend"]  = `cd backend && ${run} format`;
  }

  if (config.testing !== "none") {
    scripts["test"]            = `${run} test:frontend${config.testing === "full" ? ` && ${run} test:backend` : ""}`;
    scripts["test:frontend"]   = `cd frontend && ${run} test`;
    if (config.testing === "full") {
      scripts["test:backend"]  = `cd backend && ${run} test`;
    }
  }

  if (config.docker !== "none") {
    scripts["docker:up"]    = "docker-compose up -d";
    scripts["docker:down"]  = "docker-compose down";
    scripts["docker:logs"]  = "docker-compose logs -f";
    scripts["docker:build"] = "docker-compose build";
  }

  return {
    name:    config.projectName,
    version: "0.1.0",
    private: true,
    type:    "module",
    scripts,
    devDependencies: {
      concurrently: "^9.0.1",
    },
  };
}

export function generateReadme(config: ProjectConfig): string {
  const pm  = config.packageManager;
  const install = pm === "yarn" ? "yarn" : `${pm} install`;
  const run     = pm === "npm"  ? "npm run" : pm === "yarn" ? "yarn" : "pnpm";

  const features: string[] = [
    "⚡ **Vite + React 18 + TypeScript** on the frontend",
    "🛠  **Express + TypeScript** on the backend",
    config.uiLibrary === "mui"    ? "🎨 **MUI v6** with dark/light theming"              : "",
    config.uiLibrary === "shadcn" ? "🎨 **shadcn/ui** with CSS variable theming"         : "",
    config.uiLibrary === "none"   ? "🎨 **Tailwind CSS** for styling"                    : "",
    config.router === "react-router"    ? "🗺  **React Router v6** for client-side routing"   : "",
    config.router === "tanstack-router" ? "🗺  **TanStack Router** for type-safe routing"     : "",
    config.stateManager === "zustand"       ? "📦 **Zustand** for state management"           : "",
    config.stateManager === "redux-toolkit" ? "📦 **Redux Toolkit** for state management"     : "",
    config.stateManager === "jotai"         ? "📦 **Jotai** for atomic state management"      : "",
    config.database === "mongodb"    ? "🗄  **MongoDB** with Mongoose ODM"                : "",
    config.database === "postgresql" ? "🗄  **PostgreSQL** with Prisma ORM"              : "",
    config.database === "mysql"      ? "🗄  **MySQL** with Prisma ORM"                   : "",
    config.authStrategy === "jwt"         ? "🔐 **JWT** authentication"                  : "",
    config.authStrategy === "jwt-refresh" ? "🔐 **JWT + Refresh Token** authentication"  : "",
    config.corsSetup        ? "🌐 **CORS** configured with env-based origins"            : "",
    config.logger === "pino"    ? "📋 **Pino** structured logging"                       : "",
    config.logger === "winston" ? "📋 **Winston** structured logging"                    : "",
    config.helmetSecurity   ? "🔒 **Helmet.js** HTTP security headers"                   : "",
    config.rateLimiting     ? "🚦 **Rate limiting** with express-rate-limit"             : "",
    config.envValidation    ? "✅ **Zod** environment validation"                        : "",
    config.docker !== "none"    ? "🐳 **Docker** setup included"                         : "",
    config.testing !== "none"   ? "🧪 **Vitest** testing configured"                    : "",
    config.eslintPrettier   ? "✨ **ESLint + Prettier** code quality"                    : "",
    config.husky            ? "🐶 **Husky** pre-commit hooks"                            : "",
  ].filter(Boolean);

  // Docker compose entry in structure tree
  const dockerLine = config.docker === "compose"
    ? "├── docker-compose.yml\n"
    : "";

  return `# ${config.projectName}

> Bootstrapped with [mern-builder](https://npmjs.com/package/mern-builder)

## Features

${features.map((f) => `- ${f}`).join("\n")}

## Project Structure

\`\`\`
${config.projectName}/
├── frontend/          # Vite + React 18 + TypeScript
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/      # useApi, useLocalStorage
│   │   ├── pages/
│   │   ├── services/   # axios API client
│   │   ├── store/      # state management
│   │   └── types/
│   └── vite.config.ts
├── backend/           # Express + TypeScript
│   ├── src/
│   │   ├── config/    # env, db, cors
│   │   ├── controllers/
│   │   ├── middleware/ # errorHandler, auth, rateLimiter
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/     # logger, jwt
${dockerLine}└── package.json       # root workspace scripts
\`\`\`

## Getting Started

### Prerequisites

- Node.js >= 18
- ${pm}${config.database === "mongodb" ? "\n- MongoDB" : ""}${config.database === "postgresql" ? "\n- PostgreSQL" : ""}${config.database === "mysql" ? "\n- MySQL" : ""}

### Install dependencies

\`\`\`bash
${install}
\`\`\`

### Environment setup

\`\`\`bash
cp backend/.env.example backend/.env
# Edit backend/.env and fill in your values
\`\`\`

### Run in development

\`\`\`bash
${run} dev            # frontend + backend concurrently
${run} dev:frontend   # frontend only  →  http://localhost:5173
${run} dev:backend    # backend only   →  http://localhost:5000
\`\`\`

### Build for production

\`\`\`bash
${run} build
\`\`\`
${
  config.database === "postgresql" || config.database === "mysql"
    ? `
### Database (Prisma)

\`\`\`bash
cd backend
${run} db:generate  # generate Prisma client
${run} db:migrate   # run migrations
${run} db:studio    # open Prisma Studio
\`\`\`
`
    : ""
}${
  config.docker !== "none"
    ? `
### Docker

\`\`\`bash
${run} docker:build  # build images
${run} docker:up     # start all services
${run} docker:logs   # tail logs
${run} docker:down   # stop services
\`\`\`
`
    : ""
}${
  config.testing !== "none"
    ? `
### Testing

\`\`\`bash
${run} test            # run all tests
${run} test:frontend   # Vitest (frontend)
\`\`\`
`
    : ""
}
## API Reference

Base URL: \`http://localhost:5000/api/v1\`

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`/health\` | GET | Health check |${
  config.authStrategy !== "none"
    ? `
| \`/api/v1/auth/register\` | POST | Register new user |
| \`/api/v1/auth/login\`    | POST | Login |
| \`/api/v1/auth/me\`       | GET  | Get current user (auth required) |`
    : ""
}
| \`/api/v1/users\`     | GET | List users |
| \`/api/v1/users/:id\` | GET | Get user by ID |

## Environment Variables

See \`backend/.env.example\` for all required variables.

## License

MIT
`;
}