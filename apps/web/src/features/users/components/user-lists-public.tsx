"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useUserLists } from "../lib/hooks";
import { Star, Calendar, FolderOpen } from "lucide-react";

interface UserListsPublicProps {
  userId: string;
}

export function UserListsPublic({ userId }: UserListsPublicProps) {
  const { data: lists, isLoading } = useUserLists(userId);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-muted rounded w-48 animate-pulse" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (!lists || lists.length === 0) {
    return (
      <Card className="p-8 text-center">
        <FolderOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          No lists yet! They&apos;re probably still scrolling through 47 tabs of &apos;What anime should I watch?&apos; 🤔
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold flex items-center gap-2">
        <FolderOpen className="w-5 h-5" />
        Lists
      </h2>

      <Accordion type="multiple" className="space-y-2">
        {lists.map((list) => (
          <AccordionItem key={list.id} value={list.id} className="border rounded-lg">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3 text-left">
                <span className="font-semibold">{list.name}</span>
                <span className="text-sm text-muted-foreground">
                  ({list.entries.length} anime)
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              {list.entries.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  This list is waiting for its first anime! It&apos;s giving &apos;I swear I&apos;ll start watching this soon&apos; energy 📺✨
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {list.entries.map((entry) => (
                    <Card key={entry.id} className="overflow-hidden">
                      <CardContent className="p-3">
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
                            <h4 className="font-medium line-clamp-2 text-sm">
                              {entry.anime.title}
                            </h4>
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
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
