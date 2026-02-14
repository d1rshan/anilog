import { createAuthClient } from "better-auth/react";
import { usernameClient } from "better-auth/client/plugins";

const appOrigin = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "");
if (!appOrigin) {
  throw new Error("Missing required env: NEXT_PUBLIC_APP_URL");
}

export const authClient = createAuthClient({
  baseURL: `${appOrigin}/proxy/auth`,
  plugins: [usernameClient()],
  fetchOptions: {
    credentials: "include",
  },
});
