import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export const useAuth = authClient.useSession;

export function useRequireAuth(redirectUrl: string = "/login") {
  const { data: session, isPending } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push(redirectUrl);
    }
  }, [isPending, session, router, redirectUrl]);

  return { session, isPending };
}

export function useRedirectIfAuthenticated(redirectUrl: string = "/") {
  const { data: session, isPending } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && session) {
      router.push(redirectUrl);
    }
  }, [isPending, session, router, redirectUrl]);

  return { isPending };
}
