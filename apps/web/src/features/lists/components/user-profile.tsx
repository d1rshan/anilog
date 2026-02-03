"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Star, Calendar } from "lucide-react";
import { useSession } from "@/features/auth/lib/hooks";
import { useRouter } from "next/navigation";
import {
  useUserLists,
  useCreateList,
  useUpdateList,
  useDeleteList,
  useRemoveAnimeFromList,
} from "../lib/hooks";
import { type CreateListData } from "../lib/requests";

export function UserProfile() {
  const router = useRouter();
  const { data: session, isPending: isAuthPending } = useSession();

  useEffect(() => {
    if (!isAuthPending && !session) {
      router.push("/login");
    }
  }, [isAuthPending, session, router]);

  const { data: lists, isLoading: isListsLoading } = useUserLists();
  const createList = useCreateList();
  const updateList = useUpdateList();
  const deleteList = useDeleteList();
  const removeAnimeFromList = useRemoveAnimeFromList();

  const [createListDialog, setCreateListDialog] = useState(false);
  const [editListDialog, setEditListDialog] = useState<{
    isOpen: boolean;
    listId: string;
    name: string;
  }>({
    isOpen: false,
    listId: "",
    name: "",
  });
  const [newList, setNewList] = useState<CreateListData>({ name: "" });

  const handleCreateList = () => {
    createList.mutate(newList, {
      onSuccess: () => {
        setCreateListDialog(false);
        setNewList({ name: "" });
      },
    });
  };

  const handleEditList = () => {
    updateList.mutate(
      { listId: editListDialog.listId, name: editListDialog.name },
      {
        onSuccess: () => {
          setEditListDialog({ isOpen: false, listId: "", name: "" });
        },
      },
    );
  };

  const handleDeleteList = (listId: string, listName: string) => {
    if (confirm(`Are you sure you want to delete "${listName}"?`)) {
      deleteList.mutate(listId);
    }
  };

  const handleRemoveFromList = (entryId: string) => {
    removeAnimeFromList.mutate(entryId);
  };

  if (isAuthPending) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="h-8 bg-muted rounded w-64 animate-pulse mb-2" />
          <div className="h-5 bg-muted rounded w-96 animate-pulse" />
        </div>
        <div className="grid gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 bg-muted rounded w-48 animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">My Lists</h1>
          <p className="text-lg text-muted-foreground">
            Manage your anime lists and track your progress
          </p>
        </div>
        <Button onClick={() => setCreateListDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create List
        </Button>
      </div>

      <div className="grid gap-6">
        {lists?.map((list) => (
          <Card key={list.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{list.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {list.entries.length} anime{list.entries.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditListDialog({ isOpen: true, listId: list.id, name: list.name })}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteList(list.id, list.name)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {list.entries.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No anime in this list yet. Start adding some from the home page!
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {list.entries.map((entry) => (
                    <Card key={entry.id} className="relative">
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0"
                        onClick={() => handleRemoveFromList(entry.id)}
                      >
                        ×
                      </Button>
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          <img
                            src={entry.anime.imageUrl}
                            alt={entry.anime.title}
                            className="w-16 h-20 object-cover rounded"
                            onError={(e) => {
                              const img = e.target as HTMLImageElement;
                              img.src = `https://via.placeholder.com/64x80?text=${encodeURIComponent(entry.anime.title)}`;
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium line-clamp-2 text-sm">{entry.anime.title}</h4>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <span>{entry.anime.year}</span>
                              <span>•</span>
                              <span>{entry.anime.episodes} ep</span>
                            </div>
                            <div className="mt-2 space-y-1">
                              {entry.currentEpisode > 0 && (
                                <div className="flex items-center gap-1 text-xs">
                                  <Calendar className="w-3 h-3" />
                                  Episode {entry.currentEpisode}
                                </div>
                              )}
                              {entry.rating && (
                                <div className="flex items-center gap-1 text-xs">
                                  <Star className="w-3 h-3 fill-current" />
                                  {entry.rating}/5
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={createListDialog} onOpenChange={setCreateListDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New List</DialogTitle>
            <DialogDescription>
              Create a new list to organize your anime collection
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">List Name</Label>
              <Input
                id="name"
                value={newList.name}
                onChange={(e) => setNewList({ name: e.target.value })}
                placeholder="My List"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateListDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateList} disabled={createList.isPending}>
              {createList.isPending ? "Creating..." : "Create List"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editListDialog.isOpen} onOpenChange={(open) => setEditListDialog(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit List</DialogTitle>
            <DialogDescription>
              Update your list name
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">List Name</Label>
              <Input
                id="edit-name"
                value={editListDialog.name}
                onChange={(e) => setEditListDialog(prev => ({ ...prev, name: e.target.value }))}
                placeholder="My List"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditListDialog({ isOpen: false, listId: "", name: "" })}>
              Cancel
            </Button>
            <Button onClick={handleEditList} disabled={updateList.isPending}>
              {updateList.isPending ? "Updating..." : "Update List"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
