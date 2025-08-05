import { JsonRenderableCard } from "common/models/cards";
import { BaseElementProps } from "../../types";
import classNames from "classnames";
import CardPreview from ".";

const CardGrid = ({ children: cards, className, style, scale }: CardPreviewProps) => {
    return (
        <div className={classNames("flex flex-wrap", className)} style={style}>
            {cards.map((card, index) => {
                return <CardPreview key={index} card={card} scale={scale} orientation="vertical" rounded={false} />;
            })}
        </div>
    );
};

type CardPreviewProps = Omit<BaseElementProps, "children"> & {
    children: JsonRenderableCard[],
    scale?: number
}

export default CardGrid;