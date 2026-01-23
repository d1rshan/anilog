"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2, Star, Calendar } from "lucide-react";
import { toast } from "sonner";

interface UserList {
  id: string;
  name: string;
  type: string;
  description?: string;
  entries: ListEntry[];
}

interface ListEntry {
  id: string;
  currentEpisode: number;
  rating?: number;
  notes?: string;
  anime: {
    id: string;
    title: string;
    imageUrl: string;
    episodes: number;
    status: string;
    year: number;
  };
}

interface CreateListData {
  name: string;
  type: string;
  description: string;
}

export function UserProfile() {
  const [lists, setLists] = useState<UserList[]>([]);
  const [loading, setLoading] = useState(true);
  const [createListDialog, setCreateListDialog] = useState(false);
  const [editListDialog, setEditListDialog] = useState<{
    isOpen: boolean;
    listId: string;
    name: string;
    description: string;
  }>({
    isOpen: false,
    listId: "",
    name: "",
    description: ""
  });
  const [newList, setNewList] = useState<CreateListData>({
    name: "",
    type: "custom",
    description: ""
  });

  useEffect(() => {
    fetchUserLists();
    initializeDefaultListsIfNeeded();
  }, []);

  const fetchUserLists = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/api/lists", {
        credentials: "include"
      });
      const data = await response.json();

      if (data.success) {
        setLists(data.data);
      } else {
        throw new Error(data.error || "Failed to fetch lists");
      }
    } catch (error) {
      console.error("Error fetching lists:", error);
      toast.error("Failed to load your lists");
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultListsIfNeeded = async () => {
    try {
      // Check if user has any lists
      const response = await fetch("http://localhost:3000/api/lists", {
        credentials: "include"
      });
      const data = await response.json();

      if (data.success && data.data.length === 0) {
        // No lists exist, create default ones
        const initResponse = await fetch("http://localhost:3000/api/lists/initialize", {
          method: "POST",
          credentials: "include"
        });
        const initData = await initResponse.json();

        if (initData.success) {
          toast.success("Default lists created successfully!");
          fetchUserLists(); // Refresh the list
        }
      }
    } catch (error) {
      console.error("Error initializing default lists:", error);
    }
  };

  const handleCreateList = async () => {
    if (!newList.name.trim()) {
      toast.error("Please enter a list name");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/lists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newList),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("List created successfully!");
        setCreateListDialog(false);
        setNewList({ name: "", type: "custom", description: "" });
        fetchUserLists();
      } else {
        throw new Error(data.error || "Failed to create list");
      }
    } catch (error) {
      console.error("Error creating list:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create list");
    }
  };

  const handleEditList = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/lists/${editListDialog.listId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: editListDialog.name,
          description: editListDialog.description,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("List updated successfully!");
        setEditListDialog({ isOpen: false, listId: "", name: "", description: "" });
        fetchUserLists();
      } else {
        throw new Error(data.error || "Failed to update list");
      }
    } catch (error) {
      console.error("Error updating list:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update list");
    }
  };

  const handleDeleteList = async (listId: string, listName: string) => {
    if (!confirm(`Are you sure you want to delete "${listName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/lists/${listId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        toast.success("List deleted successfully!");
        fetchUserLists();
      } else {
        throw new Error(data.error || "Failed to delete list");
      }
    } catch (error) {
      console.error("Error deleting list:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete list");
    }
  };

  const handleRemoveFromList = async (entryId: string, animeTitle: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/lists/entries/${entryId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Removed "${animeTitle}" from list`);
        fetchUserLists();
      } else {
        throw new Error(data.error || "Failed to remove anime from list");
      }
    } catch (error) {
      console.error("Error removing from list:", error);
      toast.error(error instanceof Error ? error.message : "Failed to remove anime from list");
    }
  };

  if (loading) {
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
        {lists.map((list) => (
          <Card key={list.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {list.name}
                  <Badge variant={list.type === "custom" ? "default" : "secondary"}>
                    {list.type}
                  </Badge>
                </CardTitle>
                {list.description && (
                  <p className="text-sm text-muted-foreground mt-1">{list.description}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  {list.entries.length} anime{list.entries.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditListDialog({
                    isOpen: true,
                    listId: list.id,
                    name: list.name,
                    description: list.description || ""
                  })}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteList(list.id, list.name)}
                  disabled={["favorites", "watching", "completed", "planned", "dropped"].includes(list.type)}
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
                        onClick={() => handleRemoveFromList(entry.id, entry.anime.title)}
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
                              {entry.notes && (
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {entry.notes}
                                </p>
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

      {/* Create List Dialog */}
      <Dialog open={createListDialog} onOpenChange={setCreateListDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New List</DialogTitle>
            <DialogDescription>
              Create a custom list to organize your anime collection
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">List Name</Label>
              <Input
                id="name"
                value={newList.name}
                onChange={(e) => setNewList({ ...newList, name: e.target.value })}
                placeholder="My Custom List"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">List Type</Label>
              <Select value={newList.type} onValueChange={(value) => setNewList({ ...newList, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom</SelectItem>
                  <SelectItem value="favorites">Favorites</SelectItem>
                  <SelectItem value="watching">Currently Watching</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="planned">Plan to Watch</SelectItem>
                  <SelectItem value="dropped">Dropped</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={newList.description}
                onChange={(e) => setNewList({ ...newList, description: e.target.value })}
                placeholder="Describe your list..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateListDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateList}>Create List</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit List Dialog */}
      <Dialog open={editListDialog.isOpen} onOpenChange={(open) => setEditListDialog(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit List</DialogTitle>
            <DialogDescription>
              Update your list details
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">List Name</Label>
              <Input
                id="edit-name"
                value={editListDialog.name}
                onChange={(e) => setEditListDialog(prev => ({ ...prev, name: e.target.value }))}
                placeholder="My Custom List"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editListDialog.description}
                onChange={(e) => setEditListDialog(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your list..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditListDialog({ isOpen: false, listId: "", name: "", description: "" })}>
              Cancel
            </Button>
            <Button onClick={handleEditList}>Update List</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
