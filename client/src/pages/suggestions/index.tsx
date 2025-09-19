import { useState } from "react";
import { CardSuggestion, Faction, Type } from "common/models/cards";
import { useDeleteSuggestionMutation, useGetSuggestionsQuery } from "../../api";
import CardGrid from "../../components/cardPreview/cardGrid";
import FactionFilter from "../../components/filters/factionFilter";
import TypeFilter from "../../components/filters/typeFilter";
import { useFilters } from "../../api/hooks";
import UserFilter from "../../components/filters/userFilter";
import { Permission, User } from "common/models/user";
import EditSuggestionModal from "./editSuggestionModal";
import { addToast, Button, Spinner } from "@heroui/react";
import { DeepPartial } from "common/types";
import PermissionGate from "../../components/permissionGate";
import { hasPermission, renderCardSuggestion } from "common/utils";
import CardPreview from "../../components/cardPreview";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faX } from "@fortawesome/free-solid-svg-icons";
import TagFilter from "../../components/filters/tagFilter";
import classNames from "classnames";

const Suggestions = () => {
    const [editingCard, setEditingCard] = useState<DeepPartial<CardSuggestion>>();

    const [factions, setFactions] = useState<Faction[]>([]);
    const [types, setTypes] = useState<Type[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [tags, setTags] = useState<string[]>([]);
    const filters = useFilters({ faction: factions, type: types, suggestedBy: users.map((user) => user.discordId), tags: tags.map((tag) => [tag]) });
    const { data: suggestions, isLoading, isError } = useGetSuggestionsQuery({ filter: filters });
    const [deleteSuggestion, { isLoading: isDeleting, originalArgs: deleting }] = useDeleteSuggestionMutation();

    const isDeletingCard = (card: CardSuggestion) => isDeleting && deleting?.id === card.id;

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
    const onDelete = async (card: CardSuggestion) => {
        try {
            await deleteSuggestion(card).unwrap();
            addToast({ title: "Successfully deleted", color: "success", description: `Successfully deleted ${card.name}` });
        } catch (err) {
            // TODO: Better error handling from redux (eg. use ApiError.message for description)
            addToast({ title: "Failed to delete", color: "danger", description: "An unknown error has occurred" });
        }
    };
    return (
        <div className="space-y-2">
            <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                    <FactionFilter factions={factions} setFactions={setFactions}/>
                    <TypeFilter types={types} setTypes={setTypes}/>
                </div>
                <UserFilter label="Suggested By" users={users} setUsers={setUsers}/>
                <TagFilter label="Tags" tags={tags} setTags={setTags}/>
            </div>
            <PermissionGate requires={Permission.MAKE_SUGGESTIONS}>
                <Button size="sm" className="w-full" onPress={() => setEditingCard({})}>
                    Create Suggestion
                </Button>
            </PermissionGate>
            <CardGrid cards={suggestions ?? []} isLoading={isLoading} isError={isError} emptyContent={<div className="flex items-center">No suggestions have been made!</div>}>
                {(card) => (
                    <div className="relative">
                        {isDeletingCard(card) && <div className="absolute right-0 w-full h-full z-2 flex justify-center items-center"><Spinner size="lg"/></div>}
                        <div className="absolute right-0 w-full h-full z-1 opacity-25 p-1 flex justify-end hover:opacity-90 transition-opacity gap-0.5">
                            <PermissionGate requires={(user) => canEdit(user, card)}>
                                <Button isIconOnly={true} radius="full" variant="faded" size="sm" onPress={() => onEdit(card)}>
                                    <FontAwesomeIcon icon={faPencil}/>
                                </Button>
                            </PermissionGate>
                            <PermissionGate requires={(user) => canDelete(user, card)}>
                                <Button isIconOnly={true} radius="full" variant="faded" size="sm" onPress={() => onDelete(card)}>
                                    <FontAwesomeIcon icon={faX}/>
                                </Button>
                            </PermissionGate>
                        </div>
                        <CardPreview
                            key={card.id}
                            card={renderCardSuggestion(card)}
                            orientation="vertical"
                            rounded={true}
                            className={classNames("relative transition-all", { "blur-sm": isDeletingCard(card) })}
                        />
                    </div>)}
            </CardGrid>
            <EditSuggestionModal card={editingCard} onOpenChange={() => setEditingCard(undefined)} onSave={() => setEditingCard(undefined)}/>
        </div>
    );
};

export default Suggestions;