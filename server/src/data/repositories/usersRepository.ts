import { User } from "common/models/user";
import MongoDataSource from "./dataSources/mongoDataSource";
import { MongoClient } from "mongodb";
import { DeepPartial, SingleOrArray } from "common/types";

export default class UsersRepository {
    private database: MongoDataSource<User>;
    constructor(mongoClient: MongoClient) {
        this.database = new MongoDataSource<User>(mongoClient, "users", { username: 1 });
    }
    public async create(creating: SingleOrArray<User>) {
        return await this.database.create(creating);
    }

    public async read(reading?: SingleOrArray<DeepPartial<User>>) {
        return await this.database.read(reading);
    }

    public async update(updating: SingleOrArray<User>) {
        return await this.database.update(updating);
    }

    public async destroy(destroying: SingleOrArray<DeepPartial<User>>) {
        return await this.database.destroy(destroying);
    }
}