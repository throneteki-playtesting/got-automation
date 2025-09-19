import { useLocation } from "react-router-dom";
import { useMemo } from "react";

export function useQueryParams() {
    const { search } = useLocation();
    return useMemo(() => new URLSearchParams(search), [search]);
}

type FilterValues = Record<string, Iterable<unknown>>;

// TODO: Make this use generic T so that lists must be iterable values with T's keys
export function useFilters(lists: FilterValues) {
    return useMemo(() => {
        function cartesianProduct(obj: FilterValues): Record<string, unknown>[] | undefined {
            const nonEmpty = Object.entries(obj).filter(
                ([, iterable]) => Array.from(iterable).length > 0
            );
            if (nonEmpty.length === 0) {
                return undefined;
            }
            return nonEmpty.reduce<Record<string, unknown>[]>(
                (acc, [key, iterable]) => {
                    const values = Array.from(iterable);
                    return acc.flatMap(item =>
                        values.map(value => ({ ...item, [key]: value }))
                    );
                },
                [{}]
            );
        }

        return cartesianProduct(lists);
    }, [lists]);
}