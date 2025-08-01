import { JsonRenderableCard } from "common/models/cards";
import { BaseElementProps } from "../../types";
import classNames from "classnames";
import CardPreview from "./cardPreview";

const CardGrid = ({ children: cards, className, style, scale }: CardPreviewProps) => {
    return (
        <div className={classNames("flex flex-wrap", className)} style={style}>
            {cards.map((card, index) => {
                const orientation = card.type === "plot" ? "horizontal" : "vertical";
                return <CardPreview key={index} card={card} scale={scale} orientation={orientation} />
            })}
        </div>
    )
}

type CardPreviewProps = Omit<BaseElementProps, "children"> & {
    children: JsonRenderableCard[],
    scale?: number
}

export default CardGrid;