"use client";

import { AnimeGrid } from "@/components/anime-grid";

export default function Home() {
	return (
		<div className="container mx-auto px-4 py-8">
			<div className="mb-8">
				<h1 className="text-4xl font-bold mb-2">Anilog</h1>
				<p className="text-lg text-muted-foreground">
					Discover, track, and rate your favorite anime
				</p>
			</div>
			
			<div className="mb-6">
				<h2 className="text-2xl font-semibold mb-4">Popular Anime</h2>
				<AnimeGrid />
			</div>
		</div>
	);
}
