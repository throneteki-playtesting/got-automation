import { ReactElement, useState } from "react";
import { CardSuggestion, Faction, Type } from "common/models/cards";
import { useDeleteSuggestionMutation, useGetSuggestionsQuery, useRenderImageMutation } from "../../api";
import FactionFilter from "../../components/data/factionFilter";
import TypeFilter from "../../components/data/typeFilter";
import { useFilters } from "../../api/hooks";
import UserFilter from "../../components/data/userFilter";
import { Permission, User } from "common/models/user";
import EditSuggestionModal from "./editSuggestionModal";
import { Accordion, AccordionItem, addToast, Badge, Button, Spinner } from "@heroui/react";
import { DeepPartial, SingleOrArray, Sortable } from "common/types";
import PermissionGate from "../../components/permissionGate";
import { hasPermission, renderCardSuggestion, ValidationStep } from "common/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileExport, faFileImage, faFileImport, faPencil, faX } from "@fortawesome/free-solid-svg-icons";
import TagFilter from "../../components/data/tagFilter";
import classNames from "classnames";
import { download } from "../../utilities";
import CardGrid from "../../components/cardGrid";
import CardPreview from "@agot/card-preview";
import OrderBySelector from "../../components/data/orderBy";

const SortOptions = {
    "name": "Name",
    "faction": "Faction",
    "type": "Card Type",
    "cost": "Cost"
};

const Suggestions = () => {
    const [editingCard, setEditingCard] = useState<DeepPartial<CardSuggestion>>();

    // Filters
    const [factions, setFactions] = useState<Faction[]>([]);
    const [types, setTypes] = useState<Type[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const filters = useFilters({ faction: factions, type: types, suggestedBy: users.map((user) => user.discordId), tags: tags.map((tag) => [tag]) });

    const [orderBy, setOrderBy] = useState<Sortable<CardSuggestion>>();

    const { data: suggestions, isLoading, isError } = useGetSuggestionsQuery({ filter: filters, orderBy });
    const [deleteSuggestion, { isLoading: isDeleting, originalArgs: deleting }] = useDeleteSuggestionMutation();
    const [renderImage, { isLoading: isRenderingImage, originalArgs: renderingImage }] = useRenderImageMutation();

    const isDeletingCard = (card: CardSuggestion) => isDeleting && deleting?.id === card.id;
    const isRenderingCard = (card: CardSuggestion) => isRenderingImage && renderingImage?.key === card.id;

    const canEdit = (user: User, card: CardSuggestion) => {
        return (hasPermission(user, Permission.MAKE_SUGGESTIONS) && user.discordId === card.suggestedBy)
            || hasPermission(user, Permission.EDIT_SUGGESTIONS);
    };
    const canDelete = (user: User, card: CardSuggestion) => {
        return (hasPermission(user, Permission.MAKE_SUGGESTIONS) && user.discordId === card.suggestedBy)
            || hasPermission(user, Permission.DELETE_SUGGESTIONS);
    };

    const onEdit = (card: CardSuggestion) => {
        setEditingCard(card);
    };
    const onExportPNG = async (card: CardSuggestion) => {
        try {
            const cardRender = renderCardSuggestion(card);
            const result = await renderImage(cardRender).unwrap();
            const filename = `${card.id || crypto.randomUUID()}.png`;
            download(result, filename);
        } catch (err) {
            // TODO: Better error handling from redux (eg. use ApiError.message for description)
            addToast({ title: "Failed to download", color: "danger", description: "An unknown error has occurred" });
        }
    };
    const onDelete = async (card: CardSuggestion) => {
        try {
            await deleteSuggestion(card).unwrap();
            addToast({ title: "Successfully deleted", color: "success", description: `Successfully deleted ${card.name}` });
        } catch (err) {
            // TODO: Better error handling from redux (eg. use ApiError.message for description)
            addToast({ title: "Failed to delete", color: "danger", description: "An unknown error has occurred" });
        }
    };

    const CardButton = ({ isLoading, children, onPress, requires }: { isLoading?: boolean, children: ReactElement, onPress: () => void, requires?: SingleOrArray<ValidationStep> }) => {
        return (
            <PermissionGate requires={requires}>
                <Button isLoading={isLoading} isIconOnly={true} radius="full" variant="faded" size="sm" onPress={onPress}>
                    {children}
                </Button>
            </PermissionGate>
        );
    };
    const filterTitle = () => {
        const totalFilters = factions.length + types.length + users.length + tags.length;
        return (
            <Badge content={totalFilters} color="danger" isInvisible={totalFilters === 0}>
                Filters
            </Badge>
        );
    };
    return (
        <div className="flex flex-col gap-2 lg:flex-row">
            <div className="flex flex-col gap-2 lg:w-98">
                <Accordion>
                    <AccordionItem title={filterTitle()}>
                        <div className="flex flex-col gap-2">
                            <div className="flex lg:flex-col gap-2">
                                <FactionFilter factions={factions} setFactions={setFactions}/>
                                <TypeFilter types={types} setTypes={setTypes}/>
                            </div>
                            <UserFilter label="Suggested By" users={users} setUsers={setUsers}/>
                            <TagFilter label="Tags" tags={tags} setTags={setTags}/>
                        </div>
                    </AccordionItem>
                    <AccordionItem title={"Order By"}>
                        <OrderBySelector options={SortOptions} orderBy={orderBy} setOrderBy={setOrderBy}/>
                    </AccordionItem>
                </Accordion>
            </div>
            <div className='flex flex-col gap-2'>
                <div className="flex gap-1">
                    <PermissionGate requires={Permission.IMPORT_SUGGESTIONS}>
                        <Button size="sm" isIconOnly={true}>
                            <FontAwesomeIcon icon={faFileImport} />
                        </Button>
                    </PermissionGate>
                    <PermissionGate requires={Permission.MAKE_SUGGESTIONS}>
                        <Button className="grow" size="sm" onPress={() => setEditingCard({})}>
                        Create Suggestion
                        </Button>
                    </PermissionGate>
                    <PermissionGate requires={Permission.EXPORT_SUGGESTIONS}>
                        <Button size="sm" isIconOnly={true}>
                            <FontAwesomeIcon icon={faFileExport} />
                        </Button>
                    </PermissionGate>
                </div>
                <CardGrid cards={suggestions ?? []} isLoading={isLoading} isError={isError} emptyContent={"No suggestions found"}>
                    {(card) => (
                        <div key={card.id} className="relative">
                            {isDeletingCard(card) && <div className="absolute right-0 w-full h-full z-2 flex justify-center items-center"><Spinner size="lg"/></div>}
                            <div className="absolute right-0 w-full h-full z-1 opacity-25 p-1 flex justify-end hover:opacity-90 transition-opacity gap-0.5">
                                <CardButton onPress={() => onEdit(card)} requires={(user) => canEdit(user, card)}>
                                    <FontAwesomeIcon icon={faPencil}/>
                                </CardButton>
                                <CardButton isLoading={isRenderingCard(card)} onPress={() => onExportPNG(card)} requires={Permission.RENDER_CARDS}>
                                    <FontAwesomeIcon icon={faFileImage}/>
                                </CardButton>
                                <CardButton isLoading={isDeletingCard(card)} onPress={() => onDelete(card)} requires={(user) => canDelete(user, card)}>
                                    <FontAwesomeIcon icon={faX}/>
                                </CardButton>
                            </div>
                            <CardPreview
                                card={renderCardSuggestion(card)}
                                orientation="vertical"
                                rounded={true}
                                className={classNames("relative transition-all", { "blur-xs": isDeletingCard(card) })}
                            />
                        </div>)}
                </CardGrid>
            </div>
            <EditSuggestionModal card={editingCard} onOpenChange={() => setEditingCard(undefined)} onSave={() => setEditingCard(undefined)}/>
        </div>
    );
};

export default Suggestions;