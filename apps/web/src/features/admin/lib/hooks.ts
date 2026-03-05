"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminQueries, adminMutations } from "@/features/admin/lib/options";
import { adminKeys, animeKeys } from "@/lib/query-keys";

export function useAdminStats(options?: { enabled?: boolean }) {
  return useQuery({
    ...adminQueries.stats(),
    enabled: options?.enabled ?? true,
  });
}

export function useAdminUsers(
  query: string,
  options?: { limit?: number; offset?: number; enabled?: boolean },
) {
  const limit = options?.limit ?? 20;
  const offset = options?.offset ?? 0;

  return useQuery({
    ...adminQueries.users({ query: { q: query, limit, offset } }),
    enabled: options?.enabled ?? true,
  });
}

export function useAdminHeroCurations(options?: { enabled?: boolean }) {
  return useQuery({
    ...adminQueries.heroCurations(),
    enabled: options?.enabled ?? true,
  });
}

export function useSetUserAdminStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    ...adminMutations.setAdminStatus(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
}

export function useUpdateHeroCuration() {
  const queryClient = useQueryClient();

  return useMutation({
    ...adminMutations.updateHeroCuration(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.heroCurations() });
      queryClient.invalidateQueries({ queryKey: animeKeys.heroCurations() });
    },
  });
}
