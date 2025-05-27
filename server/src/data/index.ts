import CardsRepository from "./repositories/cardsRepository";
import { MongoClient } from "mongodb";
import MongoDataSource from "./repositories/dataSources/mongoDataSource";
import GASDataSource from "./repositories/dataSources/GASDataSource";
import ProjectsRepository from "./repositories/projectsRepository";
import { logger } from "@/services";
import ReviewsRepository from "./repositories/reviewRepository";

export interface IRepository<Model> {
    database?: MongoDataSource<Model>
    spreadsheet?: GASDataSource<Model>
}

class DataService {
    private client: MongoClient;

    private _projects: ProjectsRepository;
    private _cards: CardsRepository;
    private _reviews: ReviewsRepository;

    constructor(databaseUrl: string) {
        this.client = new MongoClient(databaseUrl, { ignoreUndefined: true });
        this.client.db().command({ ping: 1 })
            .then(() => {
                // Confirms that MongoDB is running
                logger.info(`MongoDB connected to ${this.client.db().databaseName}`);

                this._projects = new ProjectsRepository(this.client);
                this._cards = new CardsRepository(this.client);
                this._reviews = new ReviewsRepository(this.client);
            })
            .catch(logger.error);
    }

    get projects() {
        if (!this._projects) {
            throw Error("Failed to connect to \"projects\" repository: MongoDB instance cannot be reached");
        }
        return this._projects;
    }

    get cards() {
        if (!this._cards) {
            throw Error("Failed to connect to \"cards\" repository: MongoDB instance cannot be reached");
        }
        return this._cards;
    }

    get reviews() {
        if (!this._reviews) {
            throw Error("Failed to connect to \"reviews\" repository: MongoDB instance cannot be reached");
        }
        return this._reviews;
    }
}

export default DataService;