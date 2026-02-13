"use client";

import { useState } from "react";
import { Star, ChevronRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserLists, useAddAnimeToList } from "@/features/lists/lib/hooks";
import { cn } from "@/lib/utils";

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

  const handleAddToList = (listId?: string) => {
    const finalId = listId || selectedListId;
    if (!finalId) return;

    addAnimeToList.mutate(
      {
        listId: finalId,
        animeId,
        currentEpisode: currentEpisode > 0 ? currentEpisode : undefined,
        rating: rating && rating > 0 ? rating : undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          resetForm();
        },
      }
    );
  };

  const resetForm = () => {
    setSelectedListId("");
    setCurrentEpisode(0);
    setRating(undefined);
  };

  const commonLists = ["Watching", "Plan to Watch", "Completed"];
  const filteredLists = lists?.filter(l => l.name !== "Favorites") || [];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-black uppercase tracking-tight">
            Log Anime
          </DialogTitle>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            {animeTitle}
          </p>
        </DialogHeader>

        <div className="flex flex-col gap-6 p-6">
          {/* QUICK LIST SELECT */}
          <div className="grid grid-cols-1 gap-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Select List
            </Label>
            <div className="flex flex-wrap gap-2">
              {filteredLists.map((list) => {
                const isSelected = selectedListId === list.id;
                return (
                  <button
                    key={list.id}
                    onClick={() => setSelectedListId(list.id)}
                    className={cn(
                      "flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold transition-all",
                      isSelected
                        ? "bg-foreground text-background border-foreground"
                        : "bg-background hover:border-foreground"
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3" />}
                    {list.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* EPISODE INPUT */}
            <div className="grid gap-2">
              <Label htmlFor="episode" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Current Episode
              </Label>
              <div className="relative">
                <Input
                  id="episode"
                  type="number"
                  min="0"
                  className="h-12 border-none bg-muted text-lg font-bold focus-visible:ring-1 focus-visible:ring-foreground"
                  value={currentEpisode}
                  onChange={(e) => setCurrentEpisode(Number(e.target.value) || 0)}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground uppercase">
                  EP
                </span>
              </div>
            </div>

            {/* RATING INPUT */}
            <div className="grid gap-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Your Rating
              </Label>
              <div className="flex h-12 items-center justify-center gap-1 rounded-md bg-muted px-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(rating === star ? undefined : star)}
                    className="group transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star
                      className={cn(
                        "size-5 transition-colors",
                        rating !== undefined && star <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground/30 hover:text-muted-foreground"
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button
            size="lg"
            className="h-14 w-full text-sm font-black uppercase tracking-widest transition-all hover:scale-[1.02]"
            onClick={() => handleAddToList()}
            disabled={addAnimeToList.isPending || !selectedListId}
          >
            {addAnimeToList.isPending ? "Logging..." : "Confirm Log"}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
