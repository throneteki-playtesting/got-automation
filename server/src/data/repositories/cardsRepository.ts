import { BulkWriteOptions, MongoClient } from "mongodb";
import { dataService, logger, renderService } from "@/services";
import { asArray, groupBy } from "common/utils";
import * as CardsController from "gas/controllers/cardsController";
import { CardSheet } from "gas/spreadsheets/serializers/cardSerializer";
import MongoDataSource from "./dataSources/mongoDataSource";
import GASDataSource from "./dataSources/GASDataSource";
import { JsonPlaytestingCard } from "common/models/cards";
import CardCollection from "../models/cards/cardCollection";
import PlaytestingCard from "../models/cards/playtestingCard";
import { DeepPartial, SingleOrArray } from "common/types";

export default class CardsRepository {
    public database: CardMongoDataSource;
    public spreadsheet: CardDataSource;
    constructor(mongoClient: MongoClient) {
        this.database = new CardMongoDataSource(mongoClient);
        this.spreadsheet = new CardDataSource();
    }
    public async create(creating: SingleOrArray<PlaytestingCard>) {
        await this.database.create(creating);
        await this.spreadsheet.create(creating);
    }

    public async read(reading?: SingleOrArray<DeepPartial<JsonPlaytestingCard>>, hard = false) {
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
    public async update(updating: SingleOrArray<JsonPlaytestingCard>, upsert = true) {
        await this.database.update(updating, { upsert });
        await this.spreadsheet.update(updating, { upsert });
    }

    public async destroy(destroying: SingleOrArray<DeepPartial<JsonPlaytestingCard>>) {
        await this.database.destroy(destroying);
        await this.spreadsheet.destroy(destroying);
    }
}

class CardMongoDataSource extends MongoDataSource<JsonPlaytestingCard> {
    constructor(client: MongoClient) {
        super(client, "cards", { number: 1, version: 1 });
    }

    public override async create(creating: SingleOrArray<JsonPlaytestingCard>, options?: BulkWriteOptions) {
        const cards = asArray(creating);
        await renderService.syncImages(new CardCollection(cards));
        const result = await this.insertMany(cards, options);
        return result;
    }

    public override async update(updating: SingleOrArray<JsonPlaytestingCard>, options?: BulkWriteOptions & { upsert?: boolean }) {
        const cards = asArray(updating);
        await renderService.syncImages(new CardCollection(cards), true);
        const result = await this.bulkWrite(cards, options);
        return result;
    }
}
class CardDataSource extends GASDataSource<JsonPlaytestingCard> {
    public async create(creating: SingleOrArray<JsonPlaytestingCard>) {
        const cards = asArray(creating);
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

    public async read(reading?: SingleOrArray<DeepPartial<JsonPlaytestingCard>>) {
        const cards = asArray(reading);
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

    public async update(updating: SingleOrArray<JsonPlaytestingCard>, { upsert = true, sheets }: { upsert?: boolean; sheets?: CardSheet[] } = {}) {
        const cards = asArray(updating);
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

    public async destroy(destroying: SingleOrArray<DeepPartial<JsonPlaytestingCard>>) {
        const cards = asArray(destroying);
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