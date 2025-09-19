import { Autocomplete, AutocompleteItem, Button, ButtonGroup, Input, Select, SelectItem } from "@heroui/react";
import ThronesIcon from "../../thronesIcon";
import { factionNames, typeNames } from "common/utils";
import { Cost as CostType, Strength as StrengthType, factions, Faction as FactionType, types, Type as TypeType, Icons as IconsType, PlotStats as PlotStatsType, PlotValue as PlotValueType } from "common/models/cards";
import { Dispatch, SetStateAction } from "react";
import classNames from "classnames";
import { BaseElementProps } from "../../../types";
import ComboBox from "../../combobox";
import { DeepPartial } from "common/types";

type CustomSetterProps<T> = Omit<BaseElementProps, "children"> & { value?: T, setValue: Dispatch<SetStateAction<T | undefined>>, isDisabled?: boolean, errorMessage?: string };

export const FactionSelect = ({ className, style, value: faction, setValue: setFaction, isDisabled, errorMessage }: CustomSetterProps<FactionType>) => {
    return (
        <Select className={className} style={style} label="Faction" startContent={faction && <ThronesIcon name={faction}/>} selectedKeys={faction ? [faction] : []} onChange={(e) => setFaction(e.target.value as FactionType)} isDisabled={isDisabled} errorMessage={errorMessage} isInvalid={!!errorMessage}>
            {factions.map((faction) =>
                <SelectItem key={faction} startContent={<ThronesIcon name={faction}/>}>
                    {factionNames[faction]}
                </SelectItem>)}
        </Select>
    );
};

export const TypeSelect = ({ className, style, value: type, setValue: setType, isDisabled, errorMessage }: CustomSetterProps<TypeType>) => {
    return (
        <Select className={className} style={style} label="Type" startContent={type && <ThronesIcon name={type}/>} selectedKeys = {type ? [type] : []} onChange={(e) => setType(e.target.value as TypeType)} isDisabled={isDisabled} errorMessage={errorMessage} isInvalid={!!errorMessage}>
            {types.map((type) =>
                <SelectItem key={type} startContent={<ThronesIcon name={type}/>}>
                    {typeNames[type]}
                </SelectItem>
            )}
        </Select>
    );
};

export const UniqueButton = ({ className, style, value: unique, setValue: setUnique, isDisabled }: Omit<CustomSetterProps<boolean>, "errorMessage">) => {
    return (
        <Button className={classNames("w-14 h-14", { "text-default-50": !unique }, className)} style={style} isIconOnly={true} size="lg" radius="none" onPress={() => setUnique(!unique)} isDisabled={isDisabled}>
            <ThronesIcon name="unique"/>
        </Button>
    );
};

export const LoyalButton = ({ className, style, value: loyal, setValue: setLoyal, isDisabled }: Omit<CustomSetterProps<boolean>, "errorMessage">) => {
    return (
        <Button className={classNames("w-14 h-14", { "text-default-50": !loyal }, className)} style={style} size="lg" onPress={() => setLoyal(!loyal)} isDisabled={isDisabled}>
            Loyal
        </Button>
    );
};

export const CostInput = ({ className, style, value: cost, setValue, isDisabled, errorMessage }: CustomSetterProps<CostType>) => {
    const setCost = (value: string) => {
        let cost: CostType | undefined = undefined;
        if (value?.toUpperCase().startsWith("X")) {
            cost = "X";
        } else if (value?.startsWith("-")) {
            cost = "-";
        } else {
            const asNumber = parseInt(value);
            if (!isNaN(asNumber)) {
                cost = asNumber;
            }
        }
        setValue(cost);
    };
    return (
        <Autocomplete className={className} style={style} label="Cost" isClearable={false} allowsEmptyCollection={false} inputValue={cost?.toString() ?? ""} onValueChange={setCost} onSelectionChange={(value) => setCost(value as string)} isDisabled={isDisabled} errorMessage={errorMessage} isInvalid={!!errorMessage}>
            {["X", "-"].map((value) => <AutocompleteItem key={value}>{value}</AutocompleteItem>)}
        </Autocomplete>
    );
};

export const ChallengeIconButtons = ({ className, style, value: challengeIcons = {}, setValue: setChallengeIcons, isDisabled }: Omit<CustomSetterProps<DeepPartial<IconsType>>, "errorMessage">) => {
    const toggleIcon = (icon: keyof IconsType) => {
        const current = challengeIcons[icon] ?? false;
        challengeIcons[icon] = !current;
        setChallengeIcons(challengeIcons);
    };
    return (
        <ButtonGroup className={className} style={style} size="lg" isDisabled={isDisabled}>
            <Button className={classNames("w-14 h-14", { "text-default-50": !challengeIcons?.military }, className)} isIconOnly={true} onPress={() => toggleIcon("military")}>
                <ThronesIcon name="military" />
            </Button>
            <Button className={classNames("w-14 h-14", { "text-default-50": !challengeIcons?.intrigue }, className)} isIconOnly={true} onPress={() => toggleIcon("intrigue")}>
                <ThronesIcon name="intrigue" />
            </Button>
            <Button className={classNames("w-14 h-14", { "text-default-50": !challengeIcons?.power }, className)} isIconOnly={true} onPress={() => toggleIcon("power")}>
                <ThronesIcon name="power" />
            </Button>
        </ButtonGroup>
    );
};

export const StrengthInput = ({ className, style, value: strength, setValue, isDisabled, errorMessage }: CustomSetterProps<StrengthType>) => {
    const setStrength = (value: string) => {
        let strength: StrengthType | undefined = undefined;
        if (value?.toUpperCase().startsWith("X")) {
            strength = "X";
        } else {
            const asNumber = parseInt(value);
            if (!isNaN(asNumber)) {
                strength = asNumber;
            }
        }
        setValue(strength);
    };

    return (
        <Autocomplete className={className} style={style} label="Strength" isClearable={false} allowsEmptyCollection={false} inputValue={strength?.toString() ?? ""} onValueChange={setStrength} onSelectionChange={(value) => setStrength(value as string)} isDisabled={isDisabled} errorMessage={errorMessage} isInvalid={!!errorMessage}>
            {<AutocompleteItem key="X">{"X"}</AutocompleteItem>}
        </Autocomplete>
    );
};

export const TraitsInput = ({ className, style, value: traits, setValue: setTraits, isDisabled, errorMessage }: CustomSetterProps<string[]>) => {
    return (
        <ComboBox className={className} style={style} label="Traits" values={traits} placeholder="Type and press enter" onChange={setTraits} isDisabled={isDisabled} errorMessage={errorMessage} chip={{ color: "primary" }}/>
    );
};

export const FlavorInput = ({ className, style, value: flavor, setValue: setFlavor, isDisabled, errorMessage }: CustomSetterProps<string>) => {
    return (
        <Input className={className} style={style} label="Flavor" value={flavor ?? ""} onValueChange={setFlavor} isDisabled={isDisabled} errorMessage={errorMessage} isInvalid={!!errorMessage}>
            {flavor}
        </Input>
    );
};

export const PlotStatInputs = ({ className, style, value: plotStats, setValue: setPlotStats, isDisabled, errorMessages }: Omit<CustomSetterProps<DeepPartial<PlotStatsType>>, "errorMessage"> & { errorMessages?: { [K in keyof PlotStatsType]?: string } }) => {
    const setValue = (type: keyof PlotStatsType, value: string) => {
        let statValue: PlotValueType | undefined = undefined;
        if (value?.toUpperCase().startsWith("X")) {
            statValue = "X";
        } else {
            const asNumber = parseInt(value);
            if (!isNaN(asNumber)) {
                statValue = asNumber;
            }
        }
        setPlotStats({ ...plotStats, [type]: statValue });
    };
    return (
        <div className={classNames("grid grid-cols-2 gap-2", className)} style={style}>
            <Autocomplete label="Income" isClearable={false} allowsEmptyCollection={false} inputValue={plotStats?.income?.toString() ?? ""} onValueChange={(value) => setValue("income", value)} isDisabled={isDisabled} errorMessage={errorMessages?.income} isInvalid={!!errorMessages?.income}>
                {<AutocompleteItem key="X">{"X"}</AutocompleteItem>}
            </Autocomplete>
            <Autocomplete label="Initiative" isClearable={false} allowsEmptyCollection={false} inputValue={plotStats?.initiative?.toString() ?? ""} onValueChange={(value) => setValue("initiative", value)} isDisabled={isDisabled} errorMessage={errorMessages?.initiative} isInvalid={!!errorMessages?.initiative}>
                {<AutocompleteItem key="X">{"X"}</AutocompleteItem>}
            </Autocomplete>
            <Autocomplete label="Claim" isClearable={false} allowsEmptyCollection={false} inputValue={plotStats?.claim?.toString() ?? ""} onValueChange={(value) => setValue("claim", value)} isDisabled={isDisabled} errorMessage={errorMessages?.claim} isInvalid={!!errorMessages?.claim}>
                {<AutocompleteItem key="X">{"X"}</AutocompleteItem>}
            </Autocomplete>
            <Autocomplete label="Reserve" isClearable={false} allowsEmptyCollection={false} inputValue={plotStats?.reserve?.toString() ?? ""} onValueChange={(value) => setValue("reserve", value)} isDisabled={isDisabled} errorMessage={errorMessages?.reserve} isInvalid={!!errorMessages?.reserve}>
                {<AutocompleteItem key="X">{"X"}</AutocompleteItem>}
            </Autocomplete>
        </div>
    );
};