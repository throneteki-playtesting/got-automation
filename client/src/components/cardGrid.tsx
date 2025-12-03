import classNames from "classnames";
import { ReactElement, useMemo } from "react";
import { BaseElementProps } from "../../../@agotCardPreview/src/types";
import { Skeleton } from "@heroui/react";

const CardGrid = function<T>({ cards, children: renderMapFunc, className, style, isLoading, isError, emptyContent = (<span>No cards</span>), errorContent = (<span>An unexpected error has occurred</span>) }: CardPreviewProps<T>) {
    const rendering = useMemo(() => {
        if (cards?.length > 0) {
            return cards.map(renderMapFunc);
        }
        return <span className="w-full flex flex-col justify-center items-center">{emptyContent}</span>;
    }, [cards, emptyContent, renderMapFunc]);

    return (
        <Skeleton isLoaded={!isLoading} className="rounded-lg h-fit w-full">
            <div className={classNames("flex flex-wrap justify-start gap-1 min-h-64 bg-default-50 rounded-lg", className)} style={style}>
                {isError ? errorContent : rendering}
            </div>
        </Skeleton>
    );
};

type CardPreviewProps<T> = Omit<BaseElementProps, "children"> & {
    cards: T[],
    children: (card: T) => ReactElement
    isLoading?: boolean,
    isError?: boolean,
    emptyContent?: ReactElement | string,
    errorContent?: ReactElement | string
}

export default CardGrid;