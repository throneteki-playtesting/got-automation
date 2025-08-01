import React, { CSSProperties, useEffect, useRef } from "react";
import { px } from "../../../utilities";

const AutoSize = ({ children, className, style, height, rate = 0.01, minimum = 0.4 }: AutoSizeProps) => {
    const contentRef = useRef<HTMLDivElement>(null);
    let dependencies = Array.isArray(children) ? children as [] : [children];

    useEffect(() => {
        const content = contentRef.current;
        if (!content) {
            return;
        }

        let multiplier = 1;
        const baseSizes = new Map<HTMLElement, number>();

        const shrink = (el: HTMLElement) => {
            if (el.style.fontSize) {
                if (!baseSizes.has(el)) {
                    baseSizes.set(el, parseFloat(el.style.fontSize));
                }
                const baseSize = baseSizes.get(el) as number;
                el.style.fontSize = px(baseSize * multiplier);
            }

            for (const child of el.children) {
                if (child.nodeType === Node.ELEMENT_NODE) {
                    shrink(child as HTMLElement);
                }
            }
        };

        const isOverflowing = () => content.scrollWidth > content.clientWidth || content.scrollHeight > content.clientHeight;
        while (multiplier > minimum && isOverflowing()) {
            // Expliticly set the top-level content so it can scale all inner text that isn't explicitly set
            content.style.fontSize = content.style.fontSize || window.getComputedStyle(content).fontSize;
            multiplier -= rate;
            shrink(content);
        }
    }, dependencies);

    return (
        <div ref={contentRef} className={className} style={{ ...style, height: px(height) }}>
            {children}
        </div>
    )
}
type AutoSizeProps = {
    children?: React.ReactNode | React.ReactNode[],
    className?: string,
    style?: CSSProperties,
    height: number,
    rate?: number,
    minimum?: number
}
export default AutoSize;