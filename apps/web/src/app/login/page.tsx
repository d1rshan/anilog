import { LoginPage } from "@/features/auth/pages/login-page";

interface LoginRoutePageProps {
  searchParams: Promise<{
    next?: string;
  }>;
}

export default async function LoginRoutePage({ searchParams }: LoginRoutePageProps) {
  const params = await searchParams;
  const nextPath = params.next;

  return <LoginPage redirectTo={nextPath} />;
}
