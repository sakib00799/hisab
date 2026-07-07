import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    include: ["tests/unit/**/*.test.ts"],
    environment: "node",
    env: {
      // Unit tests never touch the DB, but importing modules that construct
      // PrismaClient requires the variable to exist.
      DATABASE_URL: "postgresql://unit:unit@localhost:5432/unit_tests",
    },
  },
});
