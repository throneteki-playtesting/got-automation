export type EntriesOf<T, V = unknown> = {
    [K in keyof T]?: T[K] extends (infer U)[]
        ? EntriesOf<U> | V
        : T[K] extends object
            ? EntriesOf<T[K]> | V
            : V;
}
export type DeepPartial<T> =
    T extends (infer U)[]
        ? DeepPartial<U>[] | undefined
        : T extends object
            ? { [P in keyof T]?: DeepPartial<T[P]> }
            : T;
export type SortDirection = 1 | -1 | "asc" | "desc" | "ascending" | "descending";
export type Sortable<T> = EntriesOf<T, SortDirection>;
export type Filterable<T> = {
    [K in keyof T]?: T[K] extends Array<infer U>
        ? Iterable<U>
        : T[K] extends ReadonlyArray<infer U>
            ? Iterable<U>
            : T[K] extends object
                ? Filterable<T[K]>
                : Iterable<T[K]>;
};
export type SingleOrArray<T> = T | T[];