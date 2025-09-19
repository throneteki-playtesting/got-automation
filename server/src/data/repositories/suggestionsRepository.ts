import MongoDataSource from "./dataSources/mongoDataSource";
import { MongoClient } from "mongodb";
import { DeepPartial, SingleOrArray } from "common/types";
import { CardSuggestion } from "common/models/cards";
import { asArray } from "common/utils";

export default class SuggestionsRepository {
    private database: MongoDataSource<CardSuggestion>;
    constructor(mongoClient: MongoClient) {
        this.database = new MongoDataSource<CardSuggestion>(mongoClient, "suggestions", { id: 1 });
    }

    public async create(creating: SingleOrArray<CardSuggestion>) {
        for (const create of asArray(creating)) {
            create.id = crypto.randomUUID();
        }
        return await this.database.create(creating);
    }

    public async read(reading?: SingleOrArray<DeepPartial<CardSuggestion>>) {
        return await this.database.read(reading);
    }

    public async update(updating: SingleOrArray<CardSuggestion>) {
        return await this.database.update(updating);
    }

    public async destroy(destroying: SingleOrArray<DeepPartial<CardSuggestion>>) {
        return await this.database.destroy(destroying);
    }

    public async tags() {
        return await this.database.collection.distinct("tags");
    }
}