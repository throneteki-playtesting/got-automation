import { SemanticVersion } from "../utils";
import * as Projects from "./projects";

export const factions = ["baratheon", "greyjoy", "lannister", "martell", "thenightswatch", "stark", "targaryen", "tyrell", "neutral"] as const;
export const types = ["character", "location", "attachment", "event", "plot", "agenda"] as const;
export const noteTypes = ["replaced", "reworked", "updated", "implemented"] as const;
export const githubStatuses = ["open", "closed", "complete"] as const;
export const challengeIcons = ["military", "intrigue", "power"] as const;
export const plotStats = ["income", "initiative", "claim", "reserve"] as const;
export type Faction = typeof factions[number];
export type Type = typeof types[number];
export type NoteType = typeof noteTypes[number];
export type GithubStatus = typeof githubStatuses[number];
export type ChallengeIcon = typeof challengeIcons[number];
export type PlotStat = typeof plotStats[number];

export type Code = `${Projects.Code}${number}`;
export type Cost = number | "X" | "-";
export type Strength = number | "X";
export type PlotValue = number | "X";
export type Quantity = 1 | 2 | 3;

/**
 * Base released card, fitting structure of JSON Card Data Repository
 */
export interface Card {
    code: Code,
    cost?: Cost,
    deckLimit: number,
    designer?: string,
    faction: Faction,
    flavor?: string,
    icons?: Icons,
    illustrator: string,
    loyal?: boolean,
    name: string,
    plotStats?: PlotStats,
    strength?: Strength,
    traits: string[],
    text: string,
    type: Type,
    unique?: boolean,
    // octgnId?: string,
    quantity: Quantity,
    // errata: ?, Probably not necessary
    imageUrl?: string
}

export interface Icons {
    military: boolean,
    intrigue: boolean,
    power: boolean
}

export interface PlotStats {
    income: PlotValue,
    initiative: PlotValue,
    claim: PlotValue,
    reserve: PlotValue
}

export interface PlaytestableCard extends Card {
    project: number,
    number: number,
    // latest: boolean,
    version: SemanticVersion,
    note?: NoteDetails,
    playtesting?: SemanticVersion,
    github?: GithubDetails,
    release?: ReleaseDetails
}

export interface RenderableCard extends Omit<Card, "code"> {
    code?: Code,
    key: string,
    watermark: Watermark
}

export interface Watermark {
    top?: string,
    middle?: string,
    bottom?: string
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

export interface CardSuggestion extends Omit<Card, "code"> {
    /** Unique Id of this saved suggestion (undefined for new) */
    id?: string,
    /** Discord Id of user who suggested */
    suggestedBy: string,
    /** Date suggestion was first created */
    created: string,
    /** Date suggested was last updated */
    updated: string,
    /** Discord forum thread Id, if it has been created */
    threadId?: string,
    /** Discord Id array of users who like this suggestion */
    likedBy: string[],
    /** Discord Id of user who approved this suggestion */
    approvedBy?: string,
    /** Additional tags related to this suggestion */
    tags: string[]
}