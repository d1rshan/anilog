import * as schema from "./schema";

import { neon, neonConfig } from "@neondatabase/serverless";
import { serverEnv } from "@anilog/env/server";
import { drizzle } from "drizzle-orm/neon-http";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

// To work in edge environments (Cloudflare Workers, Vercel Edge, etc.), enable querying over fetch
// neonConfig.poolQueryViaFetch = true

const sql = neon(serverEnv.DATABASE_URL);
export const db = drizzle(sql, { schema });
