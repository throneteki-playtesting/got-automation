import { JsonProject } from "common/models/projects";
import MongoDataSource from "./dataSources/mongoDataSource";
import { MongoClient } from "mongodb";
import Project from "../models/project";
import { DeepPartial, SingleOrArray } from "common/types";

export default class ProjectsRepository {
    public database: MongoDataSource<JsonProject>;
    constructor(mongoClient: MongoClient) {
        this.database = new MongoDataSource<JsonProject>(mongoClient, "projects", { number: 1 });
    }

    public async create(creating: SingleOrArray<JsonProject>) {
        const database = await this.database.create(creating);
        return database.map((json) => new Project(json));
    }

    public async read(reading?: SingleOrArray<DeepPartial<JsonProject>>) {
        const database = await this.database.read(reading);
        return database.map((json) => new Project(json));
    }

    public async update(updating: SingleOrArray<JsonProject>) {
        const database = await this.database.update(updating);
        return database.map((json) => new Project(json));
    }

    public async destroy(destroying: SingleOrArray<DeepPartial<JsonProject>>) {
        return await this.database.destroy(destroying);
    }
}