import { RenderableCard } from "common/models/cards";
import { DeepPartial } from "common/types";
import { CSSProperties } from "react";

export type BaseElementProps = {
    children?: React.ReactNode | React.ReactNode[],
    className?: string,
    style?: CSSProperties
}

export type CardComponentProps = Omit<BaseElementProps, "children"> & {
    card: DeepPartial<RenderableCard>,
    scale?: number,
    orientation?: "horizontal" | "vertical",
    rounded?: boolean
} & React.DOMAttributes<HTMLDivElement>;