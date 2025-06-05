// @ts-check
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const angularPlugin = require("@angular-eslint/eslint-plugin");
const prettierPlugin = require("eslint-plugin-prettier");
const eslintPluginPrettierRecommended = require("eslint-plugin-prettier/recommended");

const typescriptParser = require("@typescript-eslint/parser");
const angularTemplateParser = require("@angular-eslint/template-parser");

module.exports = [
  {
    ignores: [".cache/**", "node_modules/**", "dist/**", "e2e/**"],
  },
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: ["./tsconfig.json", "./tsconfig.app.json", "./tsconfig.spec.json"],
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "@angular-eslint": angularPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...angularPlugin.configs.recommended.rules,
      ...prettierPlugin.configs?.rules,
      "@typescript-eslint/naming-convention": [
        "warn",
        {
          selector: "method",
          format: ["camelCase"],
        },
      ],
      "@typescript-eslint/explicit-member-accessibility": [
        "error",
        {
          accessibility: "explicit",
          overrides: {
            constructors: "no-public",
          },
        },
      ],
      "@typescript-eslint/explicit-function-return-type": [
        "error",
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: false,
          allowHigherOrderFunctions: false,
        },
      ],
      "@angular-eslint/directive-selector": [
        "warn",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "warn",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
    },
  },
  {
    files: ["**/*.html"],
    languageOptions: {
      parser: angularTemplateParser,
    },
    plugins: {
      "@angular-eslint": angularPlugin,
      "@angular-eslint/template": angularPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      "prettier/prettier": ["error", { parser: "angular" }],
    },
  },
  eslintPluginPrettierRecommended,
];
