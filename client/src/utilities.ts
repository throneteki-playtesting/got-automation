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