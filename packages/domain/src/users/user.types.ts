import type { PublicLibraryEntryDto, UserProfileDto, UserWithProfileDto } from "@anilog/contracts";
import type { PublicLibraryEntryRecord, UserProfileRecord, UserWithCountsRecord } from "@anilog/db";

export type UserProfile = UserProfileRecord;
export type UserProfileDtoShape = UserProfileDto;
export type UserWithProfile = UserWithCountsRecord;
export type UserWithProfileDtoShape = UserWithProfileDto;
export type PublicLibraryEntry = PublicLibraryEntryRecord;
export type PublicLibraryEntryDtoShape = PublicLibraryEntryDto;
