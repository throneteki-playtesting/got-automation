import { JsonRenderableCard } from "common/models/cards";
import Character from "./cardtypes/character";
import Location from "./cardtypes/location";
import Attachment from "./cardtypes/attachment";
import Event from "./cardtypes/event";
import Plot from "./cardtypes/plot";
import Agenda from "./cardtypes/agenda";

const CardPreview = ({ card, scale, orientation }: CardPreviewProps) => {
    const getComponentFor = (card: JsonRenderableCard) => {
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
        }
    };

    const CardComponent = getComponentFor(card);
    return <CardComponent card={card} scale={scale} orientation={orientation}/>;
};
export type CardPreviewProps = {
    card: JsonRenderableCard,
    scale?: number,
    orientation?: "horizontal" | "vertical"
};

export default CardPreview;