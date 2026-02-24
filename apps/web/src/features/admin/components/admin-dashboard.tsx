"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Shield, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/features/auth/lib/hooks";
import { useMyAdminStatus } from "@/features/users/lib/hooks";
import type { HeroCuration } from "@/features/anime/lib/requests";

import {
  useAdminHeroCurations,
  useAdminStats,
  useAdminUsers,
  useSetUserAdminStatus,
  useUpdateHeroCuration,
} from "../lib/hooks";

type HeroDraft = Pick<
  HeroCuration,
  "videoId" | "start" | "stop" | "title" | "subtitle" | "description" | "tag" | "sortOrder" | "isActive"
>;

function AdminForbiddenState() {
  return (
    <div className="container mx-auto px-4 pb-20 pt-24 md:py-32">
      <Card className="mx-auto max-w-2xl border-white/10 bg-black/40">
        <CardHeader>
          <CardTitle className="font-display text-4xl font-black uppercase tracking-tight">
            403
          </CardTitle>
          <CardDescription className="text-xs font-bold uppercase tracking-[0.18em]">
            You do not have access to this area.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="outline">
            <Link href="/">Back to Discovery</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export function AdminDashboard() {
  const { userId } = useAuth();
  const { data: adminStatus, isLoading: isCheckingAdmin } = useMyAdminStatus();
  const isAdmin = Boolean(adminStatus?.isAdmin);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [drafts, setDrafts] = useState<Record<number, HeroDraft>>({});

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const statsQuery = useAdminStats({ enabled: isAdmin });
  const usersQuery = useAdminUsers(searchQuery, { enabled: isAdmin, limit: 20, offset: 0 });
  const heroCurationsQuery = useAdminHeroCurations({ enabled: isAdmin });

  const setAdminStatus = useSetUserAdminStatus();
  const updateHeroCuration = useUpdateHeroCuration();

  useEffect(() => {
    if (!heroCurationsQuery.data) {
      return;
    }

    const nextDrafts = heroCurationsQuery.data.reduce<Record<number, HeroDraft>>((acc, item) => {
      acc[item.id] = {
        videoId: item.videoId,
        start: item.start,
        stop: item.stop,
        title: item.title,
        subtitle: item.subtitle,
        description: item.description,
        tag: item.tag,
        sortOrder: item.sortOrder,
        isActive: item.isActive,
      };
      return acc;
    }, {});

    setDrafts(nextDrafts);
  }, [heroCurationsQuery.data]);

  const isLoading = useMemo(
    () => isCheckingAdmin || (isAdmin && (statsQuery.isLoading || heroCurationsQuery.isLoading || usersQuery.isLoading)),
    [heroCurationsQuery.isLoading, isAdmin, isCheckingAdmin, statsQuery.isLoading, usersQuery.isLoading],
  );

  if (isCheckingAdmin) {
    return (
      <div className="container mx-auto px-4 pb-20 pt-24 md:py-32">
        <Skeleton className="mx-auto h-[50vh] w-full max-w-6xl rounded-2xl" />
      </div>
    );
  }

  if (!isAdmin) {
    return <AdminForbiddenState />;
  }

  const totalUsers = statsQuery.data?.totalUsers ?? 0;
  const users = usersQuery.data?.users ?? [];
  const curations = heroCurationsQuery.data ?? [];

  return (
    <div className="container mx-auto px-4 pb-20 pt-24 md:py-32">
      <div className="mb-10 space-y-3 md:mb-16">
        <h1 className="font-display text-5xl font-extrabold uppercase leading-[0.82] tracking-tight text-foreground sm:text-7xl md:text-[10vw]">
          ADMIN
        </h1>
        <p className="max-w-3xl text-[10px] font-bold uppercase tracking-[0.24em] text-muted-foreground md:tracking-[0.3em]">
          Manage platform access and home hero curation from one place.
        </p>
      </div>

      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <Card className="border-white/10 bg-black/40 md:col-span-1">
          <CardHeader className="space-y-2">
            <CardDescription className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Total Users
            </CardDescription>
            <CardTitle className="font-display text-5xl font-black tracking-tight">
              {isLoading ? "..." : totalUsers}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-5">
        <Card className="border-white/10 bg-black/40 lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-display text-3xl font-black uppercase tracking-tight">
              Hero Curations
            </CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-[0.2em]">
              Update copy, video windows, order, and visibility.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {curations.length === 0 ? (
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                No hero curations found.
              </p>
            ) : (
              curations.map((curation) => {
                const draft = drafts[curation.id];
                if (!draft) return null;

                return (
                  <div key={curation.id} className="space-y-3 rounded-xl border border-white/10 p-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input
                        value={draft.title}
                        onChange={(e) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [curation.id]: { ...prev[curation.id], title: e.target.value },
                          }))
                        }
                        placeholder="Title"
                      />
                      <Input
                        value={draft.subtitle}
                        onChange={(e) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [curation.id]: { ...prev[curation.id], subtitle: e.target.value },
                          }))
                        }
                        placeholder="Subtitle"
                      />
                    </div>
                    <Input
                      value={draft.videoId}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [curation.id]: { ...prev[curation.id], videoId: e.target.value },
                        }))
                      }
                      placeholder="YouTube Video ID"
                    />
                    <Textarea
                      value={draft.description}
                      onChange={(e) =>
                        setDrafts((prev) => ({
                          ...prev,
                          [curation.id]: { ...prev[curation.id], description: e.target.value },
                        }))
                      }
                      placeholder="Description"
                      className="min-h-[90px]"
                    />
                    <div className="grid gap-3 md:grid-cols-4">
                      <Input
                        type="number"
                        value={draft.start}
                        onChange={(e) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [curation.id]: { ...prev[curation.id], start: Number(e.target.value) || 0 },
                          }))
                        }
                        placeholder="Start"
                      />
                      <Input
                        type="number"
                        value={draft.stop}
                        onChange={(e) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [curation.id]: { ...prev[curation.id], stop: Number(e.target.value) || 0 },
                          }))
                        }
                        placeholder="Stop"
                      />
                      <Input
                        type="number"
                        value={draft.sortOrder}
                        onChange={(e) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [curation.id]: { ...prev[curation.id], sortOrder: Number(e.target.value) || 0 },
                          }))
                        }
                        placeholder="Sort Order"
                      />
                      <Input
                        value={draft.tag}
                        onChange={(e) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [curation.id]: { ...prev[curation.id], tag: e.target.value },
                          }))
                        }
                        placeholder="Tag"
                      />
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={draft.isActive}
                          onCheckedChange={(checked) =>
                            setDrafts((prev) => ({
                              ...prev,
                              [curation.id]: { ...prev[curation.id], isActive: checked },
                            }))
                          }
                        />
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Active on homepage
                        </span>
                      </div>
                      <Button
                        onClick={() => updateHeroCuration.mutate({ id: curation.id, data: draft })}
                        disabled={updateHeroCuration.isPending}
                      >
                        {updateHeroCuration.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving
                          </>
                        ) : (
                          "Save"
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-black/40 lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-3xl font-black uppercase tracking-tight">
              Users
            </CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-[0.2em]">
              Search by name, username, or email.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Search users..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-11"
            />

            <div className="space-y-3">
              {users.map((entry) => {
                const isSelf = Boolean(userId && entry.id === userId);
                const willBeAdmin = !entry.isAdmin;
                const actionText = entry.isAdmin ? "Remove Admin" : "Make Admin";

                return (
                  <div
                    key={entry.id}
                    className="space-y-3 rounded-xl border border-white/10 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-1">
                        <p className="truncate text-sm font-bold text-foreground">{entry.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          @{entry.username ?? "no-username"} • {entry.email}
                        </p>
                      </div>
                      {entry.isAdmin ? (
                        <Badge className="gap-1.5 bg-emerald-500/20 text-emerald-300 border-emerald-400/40">
                          <ShieldCheck className="h-3 w-3" />
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1.5 border-white/20 text-muted-foreground">
                          <Shield className="h-3 w-3" />
                          User
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={entry.isAdmin ? "outline" : "default"}
                        className="w-full"
                        disabled={setAdminStatus.isPending || (isSelf && !willBeAdmin)}
                        onClick={() =>
                          setAdminStatus.mutate({
                            userId: entry.id,
                            isAdmin: willBeAdmin,
                          })
                        }
                      >
                        {actionText}
                      </Button>
                      <Button variant="outline" className="w-full" disabled title="Phase 2">
                        Reset Password
                      </Button>
                    </div>
                  </div>
                );
              })}

              {!usersQuery.isLoading && users.length === 0 && (
                <p className="py-8 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  No users found.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
