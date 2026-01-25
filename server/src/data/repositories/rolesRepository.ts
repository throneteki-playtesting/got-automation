import { Role } from "common/models/user";
import MongoDataSource from "./dataSources/mongoDataSource";
import { MongoClient, Sort } from "mongodb";
import { DeepPartial, SingleOrArray, Sortable } from "common/types";
import { IRepository } from "@/types";
import { flatten } from "flat";

export default class RolesRepository implements IRepository<Role> {
    private database: MongoDataSource<Role>;
    constructor(mongoClient: MongoClient) {
        this.database = new MongoDataSource<Role>(mongoClient, "roles", { name: 1 });
    }

    public async create(creating: Role): Promise<Role>;
    public async create(creating: Role[]): Promise<Role[]>;
    public async create(creating: SingleOrArray<Role>) {
        const result = await this.database.create(creating);
        return Array.isArray(creating) ? result : result[0];
    }

    public async read(reading?: SingleOrArray<DeepPartial<Role>>, orderBy?: Sortable<Role>, page?: number, perPage?: number) {
        const sort = orderBy ? flatten(orderBy) as Sort : undefined;
        const limit = perPage;
        const skip = (page - 1) * perPage;
        return await this.database.read(reading, { sort, limit, skip });
    }

    public async count(counting?: SingleOrArray<DeepPartial<Role>>) {
        return await this.database.count(counting);
    }

    public async update(updating: Role, upsert?: boolean): Promise<Role>;
    public async update(updating: Role[], upsert?: boolean): Promise<Role[]>;
    public async update(updating: SingleOrArray<Role>, upsert = true) {
        const result = await this.database.update(updating, { upsert });
        return Array.isArray(updating) ? result : result[0];
    }

    public async destroy(destroying: SingleOrArray<DeepPartial<Role>>) {
        return await this.database.destroy(destroying);
    }
}