import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    globals: true,
    coverage: {
      provider: "v8",
      reporter: process.env["CI"] ? ["text", "json", "json-summary"] : ["text"],
      reportsDirectory: "./tests/reports/unit",
      include: ["src/**/*.ts", "src/**/*.tsx"],
      exclude: ["src/**/*.type.ts", "src/**/*.enum.ts", "src/app/**", "src/**/*.stories.*"],
    },
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          include: ["tests/unit/**/*.test.ts"],
          environment: "node",
        },
      },
    ],
    reporters: process.env["CI"] ? ["github-actions", "default"] : ["default"],
    env: loadEnv("", process.cwd(), ""),
  },
});
