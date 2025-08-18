import MongoDataSource from "./dataSources/mongoDataSource";
import { MongoClient } from "mongodb";
import { dataService, logger } from "@/services";
import { JsonPlaytestingReview } from "common/models/reviews";
import { asArray, groupBy } from "common/utils";
import * as ReviewsController from "gas/controllers/reviewsController";
import GASDataSource from "./dataSources/GASDataSource";
import ReviewCollection from "../models/reviewCollection";
import { DeepPartial, SingleOrArray } from "common/types";

export default class ReviewsRepository {
    public database: MongoDataSource<JsonPlaytestingReview>;
    public spreadsheet: ReviewDataSource;
    constructor(mongoClient: MongoClient) {
        this.database = new MongoDataSource<JsonPlaytestingReview>(mongoClient, "reviews", { project: 1, number: 1, version: 1, reviewer: 1 });
        this.spreadsheet = new ReviewDataSource();
    }
    public async create(creating: SingleOrArray<JsonPlaytestingReview>) {
        await this.database.create(creating);
        await this.spreadsheet.create(creating);
    }

    public async read(reading?: SingleOrArray<DeepPartial<JsonPlaytestingReview>>, hard = false) {
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

    public async update(updating: SingleOrArray<JsonPlaytestingReview>, upsert = true) {
        await this.database.update(updating, { upsert });
        await this.spreadsheet.update(updating, { upsert });
    }

    public async destroy(destroying: SingleOrArray<DeepPartial<JsonPlaytestingReview>>) {
        await this.database.destroy(destroying);
        await this.spreadsheet.destroy(destroying);
    }
}

class ReviewDataSource extends GASDataSource<JsonPlaytestingReview> {
    public async create(creating: SingleOrArray<JsonPlaytestingReview>) {
        const reviews = asArray(creating);
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

    public async read(reading?: SingleOrArray<DeepPartial<JsonPlaytestingReview>>) {
        const reviews = asArray(reading);
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

    public async update(updating: SingleOrArray<JsonPlaytestingReview>, { upsert = true }: { upsert?: boolean } = {}) {
        const reviews = asArray(updating);
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

    public async destroy(destroying: SingleOrArray<DeepPartial<JsonPlaytestingReview>>) {
        const reviews = asArray(destroying);
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