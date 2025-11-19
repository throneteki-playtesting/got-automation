import { ReactElement, useState } from "react";
import { CardSuggestion, Faction, Type } from "common/models/cards";
import { useDeleteSuggestionMutation, useGetSuggestionsQuery, useRenderImageMutation } from "../../api";
import FactionFilter from "../../components/filters/factionFilter";
import TypeFilter from "../../components/filters/typeFilter";
import { useFilters } from "../../api/hooks";
import UserFilter from "../../components/filters/userFilter";
import { Permission, User } from "common/models/user";
import EditSuggestionModal from "./editSuggestionModal";
import { addToast, Button, Spinner } from "@heroui/react";
import { DeepPartial, SingleOrArray } from "common/types";
import PermissionGate from "../../components/permissionGate";
import { hasPermission, renderCardSuggestion, ValidationStep } from "common/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileImage, faPencil, faX } from "@fortawesome/free-solid-svg-icons";
import TagFilter from "../../components/filters/tagFilter";
import classNames from "classnames";
import { download } from "../../utilities";
import CardGrid from "../../components/cardGrid";
import CardPreview from "@agot/card-preview";

const Suggestions = () => {
    const [editingCard, setEditingCard] = useState<DeepPartial<CardSuggestion>>();

    const [factions, setFactions] = useState<Faction[]>([]);
    const [types, setTypes] = useState<Type[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const filters = useFilters({ faction: factions, type: types, suggestedBy: users.map((user) => user.discordId), tags: tags.map((tag) => [tag]) });
    const { data: suggestions, isLoading, isError } = useGetSuggestionsQuery({ filter: filters });
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
    return (
        <div className="flex flex-col gap-2 lg:flex-row">
            <div className="flex flex-col gap-2 lg:w-98">
                <div className="flex gap-2">
                    <FactionFilter factions={factions} setFactions={setFactions}/>
                    <TypeFilter types={types} setTypes={setTypes}/>
                </div>
                <UserFilter label="Suggested By" users={users} setUsers={setUsers}/>
                <TagFilter label="Tags" tags={tags} setTags={setTags}/>
                <PermissionGate requires={Permission.MAKE_SUGGESTIONS}>
                    <Button size="sm" className="w-full" onPress={() => setEditingCard({})}>
                    Create Suggestion
                    </Button>
                </PermissionGate>
            </div>
            <CardGrid className="lg:grow" cards={suggestions ?? []} isLoading={isLoading} isError={isError} emptyContent={<div className="flex items-center">No suggestions found</div>}>
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
            <EditSuggestionModal card={editingCard} onOpenChange={() => setEditingCard(undefined)} onSave={() => setEditingCard(undefined)}/>
        </div>
    );
};

export default Suggestions;