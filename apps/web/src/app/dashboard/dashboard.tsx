"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, List, Heart, BookOpen } from "lucide-react";
import Link from "next/link";

export default function Dashboard({
	session,
}: {
	session: typeof authClient.$Infer.Session;
}) {
	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-4xl font-bold mb-2">
					Welcome back, {session.user.name}!
				</h1>
				<p className="text-lg text-muted-foreground">
					Manage your anime lists and discover new favorites
				</p>
			</div>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<List className="w-5 h-5" />
							My Lists
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground mb-4">
							Create and manage your anime lists. Track your favorites, currently watching, and more.
						</p>
						<Link href="/profile">
							<Button className="w-full">
								View My Lists
							</Button>
						</Link>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<BookOpen className="w-5 h-5" />
							Discover Anime
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground mb-4">
							Browse popular anime and discover new series to add to your lists.
						</p>
						<Link href="/">
							<Button variant="outline" className="w-full">
								Browse Anime
							</Button>
						</Link>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<User className="w-5 h-5" />
							Profile Settings
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground mb-4">
							Update your profile information and preferences.
						</p>
						<Button variant="outline" className="w-full" disabled>
							Coming Soon
						</Button>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
