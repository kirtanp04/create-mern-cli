<div align="center">

<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/mongodb/mongodb-original.svg" height="40" alt="MongoDB" />&nbsp;
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/express/express-original.svg" height="40" alt="Express" />&nbsp;
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg" height="40" alt="React" />&nbsp;
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg" height="40" alt="Node.js" />&nbsp;
<img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/typescript/typescript-original.svg" height="40" alt="TypeScript" />&nbsp;
<img src="https://vitejs.dev/logo.svg" height="40" alt="Vite" />

<h1>mern-builder</h1>

<p><strong>Scaffold a production-ready MERN stack app in seconds.</strong><br/>
Like <code>create-next-app</code> — but for MERN + Vite + TypeScript.</p>

[![npm version](https://img.shields.io/npm/v/mern-builder?style=flat-square&color=00b4d8&label=npm)](https://www.npmjs.com/package/mern-builder)
[![npm downloads](https://img.shields.io/npm/dm/mern-builder?style=flat-square&color=0077b6)](https://www.npmjs.com/package/mern-builder)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen?style=flat-square)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)

</div>

---

## ⚡ Quick Start

```bash
npx mern-builder my-app
```

> No installation required. Just run and answer a few questions.

Or pass the project name later:

```bash
npx mern-builder          # interactive — prompts for name
npx mern-builder my-app   # name pre-filled, rest is interactive
```

---

## 🎬 What Happens

The CLI walks you through a fully interactive setup with **section-by-section prompts**. After answering all questions, you get a **summary screen** where you can go back and edit any section before the project is generated.

```
◆  Project Setup
◆  Frontend
◆  Backend
◆  DevOps & Tooling
◆  Review your choices  ← edit anything before confirming
◆  Scaffold!
```

---

## 🛠  What You Can Configure

### Project Setup

| Option | Choices |
|--------|---------|
| Package manager | `npm` · `pnpm` *(recommended)* · `yarn` |
| Install deps now | yes / no |
| Init git repo | yes / no |

### 🎨 Frontend

| Option | Choices |
|--------|---------|
| UI Library | Tailwind CSS · MUI v6 · shadcn/ui |
| Routing | None · React Router v6 · TanStack Router |
| State management | None · Zustand · Redux Toolkit · Jotai |
| Path alias `@/` | yes / no |

### 🔧 Backend

| Option | Choices |
|--------|---------|
| Database | MongoDB (Mongoose) · PostgreSQL (Prisma) · MySQL (Prisma) · None |
| Authentication | None · JWT · JWT + Refresh Token |
| CORS | yes / no |
| Logger | None · Pino · Winston |
| Security middleware | Rate limiting · Helmet.js · Zod env validation |

### 🐳 DevOps & Tooling

| Option | Choices |
|--------|---------|
| Docker | None · Dockerfiles · docker-compose |
| Testing | None · Vitest · Vitest + Supertest |
| Code quality | ESLint + Prettier · Husky + lint-staged |

---

## 📁 Generated Structure

```
my-app/
├── frontend/                   # Vite + React 18 + TypeScript
│   ├── src/
│   │   ├── components/         # your UI components
│   │   ├── hooks/              # useApi, useLocalStorage
│   │   ├── pages/              # route-level page components
│   │   ├── routes/             # React Router / TanStack route files
│   │   ├── services/
│   │   │   └── api.ts          # axios client (with auth interceptors)
│   │   ├── store/              # Zustand / Redux / Jotai / Context
│   │   └── types/              # shared TypeScript types
│   ├── vite.config.ts
│   └── Dockerfile              # (if Docker selected)
│
├── backend/                    # Express + TypeScript
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.ts          # Zod-validated environment
│   │   │   ├── database.ts     # MongoDB / Prisma connection
│   │   │   └── cors.ts         # CORS options
│   │   ├── controllers/
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts # global error + Zod error handling
│   │   │   ├── auth.ts         # JWT authenticate + authorize
│   │   │   └── rateLimiter.ts
│   │   ├── models/             # Mongoose models / Prisma schema
│   │   ├── routes/
│   │   └── utils/
│   │       ├── logger.ts       # Pino / Winston
│   │       └── jwt.ts          # sign + verify helpers
│   ├── prisma/                 # (if PostgreSQL / MySQL)
│   └── Dockerfile              # (if Docker selected)
│
├── docker-compose.yml          # (if compose selected)
├── .vscode/                    # editor settings + extension recommendations
└── package.json                # root workspace: dev, build, lint, test
```

---

## 🚀 What Gets Generated — Highlights

### Frontend

- **Vite + React 18** with hot module replacement out of the box
- **TypeScript** with strict mode and path aliases (`@/` → `src/`)
- **Axios API client** — pre-configured with base URL, timeout, and optional JWT interceptors + silent refresh on 401
- **`useApi` hook** — typed, reusable data-fetching hook with `loading` / `error` / `data` state
- **`useLocalStorage` hook** — cross-tab synced with `StorageEvent`
- Full **UI library setup**: MUI theming, shadcn/ui CSS variables + dark mode, or plain Tailwind

### Backend

- **Express** with `express-async-errors` — no manual `try/catch` in every route
- **Graceful shutdown** handling `SIGTERM` / `SIGINT`
- **Global error handler** — normalises `AppError`, `ZodError`, and unknown errors into a consistent JSON response
- **JWT auth** with role-based `authorize()` middleware; refresh-token flow uses `httpOnly` cookies
- **Zod env validation** — server refuses to start if `.env` is misconfigured
- **Structured logging** — Pino with `pino-pretty` in dev and JSON + log-level routing in production; Winston with `DailyRotateFile`

### DevOps

- **Multi-stage Dockerfiles** — build stage + minimal production image with health-check
- **docker-compose** — frontend (nginx), backend, and database service with health-checks
- **Nginx** config with SPA routing and `/api` proxy

---

## 📦 After Scaffolding

```bash
cd my-app

# 1. Configure environment
cp backend/.env.example backend/.env
# → fill in DB connection string, JWT secrets, etc.

# 2. Start development servers (frontend + backend concurrently)
pnpm dev
#  Frontend →  http://localhost:5173
#  Backend  →  http://localhost:5000
#  API      →  http://localhost:5000/api/v1

# 3. Build for production
pnpm build
```

### Prisma (PostgreSQL / MySQL only)

```bash
cd backend
pnpm db:generate   # generate Prisma Client
pnpm db:migrate    # run migrations
pnpm db:studio     # open Prisma Studio GUI
```

### Docker

```bash
pnpm docker:build  # build images
pnpm docker:up     # start all services (detached)
pnpm docker:logs   # tail logs
pnpm docker:down   # stop services
```

---

## 🌐 API Endpoints

The generated backend exposes:

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET`  | `/health` | Health check | — |
| `POST` | `/api/v1/auth/register` | Register new user | — |
| `POST` | `/api/v1/auth/login` | Login | — |
| `GET`  | `/api/v1/auth/me` | Get current user | ✅ JWT |
| `POST` | `/api/v1/auth/refresh` | Refresh access token | 🍪 Cookie |
| `POST` | `/api/v1/auth/logout` | Logout | ✅ JWT |
| `GET`  | `/api/v1/users` | List users | — |
| `GET`  | `/api/v1/users/:id` | Get user by ID | — |

> Some endpoints are only generated based on your auth strategy selection.

---

## 🔑 Environment Variables

The generated `backend/.env.example` includes everything you need:

```env
PORT=5000
NODE_ENV=development
LOG_LEVEL=debug

# Database (one of the following)
MONGODB_URI=mongodb://localhost:27017/my-app
DATABASE_URL=postgresql://postgres:secret@localhost:5432/my-app?schema=public

# JWT (if auth selected)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=15m

# JWT Refresh (if jwt-refresh selected)
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
JWT_REFRESH_EXPIRES_IN=7d

# CORS (if selected)
ALLOWED_ORIGINS=http://localhost:5173
```

> ⚠️ Always change the JWT secrets before deploying to production. Never commit your `.env` file.

---

## 🧑‍💻 Develop the CLI Itself

```bash
git clone https://github.com/kirtanp04/create-mern-cli
cd mern-builder
npm install

# Run without building (ts-node)
npm run dev

# Build to dist/
npm run build

# Test locally
npm link
mern-builder test-project
```


---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repo
2. Create your branch: `git checkout -b feat/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feat/my-feature`
5. Open a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## 📋 Requirements

| Requirement | Version |
|-------------|---------|
| Node.js | `>= 18.0.0` |
| npm / pnpm / yarn | any recent version |

---

## 📄 License

[MIT](LICENSE) © 2024 — made with ☕ and TypeScript.

---

<div align="center">

**[⭐ Star on GitHub](https://github.com/kirtanp04/create-mern-cli)** &nbsp;·&nbsp;
**[🐛 Report a Bug](https://github.com/kirtanp04/create-mern-cli/issues)** &nbsp;·&nbsp;
**[💡 Request a Feature](https://github.com/kirtanp04/create-mern-cli/issues)**

</div>