import { headers } from "next/headers";
import type { Route } from "next";
import { redirect } from "next/navigation";

import { LoginPageClient } from "../components/login-page-client";
import { getCurrentUser } from "../lib/server";

interface LoginPageProps {
  redirectTo?: string;
}

function sanitizeRedirectPath(path: string | undefined): Route {
  if (!path) {
    return "/" as Route;
  }

  if (!path.startsWith("/") || path.startsWith("//")) {
    return "/" as Route;
  }

  return path as Route;
}

export const LoginPage = async ({ redirectTo }: LoginPageProps) => {
  const safeRedirectPath = sanitizeRedirectPath(redirectTo);
  const user = await getCurrentUser(await headers());

  if (user) {
    redirect(safeRedirectPath);
  }

  return <LoginPageClient redirectTo={safeRedirectPath} />;
};
