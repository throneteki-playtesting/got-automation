import { JsonPlaytestingCard } from "common/models/cards";
import { DeepPartial, SingleOrArray } from "common/types";

type DotPath<T, Prefix extends string = ""> = DeepPartial<
  Record<
    {
      [K in keyof T]: T[K] extends object
        ? T[K] extends Array<unknown>
          ? `${Prefix}${Extract<K, string>}`
          : `${Prefix}${Extract<K, string>}` | DotPathKeys<T[K], `${Prefix}${Extract<K, string>}.`>
        : `${Prefix}${Extract<K, string>}`
    }[keyof T],
    string | number | boolean
  >
>;

type DotPathKeys<T, Prefix extends string = ""> = {
  [K in keyof T]: T[K] extends object
    ? T[K] extends Array<unknown>
      ? `${Prefix}${Extract<K, string>}`
      : `${Prefix}${Extract<K, string>}` | DotPathKeys<T[K], `${Prefix}${Extract<K, string>}.`>
    : `${Prefix}${Extract<K, string>}`
}[keyof T];

function expandDotPaths<T extends object>(flat: DotPath<T>): T {
    const result: Record<string, unknown> = {};

    for (const [path, value] of Object.entries(flat)) {
        if (value === undefined) continue;

        const keys = path.split(".");
        let current: Record<string, unknown> = result;

        keys.forEach((key, index) => {
            const isLast = index === keys.length - 1;

            if (isLast) {
                current[key] = value;
            } else {
                if (typeof current[key] !== "object" || current[key] === null) {
                    current[key] = {};
                }
                current = current[key] as Record<string, unknown>;
            }
        });
    }

    return result as T;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseCardFilter = (req: { query: { filter: any } }, res: unknown, next: (arg?: unknown) => void) => {
    const { filter } = req.query;
    if (!filter) {
        return next();
    }
    try {
        const decoded = decodeURIComponent(filter);
        let parsed = JSON.parse(decoded) as SingleOrArray<object>;
        parsed = Array.isArray(parsed) ? parsed.map((p: object) => expandDotPaths(p) as DeepPartial<JsonPlaytestingCard>) : parsed as DeepPartial<JsonPlaytestingCard>;
        req.query.filter = parsed;
    } catch (err) {
        next(err);
    }
    next();
};