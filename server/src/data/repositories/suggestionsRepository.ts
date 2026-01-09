import MongoDataSource from "./dataSources/mongoDataSource";
import { MongoClient } from "mongodb";
import { DeepPartial, SingleOrArray, Sortable } from "common/types";
import { ICardSuggestion } from "common/models/cards";
import { asArray } from "common/utils";
import { flatten } from "flat";

export default class SuggestionsRepository {
    private database: MongoDataSource<ICardSuggestion>;
    constructor(mongoClient: MongoClient) {
        this.database = new MongoDataSource<ICardSuggestion>(mongoClient, "suggestions", { id: 1 });
    }

    public async create(creating: ICardSuggestion): Promise<ICardSuggestion>;
    public async create(creating: ICardSuggestion[]): Promise<ICardSuggestion[]>;
    public async create(creating: SingleOrArray<ICardSuggestion>) {
        for (const create of asArray(creating)) {
            create.id = crypto.randomUUID();
        }
        const result = await this.database.create(creating);
        return Array.isArray(creating) ? result : result[0];
    }

    public async read(reading?: SingleOrArray<DeepPartial<ICardSuggestion>>, orderBy?: Sortable<ICardSuggestion>, page?: number, perPage?: number) {
        return await this.database.read(reading, { sort: orderBy ? flatten(orderBy) : undefined, limit: perPage, skip: page * perPage });
    }

    public async update(updating: ICardSuggestion, upsert?: boolean): Promise<ICardSuggestion>;
    public async update(updating: ICardSuggestion[], upsert?: boolean): Promise<ICardSuggestion[]>;
    public async update(updating: SingleOrArray<ICardSuggestion>, upsert = true) {
        const result = await this.database.update(updating, { upsert });
        return Array.isArray(updating) ? result : result[0];
    }

    public async destroy(destroying: SingleOrArray<DeepPartial<ICardSuggestion>>) {
        return await this.database.destroy(destroying);
    }

    public async tags() {
        return await this.database.collection.distinct("tags");
    }
}