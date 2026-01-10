import CardPreview from "@agot/card-preview";
import { useGetCardsQuery, useGetProjectQuery } from "../../api";
import CardGrid from "../../components/cardGrid";
import { BaseElementProps } from "../../types";
import { renderPlaytestingCard } from "common/utils";
import { Chip, Link } from "@heroui/react";
import dismoji from "../../emojis";
import Loading from "../../components/loading";
import Error from "../../components/error";
import classNames from "classnames";
import { isEmpty } from "lodash";

const ProjectDetail = ({ className, style, project: number }: ProjectDetailProps) => {
    const { data: project, isLoading: isProjectLoading } = useGetProjectQuery({ number: number });
    const { data: cards, isLoading: isCardsLoading } = useGetCardsQuery({ filter: { project: number } });

    if (isProjectLoading || !project) {
        return <Loading label="Loading project..." size="lg"/>;
    }
    if (isEmpty(project)) {
        return <Error label={`Project #${number} does not exist`}/>;
    }
    const title = project.emoji ? `${project.name} ${dismoji[project.emoji.replaceAll(":", "")]}` : project.name;
    return <div className={classNames("p-5", className)} style={style}>
        <div className="flex flex-col gap-1">
            <h1 className="text-5xl">{title}</h1>
            <div className="flex gap-1">
                <Chip variant="dot" color="warning">{project.code}</Chip>
                <Chip variant="dot" color={project.type === "cycle" ? "secondary" : "success"}>{project.type}</Chip>
                <Chip variant="dot" color="primary">{`ver. ${project.version}`}</Chip>
            </div>
        </div>
        <div className="p-5">
            <div>Review Form: <Link href={project.formUrl}>Google Forms</Link></div>
        </div>
        <CardGrid cards={cards} isLoading={isCardsLoading}>
            {(card) => (
                <Link key={card.code} href={`/project/${number}/${card.number}`}>
                    <CardPreview
                        key={card.code}
                        card={renderPlaytestingCard(card)}
                        orientation="vertical"
                        rounded={true}
                        className={"transition-all w-32"}
                    />
                </Link>)}
        </CardGrid>
    </div>;
};

export default ProjectDetail;

type ProjectDetailProps = Omit<BaseElementProps, "children"> & { project: number };