import { treaty } from "@elysiajs/eden";
import type { App } from "server";

const appOrigin = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "");
if (!appOrigin) {
  throw new Error("Missing required env: NEXT_PUBLIC_APP_URL");
}

const backendOrigin = process.env.NEXT_PUBLIC_SERVER_URL?.replace(/\/+$/, "");
if (!backendOrigin) {
  throw new Error("Missing required env: NEXT_PUBLIC_SERVER_URL");
}

const serverUrl = typeof window === "undefined" ? `${backendOrigin}` : `${appOrigin}/proxy`;

export const { api } = treaty<App>(serverUrl, {
  fetch: {
    credentials: "include",
  },
});
