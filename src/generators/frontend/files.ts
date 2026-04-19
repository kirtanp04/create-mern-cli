import type { ProjectConfig } from "../../cli/types";

export function generateIndexHtml(config: ProjectConfig): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${config.projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
}

export function generateMainTsx(config: ProjectConfig): string {
  const imports: string[] = ["import React from 'react'", "import ReactDOM from 'react-dom/client'"];
  const wrappers: string[] = [];

  if (config.uiLibrary === "mui") {
    imports.push("import { ThemeProvider, CssBaseline } from '@mui/material'");
    imports.push("import { theme } from '@/theme'");
    wrappers.push("ThemeProvider theme={theme}");
    wrappers.push("CssBaseline /");
  }

  if (config.uiLibrary === "shadcn") {
    imports.push("import { ThemeProvider } from '@/components/theme-provider'");
    wrappers.push(`ThemeProvider defaultTheme="system" storageKey="ui-theme"`);
  }

  if (config.router === "react-router") {
    imports.push("import { BrowserRouter } from 'react-router-dom'");
    wrappers.push("BrowserRouter");
  }
  if (config.router === "tanstack-router") {
    imports.push("import { RouterProvider } from '@tanstack/react-router'");
    imports.push("import { router } from '@/router'");
  }

  if (config.stateManager === "redux-toolkit") {
    imports.push("import { Provider } from 'react-redux'");
    imports.push("import { store } from '@/store'");
    wrappers.push("Provider store={store}");
  }

  imports.push("import App from './App'");

  if (config.uiLibrary === "shadcn" || config.uiLibrary === "none") {
    imports.push("import './index.css'");
  }

  // Build JSX
  let content = `<App />`;
  if (config.router === "tanstack-router") {
    content = `<RouterProvider router={router} />`;
  }

  // Wrap in providers
  const providerTags = wrappers.filter(w => !w.endsWith("/"));
  const selfClosing = wrappers.filter(w => w.endsWith("/"));

  for (const tag of [...providerTags].reverse()) {
    const tagName = tag.split(" ")[0];
    const attrs = tag.split(" ").slice(1).join(" ");
    content = `<${tagName}${attrs ? " " + attrs : ""}>\n      ${content}\n    </${tagName}>`;
  }
  for (const tag of selfClosing) {
    const tagName = tag.split(" ")[0];
    content = `${content}\n    <${tagName}>`;
  }

  return `${imports.join("\n")}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    ${content}
  </React.StrictMode>,
)
`;
}

export function generateAppTsx(config: ProjectConfig): string {
  const imports: string[] = [];
  let routerContent = "";

  if (config.router === "react-router") {
    imports.push(`import { Routes, Route, Link } from 'react-router-dom'`);
    imports.push(`import HomePage from '@/pages/HomePage'`);
    imports.push(`import NotFoundPage from '@/pages/NotFoundPage'`);
    routerContent = `
      <nav className="navbar">
        <Link to="/">Home</Link>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>`;
  } else {
    routerContent = `
      <main>
        <h1>Welcome to ${config.projectName}</h1>
        <p>Your MERN stack app is ready 🚀</p>
      </main>`;
  }

  return `${imports.join("\n")}${imports.length > 0 ? "\n\n" : ""}function App() {
  return (
    <div className="app">${routerContent}
    </div>
  )
}

export default App
`;
}

export function generateHomePageTsx(): string {
  return `export default function HomePage() {
  return (
    <div>
      <h1>Home Page</h1>
      <p>Welcome! Edit <code>src/pages/HomePage.tsx</code> to get started.</p>
    </div>
  )
}
`;
}

export function generateNotFoundPageTsx(): string {
  return `export default function NotFoundPage() {
  return (
    <div>
      <h1>404 — Page Not Found</h1>
    </div>
  )
}
`;
}

export function generateViteEnvDts(): string {
  return `/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
`;
}

export function generateFrontendEnv(): string {
  return `VITE_API_URL=http://localhost:5000/api
`;
}

export function generateTailwindConfig(config: ProjectConfig): string {
  const contentPaths = [`"./index.html"`, `"./src/**/*.{js,ts,jsx,tsx}"`];
  if (config.uiLibrary === "shadcn") {
    contentPaths.push(`"./src/components/**/*.{js,ts,jsx,tsx}"`);
  }

  const shadcnExtend =
    config.uiLibrary === "shadcn"
      ? `
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },`
      : "";

  return `/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [${contentPaths.join(", ")}],
  theme: {
    extend: {${shadcnExtend}
    },
  },
  plugins: [${config.uiLibrary === "shadcn" ? `require("tailwindcss-animate")` : ""}],
}
`;
}

export function generatePostcssConfig(): string {
  return `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;
}

export function generateIndexCss(config: ProjectConfig): string {
  if (config.uiLibrary === "shadcn") {
    return `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
`;
  }
  return `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  color-scheme: light dark;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  min-width: 320px;
  min-height: 100vh;
}
`;
}
