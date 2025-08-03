import { Ability, Card, Cost, DeckLimit, Designer, Faction, Loyalty, Name, TextBox, Traits, Type, Watermark } from "../components/cardComponents";
import AutoSize from "../components/autoSize";
import { px } from "../../../utilities";
import { CardComponentProps } from "../../../types";
import classNames from "classnames";

const Attachment = ({ card, scale, orientation, rounded, className, style }: CardComponentProps) => {
    return (
        <Card scale={scale} card={card} orientation={orientation} rounded={rounded} className={classNames("flex flex-col", className)} style={style}>
            <div className="flex grow">
                <div className="flex flex-col" style={{ width: px(35) }}>
                    <Cost>{card.cost!}</Cost>
                    <Type>Attachment</Type>
                    <DeckLimit type={card.type} className="grow">{card.deckLimit}</DeckLimit>
                </div>
                <Watermark style={{ marginRight: px(35) }}>{card.watermark}</Watermark>
            </div>
            <div className="flex flex-col items-end">
                <TextBox>
                    <Traits>{card.traits}</Traits>
                    <AutoSize height={90} className="flex flex-col">
                        <Ability>{card.text}</Ability>
                        <Designer>{card.designer}</Designer>
                    </AutoSize>
                </TextBox>
                <Loyalty>{card.loyal!}</Loyalty>
            </div>
            <div className="flex">
                <Name unique={card.unique} className="grow" style={{
                    borderTopWidth: px(2),
                    borderBottomWidth: px(2),
                    borderLeftWidth: px(2)
                }}>
                    {card.name}
                </Name>
                <Faction>{card.faction}</Faction>
            </div>
        </Card>
    );
};

export default Attachment;