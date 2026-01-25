import { CardBlank } from "@agot/card-preview";
import { hasPermission, thronesColors } from "common/utils";
import { Button, Tooltip } from "@heroui/react";
import { Code, Faction } from "common/models/cards";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAddressCard, faCirclePlus, faStarOfLife } from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames";
import { Permission } from "common/models/user";
import { memo, ReactNode, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../api/store";

const EmptyCardSlot = memo(({ code, faction, onNew = () => true, onSuggestion = () => true }: EmptyCardSlotProps) => {
    const [isActive, setIsActive] = useState(false);
    const { user } = useSelector((state: RootState) => state.auth);

    const overlay = useMemo(() => {
        const actions: { title: string, icon: ReactNode, onPress: () => void }[] = [];
        if (hasPermission(user, Permission.CREATE_CARDS)) {
            actions.push({
                title: "Create new card",
                icon: <FontAwesomeIcon icon={faStarOfLife}/>,
                onPress: onNew
            });
        }
        if (hasPermission(user, Permission.READ_SUGGESTIONS)) {
            actions.push({
                title: "Choose suggestion",
                icon: <FontAwesomeIcon icon={faAddressCard}/>,
                onPress: onSuggestion
            });
        }
        if (actions.length === 0) {
            return null;
        }
        //const radius = 35;
        return (
            <>
                <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    radius="full"
                    className={classNames("absolute transition-all duration-500 ease-soft-spring cursor-pointer", { "text-2xl rotate-45": isActive, "text-5xl": !isActive })}
                    onPress={() => setIsActive(!isActive)}
                >
                    <FontAwesomeIcon icon={faCirclePlus} />
                </Button>
                {actions.map((item, index, arr) => {
                    const angle = (index * 2 * Math.PI) / arr.length;

                    return (
                        <div
                            key={index}
                            className="absolute transition-all duration-500 ease-soft-spring [--radius:30px] md:[--radius:50px] lg:[--radius:70px]"
                            style={{
                                transform: isActive
                                    ? `translate(calc(${Math.cos(angle)} * var(--radius)), calc(${Math.sin(angle)} * var(--radius)))`
                                    : "translate(0, 0)",
                                opacity: isActive ? 1 : 0
                            }}
                        >
                            <Tooltip content={item.title} placement="top">
                                <Button
                                    isIconOnly
                                    radius="full"
                                    variant="flat"
                                    color="primary"
                                    size="sm"
                                    className="shadow-sm"
                                    onPress={() => {
                                        item.onPress();
                                    }}
                                >
                                    {item.icon}
                                </Button>
                            </Tooltip>
                        </div>
                    );
                })}
            </>
        );
    }, [isActive, onNew, onSuggestion, user]);
    return (
        <div key={code} className="relative">
            <CardBlank
                className={classNames({ "transition-all duration-200 ease-in-out hover:brightness-150": overlay && !isActive, "brightness-150": isActive })}
                rounded
                classNames={{ inner:"flex flex-col justify-center items-center border-12 bg-default-100 brightness-50" }}
                styles={{ inner: { borderColor: thronesColors[faction] } }}
                onClick={() => overlay && setIsActive(false)}
            />
            <div className="absolute inset-0 flex items-center justify-center">{overlay}</div>
        </div>
    );
});

type EmptyCardSlotProps = { code: Code, faction: Faction, onNew?: () => void, onSuggestion?: () => void }

export default EmptyCardSlot;