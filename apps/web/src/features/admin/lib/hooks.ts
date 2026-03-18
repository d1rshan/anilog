"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  adminQueries,
  adminMutations,
  type AdminUsersQueryInput,
} from "@/features/admin/lib/options";
import { getApiErrorMessage } from "@/lib/eden-fetch";
import { adminKeys, animeKeys } from "@/lib/query-keys";

export function useAdminStats(options?: { enabled?: boolean }) {
  return useQuery({
    ...adminQueries.stats(),
    enabled: options?.enabled ?? true,
  });
}

export function useAdminUsers(input: AdminUsersQueryInput = {}, options?: { enabled?: boolean }) {
  return useQuery({
    ...adminQueries.users(input),
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
      toast.success("Admin status updated");
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateHeroCuration() {
  const queryClient = useQueryClient();

  return useMutation({
    ...adminMutations.updateHeroCuration(),
    onSuccess: () => {
      toast.success("Hero curation updated");
      queryClient.invalidateQueries({ queryKey: adminKeys.heroCurations() });
      queryClient.invalidateQueries({ queryKey: animeKeys.heroCurations() });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}
