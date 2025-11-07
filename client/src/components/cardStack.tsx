import { RenderableCard } from "common/models/cards";
import CardPreview from "../../../@agotCardPreview/src";
import classNames from "classnames";
import { useMemo, useState } from "react";
import { DeepPartial } from "common/types";
import { BaseElementProps } from "../types";

const CardStack = ({ children: cards, scale, collapsed = false, className, classNames: classGroups, style }: CardStackProps) => {
    const [highlighted, setHighlighted] = useState<number>();
    const count = useMemo(() => cards?.length ?? 0, [cards?.length]);
    const columnsTemplate = useMemo(() => `repeat(${count}, ${collapsed ? "0fr" : "1fr"})`, [collapsed, count]);
    const rendering = useMemo(() => cards?.map((card, i) => {
        return (
            <div
                key={i}
                className={classNames("relative transition-all w-fit h-fit", { "-translate-y-2 z-1": highlighted === i })} style={{
                    gridColumn: `${i + 1} / span ${count - i}`,
                    gridRow: 1
                }}
                onPointerEnter={() => setHighlighted(i)}
                onPointerLeave={() => setHighlighted(undefined)}
            >
                <CardPreview
                    card={card}
                    scale={scale}
                    rounded
                    className={classNames("relative", classGroups?.card)}
                />
            </div>
        );
    }) ?? [], [cards, classGroups?.card, count, highlighted, scale]);

    return (
        <div
            className={classNames("relative grid transition-all duration-700", className, classGroups?.wrapper)}
            style={{
                gridTemplateColumns: columnsTemplate,
                ...style
            }}
        >
            {rendering}
        </div>
    );
};

type CardStackProps = Omit<BaseElementProps, "children"> & { classNames?: { wrapper?: string, card?: string }, children?: DeepPartial<RenderableCard>[], scale?: number, collapsed?: boolean };

export default CardStack;
