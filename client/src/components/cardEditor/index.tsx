import { Card, DefaultDeckLimit, PlotStats } from "common/models/cards";
import { Ref, useCallback, useEffect, useImperativeHandle, useState } from "react";
import { ChallengeIconButtons, CostInput, FactionSelect, LoyalButton, PlotStatInputs, StrengthInput, TraitsInput, TypeSelect, UniqueButton } from "./components/editorComponents";
import AbilityTextEditor from "./components/abilityEditor";
import { Accordion, AccordionItem, Input, NumberInput, Textarea } from "@heroui/react";
import { DeepPartial } from "common/types";
import { BaseElementProps } from "../../types";
import classNames from "classnames";
import * as Schema from "common/models/schemas";

const defaultVisibility: VisibilityOptions = { type: true, faction: true };

const CardEditor = ({ ref, className, style, card: initialCard = {}, inputOptions = {}, onUpdate = () => true }: CardEditorProps) => {
    const [card, setCard] = useState<DeepPartial<Card>>(initialCard);
    const [errors, setErrors] = useState<ErrorOptions>({});
    const [visibility, setVisibility] = useState<VisibilityOptions>(defaultVisibility);

    const isDisabled = useCallback((name: keyof Card) => inputOptions[name] === "disabled", [inputOptions]);
    const isVisible = useCallback((...names: (keyof Card)[]) => names.some((name) => visibility[name] && inputOptions[name] !== "hidden"), [inputOptions, visibility]);

    const validate = (partial: DeepPartial<Card>): partial is Card => {
        const { error } = Schema.Card.Full.validate(partial, { abortEarly: false, allowUnknown: true });
        if (!error) {
            setErrors({});
            return true;
        }

        const newErrors: ErrorOptions = {};
        for (const detail of error.details) {
            const name = detail.path.join(".") as keyof ValidatableCard;
            newErrors[name] = detail.message;
        }
        setErrors(newErrors);
        return false;
    };

    useImperativeHandle(ref, () => ({
        validate,
        getCard: () => card
    }));

    const applyDefaults = (card: DeepPartial<Card>) => {
        const defaults: DeepPartial<Card> = {};
        if (card.type === "character") {
            defaults.icons = {
                military: card.icons?.military ?? false,
                intrigue: card.icons?.intrigue ?? false,
                power: card.icons?.power ?? false
            };
        } else {
            delete card.icons;
        }
        if (["character", "attachment", "location"].includes(card.type ?? "")) {
            defaults.unique = card.unique ?? false;
        } else {
            delete card.unique;
        }

        if (card.faction && card.faction !== "neutral") {
            defaults.loyal = card.loyal ?? false;
        } else {
            delete card.loyal;
        }

        return { ...card, ...defaults };
    };

    const handleChange = (field: keyof Card, value: unknown) => {
        const updated = applyDefaults({ ...card, [field]: value });
        setCard(updated);
        if (field in errors) {
            delete errors[field as keyof ErrorOptions];
        }
        onUpdate(updated);
    };

    // Update visibility
    useEffect(() => {
        const updated = { ...defaultVisibility };
        if (card.type) {
            updated.name = true;
            updated.traits = true;
            updated.text = true;
            updated.flavor = true;
            updated.designer = true;
            updated.deckLimit = true;

            switch (card.type) {
                case "character":
                    updated.icons = true;
                    updated.strength = true;
                case "attachment":
                case "location":
                    updated.unique = true;
                case "event":
                    updated.cost = true;
                    break;
                case "plot":
                    updated.plotStats = true;
            }

            if (card.faction && card.faction !== "neutral") {
                updated.loyal = true;
            }
        }
        setVisibility(updated);
    }, [card.faction, card.type]);

    return (
        <div className={classNames("space-y-2", className)} style={style}>
            <div className="flex flex-col gap-2 sm:flex-row md:flex-col lg:flex-row lg:min-w-98">
                {isVisible("type") && <TypeSelect className="basis-1/3" value={card.type} setValue={(value) => handleChange("type", value)} isDisabled={isDisabled("type")} errorMessage={errors.type}/>}
                <div className="flex gap-1 grow">
                    {isVisible("faction") && <FactionSelect value={card.faction} setValue={(value) => handleChange("faction", value)} isDisabled={isDisabled("faction")} errorMessage={errors.faction}/>}
                    {isVisible("loyal") && <LoyalButton value={card.loyal} setValue={(value) => handleChange("loyal", value)} isDisabled={isDisabled("loyal")}/>}
                </div>
            </div>
            <div className="flex gap-1 items-center">
                {isVisible("cost") && <CostInput className="max-w-24" value={card.cost} setValue={(value) => handleChange("cost", value)} isDisabled={isDisabled("cost")} errorMessage={errors.cost}/>}
                <div className="grow flex overflow-hidden">
                    {isVisible("unique") && <UniqueButton className="rounded-l-xl" value={card.unique} setValue={(value) => handleChange("unique", value)} isDisabled={isDisabled("unique")}/>}
                    {isVisible("name") && <Input className="grow" classNames={{ inputWrapper: isVisible("unique") ? "rounded-r-xl" : "rounded-xl" }} radius="none" label="Name" value={card.name ?? ""} onValueChange={(value) => handleChange("name", value)} isDisabled={isDisabled("name")} errorMessage={errors.name} isInvalid={!!errors.name}>
                        {card.name}
                    </Input>}
                </div>
            </div>
            {
                isVisible("strength", "icons") &&
                    <div className="flex gap-1 items-center">
                        {isVisible("strength") && <StrengthInput value={card.strength} setValue={(value) => handleChange("strength", value)} isDisabled={isDisabled("strength")} errorMessage={errors.strength}/>}
                        {isVisible("icons") && <ChallengeIconButtons value={card.icons} setValue={(value) => handleChange("icons", value)} isDisabled={isDisabled("icons")}/>}
                    </div>
            }
            {
                isVisible("plotStats") && <PlotStatInputs value={card.plotStats} setValue={(value) => handleChange("plotStats", value)} isDisabled={isDisabled("plotStats")} errorMessages={errors.plotStats}/>
            }
            {
                isVisible("traits", "text") &&
                    <div className="flex flex-col space-y-2">
                        {isVisible("traits") && <TraitsInput value={card.traits} setValue={(value) => handleChange("traits", value)} isDisabled={isDisabled("traits")} errorMessage={errors.traits}/>}
                        {isVisible("text") && <AbilityTextEditor value={card.text} setValue={(value) => handleChange("text", value)} isDisabled={isDisabled("text")} errorMessage={errors.text}/>}
                    </div>
            }
            {
                isVisible("flavor", "designer", "deckLimit") &&
                    <Accordion isCompact={true}>
                        <AccordionItem key="additional" aria-label="Additional Options" title="Additional Options">
                            <div className="space-y-2">
                                {isVisible("flavor") && <Textarea label="Flavor Text" value={card.flavor ?? ""} onValueChange={(value) => handleChange("flavor", value)} isDisabled={isDisabled("flavor")} errorMessage={errors.flavor}>
                                    {card.flavor}
                                </Textarea>}
                                {isVisible("designer") && <Textarea label="Designer" value={card.designer ?? ""} onValueChange={(value) => handleChange("designer", value)} isDisabled={isDisabled("designer")} errorMessage={errors.designer}>
                                    {card.designer}
                                </Textarea>}
                                {isVisible("deckLimit") && <NumberInput label="Deck Limit" value={card.deckLimit ?? DefaultDeckLimit[card.type!]} onValueChange={(value) => handleChange("deckLimit", value)} minValue={1} maxValue={DefaultDeckLimit[card.type!]} isDisabled={isDisabled("deckLimit")} errorMessage={errors.deckLimit}/>}
                            </div>
                        </AccordionItem>
                    </Accordion>
            }
        </div>
    );
};

export type CardEditorRef = {
    validate: (card: DeepPartial<Card>) => card is Card,
    getCard: () => DeepPartial<Card>
}
type CardEditorProps = Omit<BaseElementProps, "children"> & { ref: Ref<CardEditorRef>, card?: DeepPartial<Card>, onUpdate?: (card: DeepPartial<Card>) => void, inputOptions?: InputOptions }
type InputOptions = { [K in keyof Card]?: "disabled" | "hidden" };

// Note: Exclude all "button" inputs, and expand plotStat values
type ValidatableCard = Omit<Card, "loyal" | "unique" | "icons">
type ErrorOptions = Omit<{ [K in keyof ValidatableCard]?: string }, "plotStats"> & { plotStats?: { [K in keyof PlotStats]?: string } };

type VisibilityOptions = { [K in keyof Card]?: boolean }

export default CardEditor;