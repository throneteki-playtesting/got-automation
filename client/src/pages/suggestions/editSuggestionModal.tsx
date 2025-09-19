import { CardSuggestion } from "common/models/cards";
import { BaseElementProps } from "../../types";
import { addToast, Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { useSubmitSuggestionMutation, useUpdateSuggestionMutation } from "../../api";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DeepPartial } from "common/types";
import { useSelector } from "react-redux";
import { RootState } from "../../api/store";
import CardEditor, { CardEditorRef } from "../../components/cardEditor";
import ComboBox from "../../components/combobox";

const EditSuggestionModal = ({ card: initialCard, onOpenChange, onSave: onSuggestionSave }: EditSuggestionModalProps) => {
    const user = useSelector((state: RootState) => state.auth.user);
    const [submitSuggestion, { isLoading: isSubmitting }] = useSubmitSuggestionMutation();
    const [updateSuggestion, { isLoading: isUpdating }] = useUpdateSuggestionMutation();
    const editorRef = useRef<CardEditorRef>(null);
    const [tags, setTags] = useState<string[]>([]);

    useEffect(() => setTags(initialCard?.tags || []), [initialCard]);

    const isNew = useMemo(() => !initialCard?.id, [initialCard?.id]);

    const onSubmit = useCallback(async () => {
        if (!user || !editorRef.current) {
            return;
        }

        const card = editorRef.current.getCard();
        if (editorRef.current.validate(card)) {
            // CardSuggestion does not have code
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { code, ...props } = card;
            const suggestion: CardSuggestion = {
                ...props,
                suggestedBy: user.discordId,
                created: new Date().toUTCString(),
                updated: new Date().toUTCString(),
                likedBy: [],
                tags
            };
            try {

                await submitSuggestion(suggestion).unwrap();
                if (onSuggestionSave) {
                    onSuggestionSave();
                }
                addToast({ title: "Successfully submitted", color: "success", description: `'${suggestion.name}' has been added to suggestions` });
            } catch (err) {
            // TODO: Better error handling from redux (eg. use ApiError.message for description)
                addToast({ title: "Failed to submit", color: "danger", description: "An unknown error has occurred" });
            }
        }
    }, [onSuggestionSave, submitSuggestion, tags, user]);

    const onUpdate = useCallback(async () => {
        if (!user || !editorRef.current) {
            return;
        }

        const card = editorRef.current.getCard();
        if (editorRef.current.validate(card)) {
            // CardSuggestion does not have code
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { code, ...props } = card;
            const suggestion: CardSuggestion = {
                ...props,
                suggestedBy: user.discordId,
                created: new Date().toUTCString(),
                updated: new Date().toUTCString(),
                likedBy: [],
                tags
            };
            try {

                await updateSuggestion(suggestion).unwrap();
                if (onSuggestionSave) {
                    onSuggestionSave();
                }
                addToast({ title: "Successfully updated", color: "success", description: `'${suggestion.name}' has been updated` });
            } catch (err) {
            // TODO: Better error handling from redux (eg. use ApiError.message for description)
                addToast({ title: "Failed to submit", color: "danger", description: "An unknown error has occurred" });
            }
        }
    }, [onSuggestionSave, tags, updateSuggestion, user]);

    const title = useMemo(() => isNew ? "New suggestion" : `Edit ${initialCard?.name}`, [initialCard?.name, isNew]);

    return <Modal isOpen={!!initialCard} placement="top-center" onOpenChange={onOpenChange}>
        <ModalContent>
            {(onClose) => (
                <>
                    <ModalHeader>{title}</ModalHeader>
                    <ModalBody className="spacing-x-2">
                        <CardEditor ref={editorRef} card={{ code: "00000", ...initialCard }}/>
                        <ComboBox label="Tags" values={tags} onChange={setTags} chip={{ color: "primary", size: "sm" }}/>
                    </ModalBody>
                    <ModalFooter>
                        <Button color="danger" variant="flat" onPress={onClose}>
                            Cancel
                        </Button>
                        {isNew ?
                            <Button color="primary" isLoading={isSubmitting} onPress={onSubmit}>
                                Submit
                            </Button> :
                            <Button color="primary" isLoading={isUpdating} onPress={onUpdate}>
                                Save
                            </Button>
                        }

                    </ModalFooter>
                </>
            )}
        </ModalContent>
    </Modal>;
};

type EditSuggestionModalProps = Omit<BaseElementProps, "children"> & { card?: DeepPartial<CardSuggestion>, onOpenChange: ((isOpen?: boolean) => void), onSave?: () => void }

export default EditSuggestionModal;