export const types = ["cycle", "expansion"] as const;
export type Type = typeof types[number];
export type Code = `${number}`;

export interface JsonProject {
    number: number,
    name: string,
    code: string,
    active: boolean,
    type: Type,
    script: string,
    perFaction: number,
    neutral: number,
    version: number,
    milestone: number,
    formUrl: string,
    emoji?: string
}