import { Autocomplete, AutocompleteItem, Button, ButtonGroup, Input, Select, SelectItem, Textarea } from "@heroui/react";
import ThronesIcon from "../../thronesIcon";
import { factionNames, typeNames } from "common/utils";
import { Cost as CostType, Strength as StrengthType, factions, Faction as FactionType, types, Type as TypeType, Icons as IconsType, PlotStats as PlotStatsType, PlotValue as PlotValueType, Watermark as WatermarkType } from "common/models/cards";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import classNames from "classnames";
import { BaseElementProps } from "../../../types";

type CustomSetterProps<T> = Omit<BaseElementProps, "children"> & { value?: T, setValue: Dispatch<SetStateAction<T | undefined>>, isDisabled?: boolean };

export const FactionSelect = ({ className, style, value: faction, setValue: setFaction, isDisabled }: CustomSetterProps<FactionType>) => {
    return (
        <Select className={className} style={style} label="Faction" startContent={faction && <ThronesIcon name={faction}/>} selectedKeys={faction ? [faction] : []} onChange={(e) => setFaction(e.target.value as FactionType)} isDisabled={isDisabled}>
            {factions.map((faction) =>
                <SelectItem key={faction} startContent={<ThronesIcon name={faction}/>}>
                    {factionNames[faction]}
                </SelectItem>)}
        </Select>
    );
};

export const TypeSelect = ({ className, style, value: type, setValue: setType, isDisabled }: CustomSetterProps<TypeType>) => {
    return (
        <Select className={className} style={style} label="Type" startContent={type && <ThronesIcon name={type}/>} selectedKeys = {type ? [type] : []} onChange={(e) => setType(e.target.value as TypeType)} isDisabled={isDisabled}>
            {types.map((type) =>
                <SelectItem key={type} startContent={<ThronesIcon name={type}/>}>
                    {typeNames[type]}
                </SelectItem>
            )}
        </Select>
    );
};

export const UniqueButton = ({ className, style, value: unique, setValue: setUnique, isDisabled }: CustomSetterProps<boolean>) => {
    return (
        <Button className={classNames("w-14 h-14", { "text-default-50": !unique }, className)} style={style} isIconOnly={true} size="lg" radius="none" onPress={() => setUnique(!unique)} isDisabled={isDisabled}>
            <ThronesIcon name="unique"/>
        </Button>
    );
};

export const LoyalButton = ({ className, style, value: loyal, setValue: setLoyal, isDisabled }: CustomSetterProps<boolean>) => {
    return (
        <Button className={classNames("w-14 h-14", { "text-default-50": !loyal }, className)} style={style} size="lg" onPress={() => setLoyal(!loyal)} isDisabled={isDisabled}>
            Loyal
        </Button>
    );
};

export const CostInput = ({ className, style, value: cost, setValue, isDisabled }: CustomSetterProps<CostType>) => {
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
        <Autocomplete className={className} style={style} label="Cost" isClearable={false} allowsEmptyCollection={false} inputValue={cost?.toString() ?? ""} onValueChange={setCost} onSelectionChange={(value) => setCost(value as string)} isDisabled={isDisabled}>
            {["X", "-"].map((value) => <AutocompleteItem key={value}>{value}</AutocompleteItem>)}
        </Autocomplete>
    );
};

export const ChallengeIconButtons = ({ className, style, value: challengeIcons, setValue: setChallengeIcons, isDisabled }: CustomSetterProps<Partial<IconsType>>) => {
    const [military, setMilitary] = useState(challengeIcons?.military);
    const [intrigue, setIntrigue] = useState(challengeIcons?.intrigue);
    const [power, setPower] = useState(challengeIcons?.power);

    useEffect(() => {
        setChallengeIcons({
            military,
            intrigue,
            power
        });
    }, [military, intrigue, power, setChallengeIcons]);
    return (
        <ButtonGroup className={className} style={style} size="lg" isDisabled={isDisabled}>
            <Button className={classNames("w-14 h-14", { "text-default-50": !military }, className)} isIconOnly={true} onPress={() => setMilitary(!military)}>
                <ThronesIcon name="military" />
            </Button>
            <Button className={classNames("w-14 h-14", { "text-default-50": !intrigue }, className)} isIconOnly={true} onPress={() => setIntrigue(!intrigue)}>
                <ThronesIcon name="intrigue" />
            </Button>
            <Button className={classNames("w-14 h-14", { "text-default-50": !power }, className)} isIconOnly={true} onPress={() => setPower(!power)}>
                <ThronesIcon name="power" />
            </Button>
        </ButtonGroup>
    );
};

export const StrengthInput = ({ className, style, value: strength, setValue, isDisabled }: CustomSetterProps<StrengthType>) => {
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
        <Autocomplete className={className} style={style} label="Strength" isClearable={false} allowsEmptyCollection={false} inputValue={strength?.toString() ?? ""} onValueChange={setStrength} onSelectionChange={(value) => setStrength(value as string)} isDisabled={isDisabled}>
            {<AutocompleteItem key="X">{"X"}</AutocompleteItem>}
        </Autocomplete>
    );
};

// TODO: Create combobox instead of regular input
export const TraitsInput = ({ className, style, value: traits, setValue: setTraits, isDisabled }: CustomSetterProps<Partial<string[]>>) => {
    const [traitsString, setTraitsString] = useState(traits?.map((trait) => `${trait}.`).join(" "));
    return (
        <Input className={className} style={style} label="Traits" description="Separate traits with full stops" value={traitsString ?? ""} onChange={(e) => {
            setTraitsString(e.target.value);
            setTraits(e.target.value.split(".").map((t) => t.trim()).filter(t => t));
        }}
        isDisabled={isDisabled}
        >
            {traitsString}
        </Input>
    );
};

export const FlavorInput = ({ className, style, value: flavor, setValue: setFlavor, isDisabled }: CustomSetterProps<string>) => {
    return (
        <Input className={className} style={style} label="Flavor" value={flavor ?? ""} onValueChange={setFlavor} isDisabled={isDisabled}>
            {flavor}
        </Input>
    );
};

export const WatermarkInput = ({ className, style, value: watermark, setValue: setWatermark, isDisabled }: CustomSetterProps<Partial<WatermarkType>>) => {
    const [value, setValue] = useState(Object.values(watermark ?? {}).join("\n"));

    useEffect(() => {
        const rows = value.split("\n");
        setWatermark({
            top: rows[0],
            middle: rows[1],
            bottom: rows[2]
        });
    }, [setWatermark, value]);

    return (
        <Textarea label="Watermark" description="Each line edits top, middle & bottom text" className={className} style={style} value={value} rows={3} onValueChange={setValue} isDisabled={isDisabled}>
            {value}
        </Textarea>
    );
};

export const PlotStatInputs = ({ className, style, value: plotStats, setValue: setPlotStats, isDisabled }: CustomSetterProps<Partial<PlotStatsType>>) => {
    const [income, setIncome] = useState(plotStats?.income);
    const [initiative, setInitiative] = useState(plotStats?.initiative);
    const [claim, setClaim] = useState(plotStats?.claim);
    const [reserve, setReserve] = useState(plotStats?.reserve);

    useEffect(() => {
        setPlotStats({
            income,
            initiative,
            claim,
            reserve
        });
    }, [setPlotStats, income, initiative, claim, reserve]);

    const setPlotValue = (value: string, setValue: Dispatch<SetStateAction<PlotValueType | undefined>>) => {
        let statValue: PlotValueType | undefined = undefined;
        if (value?.toUpperCase().startsWith("X")) {
            statValue = "X";
        } else {
            const asNumber = parseInt(value);
            if (!isNaN(asNumber)) {
                statValue = asNumber;
            }
        }
        setValue(statValue);
    };
    return (
        <div className={classNames("grid grid-cols-2 gap-2", className)} style={style}>
            <Autocomplete label="Income" isClearable={false} allowsEmptyCollection={false} inputValue={income?.toString() ?? ""} onValueChange={(value) => setPlotValue(value, setIncome)} onSelectionChange={(value) => setPlotValue(value as string, setIncome)} isDisabled={isDisabled}>
                {<AutocompleteItem key="X">{"X"}</AutocompleteItem>}
            </Autocomplete>
            <Autocomplete label="Initiative" isClearable={false} allowsEmptyCollection={false} inputValue={initiative?.toString() ?? ""} onValueChange={(value) => setPlotValue(value, setInitiative)} onSelectionChange={(value) => setPlotValue(value as string, setInitiative)} isDisabled={isDisabled}>
                {<AutocompleteItem key="X">{"X"}</AutocompleteItem>}
            </Autocomplete>
            <Autocomplete label="Claim" isClearable={false} allowsEmptyCollection={false} inputValue={claim?.toString() ?? ""} onValueChange={(value) => setPlotValue(value, setClaim)} onSelectionChange={(value) => setPlotValue(value as string, setClaim)} isDisabled={isDisabled}>
                {<AutocompleteItem key="X">{"X"}</AutocompleteItem>}
            </Autocomplete>
            <Autocomplete label="Reserve" isClearable={false} allowsEmptyCollection={false} inputValue={reserve?.toString() ?? ""} onValueChange={(value) => setPlotValue(value, setReserve)} onSelectionChange={(value) => setPlotValue(value as string, setReserve)} isDisabled={isDisabled}>
                {<AutocompleteItem key="X">{"X"}</AutocompleteItem>}
            </Autocomplete>
        </div>
    );
};