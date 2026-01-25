import { IProject } from "common/models/projects";
import MongoDataSource from "./dataSources/mongoDataSource";
import { MongoClient, Sort } from "mongodb";
import { DeepPartial, SingleOrArray, Sortable } from "common/types";
import { IRepository } from "@/types";
import { flatten } from "flat";

export default class ProjectsRepository implements IRepository<IProject> {
    public database: MongoDataSource<IProject>;
    constructor(mongoClient: MongoClient) {
        this.database = new MongoDataSource<IProject>(mongoClient, "projects", { number: 1 });
    }

    public async create(creating: IProject): Promise<IProject>;
    public async create(creating: IProject[]): Promise<IProject[]>;
    public async create(creating: SingleOrArray<IProject>) {
        const result = await this.database.create(creating);
        return Array.isArray(creating) ? result : result[0];
    }

    public async read(reading?: SingleOrArray<DeepPartial<IProject>>, orderBy?: Sortable<IProject>, page?: number, perPage?: number) {
        const sort = orderBy ? flatten(orderBy) as Sort : undefined;
        const limit = perPage;
        const skip = (page - 1) * perPage;
        return await this.database.read(reading, { sort, limit, skip });
    }

    public async count(counting?: SingleOrArray<DeepPartial<IProject>>) {
        return await this.database.count(counting);
    }

    public async update(updating: IProject, upsert?: boolean): Promise<IProject>;
    public async update(updating: IProject[], upsert?: boolean): Promise<IProject[]>;
    public async update(updating: SingleOrArray<IProject>, upsert = true) {
        const result = await this.database.update(updating, { upsert });
        return Array.isArray(updating) ? result : result[0];
    }

    public async destroy(destroying: SingleOrArray<DeepPartial<IProject>>) {
        return await this.database.destroy(destroying);
    }
}