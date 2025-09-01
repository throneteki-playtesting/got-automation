import { DefaultDeckLimit, RenderableCard } from "common/models/cards";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChallengeIconButtons, CostInput, FactionSelect, LoyalButton, PlotStatInputs, StrengthInput, TraitsInput, TypeSelect, UniqueButton, WatermarkInput } from "./components/editorComponents";
import AbilityTextEditor from "./components/abilityEditor";
import { Accordion, AccordionItem, Input, NumberInput, Textarea } from "@heroui/react";
import { DeepPartial } from "common/types";
import { BaseElementProps } from "../../types";
import classNames from "classnames";

const CardEditor = ({ className, style, card, disable = [], hide = [], onUpdate = () => true }: CardEditorProps) => {
    const [type, setType] = useState(card?.type);
    const [faction, setFaction] = useState(card?.faction);
    const [unique, setUnique] = useState(card?.unique);
    const [name, setName] = useState(card?.name);
    const [loyal, setLoyal] = useState(card?.loyal);
    const [cost, setCost] = useState(card?.cost);
    const [icons, setIcons] = useState(card?.icons);
    const [strength, setStrength] = useState(card?.strength);
    const [plotStats, setPlotStats] = useState(card?.plotStats);
    const [traits, setTraits] = useState(card?.traits);
    const [text, setText] = useState(card?.text);
    const [flavor, setFlavor] = useState(card?.flavor);
    const [designer, setDesigner] = useState(card?.designer);
    const [deckLimit, setDeckLimit] = useState(card?.deckLimit);
    const [watermark, setWatermark] = useState(card?.watermark);

    const isDisabled = useCallback((name: string) => disable.includes(name.toLowerCase()), [disable]);
    const isHidden = useCallback((name: string) => hide.includes(name.toLowerCase()), [hide]);

    const showCommon = useMemo(() => !!type, [type]);
    const showUnique = useMemo(() => ["character", "attachment", "location"].includes(type ?? ""), [type]);
    const showCost = useMemo(() => ["character", "attachment", "location", "event"].includes(type ?? ""), [type]);
    const showCharacterStats = useMemo(() => type === "character", [type]);
    const showPlotStats = useMemo(() => type === "plot", [type]);
    const showLoyalty = useMemo(() => type && faction && faction !== "neutral", [type, faction]);

    useEffect(() => {
        const updated = {
            ...card,
            faction,
            name,
            type,
            unique,
            loyal,
            traits,
            cost,
            strength,
            plotStats,
            text,
            flavor,
            designer,
            icons,
            watermark,
            deckLimit
        } as DeepPartial<RenderableCard>;

        onUpdate(updated);
    // Note: updating on "onUpdate" changing is causing useEffect loop :(
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cost, deckLimit, designer, faction, flavor, icons, loyal, name, plotStats, strength, text, traits, type, unique, watermark]);

    return (
        <div className={classNames("space-y-2", className)} style={style}>
            <div className="flex flex-col gap-2 sm:flex-row md:flex-col lg:flex-row lg:min-w-98">
                <TypeSelect className="basis-1/3" value={type} setValue={setType} isDisabled={isDisabled("type")}/>
                <div className="flex gap-1 grow">
                    <FactionSelect value={faction} setValue={setFaction} isDisabled={isDisabled("faction")}/>
                    {showLoyalty && <LoyalButton value={loyal} setValue={setLoyal} />}
                </div>
            </div>
            <div className="flex gap-1 items-center">
                {showCost && <CostInput className="max-w-24" value={cost} setValue={setCost} isDisabled={isDisabled("cost")}/>}
                <div className="grow flex rounded-xl overflow-hidden">
                    {showUnique && <UniqueButton value={unique} setValue={setUnique} isDisabled={isDisabled("unique")}/>}
                    {showCommon && <Input className="grow" radius="none" label="Name" value={name ?? ""} onValueChange={setName} isDisabled={isDisabled("name")}>
                        {name}
                    </Input>}
                </div>
            </div>
            {
                showCharacterStats &&
                    <div className="flex gap-1 items-center">
                        <StrengthInput value={strength} setValue={setStrength} isDisabled={isDisabled("strength")}/>
                        <ChallengeIconButtons value={icons} setValue={setIcons} isDisabled={isDisabled("icons")}/>
                    </div>
            }
            {
                showPlotStats &&
                    <PlotStatInputs value={plotStats} setValue={setPlotStats} isDisabled={isDisabled("plotStats")}/>
            }
            {
                showCommon &&
                    <div className="flex flex-col">
                        <TraitsInput value={traits} setValue={setTraits} isDisabled={isDisabled("traits")}/>
                        <AbilityTextEditor value={text} setValue={setText} isDisabled={isDisabled("text")}/>
                    </div>
            }
            {
                showCommon &&
                    <Accordion isCompact={true}>
                        <AccordionItem key="additional" aria-label="Additional Options" title="Additional Options">
                            <div className="space-y-2">
                                <Textarea label="Flavor Text" value={flavor ?? ""} onValueChange={setFlavor} isDisabled={isDisabled("flavor")}>
                                    {flavor}
                                </Textarea>
                                <Textarea label="Designer" value={designer ?? ""} onValueChange={setDesigner} isDisabled={isDisabled("designer")}>
                                    {designer}
                                </Textarea>
                                <NumberInput label="Deck Limit" value={deckLimit ?? DefaultDeckLimit[type!]} onValueChange={setDeckLimit} minValue={1} maxValue={DefaultDeckLimit[type!]} isDisabled={isDisabled("deckLimit")}/>
                                {!isHidden("watermark") && <WatermarkInput value={watermark} setValue={setWatermark} isDisabled={isDisabled("watermark")}/>}
                            </div>
                        </AccordionItem>
                    </Accordion>
            }
        </div>
    );
};

// TODO: Implement "cannotEdit", so that you can only allow edits on valid values
type CardEditorProps = Omit<BaseElementProps, "children"> & { card?: DeepPartial<RenderableCard>, disable?: string[], hide?: string[], onUpdate?: (card: DeepPartial<RenderableCard>) => void }

export default CardEditor;