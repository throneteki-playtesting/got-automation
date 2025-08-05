import { DefaultDeckLimit, Icons, JsonRenderableCard, PlotStats, Watermark } from "common/models/cards";
import { useMemo, useState } from "react";
import CardPreview from "../cardPreview";
import { ChallengeIconButtons, CostInput, FactionSelect, LoyalButton, PlotStatInputs, StrengthInput, TraitsInput, TypeSelect, UniqueButton, WatermarkInput } from "./components/editorComponents";
import AbilityTextEditor from "./components/abilityTextEditor";
import { Accordion, AccordionItem, Input, NumberInput, Textarea } from "@heroui/react";
import { DeepPartial } from "common/types";

const CardEditor = ({ card }: CardEditorProps) => {
    const [faction, setFaction] = useState(card?.faction);
    const [type, setType] = useState(card?.type);
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

    const showCommon = useMemo(() => !!type, [type]);
    const showUnique = useMemo(() => ["character", "attachment", "location"].includes(type ?? ""), [type]);
    const showCost = useMemo(() => ["character", "attachment", "location", "Event"].includes(type ?? ""), [type]);
    const showCharacterStats = useMemo(() => type === "character", [type]);
    const showPlotStats = useMemo(() => type === "plot", [type]);
    const showLoyalty = useMemo(() => type && faction && faction !== "neutral", [type, faction]);

    return (
        <div className="space-y-5 md:flex md:space-x-5">
            <div className="space-y-2">
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 md:flex-col lg:flex-row lg:min-w-98">
                    <FactionSelect value={faction} setValue={setFaction}/>
                    <TypeSelect value={type} setValue={setType} />
                </div>
                <div className="flex gap-1 items-center">
                    {showUnique && <UniqueButton value={unique} setValue={setUnique} />}
                    <Input label="Name" value={name ?? ""} onValueChange={setName}>
                        {name}
                    </Input>
                    {!showCost && showLoyalty && <LoyalButton value={loyal} setValue={setLoyal} />}
                    {!showLoyalty && showCost && <CostInput value={cost} setValue={setCost} />}
                </div>
                {
                    (showLoyalty && showCost) &&
                    <div className="flex gap-2 items-center">
                        <LoyalButton value={loyal} setValue={setLoyal} />
                        <CostInput value={cost} setValue={setCost} />
                    </div>
                }
                {
                    showCharacterStats &&
                    <div className="flex gap-2 items-center">
                        <ChallengeIconButtons value={icons} setValue={setIcons}/>
                        <StrengthInput value={strength} setValue={setStrength} />
                    </div>
                }
                {
                    showPlotStats &&
                    <PlotStatInputs value={plotStats} setValue={setPlotStats}/>
                }
                {
                    showCommon &&
                    <div className="flex flex-col">
                        <TraitsInput value={traits} setValue={setTraits} />
                        <AbilityTextEditor value={text} setValue={setText}/>
                    </div>
                }
            </div>
            <div className="flex justify-center">
                <CardPreview card={{
                    faction,
                    name,
                    type,
                    unique,
                    loyal,
                    traits,
                    cost,
                    strength,
                    plotStats: plotStats as PlotStats,
                    text,
                    flavor,
                    designer,
                    icons: icons as Icons,
                    watermark: watermark as Watermark,
                    deckLimit
                }}/>
            </div>
            {
                showCommon &&
                    <Accordion isCompact={true}>
                        <AccordionItem key="flavor" aria-label="Flavor Text" title="Flavor Text">
                            <Textarea aria-label="Flavor Text" value={flavor ?? ""} onValueChange={setFlavor}>
                                {flavor}
                            </Textarea>
                        </AccordionItem>
                        <AccordionItem key="designer" aria-label="Designer" title="Designer">
                            <Textarea value={designer ?? ""} onValueChange={setDesigner}>
                                {designer}
                            </Textarea>
                        </AccordionItem>
                        <AccordionItem key="watermark" aria-label="Watermark" title="Watermark">
                            <WatermarkInput value={watermark} setValue={setWatermark} />
                        </AccordionItem>
                        <AccordionItem key="decklimit" aria-label="Deck Limit" title={type === "plot" ? "Plot Deck Limit" : "Deck Limit"}>
                            <NumberInput value={deckLimit ?? DefaultDeckLimit[type!]} onValueChange={setDeckLimit} minValue={1} maxValue={DefaultDeckLimit[type!]} />
                        </AccordionItem>
                    </Accordion>
            }
        </div>
    );
};

// TODO: Implement "cannotEdit", so that you can only allow edits on valid values
type CardEditorProps = { card?: DeepPartial<JsonRenderableCard>, cannotEdit?: string[] }

export default CardEditor;