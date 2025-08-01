import { Ability, Card, DeckLimit, Designer, Faction, Loyalty, Name, PlotStat, TextBox, Traits, Type, Watermark } from "../components/cardComponents";
import AutoSize from "../components/autoSize";
import { px } from "../../../utilities";
import { CardComponentProps } from "../../../types";

const Plot = ({ card, scale, orientation = "horizontal" }: PlotComponentProps) => {
    return (
        <Card scale={scale} card={card} orientation={orientation}>
            <div className="flex flex-row items-center" style={{ height: px(40) }}>
                <div className="flex items-center justify-center gap-1" style={{ width: px(110) }}>
                    <PlotStat type="income">{card.plotStats!.income}</PlotStat>
                    <PlotStat type="initiative">{card.plotStats!.initiative}</PlotStat>
                    <PlotStat type="claim">{card.plotStats!.claim}</PlotStat>
                </div>
                <Name unique={card.unique} className="grow flex" style={{ fontSize: px(18) }}>
                    {card.name}
                </Name>
            </div>
            <div className="flex grow">
                <div className="flex flex-col" style={{ width: px(35) }}>
                    <Type>Plot</Type>
                    <DeckLimit type={card.type} className="grow">{card.deckLimit}</DeckLimit>
                </div>
                <Watermark>{card.watermark}</Watermark>
                <div className="flex flex-col items-center" style={{ width: px(35), paddingRight: px(5) }}>
                    <Faction style={{ borderColor: "transparent" }}>{card.faction}</Faction>
                    <Loyalty>{card.loyal!}</Loyalty>
                    <PlotStat type="reserve">{card.plotStats!.reserve}</PlotStat>
                </div>
            </div>
            <TextBox style={{ paddingBottom: px(0) }}>
                <Traits>{card.traits}</Traits>
                <AutoSize height={60}>
                    <Ability>{card.text}</Ability>
                    <Designer>{card.designer}</Designer>
                </AutoSize>
            </TextBox>
        </Card>
    );
};
type PlotComponentProps = CardComponentProps

export default Plot;