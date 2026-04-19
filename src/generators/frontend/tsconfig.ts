import type { ProjectConfig } from "../../cli/types";

export function generateFrontendTsConfig(config: ProjectConfig): object {
  const paths: Record<string, string[]> = {};
  if (config.pathAlias) {
    paths["@/*"] = ["./src/*"];
  }

  return {
    files: [],
    references: [
      { path: "./tsconfig.app.json" },
      { path: "./tsconfig.node.json" },
    ],
  };
}

export function generateTsConfigApp(config: ProjectConfig): object {
  const paths: Record<string, string[]> = {};
  if (config.pathAlias) {
    paths["@/*"] = ["./src/*"];
  }

  return {
    compilerOptions: {
      target: "ES2020",
      useDefineForClassFields: true,
      lib: ["ES2020", "DOM", "DOM.Iterable"],
      module: "ESNext",
      skipLibCheck: true,
      moduleResolution: "bundler",
      allowImportingTsExtensions: true,
      isolatedModules: true,
      moduleDetection: "force",
      noEmit: true,
      jsx: "react-jsx",
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noFallthroughCasesInSwitch: true,
      ...(config.pathAlias && {
        baseUrl: ".",
        paths,
      }),
    },
    include: ["src"],
  };
}

export function generateTsConfigNode(): object {
  return {
    compilerOptions: {
      target: "ES2022",
      lib: ["ES2023"],
      module: "ESNext",
      skipLibCheck: true,
      moduleResolution: "bundler",
      allowImportingTsExtensions: true,
      isolatedModules: true,
      moduleDetection: "force",
      noEmit: true,
      strict: true,
      noUnusedLocals: true,
      noUnusedParameters: true,
      noFallthroughCasesInSwitch: true,
    },
    include: ["vite.config.ts"],
  };
}
