import * as Cards from "./models/cards";
import { SingleOrArray } from "./types";

export type SemanticVersion = `${number}.${number}.${number}`;
// TODO: Replace "Partial" with "Filterable", with the advantage that it also partials inner child objects!
// type Filter<T> =
//   T extends (...args: unknown[]) => unknown
//     ? T
//     : T extends Array<infer U>
//       ? Array<Filter<U>>
//       : T extends object
//         ? { [P in keyof T]?: Filter<T[P]> }
//         : T;
// export type Filterable<T> = Filter<T> | Filter<T>[];

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
export function asArray<T>(value: SingleOrArray<T>) {
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
            .filter(([, value]) => !!value)
            .map(([key, value]) => `${key}=${encodeURIComponent(JSON.stringify(value))}`)
            .join("&");
        url += "?" + queryString;
    }
    return url;
}