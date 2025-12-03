export type DeepPartial<T> =
    T extends (infer U)[]
        ? DeepPartial<U>[] | undefined
        : T extends object
            ? { [P in keyof T]?: DeepPartial<T[P]> }
            : T;

export type SingleOrArray<T> = T | T[];

type SortDirection = 1 | -1 | "asc" | "desc" | "ascending" | "descending";
export type Sortable<T> = {
  [K in keyof T]?: SortDirection;
};