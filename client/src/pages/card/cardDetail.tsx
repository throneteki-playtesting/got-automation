import { useGetCardQuery, useGetProjectQuery, usePushCardsMutation } from "../../api/cardsApi";
import { Accordion, AccordionItem, addToast, Button, ButtonGroup, Select, SelectItem, Skeleton, Textarea } from "@heroui/react";
import classNames from "classnames";
import { BaseElementProps } from "../../types";
import CardStack from "../../components/cardPreview/cardStack";
import { useMemo, useState } from "react";
import CardEditor from "../../components/cardEditor";
import { JsonPlaytestingCard, JsonRenderableCard, NoteDetails, NoteType, noteTypes } from "common/models/cards";
import { DeepPartial } from "common/types";

const CardDetail = ({ className, style, project: projectNumber, number }: CardDetailProps) => {
    const { data: cards, ...cardsQuery } = useGetCardQuery({ project: projectNumber, number, latest: false });
    const { data: project, ...projectQuery } = useGetProjectQuery({ number: projectNumber });
    // const [collapsed, setCollapsed] = useState(false);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [draftCard, setDraftCard] = useState<DeepPartial<JsonRenderableCard>>();

    const latest = useMemo(() => cards ? cards[cards.length - 1] : undefined, [cards]);
    const stack = useMemo(() => {
        if (draftCard) {
            return [...cards ?? [], draftCard];
        }
        return cards;
    }, [cards, draftCard]);

    if (cardsQuery.error || projectQuery.error) {
        return <div className="w-full h-16 bg-default-50 text-center">
            An error has occured.
        </div>;
    }

    const onCreateNewVersion = () => {
        const card = { ...latest, watermark: { middle: "Draft" } };
        delete card.imageUrl;
        setDraftCard(card);
        setIsCreatingNew(true);
    };

    return (
        <div className={classNames("flex flex-wrap justify-center gap-5", { "h-64": cardsQuery.isLoading }, className)}>
            <Skeleton isLoaded={!cardsQuery.isLoading}>
                <CardStack
                    className={classNames("max-w-80", { "min-w-52": cardsQuery.isLoading })}
                    classNames={{
                        card: "select-none shadow-lg shadow-black"
                    }}
                    style={style}
                    // collapsed={collapsed}
                >
                    {stack}
                </CardStack>
            </Skeleton>
            <div className="flex flex-col gap-2 flex-1">
                <Skeleton isLoaded={!cardsQuery.isLoading && !projectQuery.isLoading}>
                    <h1 className="text-2xl"><strong>{latest?.name}</strong> {project?.code} #{latest?.code}</h1>
                </Skeleton>
                <Skeleton isLoaded={!cardsQuery.isLoading}>
                    {
                        !isCreatingNew
                        && (
                            <ButtonGroup>
                                {/* <Button onPress={() => setEditing({ mode: "edit", card: latest })}>Edit Latest</Button> */}
                                <Button onPress={onCreateNewVersion} isDisabled={!latest}>New Version</Button>
                            </ButtonGroup>
                        )
                    }
                    {
                        isCreatingNew && draftCard &&
                            <CreateNewVersion
                                card={draftCard}
                                onUpdate={(card) => setDraftCard(card)}
                                onSave={() => true}
                                onCancel={() => {
                                    setIsCreatingNew(false);
                                    setDraftCard(undefined);
                                }}
                            />
                    }
                </Skeleton>
            </div>
        </div>
    );
};

const CreateNewVersion = ({ className, style, card, onUpdate, onSave, onCancel }: CreateNewVersionProps) => {
    // const [card, setCard] = useState<DeepPartial<JsonPlaytestingCard & JsonRenderableCard>>(card);
    const [pushCardUpdate, pushCardsMutation] = usePushCardsMutation();
    const [noteType, setNoteType] = useState<NoteType>();
    const [noteText, setNoteText] = useState<string>();

    const onPressSave = async () => {
        // TODO: VALIDATE!!!!
        delete card.watermark;
        try {
            const response = await pushCardUpdate(card as JsonPlaytestingCard).unwrap();

        } catch (err) {
            addToast({ title: "Error", color: "danger", description: "There was an error!" });
        }
        onSave(card as JsonPlaytestingCard, { type: noteType, text: noteText } as NoteDetails);
    };

    return (
        <div className={classNames("flex flex-col gap-2", className)} style={style}>
            <h2>Create new version</h2>
            <p>
                When creating a new version of a card, you must edit it & provide appropriate change notes
            </p>
            <Accordion>
                <AccordionItem title="1. Card Details">
                    <CardEditor card={card} disable={["faction"]} hide={["watermark"]} onUpdate={onUpdate}/>
                </AccordionItem>
                <AccordionItem title="2. Change Notes">
                    <div className="flex flex-col gap-2">
                        <Select label="Type" isRequired={true} onChange={(e) => setNoteType(e.target.value as NoteType)}>
                            {noteTypes.filter((noteType) => noteType !== "implemented").map((noteType) =>
                                <SelectItem key={noteType}>
                                    {noteType}
                                </SelectItem>
                            )}
                        </Select>
                        {/* TODO: Update the below to rich text editor. Possibly move ability editor to more generic one which handles conversion between discord text & rich text */}
                        <Textarea isRequired={true} label="Notes" onChange={(e) => setNoteText(e.target.value)}/>
                    </div>
                </AccordionItem>
            </Accordion>
            <div className="flex gap-2 justify-center">
                <Button color="primary" onPress={onPressSave}>Save</Button>
                <Button color="secondary" onPress={onCancel}>Cancel</Button>
            </div>
        </div>
    );
};

type CreateNewVersionProps = Omit<BaseElementProps, "children"> & { card: DeepPartial<JsonRenderableCard>, onUpdate: (card: DeepPartial<JsonPlaytestingCard>) => void, onSave: (card: JsonPlaytestingCard, note: NoteDetails) => void, onCancel: () => void };

// const EditLatest = () => {

// };

type CardDetailProps = Omit<BaseElementProps, "children"> & { project: number, number: number };

export default CardDetail;