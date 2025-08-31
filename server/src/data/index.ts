import { MongoClient } from "mongodb";
import { logger } from "@/services";
import CardsRepository from "./repositories/cardsRepository";
import ProjectsRepository from "./repositories/projectsRepository";
import ReviewsRepository from "./repositories/reviewRepository";
import UsersRepository from "./repositories/usersRepository";
import RolesRepository from "./repositories/rolesRepository";

class DataService {
    private client: MongoClient;

    private isConnected: boolean;

    private _projects: ProjectsRepository;
    private _cards: CardsRepository;
    private _reviews: ReviewsRepository;
    private _users: UsersRepository;
    private _roles: RolesRepository;

    constructor() {
        this.isConnected = false;
        this.client = new MongoClient(process.env.DATABASE_URL, { ignoreUndefined: true });
        this.client.db().command({ ping: 1 })
            .then(() => {
                this.isConnected = true;
                // Confirms that MongoDB is running
                logger.info(`MongoDB connected to ${this.client.db().databaseName}`);

                this._projects = new ProjectsRepository(this.client);
                this._cards = new CardsRepository(this.client);
                this._reviews = new ReviewsRepository(this.client);
                this._users = new UsersRepository(this.client);
                this._roles = new RolesRepository(this.client);
            })
            .catch(logger.error);
    }

    private getRepository<T>(repository: string) {
        if (!this.isConnected) {
            throw Error(`Failed to connect to "${repository}" repository: MongoDB instance cannot be reached`);
        }
        const repo = this[`_${repository}`] as T;
        if (!repo) {
            throw Error(`Repository "${repository}" does not exist`);
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
}

export default DataService;