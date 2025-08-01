import { Ability, Card, DeckLimit, Designer, Name, TextBox, Traits, Type, Watermark } from "../components/cardComponents";
import AutoSize from "../components/autoSize";
import { CardComponentProps } from "../../../types";

const Agenda = ({ card, scale, orientation }: CardComponentProps) => {
    return (
        <Card scale={scale} card={card} orientation={orientation} className="flex flex-col">
            <div>
                <Name unique={card.unique}>
                    {card.name}
                </Name>
                <Type className="flex items-center justify-center">Agenda</Type>
            </div>
            <div className="relative">
                <DeckLimit type={card.type} className="absolute h-full">{card.deckLimit}</DeckLimit>
                <Watermark>{card.watermark}</Watermark>
            </div>
            <TextBox>
                <Traits>{card.traits}</Traits>
                <AutoSize height={130}>
                    <Ability>{card.text}</Ability>
                    <Designer>{card.designer}</Designer>
                </AutoSize>
            </TextBox>
        </Card>
    );
};

export default Agenda;