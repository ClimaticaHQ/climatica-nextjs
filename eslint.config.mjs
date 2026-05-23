import { createRequire } from "module";

const require = createRequire(import.meta.url);

/** @type {import("eslint").Linter.Config[]} */
const nextConfig = require("eslint-config-next");

const config = [
  { ignores: ["dist", "node_modules", "build", "src/_archive"] },

  ...nextConfig,

  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/consistent-type-definitions": "off",
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
];

export default config;
