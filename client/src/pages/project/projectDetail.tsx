import { CardPreview } from "@agot/card-preview";
import { useGetCardsQuery, useGetProjectQuery, useInitialiseProjectMutation } from "../../api";
import CardGrid from "../../components/cardGrid";
import { BaseElementProps } from "../../types";
import { renderPlaytestingCard } from "common/utils";
import { addToast, Button, ButtonGroup, Card, Chip, CircularProgress, Divider, Link, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Skeleton } from "@heroui/react";
import dismoji from "../../emojis";
import { useEffect, useMemo, useState } from "react";
import { IProject } from "common/models/projects";
import { IPlaytestCard } from "common/models/cards";
import EditProjectModal from "./editProjectModal";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare, faPencil, faX } from "@fortawesome/free-solid-svg-icons";
import PermissionGate from "../../components/permissionGate";
import { Permission } from "common/models/user";
import DeleteProjectModal from "./deleteProjectModal";
import classNames from "classnames";
import ProjectContentDraft from "./draft/projectContentDraft";
import ProjectHeaderDraftNotice from "./draft/projectHeaderDraftNotice";

const ProjectDetail = ({ className, style, project: number }: ProjectDetailProps) => {
    const isNew = useMemo(() => !number, [number]);
    const { data: project, isLoading: isProjectLoading } = useGetProjectQuery({ number: number! }, { skip: isNew });
    const { data: cards, isLoading: isCardsLoading } = useGetCardsQuery({ filter: { project: number } }, { skip: isNew });
    const [isEditing, setIsEditing] = useState(isNew);
    const [isDeleting, setIsDeleting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setIsEditing(isNew);
    }, [isNew]);

    return <div className={className} style={style}>
        <Card className="p-3 md:p-4 lg:p-6 rounded-b-none">
            <ProjectHeader project={project} cards={cards} isLoading={isProjectLoading} onEdit={() => setIsEditing(true)} onDelete={() => setIsDeleting(true)}/>
        </Card>
        <Card className="p-1 md:p-2 lg:p-3 rounded-t-none">
            <ProjectContent project={project} cards={cards} isLoading={isCardsLoading}/>
        </Card>
        <EditProjectModal isOpen={isEditing} project={project} onClose={() => setIsEditing(false)} onSave={(project) => {
            if (isNew) {
                navigate(`/project/${project.number}`);
            }
            addToast({ title: "Successfully saved", color: "success", description: `${project.name} has been ${isNew ? "created" : "updated"}` });
        }}/>
        {project && <DeleteProjectModal isOpen={isDeleting} project={project} onClose={() => setIsDeleting(false)} onDelete={(project) => {
            navigate("/");
            addToast({ title: "Successfully deleted", color: "success", description: `'${project.name} has been deleted` });
        }}/>}
    </div>;
};

export default ProjectDetail;

type ProjectDetailProps = Omit<BaseElementProps, "children"> & { project?: number };

const ProjectHeader = ({ className, style, project, cards, isLoading = false, onEdit = () => true, onDelete = () => true }: ProjectHeaderProps) => {
    // TODO: Placeholder values, will use IProjectCardProduction
    const percents = useMemo(() => ({
        artwork: 0.7,
        wording: 0.2,
        completed: 0.1
    }), []);

    if (!project || isLoading) {
        return (
            <div className={classNames("flex flex-col gap-2", className)} style={style}>
                <Skeleton className="h-4 sm:h-5 md:h-6 w-42 sm:w-64 rounded-lg"/>
                <Skeleton className="h-4 sm:h-5 md:h-6 w-36 sm:w-52 rounded-lg"/>
                <Skeleton className="h-4 sm:h-5 md:h-6 w-52 sm:w-74 rounded-lg"/>
            </div>
        );
    }
    const title = project.emoji ? `${dismoji[project.emoji.replaceAll(":", "")]} ${project.name}` : project.name;
    return (
        <div className={classNames("space-y-2 md:space-y-4", className)} style={style}>
            <ButtonGroup className="absolute top-0 right-0 p-2">
                <PermissionGate requires={Permission.EDIT_PROJECTS}>
                    <Button isIconOnly variant="flat" size="sm" onPress={onEdit}><FontAwesomeIcon icon={faPencil}/></Button>
                </PermissionGate>
                <PermissionGate requires={Permission.DELETE_PROJECTS}>
                    <Button isIconOnly variant="flat" size="sm" color="danger" onPress={onDelete}><FontAwesomeIcon icon={faX}/></Button>
                </PermissionGate>
                {project.draft}
            </ButtonGroup>
            <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                <div className="text-2xl md:text-3xl lg:text-4xl">{title}</div>
                <div className="space-x-1">
                    <Chip variant="bordered" color="success" className="text-xs h-6">#{project.number}</Chip>
                    <Chip variant="bordered" color="secondary" className="text-xs h-6 capitalize">{project.type}</Chip>
                    <Chip variant="bordered" color="warning" className="text-xs h-6">{project.code}</Chip>
                </div>
            </div>
            {project.draft && cards && <ProjectHeaderDraftNotice project={project} cards={cards}/>}
            {project.description && <div className="text-sm md:text-lg lg:text-xl py-1">{project.description}</div>}
            <div className="w-fit flex flex-col">
                <Link href={project.mandateUrl} className="space-x-1 cursor-pointer">
                    <span className="text-md">Mandate</span>
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare}/>
                </Link>
                <Divider className="my-1"/>
                <Link href={project.formUrl} className="space-x-1 cursor-pointer">
                    <span className="text-md">Submit Review</span>
                    <FontAwesomeIcon icon={faArrowUpRightFromSquare}/>
                </Link>
            </div>
            <div className="flex py-5">
                <CircularProgress
                    color="success"
                    valueLabel={<div className="flex flex-col justify-center text-center">
                        <div className="text-xl">{`${percents.artwork * 100}%`}</div>
                        <div className="text-md">Artwork</div>
                    </div>}
                    showValueLabel
                    strokeWidth={2}
                    classNames={{
                        svg: "w-24 h-24 drop-shadow-md"
                    }}
                    value={percents.artwork * 100}
                />
                <CircularProgress
                    color="success"
                    valueLabel={<div className="flex flex-col justify-center text-center">
                        <div className="text-xl">{`${percents.wording * 100}%`}</div>
                        <div className="text-md">Wording</div>
                    </div>}
                    showValueLabel
                    strokeWidth={2}
                    classNames={{
                        svg: "w-24 h-24 drop-shadow-md"
                    }}
                    value={percents.wording * 100}
                />
                <CircularProgress
                    color="success"
                    valueLabel={<div className="flex flex-col justify-center text-center">
                        <div className="text-xl">{`${percents.completed * 100}%`}</div>
                        <div className="text-md">Completed</div>
                    </div>}
                    showValueLabel
                    strokeWidth={2}
                    classNames={{
                        svg: "w-24 h-24 drop-shadow-md"
                    }}
                    value={percents.completed * 100}
                />
            </div>
        </div>
    );
};

type ProjectHeaderProps = Omit<BaseElementProps, "children"> & { project?: IProject, cards?: IPlaytestCard[], isLoading?: boolean, onEdit?: () => void, onDelete?: () => void };

const ProjectContent = ({ project, cards, isLoading = false }: ProjectContentProps) => {
    if (project?.draft) {
        return <ProjectContentDraft project={project} cards={cards} isLoading={isLoading}/>;
    }
    return (
        <CardGrid cards={cards} isLoading={!cards || isLoading} className="grid-cols-3 sm:grid-cols-4 gap-1 p-1">
            {(card) => (
                <Link key={card.code} href={`/project/${project?.number}/${card.number}`}>
                    <CardPreview
                        key={card.code}
                        card={renderPlaytestingCard(card)}
                        orientation="vertical"
                        rounded
                        className="transition-all"
                    />
                </Link>)}
        </CardGrid>
    );
};

type ProjectContentProps = { project?: IProject, cards?: IPlaytestCard[], isLoading?: boolean }
