import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { LoginPageClient } from "../components/login-page-client";
import { getCurrentUser } from "../lib/server";

export const LoginPage = async () => {
  const user = await getCurrentUser(await headers());

  if (user) {
    redirect("/");
  }

  return <LoginPageClient />;
};
