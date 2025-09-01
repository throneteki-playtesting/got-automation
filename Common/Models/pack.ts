import { Card, PlaytestableCard } from "./cards";

export type ReleaseDate = `${number}-${number}-${number}`;

export interface JsonPack {
    // cgdbId?: string,
    code: string,
    name: string,
    releaseDate: ReleaseDate,
    workInProgress?: boolean,
    cards: Card[]
}

export interface JsonPlaytestingPack extends JsonPack {
    workInProgress: true,
    cards: PlaytestableCard[]
}