import { Ability, Card, Cost, DeckLimit, Designer, Faction, Loyalty, Name, TextBox, Traits, Type, Watermark } from "../components/cardComponents";
import AutoSize from "../components/autoSize";
import { px } from "../../../utilities";
import { CardComponentProps } from "../../../types";
import classNames from "classnames";

const Location = ({ card, scale, orientation, rounded, className, style }: CardComponentProps) => {
    return (
        <Card scale={scale} card={card} orientation={orientation} rounded={rounded} className={classNames("flex flex-row", className)} style={style}>
            <div className="relative flex flex-col" style={{ width: px(35) }}>
                <Cost>{card.cost}</Cost>
                <Type>Location</Type>
                <Name unique={card.unique} height={150} className="border-solid border-black rotate-180" style={{
                    width: px(35),
                    borderBottomWidth: px(2),
                    borderLeftWidth: px(2),
                    borderRightWidth: px(2),
                    paddingTop: px(5),
                    paddingBottom: px(5),
                    writingMode: "vertical-lr"
                }} >
                    {card.name}
                </Name>
                <Faction>{card.faction}</Faction>
                <Loyalty>{card.loyal}</Loyalty>
            </div>
            <div className="flex flex-col justify-between">
                <div className="grow relative flex flex-col">
                    <DeckLimit type={card.type} className="absolute self-end h-full" alignment="right">{card.deckLimit}</DeckLimit>
                    <Watermark>{card.watermark}</Watermark>
                </div>
                <TextBox>
                    <Traits>{card.traits}</Traits>
                    <AutoSize height={130} className="flex flex-col">
                        <Ability>{card.text}</Ability>
                        <Designer>{card.designer}</Designer>
                    </AutoSize>
                </TextBox>
            </div>
        </Card>
    );
};

export default Location;