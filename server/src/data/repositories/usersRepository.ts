import { User } from "common/models/user";
import MongoDataSource from "./dataSources/mongoDataSource";
import { MongoClient, Sort } from "mongodb";
import { DeepPartial, SingleOrArray, Sortable } from "common/types";
import { flatten } from "flat";

export default class UsersRepository {
    private database: MongoDataSource<User>;
    constructor(mongoClient: MongoClient) {
        this.database = new MongoDataSource<User>(mongoClient, "users", { discordId: 1 });
    }

    public async create(creating: User): Promise<User>;
    public async create(creating: User[]): Promise<User[]>;
    public async create(creating: SingleOrArray<User>) {
        const result = await this.database.create(creating);
        return Array.isArray(creating) ? result : result[0];
    }

    public async read(reading?: SingleOrArray<DeepPartial<User>>, orderBy?: Sortable<User>, page?: number, perPage?: number) {
        const sort = orderBy ? flatten(orderBy) as Sort : undefined;
        const limit = perPage;
        const skip = (page - 1) * perPage;
        return await this.database.read(reading, { sort, limit, skip });
    }

    public async count(counting?: SingleOrArray<DeepPartial<User>>) {
        return await this.database.count(counting);
    }

    public async update(updating: User, upsert?: boolean): Promise<User>;
    public async update(updating: User[], upsert?: boolean): Promise<User[]>;
    public async update(updating: SingleOrArray<User>, upsert = true) {
        const result = await this.database.update(updating, { upsert });
        return Array.isArray(updating) ? result : result[0];
    }

    public async destroy(destroying: SingleOrArray<DeepPartial<User>>) {
        return await this.database.destroy(destroying);
    }
}