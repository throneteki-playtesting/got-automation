import { useState } from "react";
import CardEditor from "../../components/cardEditor";
import CardPreview from "../../components/cardPreview";
import { RenderableCard } from "common/models/cards";
import { DeepPartial } from "common/types";

const Suggestions = () => {
    const [card, setCard] = useState({} as DeepPartial<RenderableCard>);


    return (
        <div className="flex flex-col gap-5 md:flex-row">
            <CardEditor card={card} onUpdate={(card) => setCard(card)} />
            <div className="flex sticky items-center md:items-start min-w-1/2">
                <CardPreview card={card}/>
            </div>
        </div>
    );
};

export default Suggestions;