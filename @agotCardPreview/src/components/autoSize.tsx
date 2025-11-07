import React, { CSSProperties, useEffect, useRef } from "react";
import { px } from "../utils";

const AutoSize = ({ children, className, style, height, rate = 0.01, minimum = 0.4 }: AutoSizeProps) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const dependencies = Array.isArray(children) ? children as [] : [children];
    const elements = useRef(new Map<HTMLElement, number>());

    useEffect(() => {
        const content = contentRef.current;
        if (!content) {
            return;
        }

        let multiplier = 1;
        const baseSizes = elements.current;
        // Reset sizes if they were changed
        for (const [element, baseSize] of [...baseSizes.entries()]) {
            element.style.fontSize = px(baseSize);
            baseSizes.delete(element);
        }

        const shrink = (el: HTMLElement) => {
            if (el.style.fontSize) {
                if (!baseSizes.has(el)) {
                    const currentSize = parseFloat(el.style.fontSize);
                    baseSizes.set(el, currentSize);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...dependencies, minimum, rate]);

    return (
        <div ref={contentRef} className={className} style={{ ...style, height: px(height) }}>
            {children}
        </div>
    );
};
type AutoSizeProps = {
    children?: React.ReactNode | React.ReactNode[],
    className?: string,
    style?: CSSProperties,
    height: number,
    rate?: number,
    minimum?: number
}
export default AutoSize;