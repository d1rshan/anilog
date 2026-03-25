import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const webEnv = createEnv({
  client: {
    NEXT_PUBLIC_APP_URL: z.url(),
    NEXT_PUBLIC_SERVER_URL: z.url(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL,
  },
  emptyStringAsUndefined: true,
  skipValidation: process.env.CI === "true", // TODO: update when adding different workflows - also for web
});
