import classNames from "classnames";
import { ChallengeIcon, Faction, Type } from "common/models/cards";
import { CSSProperties } from "react";


const ThronesIcon = ({ name, className, style, visible = true }: IconProps) => {

    const icons: { [key: string]: string } = {
        baratheon: "\ue600",
        greyjoy: "\ue601",
        lannister: "\ue603",
        martell: "\ue604",
        thenightswatch: "\ue606",
        stark: "\ue608",
        targaryen: "\ue609",
        tyrell: "\ue60a",
        neutral: "\ue612",
        military: "\ue605",
        intrigue: "\ue602",
        power: "\ue607",
        unique: "\ue60b",
        character: "\ue60f",
        location: "\ue60e",
        attachment: "\ue60d",
        event: "\ue610",
        plot: "\ue60c",
        agenda: "\ue611"
    };

    return (
        <span className={classNames("font-thronesdb leading-none", className, { invisible: !visible, "leading-relaxed": name === "unique" })} style={style}>
            {icons[name]}
        </span>
    );
};

export type Icon = Faction | ChallengeIcon | "unique" | Type;

type IconProps = {
    name: Icon,
    className?: string,
    style?: CSSProperties,
    visible?: boolean
}

export default ThronesIcon;