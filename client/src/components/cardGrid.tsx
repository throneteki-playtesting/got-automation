import classNames from "classnames";
import { forwardRef, ReactElement } from "react";
import { ScrollShadow, Skeleton } from "@heroui/react";
import { BaseElementProps } from "../types";
import { GridComponents, VirtuosoGrid } from "react-virtuoso";

const CardGrid = function<T>({ cards, children: renderMapFunc, className, style, isLoading }: CardGridProps<T>) {
    if (isLoading) {
        return <Skeleton isLoaded={false} className="min-h-64"/>;
    }
    const components: GridComponents<T> = {
        Scroller: forwardRef(({ children, ...props }, ref) => (
            <ScrollShadow
                {...props}
                ref={ref}
                size={10}
                isEnabled={true}
            >
                {children}
            </ScrollShadow>
        )),
        List: forwardRef(({ children, style, ...props }, ref) => (
            <div {...props} className="flex flex-wrap justify-start gap-1" style={style} ref={ref}>
                {children}
            </div>
        ))
    };

    return (
        <VirtuosoGrid
            style={style}
            data={cards}
            increaseViewportBy={500}
            itemContent={(index, card) => renderMapFunc(card, index)}
            className={classNames("min-h-64", className)}
            components={components}
            useWindowScroll
        />
    );
};

type CardGridProps<T> = Omit<BaseElementProps, "children"> & {
    cards?: T[],
    children: (card: T, index: number) => ReactElement
    isLoading?: boolean
}

export default CardGrid;