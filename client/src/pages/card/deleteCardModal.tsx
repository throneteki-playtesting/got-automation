import { addToast, Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { BaseElementProps } from "../../types";
import { IPlaytestCard } from "common/models/cards";
import { useDeleteDraftMutation } from "../../api";
import { useCallback } from "react";

const DeleteCardModal = ({ isOpen, card, onClose: onModalClose, onDelete }: DeleteCardModalProps) => {
    const [deleteDraft, { isLoading: isDeleting }] = useDeleteDraftMutation();

    const onSubmit = useCallback(async () => {
        if (!card) {
            return;
        }
        try {
            await deleteDraft(card).unwrap();
            if (onDelete) {
                onDelete(card);
            }

            addToast({ title: "Successfully deleted", color: "success", description: `'${card.name}' ver. ${card.version} has been deleted` });
        } catch (err) {
            // TODO: Better error handling from redux (eg. use ApiError.message for description)
            addToast({ title: "Failed to delete", color: "danger", description: "An unknown error has occurred" });
        }
    }, [card, deleteDraft, onDelete]);

    return <Modal isOpen={isOpen} placement="top-center" onOpenChange={(isOpen) => !isOpen && onModalClose && onModalClose() } size="sm">
        <ModalContent>
            {(onClose) => (
                <>
                    <ModalHeader>{`Delete draft version for ${card?.name}?`}</ModalHeader>
                    <ModalBody>This is permanent and cannot be undone.</ModalBody>
                    <ModalFooter>
                        <Button color="danger" isLoading={isDeleting} onPress={onSubmit}>Delete</Button>
                        <Button color="default" onPress={onClose}>Back</Button>
                    </ModalFooter>
                </>
            )}
        </ModalContent>
    </Modal>;
};

type DeleteCardModalProps = Omit<BaseElementProps, "children"> & { isOpen: boolean, card?: IPlaytestCard, onClose?: () => void, onDelete?: (card: IPlaytestCard) => void }

export default DeleteCardModal;