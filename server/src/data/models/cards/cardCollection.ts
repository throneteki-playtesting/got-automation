import * as Ver from "semver";
import PlaytestingCard from "./playtestingCard";
import { pushSorted, SemanticVersion } from "common/utils";
import { PlaytestableCard } from "common/models/cards";

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

    constructor(Cards: PlaytestableCard[]) {
        const nMap = new Map<number, CardVersionCollection>();
        const compareFn = (a: PlaytestingCard, b: PlaytestingCard) => a.project - b.project || a.number - b.number || Ver.compare(a.version, b.version);
        for (const Card of Cards) {
            const card = new PlaytestingCard(Card);
            pushSorted(this.all, card, compareFn);

            const { number, version } = card;
            let vCollection = nMap.get(number);
            if (!vCollection) {
                vCollection = {
                    latest: card,
                    all: []
                } as CardVersionCollection;
                nMap.set(number, vCollection);
            }

            pushSorted(vCollection.all, card, compareFn);
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

            pushSorted(this.latest, latest, compareFn);

            if (draft) {
                pushSorted(this.draft, draft, compareFn);
            }

            // Set playtesting on both number & version collections as we now know the actual latests
            if (latest.playtesting && vCollection[latest.playtesting]) {
                vCollection.playtesting = vCollection[latest.playtesting];
                pushSorted(this.playtesting, vCollection[latest.playtesting], compareFn);
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
