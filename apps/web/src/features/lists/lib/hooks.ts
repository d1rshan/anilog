import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  getUserLists,
  createList,
  updateList,
  deleteList,
  removeAnimeFromList,
  addAnimeToList,
  addToFavorites,
  type ListWithEntries,
} from "./requests";

export const useUserLists = () => {
  return useQuery<ListWithEntries[]>({
    queryKey: ["user-lists"],
    queryFn: getUserLists,
  });
};

export const useCreateList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-lists"] });
      toast.success("List created successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-lists"] });
      toast.success("List updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-lists"] });
      toast.success("List deleted successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useRemoveAnimeFromList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeAnimeFromList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-lists"] });
      toast.success("Anime removed from list");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useAddAnimeToList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addAnimeToList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-lists"] });
      toast.success("Anime added to list successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useAddToFavorites = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addToFavorites,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-lists"] });
      toast.success("Added to Favorites!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
