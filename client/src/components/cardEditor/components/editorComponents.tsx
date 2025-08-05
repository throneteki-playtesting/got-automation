import { Autocomplete, AutocompleteItem, Button, ButtonGroup, Input, Select, SelectItem, Textarea } from "@heroui/react";
import ThronesIcon from "../../thronesIcon";
import { factionNames, typeNames } from "common/utils";
import { Cost as CostType, Strength as StrengthType, factions, Faction as FactionType, JsonCard, types, Type as TypeType, Icons as IconsType, PlotStats as PlotStatsType, PlotValue as PlotValueType, Watermark as WatermarkType } from "common/models/cards";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import classNames from "classnames";
import { BaseElementProps } from "../../../types";
import { DeepPartial } from "common/types";

type CustomSetterProps<T> = Omit<BaseElementProps, "children"> & { card?: DeepPartial<JsonCard>, value?: T, setValue: Dispatch<SetStateAction<T | undefined>> };

export const FactionSelect = ({ className, style, value: faction, setValue: setFaction }: CustomSetterProps<FactionType>) => {
    return (
        <Select className={className} style={style} label="Faction" startContent={faction && <ThronesIcon name={faction}/>} selectedKeys={faction ? [faction] : []} onChange={(e) => setFaction(e.target.value as FactionType)}>
            {factions.map((faction) =>
                <SelectItem key={faction} startContent={<ThronesIcon name={faction}/>}>
                    {factionNames[faction]}
                </SelectItem>)}
        </Select>
    );
};

export const TypeSelect = ({ className, style, value: type, setValue: setType }: CustomSetterProps<TypeType>) => {
    return (
        <Select className={className} style={style} label="Type" startContent={type && <ThronesIcon name={type}/>} selectedKeys = {type ? [type] : []} onChange={(e) => setType(e.target.value as TypeType)}>
            {types.map((type) =>
                <SelectItem key={type} startContent={<ThronesIcon name={type}/>}>
                    {typeNames[type]}
                </SelectItem>
            )}
        </Select>
    );
};

export const UniqueButton = ({ value: unique, setValue: setUnique }: CustomSetterProps<boolean>) => {
    return (
        <Button size="lg" isIconOnly={true} onPress={() => setUnique(!unique)}>
            <ThronesIcon className={classNames({ "text-default-50": !unique })} name="unique"/>
        </Button>
    );
};

export const LoyalButton = ({ value: loyal, setValue: setLoyal }: CustomSetterProps<boolean>) => {
    return (
        <Button size="lg" onPress={() => setLoyal(!loyal)}>
            <span className={classNames({ "text-default-50": !loyal })}>Loyal</span>
        </Button>
    );
};

export const CostInput = ({ value: cost, setValue }: CustomSetterProps<CostType>) => {
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
        <Autocomplete label="Cost" isClearable={false} allowsEmptyCollection={false} inputValue={cost?.toString() ?? ""} onValueChange={setCost} onSelectionChange={(value) => setCost(value as string)}>
            {["X", "-"].map((value) => <AutocompleteItem key={value}>{value}</AutocompleteItem>)}
        </Autocomplete>
    );
};

export const ChallengeIconButtons = ({ value: challengeIcons, setValue: setChallengeIcons }: CustomSetterProps<Partial<IconsType>>) => {
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
        <ButtonGroup size="lg">
            <Button isIconOnly={true} onPress={() => setMilitary(!military)}>
                <ThronesIcon className={classNames({ "text-default-50": !military })} name="military" />
            </Button>
            <Button isIconOnly={true} onPress={() => setIntrigue(!intrigue)}>
                <ThronesIcon className={classNames({ "text-default-50": !intrigue })} name="intrigue" />
            </Button>
            <Button isIconOnly={true} onPress={() => setPower(!power)}>
                <ThronesIcon className={classNames({ "text-default-50": !power })} name="power" />
            </Button>
        </ButtonGroup>
    );
};

export const StrengthInput = ({ value: strength, setValue }: CustomSetterProps<StrengthType>) => {
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
        <Autocomplete label="Strength" isClearable={false} allowsEmptyCollection={false} inputValue={strength?.toString() ?? ""} onValueChange={setStrength} onSelectionChange={(value) => setStrength(value as string)}>
            {<AutocompleteItem key="X">{"X"}</AutocompleteItem>}
        </Autocomplete>
    );
};

// TODO: Create combobox instead of regular input
export const TraitsInput = ({ value: traits, setValue: setTraits }: CustomSetterProps<Partial<string[]>>) => {
    const [traitsString, setTraitsString] = useState(traits?.join());
    return (
        <Input label="Traits" description="Separate traits with full stops" value={traitsString ?? ""} onChange={(e) => {
            setTraitsString(e.target.value);
            setTraits(e.target.value.split(".").map((t) => t.trim()).filter(t => t));
        }}>
            {traitsString}
        </Input>
    );
};

export const FlavorInput = ({ value: flavor, setValue: setFlavor }: CustomSetterProps<string>) => {
    return (
        <Input label="Flavor" value={flavor ?? ""} onValueChange={setFlavor}>
            {flavor}
        </Input>
    );
};

export const WatermarkInput = ({ value: watermark, setValue: setWatermark }: CustomSetterProps<Partial<WatermarkType>>) => {
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
        <Textarea value={value} rows={3} onValueChange={setValue}>
            {value}
        </Textarea>
    );
};

export const PlotStatInputs = ({ value: plotStats, setValue: setPlotStats }: CustomSetterProps<Partial<PlotStatsType>>) => {
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
        <div className="grid grid-cols-2 gap-2">
            <Autocomplete label="Income" isClearable={false} allowsEmptyCollection={false} inputValue={income?.toString() ?? ""} onValueChange={(value) => setPlotValue(value, setIncome)} onSelectionChange={(value) => setPlotValue(value as string, setIncome)}>
                {<AutocompleteItem key="X">{"X"}</AutocompleteItem>}
            </Autocomplete>
            <Autocomplete label="Initiative" isClearable={false} allowsEmptyCollection={false} inputValue={initiative?.toString() ?? ""} onValueChange={(value) => setPlotValue(value, setInitiative)} onSelectionChange={(value) => setPlotValue(value as string, setInitiative)}>
                {<AutocompleteItem key="X">{"X"}</AutocompleteItem>}
            </Autocomplete>
            <Autocomplete label="Claim" isClearable={false} allowsEmptyCollection={false} inputValue={claim?.toString() ?? ""} onValueChange={(value) => setPlotValue(value, setClaim)} onSelectionChange={(value) => setPlotValue(value as string, setClaim)}>
                {<AutocompleteItem key="X">{"X"}</AutocompleteItem>}
            </Autocomplete>
            <Autocomplete label="Reserve" isClearable={false} allowsEmptyCollection={false} inputValue={reserve?.toString() ?? ""} onValueChange={(value) => setPlotValue(value, setReserve)} onSelectionChange={(value) => setPlotValue(value as string, setReserve)}>
                {<AutocompleteItem key="X">{"X"}</AutocompleteItem>}
            </Autocomplete>
        </div>
    );
};