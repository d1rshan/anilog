import { defineConfig } from "drizzle-kit";
import dotenv from "dotenv";
import { serverEnv } from "@anilog/env/server";

dotenv.config({
  path: "../../apps/server/.env",
});

export default defineConfig({
  schema: "./src/schema",
  out: "./src/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: serverEnv.DATABASE_URL,
  },
});
