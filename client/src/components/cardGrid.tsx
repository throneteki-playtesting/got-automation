import classNames from "classnames";
import { ReactElement, useMemo } from "react";
import { BaseElementProps } from "../types";
import LoadingCard from "./loadingCard";

const CardGrid = function<T>({ cards = [], size = "md", children: renderMapFunc, className, style, isLoading }: CardGridProps<T>) {
    const loadingNumber = useMemo(() => {
        switch (size) {
            case "sm":
                return 4;
            case "md":
                return 3;
            case "lg":
                return 2;
        }
    }, [size]);

    const content = useMemo(() => {
        if (isLoading) {
            return Array.from({ length: loadingNumber }).map((_, index) => <LoadingCard key={index}/>);
        }
        return cards.map(renderMapFunc);
    }, [cards, isLoading, loadingNumber, renderMapFunc]);

    const columnsClassName = useMemo(() => {
        switch (size) {
            case "sm":
                return "grid-cols-4 sm:grid-cols-5";
            case "md":
                return "grid-cols-3 sm:grid-cols-4";
            case "lg":
                return "grid-cols-2 sm:grid-cols-3";
        }
    }, [size]);
    return (
        <div className={classNames("grid gap-1", columnsClassName, className)} style={style}>
            {content}
        </div>
    );
};

type CardGridProps<T> = Omit<BaseElementProps, "children"> & {
    cards?: T[],
    size?: "sm" | "md" | "lg",
    children: (card: T, index: number) => ReactElement
    isLoading?: boolean
}


export default CardGrid;