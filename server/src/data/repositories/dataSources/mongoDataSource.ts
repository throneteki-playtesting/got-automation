import { BulkWriteOptions, Collection, DeleteOptions, Filter, FindOptions, IndexSpecification, MongoClient, OptionalUnlessRequiredId, WithId } from "mongodb";
import { flatten } from "flat";
import { DeepPartial, SingleOrArray } from "common/types";
import { logger } from "@/services";
import { asArray } from "common/utils";

export default class MongoDataSource<T> {
    protected collection: Collection<T>;
    protected primaryKeys: string[];
    constructor(client: MongoClient, protected name: string, primaryKeys: IndexSpecification) {
        this.collection = client.db().collection<T>(name);
        this.primaryKeys = Object.keys(primaryKeys);
        if (this.primaryKeys.length === 0) {
            throw Error(`At least one primary key/index must be supplied for ${this.name} collection`);
        }
        this.collection.createIndex(primaryKeys, { unique: true });
    }
    protected buildFilterQuery(values?: SingleOrArray<DeepPartial<T>>): Filter<T> {
        let query = {};

        if (values) {
            if (!Array.isArray(values)) {
                query = flatten(values);
            } else if (values.length > 0) {
                query = values.length === 1
                    ? flatten(values[0])
                    : { "$or": values.map(v => flatten(v)) };
            }
        }

        // By default, MongoDB treats "undefined" as value not existing.
        // This converts any "undefined" to count as any value for existing
        for (const [key, value] of Object.entries(query)) {
            if (value === undefined) {
                query[key] = { $exists: true };
            }
        }
        return query as Filter<T>;
    }
    protected withoutId(values: WithId<T>[]) {
        return values.map((value) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { _id, ...rest } = value;
            return rest as T;
        });
    }
    public async create(creating: SingleOrArray<T>, options?: BulkWriteOptions) {
        const docs = asArray(creating);
        const result = await this.insertMany(docs, options);
        return result;
    }
    public async read(reading?: SingleOrArray<DeepPartial<T>>, options?: FindOptions) {
        const query = this.buildFilterQuery(reading);
        const result = await this.find(query, options);
        return result;
    }

    public async update(updating: SingleOrArray<T>, options?: BulkWriteOptions & { upsert?: boolean }) {
        const docs = asArray(updating);
        const result = await this.bulkWrite(docs, options);
        return result;

    }
    public async destroy(deleting: SingleOrArray<DeepPartial<T>>, options?: DeleteOptions) {
        const query = this.buildFilterQuery(deleting);
        const result = await this.deleteMany(query, options);
        return result;
    }


    // Mongo Commands //
    protected async insertMany(docs: T[], options?: BulkWriteOptions) {
        if (docs.length === 0) {
            return [];
        }
        const results = await this.collection.insertMany(docs as OptionalUnlessRequiredId<T>[], { ordered: false, ...options });

        logger.verbose(`[Mongo] Inserted ${results.insertedCount} documents into ${this.name} collection`);

        // Sanitise docs in case _id was added
        docs.forEach((doc) => {
            if (doc["_id"]) {
                delete doc["_id"];
            }
        });
        // Return docs which were actually inserted (no duplicates)
        return Object.keys(results.insertedIds).map((index) => docs[index] as T);
    }

    protected async find(query: Filter<T>, options?: FindOptions) {
        const result = await this.collection.find(query, options).toArray();

        logger.verbose(`[Mongo] Read ${result.length} documents from ${this.name} collection`);
        return this.withoutId(result);
    }

    protected async bulkWrite(docs: T[], { upsert, ...options }: BulkWriteOptions & { upsert?: boolean } = { upsert: true }) {
        if (docs.length === 0) {
            return [];
        }
        const defaultOptions = (doc: T) => {
            const filter = this.primaryKeys.reduce((f, pk) => {
                f[pk] = doc[pk];
                return f;
            }, {});

            return { filter, upsert };
        };
        const results = await this.collection.bulkWrite(docs.map((doc) => ({
            replaceOne: {
                ...defaultOptions(doc),
                replacement: doc
            }
        })), { ordered: false, ...options });

        logger.verbose(`[Mongo] ${upsert ? "Upserted" : "Updated"} ${results.modifiedCount + results.upsertedCount} documents into ${this.name} collection`);
        const updatedIds = { ... results.insertedIds, ...results.upsertedIds };

        // Return docs which were actually inserted or upserted
        // TODO: Need to find out how to also include "Updated" objects, as they are not included in insertedIds or upsertedIds
        return Object.keys(updatedIds).map((index) => docs[index] as T);
    }

    protected async deleteMany(query: Filter<T>, options?: DeleteOptions) {
        if (Object.keys(query).length === 0) {
            return 0; // Do not delete anything if there are no query parameters
        }
        const results = await this.collection.deleteMany(query, options);

        logger.verbose(`[Mongo] Deleted ${results.deletedCount} documents from ${this.name} collection`);
        return results.deletedCount;
    }
};