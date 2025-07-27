import { SemanticVersion } from "../utils";
import * as Projects from "./projects";

export const factions = ["baratheon", "greyjoy", "lannister", "martell", "thenightswatch", "stark", "targaryen", "tyrell", "neutral"] as const;
export const types = ["character", "location", "attachment", "event", "plot", "agenda"] as const;
export const noteTypes = ["replaced", "reworked", "updated", "implemented"] as const;
export const githubStatuses = ["open", "closed", "complete"] as const;
export type Faction = typeof factions[number];
export type Type = typeof types[number];
export type NoteType = typeof noteTypes[number];
export type GithubStatus = typeof githubStatuses[number];

export type Code = `${Projects.Code}${number}`;

export interface JsonCard {
    code: Code,
    cost?: number | "X" | "-",
    deckLimit: number,
    designer?: string,
    faction: Faction,
    flavor?: string,
    icons?: Icons,
    illustrator: string,
    loyal?: boolean,
    name: string,
    plotStats?: PlotStats,
    strength?: number | "X",
    traits: string[],
    text: string,
    type: Type,
    unique?: boolean,
    // octgnId?: string,
    quantity: 1 | 2 | 3,
    // errata: ?, Probably not necessary
    imageUrl?: string
}

export interface Icons {
    military: boolean,
    intrigue: boolean,
    power: boolean
}

export interface PlotStats {
    income: number | "X",
    initiative: number | "X",
    claim: number | "X",
    reserve: number | "X"
}

export interface JsonPlaytestingCard extends JsonCard {
    project: number,
    number: number,
    // latest: boolean,
    version: SemanticVersion,
    note?: NoteDetails,
    playtesting?: SemanticVersion,
    github?: GithubDetails,
    release?: ReleaseDetails
}

export interface JsonRenderableCard extends JsonCard {
    watermark: Watermark
}

export interface Watermark {
    top: string,
    middle: string,
    bottom: string
}

export interface NoteDetails {
    type: NoteType,
    text: string
}

export interface GithubDetails {
    status: GithubStatus,
    issueUrl: string
}

export interface ReleaseDetails {
        short: string,
        number: number
    }

export enum DefaultDeckLimit {
    character = 3,
    attachment = 3,
    location = 3,
    event = 3,
    plot = 2,
    agenda = 1
}