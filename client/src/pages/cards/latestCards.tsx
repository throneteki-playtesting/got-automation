import { PlaytestableCard } from "common/models/cards";
import { DeepPartial, SingleOrArray } from "common/types";
import { BaseElementProps } from "../../types";
import CardGrid from "../../components/cardPreview/cardGrid";
import { useGetCardsQuery } from "../../api";
import CardPreview from "../../components/cardPreview";
import { renderPlaytestingCard } from "common/utils";

const LatestCards = ({ className, style, filter }: LatestCardsProps) => {
    const { data: cards, isLoading, error } = useGetCardsQuery({ filter, latest: true });

    if (error) {
        return <div className="w-full h-16 bg-default-50 text-center">
            An error has occured.
        </div>;
    }

    return (
        <CardGrid cards={cards ?? []} className={className} style={style} isLoading={isLoading}>
            {(card) => (
                <CardPreview
                    key={card.code}
                    card={renderPlaytestingCard(card)}
                    orientation="vertical"
                    rounded={true}
                    className={"transition-all"}
                />)}
        </CardGrid>
    );
};

type LatestCardsProps = Omit<BaseElementProps, "children"> & { filter?: SingleOrArray<DeepPartial<PlaytestableCard>> };

export default LatestCards;