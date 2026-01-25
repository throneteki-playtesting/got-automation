import { useLocation } from "react-router-dom";
import { useMemo } from "react";
import { Filterable } from "common/types";

export function useQueryParams() {
    const { search } = useLocation();
    return useMemo(() => new URLSearchParams(search), [search]);
}

export function useFilter<T>(filter: Filterable<T>) {
    return useMemo(() => {
        function cartesianProduct(obj: Filterable<T>): Record<string, unknown>[] | undefined {
            // Type-guard for iterables (arrays, sets, etc.) without using `any`.
            const isIterable = (v: unknown): v is Iterable<unknown> =>
                v != null && typeof (v as { [Symbol.iterator]?: unknown })[Symbol.iterator] === "function";

            // Recursive worker that accepts unknown to avoid unsafe casts in the public signature.
            const worker = (input: unknown): Record<string, unknown>[] | undefined => {
                if (input == null || typeof input !== "object") return undefined;

                // Keep only entries that have non-empty iterable values or nested non-empty objects
                const entries = Object.entries(input as Record<string, unknown>).filter(([, v]) => {
                    if (v == null) return false;
                    if (isIterable(v) && typeof v !== "string") return Array.from(v as Iterable<unknown>).length > 0;
                    return typeof v === "object" && worker(v) !== undefined;
                });

                if (entries.length === 0) return undefined;

                // Reduce entries into the cartesian product
                return entries.reduce<Record<string, unknown>[]>((acc, [key, v]) => {
                    if (isIterable(v) && typeof v !== "string") {
                        const values = Array.from(v as Iterable<unknown>);
                        return acc.flatMap(item => values.map(val => ({ ...item, [key]: val })));
                    }

                    const nested = worker(v);
                    return acc.flatMap(item => (nested ?? []).map(n => ({ ...item, [key]: n })));
                }, [{}]);
            };

            return worker(obj);
        }

        return cartesianProduct(filter);
    }, [filter]);
}