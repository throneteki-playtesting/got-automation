import { JsonRenderableCard } from "common/models/cards";
import { CSSProperties } from "react"

export type BaseElementProps = {
    children?: React.ReactNode | React.ReactNode[],
    className?: string,
    style?: CSSProperties
}

export type CardComponentProps = {
    card: JsonRenderableCard,
    scale?: number,
    orientation?: "horizontal" | "vertical"
};