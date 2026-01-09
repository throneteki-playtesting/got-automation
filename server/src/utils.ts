import { NoteType } from "common/models/cards";

export const NoteVersion: Record<NoteType, "major" | "minor" | "patch" | undefined> = {
    "replaced": "major",
    "reworked": "minor",
    "updated": "patch",
    "implemented": undefined
};