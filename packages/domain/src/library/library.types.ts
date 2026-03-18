import type { LibraryEntryDto, LibraryStatusSchema, LogAnimeBody } from "@anilog/contracts";
import type { LibraryEntryRecord } from "@anilog/db/repositories/library.repo";

export type LibraryEntry = LibraryEntryRecord;
export type LibraryEntryDtoShape = LibraryEntryDto;
export type LibraryAnimeInput = LogAnimeBody["anime"];
export type LibraryStatus = LibraryStatusSchema;
