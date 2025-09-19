import { MongoClient } from "mongodb";
import { logger } from "@/services";
import CardsRepository from "./repositories/cardsRepository";
import ProjectsRepository from "./repositories/projectsRepository";
import ReviewsRepository from "./repositories/reviewRepository";
import UsersRepository from "./repositories/usersRepository";
import RolesRepository from "./repositories/rolesRepository";
import SuggestionsRepository from "./repositories/suggestionsRepository";

class DataService {
    private client: MongoClient;

    private isConnected: boolean;

    private _projects: ProjectsRepository;
    private _cards: CardsRepository;
    private _reviews: ReviewsRepository;
    private _users: UsersRepository;
    private _roles: RolesRepository;
    private _suggestions: SuggestionsRepository;

    constructor() {
        this.client = new MongoClient(`${process.env.DATABASE_URL}?retryWrites=true&retryReads=true`, { ignoreUndefined: true, maxPoolSize: 10, connectTimeoutMS: 5000 });
        this.connect();
    }

    private async connect() {
        try {
            await this.client.db().command({ ping: 1 });
            // Confirms that MongoDB is running
            logger.info(`MongoDB connected to ${this.client.db().databaseName}`);

            this._projects = new ProjectsRepository(this.client);
            this._cards = new CardsRepository(this.client);
            this._reviews = new ReviewsRepository(this.client);
            this._users = new UsersRepository(this.client);
            this._roles = new RolesRepository(this.client);
            this._suggestions = new SuggestionsRepository(this.client);
            return true;
        } catch (err) {
            logger.error(err);
            return false;
        }
    }

    private getRepository<T>(repository: string) {
        const repo = this[`_${repository}`] as T;
        if (!repo) {
            logger.log("warning", `Failed to connect to ${repository}, attempting to reconnect to database...`);
            if (!this.connect()) {
                throw Error("Failed to connect to database");
            }
        }
        return repo;
    }

    get projects() {
        return this.getRepository<ProjectsRepository>("projects");
    }

    get cards() {
        return this.getRepository<CardsRepository>("cards");
    }

    get reviews() {
        return this.getRepository<ReviewsRepository>("reviews");
    }

    get users() {
        return this.getRepository<UsersRepository>("users");
    }

    get roles() {
        return this.getRepository<RolesRepository>("roles");
    }

    get suggestions() {
        return this.getRepository<SuggestionsRepository>("suggestions");
    }
}

export default DataService;