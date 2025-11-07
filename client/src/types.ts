import { CSSProperties } from "react";

export type BaseElementProps = {
    children?: React.ReactNode | React.ReactNode[],
    className?: string,
    style?: CSSProperties
}