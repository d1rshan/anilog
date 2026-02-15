import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";

export async function getSession(headers: Headers) {
  return authClient.getSession({
    fetchOptions: {
      headers,
      throw: true,
    },
  });
}

export async function getCurrentUser(headers: Headers) {
  const session = await getSession(headers);
  return session?.user ?? null;
}

export async function requireCurrentUser(headers: Headers) {
  const user = await getCurrentUser(headers);

  if (!user) {
    redirect("/login");
  }

  return user;
}
