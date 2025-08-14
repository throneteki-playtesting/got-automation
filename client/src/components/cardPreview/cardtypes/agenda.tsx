import { Ability, Card, DeckLimit, Designer, Name, TextBox, Traits, Type, Watermark } from "../components/cardComponents";
import AutoSize from "../components/autoSize";
import { CardComponentProps } from "../../../types";

const Agenda = ({ card, scale, orientation, rounded, className, style, ...props }: CardComponentProps) => {
    return (
        <Card scale={scale} card={card} orientation={orientation} rounded={rounded} className={className} classNames={{ inner: "flex flex-col" }} style={style} {...props}>
            <div>
                <Name>
                    {card.name}
                </Name>
                <Type className="flex items-center justify-center">Agenda</Type>
            </div>
            <div className="grow relative flex">
                <DeckLimit type={card.type} className="absolute h-full">{card.deckLimit}</DeckLimit>
                <Watermark>{card.watermark}</Watermark>
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

export default Agenda;