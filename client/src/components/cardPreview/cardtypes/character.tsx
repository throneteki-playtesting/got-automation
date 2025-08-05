import { ChallengeIcon } from "common/models/cards";
import { Ability, Card, ChallengeIcons, Cost, DeckLimit, Designer, Faction, Loyalty, Name, Strength, TextBox, Traits, Type, Watermark } from "../components/cardComponents";
import AutoSize from "../components/autoSize";
import { px } from "../../../utilities";
import { CardComponentProps } from "../../../types";
import classNames from "classnames";

const Character = ({ card, scale, orientation, rounded, className, style }: CardComponentProps) => {
    return (
        <Card scale={scale} card={card} orientation={orientation} rounded={rounded} className={classNames("flex flex-col", className)} style={style}>
            <div className="flex grow">
                <div className="flex relative flex-col" style={{ width: px(35) }}>
                    <Cost>{card.cost}</Cost>
                    <Type>Character</Type>
                    <ChallengeIcons>{Object.entries(card.icons || {}).filter(([, value]) => value).map(([icon]) => icon as ChallengeIcon)}</ChallengeIcons>
                </div>
                <Watermark>{card.watermark}</Watermark>
                <div className="flex flex-col justify-end">
                    <DeckLimit type={card.type} className="grow" alignment="right">{card.deckLimit}</DeckLimit>
                    <Loyalty>{card.loyal}</Loyalty>
                </div>
            </div>
            <div className="flex">
                <Strength>{card.strength}</Strength>
                <Name unique={card.unique} className="self-end grow border-black text-sm flex items-center justify-center" style={{
                    height: px(30),
                    borderTopWidth: px(2),
                    borderBottomWidth: px(2)
                }}>
                    {card.name}
                </Name>
                <Faction>{card.faction}</Faction>
            </div>
            <TextBox>
                <Traits>{card.traits}</Traits>
                <AutoSize height={95} className="flex flex-col">
                    <Ability>{card.text}</Ability>
                    <Designer>{card.designer}</Designer>
                </AutoSize>
            </TextBox>
        </Card>
    );
};

export default Character;