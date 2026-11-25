import { createRequire } from "module";

const require = createRequire(import.meta.url);

/** @type {import("eslint").Linter.Config[]} */
const nextConfig = require("eslint-config-next");

const config = [
  { ignores: ["dist", "node_modules", "build", "src/_archive", ".next-analytics"] },

  ...nextConfig,

  {
    files: ["**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/consistent-type-definitions": "off",
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },

  {
    // * a number shown to readers goes through useDisplayFormat (src/utils/displayFormat.util.ts),
    // * so its rounding is defined once, in DISPLAY_PRECISION
    files: ["src/components/**/*.{ts,tsx}", "src/app/**/*.{ts,tsx}", "src/hooks/**/*.{ts,tsx}"],
    ignores: ["src/app/api/**"],
    rules: {
      "no-restricted-properties": [
        "error",
        ...["toFixed", "toPrecision", "toLocaleString"].map((property) => ({
          property,
          message:
            "Format numbers with useDisplayFormat (DISPLAY_PRECISION), CSV with formatCsvNumber.",
        })),
        {
          object: "Math",
          property: "round",
          message: "Round displayed numbers with roundForDisplay / useDisplayFormat.",
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector: "NewExpression[callee.object.name='Intl'][callee.property.name='NumberFormat']",
          message: "Format numbers with useDisplayFormat (DISPLAY_PRECISION).",
        },
      ],
    },
  },
];

export default config;
