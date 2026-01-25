import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { ReactNode } from "react";
import { BaseElementProps } from "../types";

const ConfirmModal = ({ isOpen, isLoading = false, title, content, confirmContent = "Confirm", cancelContent = "Cancel", onClose: onModalClose = () => true, onConfirm = () => true }: ConfirmModalProps) => {
    return <Modal isOpen={isOpen} placement="center" onOpenChange={(isOpen) => !isOpen && onModalClose() } size="sm">
        <ModalContent>
            {(onClose) => (
                <>
                    <ModalHeader>{title}</ModalHeader>
                    <ModalBody>{content}</ModalBody>
                    <ModalFooter>
                        <Button color="danger" isLoading={isLoading} onPress={onConfirm}>{confirmContent}</Button>
                        <Button color="default" onPress={onClose}>{cancelContent}</Button>
                    </ModalFooter>
                </>
            )}
        </ModalContent>
    </Modal>;
};

type ConfirmModalProps = Omit<BaseElementProps, "children"> & { isOpen: boolean, isLoading?: boolean, title?: ReactNode, content?: ReactNode, confirmContent?: ReactNode, cancelContent?: ReactNode, onClose?: () => void, onConfirm?: () => void }

export default ConfirmModal;