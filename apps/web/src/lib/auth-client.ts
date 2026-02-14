import { createAuthClient } from "better-auth/react";
import { usernameClient } from "better-auth/client/plugins";

const serverBaseURL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL.replace(/\/+$/, "")}` : "") ||
  "http://localhost:3001";

const baseURL = typeof window === "undefined" ? `${serverBaseURL}/auth` : "/auth";

export const authClient = createAuthClient({
  baseURL,
  plugins: [usernameClient()],
  fetchOptions: {
    credentials: "include",
  },
});
