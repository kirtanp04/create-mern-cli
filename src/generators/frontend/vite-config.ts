import type { ProjectConfig } from "../../cli/types";

export function generateViteConfig(config: ProjectConfig): string {
  const plugins: string[] = ["react()"];
  const imports: string[] = [`import { defineConfig } from 'vite'`, `import react from '@vitejs/plugin-react'`];
  const resolveAlias: string[] = [];

  if (config.pathAlias) {
    imports.push(`import path from 'path'`);
    resolveAlias.push(`'@': path.resolve(__dirname, './src')`);
  }

  if (config.router === "tanstack-router") {
    imports.push(`import { TanStackRouterVite } from '@tanstack/router-plugin/vite'`);
    plugins.unshift("TanStackRouterVite()");
  }

  const resolveSection =
    resolveAlias.length > 0
      ? `
  resolve: {
    alias: {
      ${resolveAlias.join(",\n      ")},
    },
  },`
      : "";

  return `${imports.join("\n")}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [${plugins.join(", ")}],${resolveSection}
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
})
`;
}
