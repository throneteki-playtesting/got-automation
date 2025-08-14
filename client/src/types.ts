import { JsonRenderableCard } from "common/models/cards";
import { DeepPartial } from "common/types";
import { CSSProperties } from "react";

export type BaseElementProps = {
    children?: React.ReactNode | React.ReactNode[],
    className?: string,
    style?: CSSProperties
}

export type CardComponentProps = Omit<BaseElementProps, "children"> & {
    card: DeepPartial<JsonRenderableCard>,
    scale?: number,
    orientation?: "horizontal" | "vertical",
    rounded?: boolean
} & React.DOMAttributes<HTMLDivElement>;