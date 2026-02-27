"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiClientError } from "@/lib/eden";
import { getApiErrorMessage } from "@/lib/eden";

import { adminQueries } from "@/features/admin/lib/queries";
import { adminMutations } from "@/features/admin/lib/mutations";
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
    ...adminQueries.users(query, limit, offset),
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
      toast.success("Admin status updated");
    },
    onError: (error: ApiClientError) => {
      toast.error(getApiErrorMessage(error, "Failed to update admin status"));
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
      toast.success("Hero curation updated");
    },
    onError: (error: ApiClientError) => {
      toast.error(getApiErrorMessage(error, "Failed to update hero curation"));
    },
  });
}
