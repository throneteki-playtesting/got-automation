import { JsonRenderableCard } from "common/models/cards";
import Character from "./cardtypes/character";
import Location from "./cardtypes/location";
import Attachment from "./cardtypes/attachment";
import Event from "./cardtypes/event";
import Plot from "./cardtypes/plot";
import Agenda from "./cardtypes/agenda";
import { CardComponentProps } from "../../types";
import { Card } from "./components/cardComponents";
import { DeepPartial } from "common/types";

const CardPreview = ({ card, scale, orientation, rounded, className, style }: CardPreviewProps) => {
    const getComponentFor = (card: DeepPartial<JsonRenderableCard>) => {
        switch (card.type) {
            case "character":
                return Character;
            case "location":
                return Location;
            case "attachment":
                return Attachment;
            case "event":
                return Event;
            case "plot":
                return Plot;
            case "agenda":
                return Agenda;
            default:
                return Card;
        }
    };

    const CardComponent = getComponentFor(card);
    return <CardComponent card={card} scale={scale} orientation={orientation} rounded={rounded} className={className} style={style}/>;
};
export type CardPreviewProps = CardComponentProps;

export default CardPreview;