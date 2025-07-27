import * as Cards from "./models/cards";

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

export function groupBy<V, O>(objects: O[], groupFunc: (object: O) => V) {
    return objects.reduce((groups, object) => {
        const value = groupFunc(object);
        const group = groups.get(value) || [];
        group.push(object);
        groups.set(value, group);
        return groups;
    }, new Map<V, O[]>());
}

export function distinct<T>(values: T[]) {
    return values.filter((value, index, array) => array.indexOf(value) === index);
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

export function parseCardCode(isReleasable: boolean, project: number, number: number) {
    if (isReleasable) {
        return `${project}${number.toString().padStart(3, "0")}` as Cards.Code;
    } else {
        return `${project}${number + 500}` as Cards.Code;
    }
}