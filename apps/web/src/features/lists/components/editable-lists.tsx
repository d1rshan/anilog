"use client";

import { useState } from "react";
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
import { Plus, Edit, Trash2, ChevronUp } from "lucide-react";
import {
  useUserLists,
  useCreateList,
  useUpdateList,
  useDeleteList,
  useRemoveAnimeFromList,
} from "../lib/hooks";
import { type CreateListData } from "../lib/requests";
import { AnimeCard } from "@/features/anime/components/anime-card";
import { AnimeStackPreview } from "./anime-stack-preview";

export function EditableLists() {
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
  const [expandedLists, setExpandedLists] = useState<Record<string, boolean>>(
    {},
  );

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

  const toggleExpanded = (listId: string) => {
    setExpandedLists((prev) => ({
      ...prev,
      [listId]: !prev[listId],
    }));
  };

  if (isListsLoading) {
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="w-full aspect-[2/3] animate-pulse rounded-md bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-16 py-10">
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">
          My Lists
        </h2>
        <Button onClick={() => setCreateListDialog(true)} size="sm" className="h-8 font-black uppercase tracking-widest text-[10px]">
          <Plus className="mr-1.5 h-3 w-3" />
          Create New List
        </Button>
      </div>

      <div className="space-y-20">
        {lists?.map((list) => (
          <div key={list.id} className="space-y-8">
            <div className="flex items-end justify-between border-b border-white/10 pb-4">
              <div className="space-y-1">
                <h3 className="font-display text-5xl font-bold uppercase tracking-tight leading-[0.9]">
                  {list.name}
                </h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                  {list.entries.length} TITLES
                </p>
              </div>
              <div className="flex gap-2">
                {expandedLists[list.id] && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-[10px] font-bold uppercase tracking-widest"
                    onClick={() => toggleExpanded(list.id)}
                  >
                    Collapse
                    <ChevronUp className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setEditListDialog({ isOpen: true, listId: list.id, name: list.name })}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:text-destructive"
                  onClick={() => handleDeleteList(list.id, list.name)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {list.entries.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center rounded-md border border-dashed border-border text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  This list is empty
                </p>
              </div>
            ) : !expandedLists[list.id] ? (
              <button
                type="button"
                onClick={() => toggleExpanded(list.id)}
                className="w-full text-left"
                aria-label={`Expand ${list.name} list`}
              >
                <AnimeStackPreview entries={list.entries} />
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {list.entries.map((entry) => (
                  <div key={entry.id} className="w-full">
                    <AnimeCard
                      anime={entry.anime}
                      rating={entry.rating}
                      currentEpisode={entry.currentEpisode}
                      onRemove={() => handleRemoveFromList(entry.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create List Dialog */}
      <Dialog open={createListDialog} onOpenChange={setCreateListDialog}>
        <DialogContent className="border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tight">Create New List</DialogTitle>
            <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Organize your anime collection
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">List Name</Label>
              <Input
                id="name"
                value={newList.name}
                onChange={(e) => setNewList({ name: e.target.value })}
                placeholder="e.g. Summer 2024"
                className="h-12 border-none bg-muted font-bold focus-visible:ring-1 focus-visible:ring-foreground"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateList} disabled={createList.isPending} className="h-12 w-full font-black uppercase tracking-widest">
              {createList.isPending ? "Creating..." : "Create List"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit List Dialog */}
      <Dialog open={editListDialog.isOpen} onOpenChange={(open) => setEditListDialog(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent className="border-none shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-tight">Edit List</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">List Name</Label>
              <Input
                id="edit-name"
                value={editListDialog.name}
                onChange={(e) => setEditListDialog(prev => ({ ...prev, name: e.target.value }))}
                className="h-12 border-none bg-muted font-bold focus-visible:ring-1 focus-visible:ring-foreground"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditList} disabled={updateList.isPending} className="h-12 w-full font-black uppercase tracking-widest">
              {updateList.isPending ? "Updating..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
