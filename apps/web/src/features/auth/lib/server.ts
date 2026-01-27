import { authClient } from "@/lib/auth-client";

export async function getSession(headers: Headers) {
  return authClient.getSession({
    fetchOptions: {
      headers,
      throw: true,
    },
  });
}
