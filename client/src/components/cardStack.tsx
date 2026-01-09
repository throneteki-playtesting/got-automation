import classNames from "classnames";
import { ReactElement, useMemo } from "react";
import { BaseElementProps } from "../types";
import { Skeleton } from "@heroui/react";

const CardStack = function<T>({
    cards,
    children: renderMapFunc,
    collapsed = false,
    className,
    classNames: classGroups,
    style,
    isLoading,
    isError,
    emptyContent = (<span>No cards</span>),
    errorContent = (<span>An unexpected error has occurred</span>)

}: CardStackProps<T>) {
    const count = useMemo(() => cards?.length ?? 0, [cards?.length]);
    const columnsTemplate = useMemo(() => `repeat(${count}, ${collapsed ? "0fr" : "1fr"})`, [collapsed, count]);
    const rendering = useMemo(() => {
        if (cards?.length > 0) {
            return cards.map((card, index) => {
                const element = renderMapFunc(card);
                return (
                    <div
                        className="relative w-fit h-fit" style={{
                            gridColumn: `${index + 1} / span ${count - index}`,
                            gridRow: 1
                        }}
                    >
                        {element}
                    </div>
                );
            });
        }
        return <span className="w-full flex flex-col justify-center items-center">{emptyContent}</span>;
    }, [cards, count, emptyContent, renderMapFunc]);

    return (
        <Skeleton isLoaded={!isLoading} className="rounded-lg h-fit w-full">
            <div
                className={classNames("relative grid transition-all duration-700", className, classGroups?.wrapper)}
                style={{
                    gridTemplateColumns: columnsTemplate,
                    ...style
                }}
            >
                {isError ? errorContent : rendering}
            </div>
        </Skeleton>
    );
};

type CardStackProps<T> = Omit<BaseElementProps, "children"> & {
    cards: T[],
    classNames?: { wrapper?: string, card?: string },
    children: (card: T) => ReactElement
    scale?: number,
    collapsed?: boolean,
    isLoading?: boolean,
    isError?: boolean,
    emptyContent?: ReactElement | string,
    errorContent?: ReactElement | string
};

export default CardStack;
