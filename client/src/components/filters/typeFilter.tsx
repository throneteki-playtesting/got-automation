import { Select, SelectItem } from "@heroui/react";
import { Type, types as allTypes } from "common/models/cards";
import { typeNames } from "common/utils";
import ThronesIcon, { Icon } from "../thronesIcon";

const TypeFilter = ({ label = "Type", setTypes, types = [] }: TypeFilterProps) => {
    const items = allTypes.map((type) => ({ key: type, label: typeNames[type] }));
    return <Select
        label={label}
        selectionMode={"multiple"}
        items={items}
        selectedKeys={types}
        renderValue={(items) => <div className="flex gap-1">
            {items.map((item) => (
                <ThronesIcon name={item.data?.key as Icon}/>
            ))}
        </div>}
        onSelectionChange={(keys) => setTypes([...keys] as Type[])}
    >
        {
            (type) => <SelectItem key={type.key} startContent={<ThronesIcon name={type.key} />}>{type.label}</SelectItem>
        }
    </Select>;
};

type TypeFilterProps = { label?: string, setTypes: (types: Type[]) => void, types?: Type[] }

export default TypeFilter;