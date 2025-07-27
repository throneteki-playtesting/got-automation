import MongoDataSource from "./dataSources/mongoDataSource";
import { MongoClient } from "mongodb";
import { IRepository } from "..";
import { dataService, logger } from "@/services";
import Review from "../models/review";
import { JsonPlaytestingReview } from "common/models/reviews";
import { groupBy } from "common/utils";
import * as ReviewsController from "gas/controllers/reviewsController";
import GASDataSource from "./dataSources/GASDataSource";
import { JsonPlaytestingCard } from "common/models/cards";
import ReviewCollection from "../models/reviewCollection";

export default class ReviewsRepository implements IRepository<JsonPlaytestingReview> {
    public database: ReviewMongoDataSource;
    public spreadsheet: ReviewDataSource;
    constructor(mongoClient: MongoClient) {
        this.database = new ReviewMongoDataSource(mongoClient);
        this.spreadsheet = new ReviewDataSource();
    }
    public async create(creating: Review | Review[]) {
        await this.database.create(creating);
        await this.spreadsheet.create(creating);
    }

    public async read(reading?: Partial<JsonPlaytestingReview> | Partial<JsonPlaytestingReview>[], hard = false) {
        let reviews: JsonPlaytestingReview[];
        // Force hard refresh from spreadsheet (slow)
        if (hard) {
            const fetched = await this.spreadsheet.read(reading);
            await this.database.update(fetched);
            reviews = fetched;
        } else {
            // Otherwise, use database (fast)...
            reviews = await this.database.read(reading);
        }
        return new ReviewCollection(reviews);
    }

    public async update(updating: JsonPlaytestingReview | JsonPlaytestingReview[], upsert = true) {
        await this.database.update(updating, { upsert });
        await this.spreadsheet.update(updating, { upsert });
    }

    public async destroy(destroying: Partial<JsonPlaytestingReview> | Partial<JsonPlaytestingReview>[]) {
        await this.database.destroy(destroying);
        await this.spreadsheet.destroy(destroying);
    }
}

class ReviewMongoDataSource extends MongoDataSource<JsonPlaytestingReview> {
    constructor(client: MongoClient) {
        super(client, "reviews");
    }
    public async create(creating: JsonPlaytestingReview | JsonPlaytestingReview[]) {
        const reviews = Array.isArray(creating) ? creating : [creating];
        if (reviews.length === 0) {
            return [];
        }
        const results = await this.collection.insertMany(reviews, { ordered: false });

        logger.verbose(`Inserted ${results.insertedCount} values into ${this.name} collection`);

        // Return reviews which were actually inserted (no duplicates)
        return Object.keys(results.insertedIds).map((index) => reviews[index] as JsonPlaytestingReview);
    }
    public async read(reading?: Partial<JsonPlaytestingReview> | Partial<JsonPlaytestingReview>[]) {
        const query = this.buildFilterQuery(reading);
        const result = await this.collection.find(query).toArray();

        logger.verbose(`Read ${result.length} values from ${this.name} collection`);
        return this.withoutId(result);
    }

    public async update(updating: JsonPlaytestingReview | JsonPlaytestingReview[], { upsert }: { upsert: boolean } = { upsert: true }) {
        const reviews = Array.isArray(updating) ? updating : [updating];
        if (reviews.length === 0) {
            return [];
        }
        const results = await this.collection.bulkWrite(reviews.map((review) => ({
            replaceOne: {
                filter: { "number": review.number, "version": review.version, "reviewer": review.reviewer },
                replacement: review,
                upsert
            }
        })), { ordered: false });

        logger.verbose(`${upsert ? "Upserted" : "Updated"} ${results.modifiedCount + results.upsertedCount} values out of ${results.matchedCount} into ${this.name} collection`);

        const updatedIds = { ... results.insertedIds, ...results.upsertedIds };
        // Return reviews which were actually inserted or upserted
        return Object.keys(updatedIds).map((index) => reviews[index] as JsonPlaytestingReview);
    }

    public async destroy(deleting: Partial<JsonPlaytestingReview> | Partial<JsonPlaytestingCard>[]) {
        const query = this.buildFilterQuery(deleting);
        if (Object.keys(query).length === 0) {
            return 0; // Do not delete anything if there are no query parameters
        }
        // Collect all which are to be deleted
        const results = await this.collection.deleteMany(query);

        logger.verbose(`Deleted ${results.deletedCount} values from ${this.name} collection`);
        return results.deletedCount;
    }
}

class ReviewDataSource extends GASDataSource<JsonPlaytestingReview> {
    public async create(creating: JsonPlaytestingReview | JsonPlaytestingReview[]) {
        const reviews = Array.isArray(creating) ? creating : [creating];
        const groups = groupBy(reviews, (review) => review.project);

        const created: JsonPlaytestingReview[] = [];
        for (const [pNumber, pReviews] of groups.entries()) {
            const [project] = await dataService.projects.read({ number: pNumber });
            // TODO: Error if project is missing
            const url = `${project.script}/reviews/create`;
            const body = JSON.stringify(pReviews);
            const response = await this.client.post<ReviewsController.CreateResponse>(url, null, body);
            created.push(...response.created);
            logger.verbose(`${created.length} review(s) created in Google App Script (${project.name})`);
        }
        return created;
    }

    public async read(reading?: Partial<JsonPlaytestingReview> | Partial<JsonPlaytestingReview>[]) {
        const reviews = Array.isArray(reading) ? reading : [reading];
        const groups = groupBy(reviews, (review) => review.project);
        // If no project is specified, read that from all active projects
        if (groups.has(undefined)) {
            const noProjectCards = groups.get(undefined);
            const allActiveProjects = await dataService.projects.read({ active: true });
            allActiveProjects.forEach((project) => groups.set(project.number, noProjectCards));
            groups.delete(undefined);
        }

        const read: JsonPlaytestingReview[] = [];
        for (const [pNumber, pReviews] of groups.entries()) {
            const [project] = await dataService.projects.read({ number: pNumber });
            // TODO: Error if project is missing
            for (const pReview of pReviews) {
                const url = `${project.script}/cards`;
                const query = { filter: pReview };
                const response = await this.client.get<ReviewsController.ReadResponse>(url, query);
                read.push(...response.reviews);
            }
            logger.verbose(`${read.length} review(s) read from Google App Script (${project.name})`);
        }
        return read;
    }

    public async update(updating: JsonPlaytestingReview | JsonPlaytestingReview[], { upsert = true }: { upsert?: boolean } = {}) {
        const reviews = Array.isArray(updating) ? updating : [updating];
        const groups = groupBy(reviews, (review) => review.project);
        const updated: JsonPlaytestingReview[] = [];
        for (const [pNumber, pReviews] of groups.entries()) {
            const [project] = await dataService.projects.read({ number: pNumber });
            // TODO: Error if project is missing
            const url = `${project.script}/cards/update`;
            const query = { upsert };
            const body = JSON.stringify(pReviews);
            const response = await this.client.post<ReviewsController.UpdateResponse>(url, query, body);
            updated.push(...response.updated);
            logger.verbose(`${updated.length} review(s) updated in Google App Script (${project.name})`);
        }
        return updated;
    }

    public async destroy(destroying: Partial<JsonPlaytestingReview> | Partial<JsonPlaytestingReview>[]) {
        const reviews = Array.isArray(destroying) ? destroying : [destroying];
        const groups = groupBy(reviews, (review) => review.project);
        // If no project is specified, read that from all active projects
        if (groups.has(undefined)) {
            const noProjectCards = groups.get(undefined);
            const allActiveProjects = await dataService.projects.read({ active: true });
            allActiveProjects.forEach((project) => groups.set(project.number, noProjectCards));
            groups.delete(undefined);
        }
        const destroyed: JsonPlaytestingReview[] = [];
        for (const [pNumber, pReviews] of groups.entries()) {
            const [project] = await dataService.projects.read({ number: pNumber });

            for (const pReview of pReviews) {
                const url = `${project.script}/reviews/destroy`;
                const query = { filter: pReview };
                const response = await this.client.post<ReviewsController.DestroyResponse>(url, query);
                destroyed.push(...response.destroyed);
            }
            logger.verbose(`${destroyed.length} review(s) deleted in Google App Script (${project.name})`);
        }
        return destroyed.length;
    }
}