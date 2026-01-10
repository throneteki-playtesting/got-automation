import { BreadcrumbItem, Breadcrumbs, Button, ButtonGroup, Skeleton, Spacer } from "@heroui/react";
import { BaseElementProps } from "../../types";
import { useCallback, useMemo, useState } from "react";
import { useGetCardQuery, useGetProjectQuery } from "../../api";
import CardVersionDetail from "./cardVersionDetail";
import CardCollection, { ICardVersionCollection } from "common/collections/cardCollection";
import { IPlaytestCard } from "common/models/cards";
import EditCardModal from "./editCardModal";
import { isPreview } from "common/utils";
import DeleteCardModal from "./deleteCardModal";
import { cloneDeep } from "lodash";

const CardDetail = ({ className, style, project: projectNumber, number }: CardDetailProps) => {
    const [editing, setEditing] = useState<IPlaytestCard>();
    const [deleting, setDeleting] = useState<IPlaytestCard>();

    const { data: cards, ...cardsQuery } = useGetCardQuery({ project: projectNumber, number, latest: false });
    const { data: project, ...projectQuery } = useGetProjectQuery({ number: projectNumber });

    const collection = useMemo(() => new CardCollection(cards ?? [])[number] as ICardVersionCollection<IPlaytestCard> | undefined, [cards, number]);

    const cardDetails = useCallback(() => {
        return collection?.all?.map((card) => {
            return (
                <Skeleton key={`${card.code}@${card.version}`} isLoaded={card && !!project}>
                    {card && project && <CardVersionDetail card={card} project={project} isLatest={card === collection.latest} isDraft={card === collection.draft} isPreview={isPreview(card)} onEdit={() => setEditing(card)} onDelete={() => setDeleting(card)}/>}
                </Skeleton>
            );
        });
    }, [collection?.all, collection?.draft, collection?.latest, project]);

    const onNewVersion = useCallback((latest: IPlaytestCard) => {
        const draft = cloneDeep(latest);
        delete draft.note;
        setEditing(draft);
    }, []);

    if (cardsQuery.error || projectQuery.error) {
        return <div className="w-full h-16 bg-default-50 text-center">
            Card or project fetching errored.
        </div>;
    }

    return (
        <>
            <div className={className} style={style}>
                <Breadcrumbs size="lg">
                    <BreadcrumbItem href={`/project/${projectNumber}`}>{project?.name}</BreadcrumbItem>
                    <BreadcrumbItem isCurrent>#{collection?.latest?.code}</BreadcrumbItem>
                </Breadcrumbs>
                <ButtonGroup>
                    {!collection?.draft && collection?.latest && <Button onPress={() => onNewVersion(collection.latest)}>New Version</Button>}
                </ButtonGroup>
                <Spacer/>
                <div className="flex flex-col-reverse gap-2">
                    {cardDetails()}
                </div>
            </div>
            <EditCardModal isOpen={!!editing} card={editing} onClose={() => setEditing(undefined)} onSave={() => setEditing(undefined)}/>
            <DeleteCardModal isOpen={!!deleting} card={deleting} onClose={() => setDeleting(undefined)} onDelete={() => setDeleting(undefined)}/>
        </>
    );
};

type CardDetailProps = Omit<BaseElementProps, "children"> & { project: number, number: number };

export default CardDetail;