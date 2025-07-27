import { MongoClient } from "mongodb";
import { IRepository } from "..";
import { dataService, logger, renderService } from "@/services";
import { groupBy } from "common/utils";
import * as CardsController from "gas/controllers/cardsController";
import { CardSheet } from "gas/spreadsheets/serializers/cardSerializer";
import MongoDataSource from "./dataSources/mongoDataSource";
import GASDataSource from "./dataSources/GASDataSource";
import { JsonPlaytestingCard } from "common/models/cards";
import CardCollection from "../models/cards/cardCollection";
import PlaytestingCard from "../models/cards/playtestingCard";

export default class CardsRepository implements IRepository<JsonPlaytestingCard> {
    public database: CardMongoDataSource;
    public spreadsheet: CardDataSource;
    constructor(mongoClient: MongoClient) {
        this.database = new CardMongoDataSource(mongoClient);
        this.spreadsheet = new CardDataSource();
    }
    public async create(creating: PlaytestingCard | PlaytestingCard[]) {
        await this.database.create(creating);
        await this.spreadsheet.create(creating);
    }

    public async read(reading?: Partial<JsonPlaytestingCard> | Partial<JsonPlaytestingCard>[], hard = false) {
        let cards: JsonPlaytestingCard[];
        // Force hard refresh from spreadsheet (slow)
        if (hard) {
            const fetched = await this.spreadsheet.read(reading);
            await this.database.update(fetched);
            cards = fetched;
        } else {
            // Otherwise, use database (fast)...
            cards = await this.database.read(reading);
        }
        return new CardCollection(cards);
    }
    public async update(updating: JsonPlaytestingCard | JsonPlaytestingCard[], upsert = true) {
        await this.database.update(updating, { upsert });
        await this.spreadsheet.update(updating, { upsert });
    }

    public async destroy(destroying: Partial<JsonPlaytestingCard> | Partial<JsonPlaytestingCard>[]) {
        await this.database.destroy(destroying);
        await this.spreadsheet.destroy(destroying);
    }
}

class CardMongoDataSource extends MongoDataSource<JsonPlaytestingCard> {
    constructor(client: MongoClient) {
        super(client, "cards");
        // Index on number & version, and allow _id to be a uuid
        this.collection.createIndex({ number: 1, version: 1 }, { unique: true });
    }

    public async create(creating: JsonPlaytestingCard | JsonPlaytestingCard[]) {
        const cards = Array.isArray(creating) ? creating : [creating];
        if (cards.length === 0) {
            return [];
        }
        await renderService.syncImages(new CardCollection(cards));
        const results = await this.collection.insertMany(cards, { ordered: false });

        logger.verbose(`Inserted ${results.insertedCount} values into ${this.name} collection`);

        // Return cards which were actually inserted (no duplicates)
        return Object.keys(results.insertedIds).map((index) => cards[index] as JsonPlaytestingCard);
    }

    public async read(reading?: Partial<JsonPlaytestingCard> | Partial<JsonPlaytestingCard>[]) {
        const query = this.buildFilterQuery(reading);
        const result = await this.collection.find(query).toArray();

        logger.verbose(`Read ${result.length} values from ${this.name} collection`);
        return this.withoutId(result);
    }

    public async update(updating: JsonPlaytestingCard | JsonPlaytestingCard[], { upsert }: { upsert: boolean } = { upsert: true }) {
        const cards = Array.isArray(updating) ? updating : [updating];
        if (cards.length === 0) {
            return [];
        }
        await renderService.syncImages(new CardCollection(cards), true);
        const results = await this.collection.bulkWrite(cards.map((card) => ({
            replaceOne: {
                filter: { "number": card.number, "version": card.version },
                replacement: card,
                upsert
            }
        })), { ordered: false });

        logger.verbose(`${upsert ? "Upserted" : "Updated"} ${results.modifiedCount + results.upsertedCount} values into ${this.name} collection`);

        const updatedIds = { ... results.insertedIds, ...results.upsertedIds };
        // Return cards which were actually inserted or upserted
        return Object.keys(updatedIds).map((index) => cards[index] as JsonPlaytestingCard);
    }

    public async destroy(deleting: Partial<JsonPlaytestingCard> | Partial<JsonPlaytestingCard>[]) {
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

class CardDataSource extends GASDataSource<JsonPlaytestingCard> {
    public async create(creating: JsonPlaytestingCard | JsonPlaytestingCard[]) {
        const cards = Array.isArray(creating) ? creating : [creating];
        const groups = groupBy(cards, (card) => card.project);

        const created: JsonPlaytestingCard[] = [];
        for (const [pNumber, pCards] of groups.entries()) {
            const [project] = await dataService.projects.read({ number: pNumber });

            const url = `${project.script}/cards/create`;
            const body = JSON.stringify(pCards);
            const response = await this.client.post<CardsController.CreateResponse>(url, null, body);
            created.push(...response.created);
            logger.verbose(`${created.length} card(s) created in Google App Script (${project.name})`);
        }
        return created;
    }

    public async read(reading?: Partial<JsonPlaytestingCard> | Partial<JsonPlaytestingCard>[]) {
        const cards = Array.isArray(reading) ? reading : [reading];
        const groups = groupBy(cards, (card) => card.project);
        // If no project is specified, read that from all active projects
        if (groups.has(undefined)) {
            const noProjectCards = groups.get(undefined);
            const allActiveProjects = await dataService.projects.read({ active: true });
            allActiveProjects.forEach((project) => groups.set(project.number, noProjectCards));
            groups.delete(undefined);
        }
        const read: JsonPlaytestingCard[] = [];
        for (const [pNumber, pCards] of groups.entries()) {
            const [project] = await dataService.projects.read({ number: pNumber });
            // TODO: Error if project is missing
            for (const pCard of pCards) {
                const url = `${project.script}/cards`;
                const query = { filter: pCard };
                const response = await this.client.get<CardsController.ReadResponse>(url, query);
                read.push(...response.cards);
            }
            logger.verbose(`${read.length} card(s) read from Google App Script (${project.name})`);
        }
        return read;
    }

    public async update(updating: JsonPlaytestingCard | JsonPlaytestingCard[], { upsert = true, sheets }: { upsert?: boolean; sheets?: CardSheet[] } = {}) {
        const cards = Array.isArray(updating) ? updating : [updating];
        const groups = groupBy(cards, (card) => card.project);
        const updated: JsonPlaytestingCard[] = [];
        for (const [pNumber, pCards] of groups.entries()) {
            const [project] = await dataService.projects.read({ number: pNumber });
            // TODO: Error if project is missing
            const url = `${project.script}/cards/update`;
            const query = { upsert, sheets };
            const body = JSON.stringify(pCards);
            const response = await this.client.post<CardsController.UpdateResponse>(url, query, body);
            updated.push(...response.updated);
            logger.verbose(`${updated.length} card(s) updated in Google App Script (${project.name})`);
        }
        return updated;
    }

    public async destroy(destroying: Partial<JsonPlaytestingCard> | Partial<JsonPlaytestingCard>[]) {
        const cards = Array.isArray(destroying) ? destroying : [destroying];
        const groups = groupBy(cards, (card) => card.project);
        // If no project is specified, read that from all active projects
        if (groups.has(undefined)) {
            const noProjectCards = groups.get(undefined);
            const allActiveProjects = await dataService.projects.read({ active: true });
            allActiveProjects.forEach((project) => groups.set(project.number, noProjectCards));
            groups.delete(undefined);
        }
        const destroyed: JsonPlaytestingCard[] = [];
        for (const [pNumber, pCards] of groups.entries()) {
            const [project] = await dataService.projects.read({ number: pNumber });

            for (const pCard of pCards) {
                const url = `${project.script}/cards/destroy`;
                const query = { filter: pCard };
                const response = await this.client.post<CardsController.DestroyResponse>(url, query);
                destroyed.push(...response.destroyed);
            }
            logger.verbose(`${destroyed.length} card(s) deleted in Google App Script (${project.name})`);
        }
        return destroyed.length;
    }
}