import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const envServerSchema = {
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.url(),
  BETTER_AUTH_SECRET: z.string().min(1),
  BETTER_AUTH_URL: z.url(),
  CORS_ORIGIN: z.string().min(1),
  CRON_SECRET: z.string().min(1),
  PORT: z.coerce.number().int().positive().default(3000),
} as const;

export const serverEnv = createEnv({
  server: envServerSchema,
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
  skipValidation: process.env.CI === "true", // TODO: update when adding different workflows - also for web
});

export function getCorsOrigins() {
  return serverEnv.CORS_ORIGIN.split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}
