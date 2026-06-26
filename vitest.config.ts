import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    testTimeout: 15000,
    include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
    exclude: ["tests/e2e/**", "node_modules/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
