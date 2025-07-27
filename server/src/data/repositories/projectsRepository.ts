import { IRepository } from "..";
import { logger } from "@/services";
import { JsonProject } from "common/models/projects";
import MongoDataSource from "./dataSources/mongoDataSource";
import { MongoClient } from "mongodb";
import Project from "../models/project";

export default class ProjectsRepository implements IRepository<JsonProject> {
    public database: ProjectDataSource;
    constructor(mongoClient: MongoClient) {
        this.database = new ProjectDataSource(mongoClient);
    }

    public async create(creating: JsonProject | JsonProject[]) {
        const database = await this.database.create(creating);
        return database.map((json) => new Project(json));
    }

    public async read(reading?: Partial<JsonProject> | Partial<JsonProject>[]) {
        const database = await this.database.read(reading);
        return database.map((json) => new Project(json));
    }

    public async update(updating: JsonProject | JsonProject[]) {
        const database = await this.database.update(updating);
        return database.map((json) => new Project(json));
    }

    public async destroy(destroying: Partial<JsonProject> | Partial<JsonProject>[]) {
        return this.database.destroy(destroying);
    }
}

class ProjectDataSource extends MongoDataSource<JsonProject> {
    constructor(client: MongoClient) {
        super(client, "projects");
    }

    public async create(creating: JsonProject | JsonProject[]) {
        const projects = Array.isArray(creating) ? creating : [creating];
        if (projects.length === 0) {
            return [];
        }

        const results = await this.collection.insertMany(projects, { ordered: false });

        logger.verbose(`Inserted ${results.insertedCount} values into ${this.name} collection`);

        return Object.keys(results.insertedIds).map((index) => projects[index] as JsonProject);
    }

    public async read(reading?: Partial<JsonProject> | Partial<JsonProject>[]) {
        const query = this.buildFilterQuery(reading);
        const result = await this.collection.find(query).toArray();

        logger.verbose(`Read ${result.length} values from ${this.name} collection`);
        return this.withoutId(result);
    }

    public async update(updating: JsonProject | JsonProject[], { upsert }: { upsert: boolean } = { upsert: true }) {
        const projects = Array.isArray(updating) ? updating : [updating];
        if (projects.length === 0) {
            return [];
        }

        const results = await this.collection.bulkWrite(projects.map((project) => ({
            replaceOne: {
                filter: { "number": project.number },
                replacement: project,
                upsert
            }
        })), { ordered: false });

        logger.verbose(`${upsert ? "Upserted" : "Updated"} ${results.modifiedCount + results.upsertedCount} values into ${this.name} collection`);
        const updatedIds = { ... results.insertedIds, ...results.upsertedIds };
        // Return projects which were actually inserted or upserted
        return Object.keys(updatedIds).map((index) => projects[index] as JsonProject);
    }

    public async destroy(deleting: Partial<JsonProject> | Partial<JsonProject>[]) {
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