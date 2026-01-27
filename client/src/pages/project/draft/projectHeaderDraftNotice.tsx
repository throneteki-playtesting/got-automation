import { addToast, Button, Card, Divider, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";
import { Permission } from "common/models/user";
import PermissionGate from "../../../components/permissionGate";
import { IPlaytestCard } from "common/models/cards";
import { IProject } from "common/models/projects";
import { BaseElementProps } from "../../../types";
import { useCallback, useMemo, useState } from "react";
import { useInitialiseProjectMutation } from "../../../api";
import classNames from "classnames";

const ProjectHeaderDraftNotice = ({ className, style, project, cards }: ProjectHeaderDraftNoticeProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [initialiseProject, { isLoading: isInitialising }] = useInitialiseProjectMutation();

    const canInitialise = useMemo(() => {
        if (!project || !project.draft || !cards) {
            return false;
        }

        const totalSlots = Object.values(project.cardCount).reduce((arr, num) => arr + num, 0);
        return totalSlots === cards.length;
    }, [cards, project]);

    const onSubmit = useCallback(async () => {
        try {
            await initialiseProject(project).unwrap();
            setIsModalOpen(false);
            addToast({ title: "Successfully initialised", color: "success", description: `${project.name} has been initialised` });
        } catch (err) {
            // TODO: Better error handling from redux (eg. use ApiError.message for description)
            addToast({ title: "Failed to delete", color: "danger", description: "An unknown error has occurred" });
        }
    }, [initialiseProject, project]);

    return (
        <Card className={classNames("p-2 bg-secondary-100 rounded-lg md:rounded-xl mt-2", className)} style={style}>
            <span className="font-bold text-sm md:text-md lg:text-lg">Draft Mode</span>
            <span className="text-xs md:text-sm lg:text-md italic">Project is in an experimental phase where the it can be freely edited or reset as we finalize the initial concept. Once moved to Active status, the card designs are locked into their first official versions and any future changes will be formally tracked.</span>
            <PermissionGate requires={Permission.INITIALISE_PROJECTS}>
                <Divider className="my-2"/>
                <Button variant="flat" className="w-full md:text-lg font-bold" onPress={() => setIsModalOpen(true)}>Initialise</Button>
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="lg" placement="top-center">
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader>Initialise Project?</ModalHeader>
                                <ModalBody>
                                    <span className="text-sm">Project will become "Active", which prevents further changes to card counts & locks all chosen cards into their first official versions.</span>
                                    <span className="text-sm">It will officially lock this project into playtesting, and is generally a good time to announce it to the community.</span>
                                    {canInitialise
                                        ? <span>Would you like to continue?</span>
                                        : <span className="p-2 bg-red-500 rounded-lg md:rounded-xl text-sm animate-pulse">You cannot initialise a project without filling all available card slots. Either add cards to all missing slots, or edit project card counts!</span>
                                    }
                                </ModalBody>
                                <ModalFooter>
                                    <Button onPress={onClose}>Cancel</Button>
                                    <Button color="primary" isDisabled={!canInitialise} onPress={onSubmit} isLoading={isInitialising}>Initialise</Button>
                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                </Modal>
            </PermissionGate>
        </Card>
    );
};

type ProjectHeaderDraftNoticeProps = Omit<BaseElementProps, "children"> & { project: IProject, cards: IPlaytestCard[] }

export default ProjectHeaderDraftNotice;