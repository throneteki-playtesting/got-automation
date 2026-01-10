import { ReactElement, useState } from "react";
import { Faction, ICard, ICardSuggestion, Type } from "common/models/cards";
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
    const [editing, setEditing] = useState<DeepPartial<ICardSuggestion>>();

    // Filters
    const [factions, setFactions] = useState<Faction[]>([]);
    const [types, setTypes] = useState<Type[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const filters = useFilters({ faction: factions, type: types, user: users.map((user) => ({ discordId: user.discordId })), tags: tags.map((tag) => [tag]) });

    const [orderBy, setOrderBy] = useState<Sortable<ICard>>();

    const { data: suggestions, isLoading } = useGetSuggestionsQuery({ filter: filters, orderBy: { card: orderBy } });
    const [deleteSuggestion, { isLoading: isDeleting, originalArgs: deleting }] = useDeleteSuggestionMutation();
    const [renderImage, { isLoading: isRenderingImage, originalArgs: renderingImage }] = useRenderImageMutation();

    const isDeletingSuggestion = (suggestion: ICardSuggestion) => isDeleting && deleting?.id === suggestion.id;
    const isRenderingSuggestion = (suggestion: ICardSuggestion) => isRenderingImage && renderingImage?.key === suggestion.id;

    const canEdit = (user: User, suggestion: ICardSuggestion) => {
        return (hasPermission(user, Permission.MAKE_SUGGESTIONS) && user.discordId === suggestion.user.discordId)
            || hasPermission(user, Permission.EDIT_SUGGESTIONS);
    };
    const canDelete = (user: User, suggestion: ICardSuggestion) => {
        return (hasPermission(user, Permission.MAKE_SUGGESTIONS) && user.discordId === suggestion.user.discordId)
            || hasPermission(user, Permission.DELETE_SUGGESTIONS);
    };

    const onEdit = (suggestion: ICardSuggestion) => {
        setEditing(suggestion);
    };
    const onExportPNG = async (suggestion: ICardSuggestion) => {
        try {
            const cardRender = renderCardSuggestion(suggestion);
            const result = await renderImage(cardRender).unwrap();
            const filename = `${suggestion.id || crypto.randomUUID()}.png`;
            download(result, filename);
        } catch (err) {
            // TODO: Better error handling from redux (eg. use ApiError.message for description)
            addToast({ title: "Failed to download", color: "danger", description: "An unknown error has occurred" });
        }
    };
    const onDelete = async (suggestion: ICardSuggestion) => {
        try {
            await deleteSuggestion(suggestion).unwrap();
            addToast({ title: "Successfully deleted", color: "success", description: "Successfully deleted suggestion" });
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
            <div className='flex flex-col gap-2 flex-grow'>
                <div className="flex gap-1">
                    <PermissionGate requires={Permission.IMPORT_SUGGESTIONS}>
                        <Button size="sm" isIconOnly={true}>
                            <FontAwesomeIcon icon={faFileImport} />
                        </Button>
                    </PermissionGate>
                    <PermissionGate requires={Permission.MAKE_SUGGESTIONS}>
                        <Button className="grow" size="sm" onPress={() => setEditing({})}>
                        Create Suggestion
                        </Button>
                    </PermissionGate>
                    <PermissionGate requires={Permission.EXPORT_SUGGESTIONS}>
                        <Button size="sm" isIconOnly={true}>
                            <FontAwesomeIcon icon={faFileExport} />
                        </Button>
                    </PermissionGate>
                </div>
                <CardGrid cards={suggestions ?? []} isLoading={isLoading}>
                    {(suggestion) => (
                        <div key={suggestion.id} className="relative">
                            {isDeletingSuggestion(suggestion) && <div className="absolute right-0 w-full h-full z-2 flex justify-center items-center"><Spinner size="lg"/></div>}
                            <div className="absolute right-0 w-full h-full z-1 opacity-25 p-1 flex justify-end hover:opacity-90 transition-opacity gap-0.5">
                                <CardButton onPress={() => onEdit(suggestion)} requires={(user) => canEdit(user, suggestion)}>
                                    <FontAwesomeIcon icon={faPencil}/>
                                </CardButton>
                                <CardButton isLoading={isRenderingSuggestion(suggestion)} onPress={() => onExportPNG(suggestion)} requires={Permission.RENDER_CARDS}>
                                    <FontAwesomeIcon icon={faFileImage}/>
                                </CardButton>
                                <CardButton isLoading={isDeletingSuggestion(suggestion)} onPress={() => onDelete(suggestion)} requires={(user) => canDelete(user, suggestion)}>
                                    <FontAwesomeIcon icon={faX}/>
                                </CardButton>
                            </div>
                            <CardPreview
                                card={renderCardSuggestion(suggestion)}
                                orientation="vertical"
                                rounded={true}
                                className={classNames("relative transition-all", { "blur-xs": isDeletingSuggestion(suggestion) })}
                            />
                        </div>)}
                </CardGrid>
            </div>
            <EditSuggestionModal isOpen={!!editing} suggestion={editing} onClose={() => setEditing(undefined)} onSave={() => setEditing(undefined)}/>
        </div>
    );
};

export default Suggestions;