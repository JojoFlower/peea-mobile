// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    rules: {
      // The UI copy is entirely in French; apostrophes are intentional and
      // escaping them as &apos; would only hurt readability.
      "react/no-unescaped-entities": "off",
    },
  },
]);
