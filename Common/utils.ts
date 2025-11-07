import * as Cards from "./models/cards";
import { Permission, User } from "./models/user";
import { ApiError, DeepPartial, SingleOrArray } from "./types";

export type SemanticVersion = `${number}.${number}.${number}`;

export function maxEnum(o: object) {
    return Math.max(...Object.keys(o).filter(obj => !isNaN(parseInt(obj))).map(obj => parseInt(obj))) + 1;
}

export const Regex = {
    Card: {
        id: {
            full: /^\d+@\d+\.\d+\.\d+$/,
            optional: /^\d+(?:@\d+\.\d+\.\d+)?$/
        },
        code: /^\d{5}$/
    },
    Review: {
        id: {
            full: /^\w+@\d+@\d+\.\d+\.\d+$/
        }
    },
    SemanticVersion: /^\d+\.\d+\.\d+$/
};

export function titleCase(value: string) {
    return value.split(" ")
        .map(w => w[0].toUpperCase() + w.substring(1).toLowerCase())
        .join(" ");
}

export function cleanObject<T>(object: T) {
    for (const key in object) {
        if (object[key] === undefined) {
            delete object[key];
        }
    }

    return object;
}

export function groupBy<T, V>(objects: T[], groupFunc: (object: T) => V) {
    return objects.reduce((groups, object) => {
        const value = groupFunc(object);
        const group = groups.get(value) || [];
        group.push(object);
        groups.set(value, group);
        return groups;
    }, new Map<V, T[]>());
}

export function distinct<T>(values: T[]) {
    return values.filter((value, index, array) => array.indexOf(value) === index);
}

export function pushSorted<T>(arr: T[], item: T, compareFn: (a: T, b: T) => number) {
    let low = 0, high = arr.length;
    while (low < high) {
        const mid = Math.floor((low + high) / 2);
        if (compareFn(item, arr[mid]) < 0) {
            high = mid;
        } else {
            low = mid + 1;
        }
    }
    arr.splice(low, 0, item);
}

/**
 * Ensures a possible single or array of objects are treated as an array of that object
 */
export function asArray<T>(value: SingleOrArray<T>): T[]
export function asArray<T>(value?: SingleOrArray<T>): T[] | undefined {
    if (value === undefined) {
        return undefined;
    }
    return Array.isArray(value) ? value : [value as T];
}

/**
 * Ensures a possible single or array of objects are treated as a single object. If an array is passed in, the first element is returned
 */
export function asSingle<T>(value: SingleOrArray<T>) {
    if (value === undefined) {
        return undefined;
    }
    return Array.isArray(value) ? value[0] as T : value as T;
}

export const factionNames = {
    "baratheon": "House Baratheon",
    "greyjoy": "House Greyjoy",
    "lannister": "House Lannister",
    "martell": "House Martell",
    "thenightswatch": "The Night's Watch",
    "stark": "House Stark",
    "targaryen": "House Targaryen",
    "tyrell": "House Tyrell",
    "neutral": "Neutral"
};

export const typeNames = {
    "character": "Character",
    "location": "Location",
    "attachment": "Attachment",
    "event": "Event",
    "plot": "Plot",
    "agenda": "Agenda"
};

export function parseCardCode(isReleasable: boolean, project: number, number: number) {
    if (isReleasable) {
        return `${project}${number.toString().padStart(3, "0")}` as Cards.Code;
    } else {
        return `${project}${number + 500}` as Cards.Code;
    }
}
/**
     * Creates the full url for the specified request, converting query parameters into JSON
     */
export function buildUrl(baseUrl: string, queryParameters?: { [key: string]: unknown }) {
    let url = baseUrl;
    if (queryParameters && Object.keys(queryParameters).length > 0) {
        const queryString = Object.entries(queryParameters)
            .filter(([, value]) => value != undefined)
            .map(([key, value]) => `${key}=${encodeURIComponent(typeof value === "string" ? value : JSON.stringify(value))}`)
            .join("&");
        if (queryString) {
            url += "?" + queryString;
        }
    }
    return url;
}

export type ValidationStep = Permission | ((user: User) => boolean);
export function validate(user?: User, ...steps: ValidationStep[]) {
    const { checks, permissions } = steps.reduce<{ checks: ((user: User) => boolean)[], permissions: Permission[] }>(
        (results, step) => {
            if (typeof step === "function") {
                results.checks.push(step);
            } else {
                results.permissions.push(step);
            }
            return results;
        }, { checks: [], permissions: [] }
    );
    return hasPermission(user, ...permissions) && checks.every((check) => !!user && check(user));
};

export function hasPermission(user?: User, ...permissions: Permission[]) {
    if (permissions.length === 0) {
        return true;
    }

    if (!user) {
        return false;
    }

    const includesPermission = (ps: Permission[]) => {
        return permissions.some((a) => ps.some((b) => a === b));
    };

    if (includesPermission(user.permissions)) {
        return true;
    }

    if (user.roles.some((role) => includesPermission(role.permissions))) {
        return true;
    }

    return false;
}

export function isApiError(err: unknown): err is ApiError {
    if (err instanceof Error && "code" in err && "message" in err && "error" in err) {
        return true;
    }
    return false;
}
export function renderPlaytestingCard(card: Cards.PlaytestableCard): Cards.RenderableCard
export function renderPlaytestingCard(card: DeepPartial<Cards.PlaytestableCard>): DeepPartial<Cards.RenderableCard>
export function renderPlaytestingCard(card: DeepPartial<Cards.PlaytestableCard>) {
    return {
        ...card,
        key: `${card.code}@${card.version}`,
        watermark: {
            top: card.code ?? "Unkown Code",
            middle: (card.version ? `v${card.version}` : "0.0.0"),
            bottom: "Work In Progress"
        }
    } as DeepPartial<Cards.RenderableCard>;
}

export function renderCardSuggestion(card: Cards.CardSuggestion): Cards.RenderableCard
export function renderCardSuggestion(card: DeepPartial<Cards.CardSuggestion>): DeepPartial<Cards.RenderableCard>
export function renderCardSuggestion(card: DeepPartial<Cards.CardSuggestion>) {
    return {
        ...card,
        key: card.id,
        watermark: {
            top: undefined,
            middle: "Custom",
            bottom: "Card Suggestion"
        }
    } as DeepPartial<Cards.RenderableCard>;
}

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