module.exports = [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      ".expo/**",
      ".playwright-mcp/**",
    ],
  },
  {
    files: ["**/*.cjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
    },
    rules: {},
  },
  {
    files: ["**/*.{js,mjs}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {},
  },
];
