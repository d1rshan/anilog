"use client";

import { useState } from "react";

import { Star } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUserLists, useAddAnimeToList } from "@/features/lists/lib/hooks";

interface AddToListDialogProps {
  animeId: number;
  animeTitle: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddToListDialog({ animeId, animeTitle, isOpen, onOpenChange }: AddToListDialogProps) {
  const { data: lists } = useUserLists();
  const addAnimeToList = useAddAnimeToList();
  const [selectedListId, setSelectedListId] = useState<string>("");
  const [currentEpisode, setCurrentEpisode] = useState<number>(0);
  const [rating, setRating] = useState<number | undefined>();

  const handleAddToList = () => {
    addAnimeToList.mutate(
      {
        listId: selectedListId,
        animeId,
        currentEpisode: currentEpisode > 0 ? currentEpisode : undefined,
        rating: rating && rating > 0 ? rating : undefined,
      },
    {
      onSuccess: () => {
        onOpenChange(false);
        setSelectedListId("");
        setCurrentEpisode(0);
        setRating(undefined);
      },
      onError: () => {
        onOpenChange(false);
        setSelectedListId("");
        setCurrentEpisode(0);
        setRating(undefined);
      },
    },
    );
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
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a list..." />
              </SelectTrigger>
              <SelectContent>
                {lists?.filter((list: { id: string; name: string }) => list.name !== "Favorites").map((list: { id: string; name: string }) => (
                  <SelectItem key={list.id} value={list.id}>
                    {list.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="episode">Current Episode</Label>
            <Input
              id="episode"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-full"
              value={currentEpisode}
              onChange={(e) => setCurrentEpisode(Number(e.target.value) || 0)}
              placeholder="0"
            />
          </div>

          <div className="grid gap-2">
            <Label>Rating</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(rating === star ? undefined : star)}
                  className="p-1 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                >
                  <Star
                    className={`size-6 transition-colors ${
                      rating !== undefined && star <= rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/50"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddToList} disabled={addAnimeToList.isPending || !selectedListId}>
            {addAnimeToList.isPending ? "Adding..." : "Add to List"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
