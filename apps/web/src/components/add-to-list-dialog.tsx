"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

interface UserList {
  id: string;
  name: string;
  type: string;
  description?: string;
}

interface AddToListDialogProps {
  animeId: string;
  animeTitle: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddToListDialog({ animeId, animeTitle, isOpen, onOpenChange }: AddToListDialogProps) {
  const [lists, setLists] = useState<UserList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>("");
  const [currentEpisode, setCurrentEpisode] = useState<number>(0);
  const [rating, setRating] = useState<number | undefined>();
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchUserLists();
    }
  }, [isOpen]);

  const fetchUserLists = async () => {
    try {
      const { data: session } = await authClient.getSession();
      if (!session?.user?.id) {
        toast.error("Please sign in to add anime to lists");
        onOpenChange(false);
        return;
      }

      const response = await fetch("http://localhost:3000/api/lists", {
        credentials: "include"
      });
      const data = await response.json();

      if (data.success) {
        setLists(data.data.map((list: any) => ({
          id: list.id,
          name: list.name,
          type: list.type,
          description: list.description
        })));
      } else {
        throw new Error(data.error || "Failed to fetch lists");
      }
    } catch (error) {
      console.error("Error fetching lists:", error);
      toast.error("Failed to load your lists");
    }
  };

  const handleAddToList = async () => {
    if (!selectedListId) {
      toast.error("Please select a list");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/lists/${selectedListId}/anime`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          animeId,
          currentEpisode: currentEpisode > 0 ? currentEpisode : undefined,
          rating: rating && rating > 0 ? rating : undefined,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Added "${animeTitle}" to your list!`);
        onOpenChange(false);
        // Reset form
        setSelectedListId("");
        setCurrentEpisode(0);
        setRating(undefined);
        setNotes("");
      } else {
        throw new Error(data.error || "Failed to add anime to list");
      }
    } catch (error) {
      console.error("Error adding to list:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add anime to list");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add to List</DialogTitle>
          <DialogDescription>
            Add "{animeTitle}" to one of your lists
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="list">Select List</Label>
            <Select value={selectedListId} onValueChange={setSelectedListId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a list..." />
              </SelectTrigger>
              <SelectContent>
                {lists.map((list) => (
                  <SelectItem key={list.id} value={list.id}>
                    {list.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="episode">Current Episode (optional)</Label>
            <Input
              id="episode"
              type="number"
              min="0"
              value={currentEpisode}
              onChange={(e) => setCurrentEpisode(Number(e.target.value) || 0)}
              placeholder="0"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="rating">Rating (optional)</Label>
            <Select value={rating?.toString()} onValueChange={(value) => setRating(value ? Number(value) : undefined)}>
              <SelectTrigger>
                <SelectValue placeholder="Rate this anime..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 - Poor</SelectItem>
                <SelectItem value="2">2 - Fair</SelectItem>
                <SelectItem value="3">3 - Good</SelectItem>
                <SelectItem value="4">4 - Very Good</SelectItem>
                <SelectItem value="5">5 - Excellent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this anime..."
              className="resize-none"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddToList} disabled={loading || !selectedListId}>
            {loading ? "Adding..." : "Add to List"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
