import { treaty } from "@elysiajs/eden";
import { webEnv } from "@anilog/env/web";
import type { App } from "server";

const appOrigin = webEnv.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "");
const backendOrigin = webEnv.NEXT_PUBLIC_SERVER_URL.replace(/\/+$/, "");

const serverUrl = typeof window === "undefined" ? `${backendOrigin}` : `${appOrigin}/proxy`;

export const { api } = treaty<App>(serverUrl, {
  fetch: {
    credentials: "include",
  },
});
