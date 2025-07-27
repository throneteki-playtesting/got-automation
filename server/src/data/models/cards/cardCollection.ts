import * as Ver from "semver";
import PlaytestingCard from "./playtestingCard";
import { SemanticVersion } from "common/utils";
import { JsonPlaytestingCard } from "common/models/cards";

/**
 * An ordered collection of cards, split into latest, playtesting, and draft cards
 *
 * Iterating through CardCollection will iterate through the latest cards
 */
class CardCollection implements CardNumberCollection {
    public latest: PlaytestingCard[] = [];
    public all: PlaytestingCard[] = [];
    public playtesting: PlaytestingCard[] = [];
    public draft: PlaytestingCard[] = [];
    [number: number]: CardVersionCollection;

    constructor(jsonCards: JsonPlaytestingCard[]) {
        const nMap = new Map<number, CardVersionCollection>();
        for (const jsonCard of jsonCards) {
            const card = new PlaytestingCard(jsonCard);
            this.all.push(card);

            const { number, version } = card;
            let vCollection = nMap.get(number);
            if (!vCollection) {
                vCollection = {
                    latest: card,
                    all: []
                } as CardVersionCollection;
                nMap.set(number, vCollection);
            }

            vCollection.all.push(card);
            vCollection[version] = card;

            if (Ver.gt(card.version, vCollection.latest.version)) {
                vCollection.latest = card;
            }

            if (card.isDraft) {
                if (!vCollection.draft || Ver.gt(card.version, vCollection.draft.version)) {
                    vCollection.draft = card;
                }
            }
        }

        // Convert temporary map into collection values
        for (const [number, vCollection] of nMap) {
            this[number] = vCollection;
            const { latest, draft } = vCollection;

            this.latest.push(latest);

            if (draft) {
                this.draft.push(draft);
            }

            // Set playtesting on both number & version collections as we now know the actual latests
            if (latest.playtesting && vCollection[latest.playtesting]) {
                vCollection.playtesting = vCollection[latest.playtesting];
                this.playtesting.push(vCollection[latest.playtesting]);
            }
        }
    }

    [Symbol.iterator](): Iterator<PlaytestingCard> {
        return this.latest[Symbol.iterator]();
    }
}

interface CardNumberCollection {
    latest: PlaytestingCard[],
    all: PlaytestingCard[],
    playtesting: PlaytestingCard[],
    draft: PlaytestingCard[],
    [number: number]: CardVersionCollection
}

interface CardVersionCollection {
    latest: PlaytestingCard,
    all: PlaytestingCard[],
    playtesting?: PlaytestingCard,
    draft?: PlaytestingCard,
    [version: SemanticVersion]: PlaytestingCard
}

export default CardCollection;
