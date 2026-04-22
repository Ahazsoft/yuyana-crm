import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  datasource: {
    // url: env("DATABASE_URL"),

    url: env("DIRECT_URL"),
  },
  migrations: {
    seed: "npx tsx prisma/seeds/complete-seed.ts",
  },
});
