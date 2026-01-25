import * as Ver from "semver";
import { pushSorted, SemanticVersion } from "../utils";
import { IPlaytestCard } from "../models/cards";

/**
 * An ordered collection of cards, split into latest, playtesting, and draft cards
 *
 * Iterating through CardCollection will iterate through the latest cards
 */
class CardCollection<T extends IPlaytestCard> implements ICardCollection<T> {
    public latest: T[] = [];
    public all: T[] = [];
    public playtesting: T[] = [];
    public draft: T[] = [];
    [number: number]: ICardVersionCollection<T> | undefined;

    constructor(items: T[]) {
        const nMap = new Map<number, ICardVersionCollection<T>>();
        const compareFn = (a: T, b: T) => a.project - b.project || a.number - b.number || Ver.compare(a.version, b.version);
        for (const item of items) {
            pushSorted(this.all, item, compareFn);

            const { number, version } = item;
            let vCollection = nMap.get(number);
            if (!vCollection) {
                vCollection = {
                    latest: item,
                    all: []
                } as ICardVersionCollection<T>;
                nMap.set(number, vCollection);
            }

            pushSorted(vCollection.all, item, compareFn);
            vCollection[version] = item;

            if (Ver.gt(item.version, vCollection.latest.version)) {
                vCollection.latest = item;
            }

            // Is draft
            if (!item.playtesting || Ver.neq(item.playtesting, item.version)) {
                if (!vCollection.draft || Ver.gt(item.version, vCollection.draft.version)) {
                    vCollection.draft = item;
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

    [Symbol.iterator](): Iterator<T> {
        return this.latest[Symbol.iterator]();
    }
}

export interface ICardCollection<T> {
    latest: T[],
    all: T[],
    playtesting: T[],
    draft: T[],
    [number: number]: ICardVersionCollection<T> | undefined
}

export interface ICardVersionCollection<T> {
    latest: T,
    all: T[],
    playtesting?: T,
    draft?: T,
    [version: SemanticVersion]: T
}

export default CardCollection;
