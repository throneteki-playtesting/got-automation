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
export const parseAPIRequest = (req: { query: any }, res: unknown, next: (arg?: unknown) => void) => {
    try {
        const objects = ["filter", "orderBy"];
        const numbers = ["page", "perPage"];
        for (const property in req.query) {
            if (objects.includes(property)) {
                const value = req.query[property];
                if (value) {
                    const decoded = decodeURIComponent(value);
                    let parsed = JSON.parse(decoded) as SingleOrArray<object>;
                    const convert = (o: object) => expandDotPaths(o);
                    parsed = Array.isArray(parsed) ? parsed.map(convert) : convert(parsed);

                    req.query[property] = parsed;
                }
            }
            if (numbers.includes(property)) {
                const value = req.query[property];
                if (value) {
                    const parsed = parseInt(value);
                    req.query[property] = parsed;
                }
            }
        }
    } catch (err) {
        next(err);
    }
    next();
};