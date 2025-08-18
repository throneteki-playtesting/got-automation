import { JsonPlaytestingCard } from "common/models/cards";
import { DeepPartial, SingleOrArray } from "common/types";
import { BaseElementProps } from "../../types";
import CardGrid from "../../components/cardPreview/cardGrid";
import { Skeleton } from "@heroui/react";
import classNames from "classnames";
import { useGetCardsQuery } from "../../api";

const LatestCards = ({ className, style, filter }: LatestCardsProps) => {
    const { data: cards, isLoading, error } = useGetCardsQuery({ filter, latest: true });

    if (error) {
        return <div className="w-full h-16 bg-default-50 text-center">
            An error has occured.
        </div>;
    }

    return (
        <Skeleton isLoaded={!isLoading} className="rounded-b-xl">
            <CardGrid className={classNames("gap-1", { "h-64": isLoading }, className)} style={style}>
                {cards}
            </CardGrid>
        </Skeleton>
    );
};

type LatestCardsProps = Omit<BaseElementProps, "children"> & { filter?: SingleOrArray<DeepPartial<JsonPlaytestingCard>> };

export default LatestCards;