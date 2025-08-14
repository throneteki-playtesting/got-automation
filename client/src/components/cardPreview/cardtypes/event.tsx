import { Ability, Card, Cost, DeckLimit, Designer, Faction, Loyalty, Name, TextBox, Traits, Type, Watermark } from "../components/cardComponents";
import AutoSize from "../components/autoSize";
import { px } from "../../../utilities";
import { CardComponentProps } from "../../../types";

const Event = ({ card, scale, orientation, rounded, className, style, ...props }: CardComponentProps) => {
    return (
        <Card scale={scale} card={card} orientation={orientation} rounded={rounded} className={className} classNames={{ inner: "flex flex-col" }} style={style} {...props}>
            <div className="grow flex">
                <div className="flex flex-col" style={{ width: px(35) }}>
                    <Cost>{card.cost}</Cost>
                    <Type>Event</Type>
                    <DeckLimit type={card.type} className="grow">{card.deckLimit}</DeckLimit>
                </div>
                <div className="flex flex-col grow">
                    <Name style={{
                        borderTopWidth: px(2),
                        borderBottomWidth: px(2),
                        borderLeftWidth: px(2)
                    }}>
                        {card.name}
                    </Name>
                    <Watermark className="grow">{card.watermark}</Watermark>
                </div>
                <div className="flex flex-col" style={{ width: px(35) }}>
                    <Faction>{card.faction}</Faction>
                    <Loyalty>{card.loyal}</Loyalty>
                </div>
            </div>
            <TextBox>
                <Traits>{card.traits}</Traits>
                <AutoSize height={130} className="flex flex-col">
                    <Ability>{card.text}</Ability>
                    <Designer>{card.designer}</Designer>
                </AutoSize>
            </TextBox>
        </Card>
    );
};

export default Event;