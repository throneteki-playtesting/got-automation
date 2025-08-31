import { Role } from "common/models/user";
import MongoDataSource from "./dataSources/mongoDataSource";
import { MongoClient } from "mongodb";
import { DeepPartial, SingleOrArray } from "common/types";

export default class RolesRepository {
    private database: MongoDataSource<Role>;
    constructor(mongoClient: MongoClient) {
        this.database = new MongoDataSource<Role>(mongoClient, "roles", { name: 1 });
    }
    public async create(creating: SingleOrArray<Role>) {
        return await this.database.create(creating);
    }

    public async read(reading?: SingleOrArray<DeepPartial<Role>>) {
        return await this.database.read(reading);
    }

    public async update(updating: SingleOrArray<Role>) {
        return await this.database.update(updating);
    }

    public async destroy(destroying: SingleOrArray<DeepPartial<Role>>) {
        return await this.database.destroy(destroying);
    }
}