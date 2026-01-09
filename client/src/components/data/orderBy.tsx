import { Chip, Select, SelectItem, SharedSelection } from "@heroui/react";
import { Sortable } from "common/types";
import { useCallback, useMemo } from "react";

const OrderBySelector = function<T>({ label, orderBy, setOrderBy, options }: OrderByProps<T>) {
    const items = useMemo(() => {
        if (!Array.isArray(options)) {
            const entries = Object.entries(options) as [keyof T, string][];
            return entries.map(([key, value]) => ({ key, value }));
        }
        return options.map((option) => ({ key: option, value: option as string }));
    }, [options]);

    const handleSelectionChange = useCallback((keys: SharedSelection) => {

        const parseSortable = (keys: string[]): Sortable<T> | undefined => {
            if (keys.length === 0) {
                return undefined;
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return keys.reduce((acc: any, path: string) => {
                const parts = path.split(".");
                let current = acc;

                for (let i = 0; i < parts.length - 1; i++) {
                    const part = parts[i];
                    if (!current[part]) {
                        current[part] = {};
                    }
                    current = current[part];
                }

                const finalKey = parts[parts.length - 1];
                current[finalKey] = "asc"; // TODO: Implement sort direction in UI
                return acc;
            }, {} as Sortable<T>);
        };

        const selectionKeys: string[] =
        keys === "all"
            ? items.map(({ key }) => key.toString())
            : Array.from(keys).map(key => key.toString());

        setOrderBy(parseSortable(selectionKeys));
    }, [items, setOrderBy]);

    return (
        <Select
            label={label}
            isClearable
            isMultiline
            selectionMode={"multiple"}
            items={items}
            selectedKeys={Object.keys(orderBy ?? {})}
            renderValue={(items) => <div className="py-1 flex flex-wrap gap-1">{items.map((item) => <Chip key={item.data?.key.toString()} color="primary">{item.data?.value}</Chip>)}</div>}
            onSelectionChange={handleSelectionChange}
        >
            {({ key, value }) => <SelectItem key={key.toString()}>{value}</SelectItem>}
        </Select>
    );
};

type OrderByProps<T> = { label?: string, orderBy?: Sortable<T>, setOrderBy: (orderBys?: Sortable<T>) => void, options: Array<keyof T> | { [K in keyof T]?: string } };

export default OrderBySelector;