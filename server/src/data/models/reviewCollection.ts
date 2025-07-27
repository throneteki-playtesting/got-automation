import * as Ver from "semver";
import { SemanticVersion } from "common/utils";
import Review from "./review";
import { JsonPlaytestingReview } from "common/models/reviews";

/**
 * An ordered collection of reviews, with options to only view latest card reviews
 *
 * Iterating through CardCollection will iterate through the latest card reviews
 */
class ReviewCollection implements CardNumberCollection {
    public latest: Review[] = [];
    public all: Review[] = [];
    [number: number]: CardVersionCollection;

    constructor(jsonReviews: JsonPlaytestingReview[]) {
        const nMap = new Map<number, CardVersionCollection>();
        for (const jsonReview of jsonReviews) {
            const review = new Review(jsonReview);
            this.all.push(review);

            const { number, version } = review;
            let vCollection = nMap.get(number);
            if (!vCollection) {
                vCollection = {
                    latest: [],
                    all: []
                } as CardVersionCollection;
                nMap.set(number, vCollection);
            }

            vCollection.all.push(review);
            vCollection[version] = vCollection[version] || [];
            vCollection[version].push(review);

            const firstLatest = vCollection.latest[0];
            if (!firstLatest || Ver.eq(review.version, firstLatest.version)) {
                vCollection.latest.push(review);
            } else if (Ver.gt(review.version, firstLatest.version)) {
                vCollection.latest = [review];
            }
        }

        // Convert temporary map into collection values
        for (const [number, vCollection] of nMap) {
            this[number] = vCollection;
            const { latest } = vCollection;

            this.latest.push(...latest);
        }
    }

    [Symbol.iterator](): Iterator<Review> {
        return this.latest[Symbol.iterator]();
    }
}

interface CardNumberCollection {
    latest: Review[],
    all: Review[],
    [number: number]: CardVersionCollection
}

interface CardVersionCollection {
    latest: Review[],
    all: Review[],
    [version: SemanticVersion]: Review[]
}

export default ReviewCollection;
