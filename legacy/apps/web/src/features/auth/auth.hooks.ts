import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export const useSession = () => authClient.useSession();

export function useAuth() {
  const sessionQuery = useSession();
  const session = sessionQuery.data ?? null;
  const user = session?.user ?? null;

  return {
    ...sessionQuery,
    session,
    user,
    userId: user?.id ?? null,
    username: user?.username ?? user?.name ?? null,
    isAuthenticated: Boolean(user),
  };
}

interface UseRequireAuthOptions {
  toastMessage?: string;
  onUnauthenticated?: () => void;
}

export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const { toastMessage = "Please sign in to continue", onUnauthenticated } = options;
  const auth = useAuth();

  return {
    ...auth,
    requireAuth: () => {
      if (auth.isAuthenticated) {
        return true;
      }

      if (toastMessage) {
        toast.error(toastMessage);
      }
      onUnauthenticated?.();
      return false;
    },
  };
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await authClient.signOut();
      if (result.error) {
        throw new Error(result.error.message || "Failed to sign out");
      }
    },
    onSuccess: () => {
      queryClient.clear();
      router.replace("/");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to sign out");
    },
  });
}
