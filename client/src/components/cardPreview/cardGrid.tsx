import { Code, PlaytestableCard } from "common/models/cards";
import { BaseElementProps } from "../../types";
import classNames from "classnames";
import CardPreview from ".";
import { useMemo, useState } from "react";
import { toRenderableCard } from "../../utilities";

const CardGrid = ({ children: cards, className, style, scale }: CardPreviewProps) => {
    const [focused, setFocused] = useState<Code>();

    const rendering = useMemo(() => cards?.map((card) => {
        const isFocused = focused === card.code;
        return (
            <CardPreview
                key={card.code}
                card={toRenderableCard(card)}
                scale={scale}
                orientation="vertical"
                rounded={true}
                className={classNames("cursor-pointer transition-all", { "blur-xs": focused !== undefined && !isFocused })}
                onClick={() => isFocused ? setFocused(undefined) : setFocused(card.code)}
            />
        );
    }) ?? [], [cards, focused, scale]);

    return (
        <div className={classNames("flex flex-wrap justify-center", className)} style={style}>
            {rendering}
        </div>
    );
};

type CardPreviewProps = Omit<BaseElementProps, "children"> & {
    children?: PlaytestableCard[],
    scale?: number
}

export default CardGrid;