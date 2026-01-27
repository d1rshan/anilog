import { authClient } from "@/lib/auth-client";

export const useSession = () => authClient.useSession();
