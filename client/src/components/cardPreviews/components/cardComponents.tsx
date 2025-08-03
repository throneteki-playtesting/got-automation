import classNames from "classnames";
import { BaseElementProps } from "../../../types";
import { ChallengeIcon, challengeIcons, DefaultDeckLimit, Faction as FactionType, JsonRenderableCard, PlotStat as PlotStatType, Type as TypeType, Watermark as WatermarkType } from "common/models/cards";
import ThronesIcon, { Icon } from "../thronesIcon";
import AutoSize from "./autoSize";
import { em, px } from "../../../utilities";

const defaultOrientation = (card: JsonRenderableCard) => card.type === "plot" ? "horizontal" : "vertical";
export const Card = ({ children, card, orientation = defaultOrientation(card), scale = 1, rounded = true, className, style }: CardProps) => {
    const factionBorder = {
        baratheon: "border-baratheon",
        greyjoy: "border-greyjoy",
        lannister: "border-lannister",
        martell: "border-martell",
        thenightswatch: "border-thenightswatch",
        stark: "border-stark",
        targaryen: "border-targaryen",
        tyrell: "border-tyrell",
        neutral: "border-neutral"
    };
    const width = 240;
    const height = 333;

    const wrapperWidth = orientation === "horizontal" ? height : width;
    const wrapperHeight = orientation === "horizontal" ? width : height;
    const innerWidth = card.type === "plot" ? height : width;
    const innerHeight = card.type === "plot" ? width : height;

    const rotate = orientation !== defaultOrientation(card);

    const innerClassName = classNames("bg-white text-black font-opensans", factionBorder[card.faction],
        {
            "origin-top-left": scale !== 1 || rotate,
            "relative rotate-270 top-full": rotate
        },
        className);

    return (
        <div style={{
            width: px(wrapperWidth * scale),
            height: px(wrapperHeight * scale)
        }}>
            <div
                className={innerClassName}
                style={{
                    width: px(innerWidth),
                    height: px(innerHeight),
                    borderWidth: px(12),
                    ...(rounded && { borderRadius: px(12) }),
                    ...(scale !== 1 && { scale }),
                    ...style
                }}
            >
                {children}
            </div>
        </div>
    );
};
type CardProps = BaseElementProps & { card: JsonRenderableCard, orientation?: "vertical" | "horizontal", scale?: number, rounded?: boolean };


export const Type = ({ children: type, className, style }: TypeProps) => {
    return (
        <div className={classNames("relative", className)} style={{ top: px(-5), left: px(2), fontSize: px(8), ...style }}>
            {type}
        </div>
    );
};
type TypeProps = Omit<BaseElementProps, "children"> & { children: string };


export const Cost = ({ children, className, style }: CostProps) => {
    return (
        <AutoSize
            height={35}
            className={classNames("relative rounded-full border-black border-solid bg-white text-center", className)}
            style={{
                top: px(-7.5),
                left: px(-7.5),
                width: px(35),
                lineHeight: 1.25,
                fontSize: px(24),
                borderWidth: px(2),
                ...style
            }}
        >
            {children}
        </AutoSize>
    );
};
type CostProps = Omit<BaseElementProps, "children"> & { children: number | "X" | "-" };


export const ChallengeIcons = ({ children: icons, className, style }: ChallengeIconsProps) => {
    return (
        <div className={classNames("grow flex flex-col", className)} style={style}>
            {challengeIcons.map((icon) =>
                <span key={icon} className="grow flex flex-col justify-center items-center">
                    <ThronesIcon
                        name={icon as ChallengeIcon}
                        className="h-1/3 flex justify-center items-center"
                        style={{ fontSize: px(20) }}
                        visible={icons.includes(icon)}
                    />
                </span>
            )}
        </div>
    );
};
type ChallengeIconsProps = Omit<BaseElementProps, "children"> & { children: ChallengeIcon[] };


export const Loyalty = ({ children: loyal, className, style }: LoyaltyProps) => {
    return (
        <div
            className={classNames("flex items-center justify-center", className)}
            style={{ width: px(35), height: px(15), fontSize: px(10), ...style }}
        >
            {loyal && "Loyal"}
        </div>
    );
};
type LoyaltyProps = Omit<BaseElementProps, "children"> & { children: boolean }


export const Strength = ({ children: strength, className, style }: StrengthProps) => {
    return (
        <div
            className={classNames("border-black box-border flex items-center justify-center bg-gray-200", className)}
            style={{ height: px(35), width: px(35), fontSize: px(22), borderWidth: px(2), ...style }}
        >
            {strength}
        </div>
    );
};
type StrengthProps = Omit<BaseElementProps, "children"> & { children: number | "X" };


export const Name = ({ unique, height, children: name, className, style }: NameProps) => {
    return (
        <AutoSize height={height ?? 35} className={classNames("text-center flex items-center justify-center", className)} style={{
            fontSize: px(14),
            paddingLeft: px(2),
            paddingRight: px(2),
            gap: px(2),
            ...style
        }}
        >
            {unique && <ThronesIcon name="unique"/>}
            <span className="flex items-center justify-center">{name}</span>
        </AutoSize>
    );
};
type NameProps = Omit<BaseElementProps, "children"> & { children: string, unique?: boolean, height?: number };


export const Faction = ({ children: faction, className, style }: FactionBadgeProps) => {
    return (
        <div
            className={classNames("border-black box-border flex items-center justify-center", className)}
            style={{ width: px(35), height: px(35), fontSize: px(22), borderWidth: px(2), ...style }}
        >
            <ThronesIcon name={faction} />
        </div>
    );
};
type FactionBadgeProps = Omit<BaseElementProps, "children"> & { children: FactionType };


export const Traits = ({ children: traits, className, style }: TraitsProps) => {
    return (
        <div
            className={classNames("italic font-bold text-center", className)}
            style={{ height: px(16), fontSize: px(12), ...style }}
        >
            {traits.map((trait) => `${trait}.`).join(" ")}
        </div>
    );
};
type TraitsProps = Omit<BaseElementProps, "children"> & { children: string[] };


export const TextBox = ({ children, className, style }: TextBoxProps) => {
    return (
        <div className={classNames("font-crimson flex flex-col", className)} style={{ fontSize: px(12), lineHeight: 1.1, padding: `${px(5)} ${px(10)} ${px(5)} ${px(10)}`, ...style }}>
            {children}
        </div>
    );
};
type TextBoxProps = BaseElementProps;


export const Ability = ({ children: text, className, style }: AbilityProps) => {
    const convertToHtml = (htmlString: string): React.ReactNode[] => {
        const raw = htmlString
            .replace(/(?<=\n?)([^\n]+)(?=\n?)/g, "<p>$1</p>")
            .replace(/\[([^\]]+)\]/g, "<icon name=\"$1\"></icon>")
            // If any plot modifiers are detected, create the plot-modifiers class...
            .replace(/<p>((?:\s*[+-]\d+ (?:Income|Initiative|Claim|Reserve)\.?\s*)+)<\/p>/gi, "<plotModifiers>$1</plotModifiers>")
            // ...and wrap each plot modifier in a span within that class
            .replace(/\s*([+-])(\d+) (Income|Initiative|Claim|Reserve)\.?\s*/gi, (_: string, modifier: string, value: string, plotStat: string) => `<plotModifier name="${plotStat.toLowerCase()}" modifier="${modifier}">${value}</plotModifier>`)
            // If any lists are detected, create the ul...
            .replace(/<p>(-\s*.*\.)<\/p>/g, "<ul>$1</ul>")
            // ... and wrap each line in li
            .replace(/<p>-\s*(.*?\.)(?=<br>|<\/ul><\/p>)/g, "<li>$1</li>")
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
                        return <b key={key} className="font-bold">{children}</b>;
                    case "i":
                        return <i key={key} className="italic font-bold">{children}</i>;
                    case "ul":
                        return <ul key={key} style={{ marginBlockStart: em(0.25), marginBlockEnd: em(0.25), paddingInlineStart: em(2) }}>{children}</ul>;
                    case "li":
                        return <li key={key} style={{ paddingTop: em(0.1), paddingBottom: em(0.1) }}>{children}</li>;
                    case "icon":
                        return <ThronesIcon key={key} name={el.getAttribute("name") as Icon} />;
                    case "plotmodifiers":
                        return <div key={key} className="grow flex justify-center items-center" style={{ gap: em(0.25) }}>{children}</div>;
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
    return <div className={classNames("grow flex flex-col", className)} style={{ gap: em(0.25), ...style }}>
        {convertToHtml(text)}
    </div>;
};
type AbilityProps = Omit<BaseElementProps, "children"> & { children: string };


export const Designer = ({ children: designer, className, style }: DesignerProps) => {
    return (
        (designer && <div className={classNames("grow font-bold", className)} style={{ fontSize: px(11), paddingTop: em(0.5), ...style }}>
            {designer}
        </div>)
    );
};
type DesignerProps = Omit<BaseElementProps, "children"> & { children?: string };


export const PlotModifier = ({ className, style, type, modifier, children: value }: PlotModifierProps) => {
    const actualValue = `${modifier}${value}` as `${"+" | "-"}${number}`;
    return <PlotStat className={className} style={style} type={type}>{actualValue}</PlotStat>;
};
type PlotModifierProps = Omit<BaseElementProps, "children"> & { type: PlotStatType, modifier: "+" | "-", children: number, inline?: boolean }


export const PlotStat = ({ className, style, type, children: value }: PlotStatProps) => {
    const getStatDetails = (): { background: string, clipPath: string } => {
        switch (type) {
            case "income":
                return { background: "bg-income", clipPath: "circle(50%)" };
            case "initiative":
                return { background: "bg-initiative", clipPath: "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)" };
            case "claim":
                return { background: "bg-claim", clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" };
            case "reserve":
                return { background: "bg-reserve", clipPath: "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)" };
        }
    };
    const { background, clipPath } = getStatDetails();

    return (
        <AutoSize
            height={30}
            className={classNames("relative text-center font-opensans", background, className)}
            style={{
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
};
type PlotStatProps = Omit<BaseElementProps, "children"> & { type: PlotStatType, children: number | "X" | `${"+" | "-"}${number | "X"}` }

export const DeckLimit = ({ type, alignment = "left", children: limit, className, style }: DeckLimitProps) => {
    if (limit === DefaultDeckLimit[type]) {
        return null;
    }

    return (
        <div className={classNames("text-center", { "rotate-180": alignment === "left" }, className)} style={{ fontSize: px(8), padding: px(5), writingMode: "vertical-rl", ...style }}>
            {`Deck Limit: ${limit}`}
        </div>
    );
};
type DeckLimitProps = Omit<BaseElementProps, "children"> & { type: TypeType, alignment?: "left" | "right", children: number };


export const Watermark = ({ children: watermark, className, style }: WatermarkProps) => {
    return (
        <div
            className={classNames("grow flex flex-col text-gray-200 font-bold justify-center items-center", className)}
            style={{ fontSize: px(14), ...style }}
        >
            <span>{watermark.top}</span>
            <span style={{ fontSize: px(36), lineHeight: 1 }}>{watermark.middle}</span>
            <span>{watermark.bottom}</span>
        </div>
    );
};
type WatermarkProps = Omit<BaseElementProps, "children"> & { children: WatermarkType };