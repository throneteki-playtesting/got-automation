import { useGetCardsQuery } from "../api/cardsApi";
import { JsonRenderableCard } from "common/models/cards";
import CardGrid from "../components/cardPreviews/cardGrid";

const Cards = () => {
    const { data: cards, isLoading, error } = useGetCardsQuery();

    if (!cards || isLoading || error) {
        return null;
    }

    const rendering = cards?.map((card) => {
        return {
            ...card,
            watermark: {
                top: card.code,
                middle: `v${card.version}`,
                bottom: "Work In Progress"
            }
        } as JsonRenderableCard;
    });

    return (
        <CardGrid className="justify-center">
            {rendering}
        </CardGrid>
    );
};

export default Cards;