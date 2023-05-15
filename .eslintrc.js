module.exports = {
  extends: ["@yext/eslint-config"],
  ignorePatterns: ["**/dist", "**/coverage", "**/docs"],
  overrides: [
    {
      files: ["test-node-cjs/node.ts"],
      rules: {
        "@typescript-eslint/no-var-requires": "off",
      },
    },
  ],
};
