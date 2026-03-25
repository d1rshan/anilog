import { createAuthClient } from "better-auth/react";
import { usernameClient } from "better-auth/client/plugins";
import { webEnv } from "@anilog/env/web";

const appOrigin = webEnv.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "");

export const authClient = createAuthClient({
  baseURL: `${appOrigin}/proxy/auth`,
  plugins: [usernameClient()],
  fetchOptions: {
    credentials: "include",
  },
});
