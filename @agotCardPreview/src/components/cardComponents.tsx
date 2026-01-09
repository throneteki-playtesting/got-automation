import classNames from "classnames";
import { Cost as CostType, Strength as StrengthType, PlotValue as PlotValueType, ChallengeIcon, challengeIcons, DefaultDeckLimit, Faction as FactionType, PlotStat as PlotStatType, Type as TypeType, Watermark as WatermarkType, IRenderCard } from "common/models/cards";
import AutoSize from "./autoSize";
import { em, px } from "../utils";
import { DeepPartial } from "common/types";
import { CSSProperties, memo, useMemo } from "react";
import { BaseElementProps } from "../types";
import ThronesIcon, { Icon } from "../../../client/src/components/thronesIcon";
import { thronesColors } from "common/utils";

const defaultOrientation = (type?: TypeType) => type === "plot" ? "horizontal" : "vertical";
export const Card = memo(({ children, card, orientation = defaultOrientation(card.type), scale = 1, rounded = true, className, classNames: classGroups, style, styles: styleGroups, ...props }: CardProps) => {
    const width = 240;
    const height = 333;

    const wrapperWidth = orientation === "horizontal" ? height : width;
    const wrapperHeight = orientation === "horizontal" ? width : height;
    const innerWidth = card.type === "plot" ? height : width;
    const innerHeight = card.type === "plot" ? width : height;

    const rotate = orientation !== defaultOrientation(card.type);

    const innerStyle = useMemo(() => {
        const style: CSSProperties = {
            borderColor: card.faction ? thronesColors[card.faction] : "white",
            background: "white",
            color: "black",
            fontFamily: "Open Sans, sans-serif",
            ...(scale !== 1 && { scale }),
            ...((scale !== 1 || rotate) && { transformOrigin: "top left" }),
            ...(rotate && { position: "relative", rotate: "270deg", top: "100%" }),
            ...styleGroups?.inner
        };
        return style;
    }, [card.faction, rotate, scale, styleGroups?.inner]);

    return (
        <div
            className={classNames(className, classGroups?.wrapper)}
            style={{
                overflow: "hidden",
                width: px(wrapperWidth * scale),
                height: px(wrapperHeight * scale),
                ...(rounded && { borderRadius: px(12) }),
                ...style,
                ...styleGroups?.wrapper
            }}
            {...props}
        >
            <div
                className={classGroups?.inner}
                style={{
                    width: px(innerWidth),
                    height: px(innerHeight),
                    borderWidth: px(12),
                    ...innerStyle
                }}
            >
                {children}
            </div>
        </div>
    );
});
type CardProps = BaseElementProps & { classNames?: { wrapper?: string, inner?: string }, styles?: { wrapper?: CSSProperties, inner?: CSSProperties }, card: DeepPartial<IRenderCard>, orientation?: "vertical" | "horizontal", scale?: number, rounded?: boolean } & React.DOMAttributes<HTMLDivElement>;


export const Type = memo(({ children: type, className, style }: TypeProps) => {
    return (
        <div className={className} style={{ position: "relative", top: px(-5), left: px(2), fontSize: px(8), ...style }}>
            {type}
        </div>
    );
});
type TypeProps = Omit<BaseElementProps, "children"> & { children?: string };


export const Cost = memo(({ children, className, style }: CostProps) => {
    return (
        <AutoSize
            height={35}
            className={className}
            style={{
                top: px(-7.5),
                left: px(-7.5),
                width: px(35),
                lineHeight: px(30),
                fontSize: px(24),
                borderWidth: px(2),
                position: "relative",
                borderRadius: "100%",
                borderColor: "black",
                borderStyle: "solid",
                background: "white",
                textAlign: "center",
                ...style
            }}
        >
            {children}
        </AutoSize>
    );
});
type CostProps = Omit<BaseElementProps, "children"> & { children?: CostType };


export const ChallengeIcons = memo(({ children: icons = [], className, style }: ChallengeIconsProps) => {
    return (
        <div className={className} style={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            ...style
        }}>
            {challengeIcons.map((icon) =>
                <span key={icon} style={{
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                    justifyContent: "center",
                    alignItems: "center"
                }}>
                    <ThronesIcon
                        name={icon as ChallengeIcon}
                        style={{
                            height: "calc(1/3 * 100%)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            fontSize: px(20)
                        }}
                        visible={icons.includes(icon)}
                    />
                </span>
            )}
        </div>
    );
});
type ChallengeIconsProps = Omit<BaseElementProps, "children"> & { children?: ChallengeIcon[] };


export const Loyalty = memo(({ children: loyal, className, style }: LoyaltyProps) => {
    return (
        <div
            className={className}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: px(35),
                height: px(15),
                fontSize: px(10),
                ...style
            }}
        >
            {loyal && "Loyal"}
        </div>
    );
});
type LoyaltyProps = Omit<BaseElementProps, "children"> & { children?: boolean }


export const Strength = memo(({ children: strength, className, style }: StrengthProps) => {
    return (
        <AutoSize
            height={35}
            className={className}
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "cneter",
                boxSizing: "border-box",
                backgroundColor: "#e5e7eb",
                borderColor: "black",
                borderWidth: px(2),
                width: px(35),
                fontSize: px(22),
                ...style
            }}
        >
            {strength}
        </AutoSize>
    );
});
type StrengthProps = Omit<BaseElementProps, "children"> & { children?: StrengthType };


export const Name = memo(({ unique, height, children: name, className, style }: NameProps) => {
    return (
        <AutoSize height={height ?? 35} className={className} style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            fontSize: px(14),
            paddingLeft: px(2),
            paddingRight: px(2),
            gap: px(2),
            ...style
        }}
        >
            {unique && <ThronesIcon name="unique"/>}
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>{name}</span>
        </AutoSize>
    );
});
type NameProps = Omit<BaseElementProps, "children"> & { children?: string, unique?: boolean, height?: number };


export const Faction = memo(({ children: faction, className, style }: FactionBadgeProps) => {
    return (
        <div
            className={className}
            style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box",
                borderColor: "black",
                width: px(35),
                height: px(35),
                fontSize: px(22),
                borderWidth: px(2),
                ...style
            }}
        >
            {faction && <ThronesIcon name={faction} />}
        </div>
    );
});
type FactionBadgeProps = Omit<BaseElementProps, "children"> & { children?: FactionType };


export const Traits = memo(({ children: traits = [], className, style }: TraitsProps) => {
    return (
        <div
            className={className}
            style={{
                fontStyle: "italic",
                fontWeight: "700",
                textAlign: "center",
                height: px(16),
                fontSize: px(12),
                ...style
            }}
        >
            {traits.map((trait) => `${trait}.`).join(" ")}
        </div>
    );
});
type TraitsProps = Omit<BaseElementProps, "children"> & { children?: Partial<string[]> };


export const TextBox = memo(({ children, className, style }: TextBoxProps) => {
    return (
        <div className={className} style={{
            display: "flex",
            flexDirection: "column",
            fontFamily: "Crimson Text, serif",
            fontSize: px(12),
            lineHeight: 1.1,
            padding: `${px(5)} ${px(10)}`,
            ...style
        }}>
            {children}
        </div>
    );
});
type TextBoxProps = BaseElementProps;


export const Ability = memo(({ children: text, className, style }: AbilityProps) => {
    const convertToHtml = (htmlString: string): React.ReactNode[] => {
        const raw = htmlString
            .replace(/(?<=\n?)([^\n]+)(?=\n?)/g, "<p>$1</p>")
            .replace(/\[([^\]]+)\]/g, "<icon name=\"$1\"></icon>")
            // If any plot modifiers are detected, create the plot-modifiers class...
            .replace(/<p>((?:\s*[+-]\d+ (?:Income|Initiative|Claim|Reserve)\.?\s*)+)<\/p>/gi, "<plotModifiers>$1</plotModifiers>")
            // ...and wrap each plot modifier in a span within that class
            .replace(/\s*([+-])(\d+) (Income|Initiative|Claim|Reserve)\.?\s*/gi, (_: string, modifier: string, value: string, plotStat: string) => `<plotModifier name="${plotStat.toLowerCase()}" modifier="${modifier}">${value}</plotModifier>`)
            // If any lists are detected, create the ul...
            .replace(/((?:<p>-.*<\/p>\s*)+)/g, "<ul>$1</ul>")
            // ... and wrap each line in li
            .replace(/<p>-\s*(.*?)<\/p>/g, "<li>$1</li>")
            .replace(/\n/g, "");

        const parser = new DOMParser();
        const body = parser.parseFromString(raw, "text/html").body;

        const transformNode = (node: ChildNode | Element, key: number) => {
            if (node.nodeType === Node.TEXT_NODE) {
                return node.textContent;
            }
            if (node.nodeType === Node.ELEMENT_NODE) {
                const el = node as HTMLElement;
                const children = Array.from(el.childNodes).map((child, i) => transformNode(child, i));

                switch (el.tagName.toLowerCase()) {
                    case "p":
                        return <span key={key}>{children}</span>;
                    case "b":
                        return <b key={key} style={{ fontWeight: "700" }}>{children}</b>;
                    case "i":
                        return <i key={key} style={{ fontStyle: "italic", fontWeight: "700" }}>{children}</i>;
                    case "ul":
                        return <ul key={key} style={{ listStyleType: "disc", marginBlockStart: em(0.25), marginBlockEnd: em(0.25), paddingInlineStart: em(2) }}>{children}</ul>;
                    case "li":
                        return <li key={key} style={{ paddingTop: em(0.1), paddingBottom: em(0.1) }}>{children}</li>;
                    case "icon":
                        return <ThronesIcon key={key} name={el.getAttribute("name") as Icon} />;
                    case "plotmodifiers":
                        return <div key={key} style={{ display: "flex", flexGrow: 1, justifyContent: "center", alignItems: "center", gap: em(0.25) }}>{children}</div>;
                    case "plotmodifier":
                        return <PlotModifier key={key} type={el.getAttribute("name") as PlotStatType} modifier={el.getAttribute("modifier") as "+" | "-"} inline={true}>{parseInt(children[0] as string) as number}</PlotModifier>;
                    default:
                        return <span key={key}>{children}</span>;
                }
            }
            return null;
        };
        return body ? Array.from(body.childNodes).map((node, i) => transformNode(node, i)) : [];
    };
    return <div className={className} style={{ display: "flex", flexDirection: "column", flexGrow: 1, gap: em(0.25), ...style }}>
        {text && convertToHtml(text)}
    </div>;
});
type AbilityProps = Omit<BaseElementProps, "children"> & { children?: string };


export const Designer = memo(({ children: designer, className, style }: DesignerProps) => {
    return (
        (designer && <div className={className} style={{ flexGrow: 1, fontWeight: "700", fontSize: px(11), paddingTop: em(0.5), ...style }}>
            {designer}
        </div>)
    );
});
type DesignerProps = Omit<BaseElementProps, "children"> & { children?: string };


export const PlotModifier = memo(({ className, style, type, modifier, children: value }: PlotModifierProps) => {
    const actualValue = `${modifier}${value}` as `${"+" | "-"}${number}`;
    return (value && <PlotStat className={className} style={style} type={type}>{actualValue}</PlotStat>);
});
type PlotModifierProps = Omit<BaseElementProps, "children"> & { type: PlotStatType, modifier: "+" | "-", children?: PlotValueType, inline?: boolean }


export const PlotStat = memo(({ className, style, type, children: value }: PlotStatProps) => {
    const getClipPath = (): string => {
        switch (type) {
            case "income":
                return "circle(50%)";
            case "initiative":
                return "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)";
            case "claim":
                return "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)";
            case "reserve":
                return "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)";
        }
    };
    const clipPath = getClipPath();

    return (
        <AutoSize
            height={30}
            className={className}
            style={{
                backgroundColor: thronesColors[type],
                position: "relative",
                textAlign: "center",
                fontFamily: "Open sans, sans-serif",
                width: px(30),
                lineHeight: 1.35,
                padding: em(0.15),
                fontSize: px(18),
                clipPath, ...style
            }}
        >
            {value}
        </AutoSize>
    );
});
type PlotStatProps = Omit<BaseElementProps, "children"> & { type: PlotStatType, children?: PlotValueType | `${"+" | "-"}${PlotValueType}` }

export const DeckLimit = memo(({ type, alignment = "left", children: limit, className, style }: DeckLimitProps) => {
    if (!type || limit === DefaultDeckLimit[type]) {
        return null;
    }

    return (
        <div className={className}
            style={{
                textAlign: "center",
                ...(alignment === "left" && { rotate: "180deg" }),
                fontSize: px(8),
                padding: px(5),
                writingMode: "vertical-rl",
                ...style
            }}>
            {limit && `Deck Limit: ${limit}`}
        </div>
    );
});
type DeckLimitProps = Omit<BaseElementProps, "children"> & { type?: TypeType, alignment?: "left" | "right", children?: number };

// TODO: Convert into AutoSize, and eliminate "height" requirement of autosize
export const Watermark = memo(({ children: watermark, className, style }: WatermarkProps) => {
    return (
        <div
            className={className}
            style={{
                display: "flex",
                flexDirection: "column",
                flexGrow: 1,
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                color: "#e5e7eb",
                fontWeight: "700",
                fontSize: px(14),
                ...style
            }}
        >
            <span>{watermark?.top}</span>
            <span style={{ fontSize: px(36), lineHeight: 1 }}>{watermark?.middle}</span>
            <span>{watermark?.bottom}</span>
        </div>
    );
});
type WatermarkProps = Omit<BaseElementProps, "children"> & { children?: Partial<WatermarkType> };