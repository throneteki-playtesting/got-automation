import { PlaytestableCard, RenderableCard } from "common/models/cards";
import { DeepPartial, SingleOrArray } from "common/types";

export const px = (value: number) => `${value}px`;
export const em = (value: number) => `${value}em`;


export const abilityIcons: { [key: string]: string } = {
    military: "\ue605",
    intrigue: "\ue602",
    power: "\ue607",
    baratheon: "\ue600",
    greyjoy: "\ue601",
    lannister: "\ue603",
    martell: "\ue604",
    thenightswatch: "\ue606",
    stark: "\ue608",
    targaryen: "\ue609",
    tyrell: "\ue60a"
};

export const thronesIcons: { [key: string]: string } = {
    ...abilityIcons,
    neutral: "\ue612",
    unique: "\ue60b",
    character: "\ue60f",
    location: "\ue60e",
    attachment: "\ue60d",
    event: "\ue610",
    plot: "\ue60c",
    agenda: "\ue611"
};

type RenderConversionInput = DeepPartial<PlaytestableCard & RenderableCard>;
type RenderConversionOutput = DeepPartial<RenderableCard>;
export function toRenderableCard(cards?: RenderConversionInput[]): RenderConversionOutput[];
export function toRenderableCard(cards?: RenderConversionInput): RenderConversionOutput;
export function toRenderableCard(cards?: SingleOrArray<RenderConversionInput>) {
    if (cards === undefined) {
        return undefined;
    }
    const convert = (card: RenderConversionInput) => {
        const watermark = {
            top: card.watermark?.top ?? card.code ?? "Unkown Code",
            middle: card.watermark?.middle ?? (card.version ? `v${card.version}` : "No Version"),
            bottom: card.watermark?.bottom ?? "Work In Progress"
        };
        return {
            ...card,
            watermark
        } as RenderConversionOutput;
    };
    if (Array.isArray(cards)) {
        return cards?.map(convert) ?? [];
    } else {
        return convert(cards);
    }
}

export function enumToArray<T extends { [key: string]: string | number }>(
    e: T
): { key: T[keyof T]; value: Extract<keyof T, string> }[] {
    return Object.keys(e)
        .filter(k => isNaN(Number(k)))
        .map(k => ({
            key: e[k as keyof T],
            value: k as Extract<keyof T, string>
        }));
}