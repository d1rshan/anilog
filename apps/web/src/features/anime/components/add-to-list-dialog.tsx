"use client";

import { useState } from "react";

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
  const [notes, setNotes] = useState<string>("");

  const handleAddToList = () => {
    addAnimeToList.mutate(
      {
        listId: selectedListId,
        animeId,
        currentEpisode: currentEpisode > 0 ? currentEpisode : undefined,
        rating: rating && rating > 0 ? rating : undefined,
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setSelectedListId("");
          setCurrentEpisode(0);
          setRating(undefined);
          setNotes("");
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
              <SelectTrigger>
                <SelectValue placeholder="Choose a list..." />
              </SelectTrigger>
              <SelectContent>
                {lists?.map((list) => (
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
          <Button onClick={handleAddToList} disabled={addAnimeToList.isPending || !selectedListId}>
            {addAnimeToList.isPending ? "Adding..." : "Add to List"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
