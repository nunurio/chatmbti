// Flat Config で Next.js + TS を有効化
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import { FlatCompat } from "@eslint/eslintrc";
import path from "node:path";

const compat = new FlatCompat({
  baseDirectory: path.resolve(),
});

export default [
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  // 互換レイヤで next/core-web-vitals を取り込む
  ...compat.config({ extends: ["next/core-web-vitals"] }),
  {
    ignores: ["src/lib/database.types.ts"], // Supabase auto-generated file
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
];