import { FactionCardCount } from "common/models/projects";
import { NumberInput } from "@heroui/react";
import { DeepPartial } from "common/types";
import { useEffect, useMemo, useState } from "react";
import { Faction } from "common/models/cards";
import { factionNames } from "common/utils";
import ThronesIcon from "../../components/thronesIcon";

const CardCountEditor = ({ cardCount: initial, onChange }: CardCountEditorProps) => {
    const [baratheon, setBaratheon] = useState<number>(0);
    const [greyjoy, setGreyjoy] = useState<number>(0);
    const [lannister, setLannister] = useState<number>(0);
    const [martell, setMartell] = useState<number>(0);
    const [thenightswatch, setTheNightsWatch] = useState<number>(0);
    const [stark, setStark] = useState<number>(0);
    const [targaryen, setTargaryen] = useState<number>(0);
    const [tyrell, setTyrell] = useState<number>(0);
    const [neutral, setNeutral] = useState<number>(0);

    useEffect(() => {
        const cardCount = {
            baratheon: initial?.baratheon ?? 0,
            greyjoy: initial?.greyjoy ?? 0,
            lannister: initial?.lannister ?? 0,
            martell: initial?.martell ?? 0,
            thenightswatch: initial?.thenightswatch ?? 0,
            stark: initial?.stark ?? 0,
            targaryen: initial?.targaryen ?? 0,
            tyrell: initial?.tyrell ?? 0,
            neutral: initial?.neutral ?? 0
        };
        setBaratheon(cardCount.baratheon);
        setGreyjoy(cardCount.greyjoy);
        setLannister(cardCount.lannister);
        setMartell(cardCount.martell);
        setTheNightsWatch(cardCount.thenightswatch);
        setStark(cardCount.stark);
        setTargaryen(cardCount.targaryen);
        setTyrell(cardCount.tyrell);
        setNeutral(cardCount.neutral);

        // Ensure initial is defaulting to 0's
        if (!initial) {
            onChange(cardCount);
        }
    }, [initial, onChange]);

    const countInput = (faction: Faction, value: number, setValue: (value: number) => void) =>
        <NumberInput
            key={faction}
            name={`cardCount.${faction}`}
            aria-label={factionNames[faction]}
            classNames={{ input: "text-center text-lg" }}
            startContent={<ThronesIcon name={faction}className="text-xl text-center"/>}
            minValue={0}
            value={value}
            onValueChange={(value) => {
                setValue(value);
                const current = {
                    baratheon,
                    greyjoy,
                    lannister,
                    martell,
                    thenightswatch,
                    stark,
                    targaryen,
                    tyrell,
                    neutral,
                    ... { [faction]: value }
                };
                current[faction] = value;
                onChange(current);
            }}
        />;

    const total = useMemo(() => baratheon + greyjoy + lannister + martell + thenightswatch + stark + targaryen + tyrell + neutral,
        [baratheon, greyjoy, lannister, martell, neutral, stark, targaryen, thenightswatch, tyrell]);
    return (
        <>
            <span className="text-xl">Card Counts</span>
            <div className="text-sm">Each faction must have their total number of cards defined before card selection.</div>
            <div className="text-xs italic font-bold">Warning: This cannot be adjusted after initial cards are confirmed!</div>
            <div className="grid grid-cols-3 gap-1">
                {countInput("baratheon", baratheon, setBaratheon)}
                {countInput("greyjoy", greyjoy, setGreyjoy)}
                {countInput("lannister", lannister, setLannister)}
                {countInput("martell", martell, setMartell)}
                {countInput("thenightswatch", thenightswatch, setTheNightsWatch)}
                {countInput("stark", stark, setStark)}
                {countInput("targaryen", targaryen, setTargaryen)}
                {countInput("tyrell", tyrell, setTyrell)}
                {countInput("neutral", neutral, setNeutral)}
            </div>
            <div className="text-lg font-bold bg-default-100 w-full text-center rounded-lg p-2">Total: {total}</div>
        </>
    );
};

type CardCountEditorProps = { cardCount?: DeepPartial<FactionCardCount>, onChange: (data: FactionCardCount) => void }

export default CardCountEditor;