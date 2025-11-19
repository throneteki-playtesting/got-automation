import { MongoClient } from "mongodb";
import { logger } from "@/services";
import CardsRepository from "./repositories/cardsRepository";
import ProjectsRepository from "./repositories/projectsRepository";
import ReviewsRepository from "./repositories/reviewRepository";
import UsersRepository from "./repositories/usersRepository";
import RolesRepository from "./repositories/rolesRepository";
import SuggestionsRepository from "./repositories/suggestionsRepository";
import AuthRepository from "./repositories/authRepository";
import { createClient, RedisClientType } from "redis";

class DataService {
    private database: MongoClient;
    public redis: RedisClientType;

    private isConnected: boolean;

    private _projects: ProjectsRepository;
    private _cards: CardsRepository;
    private _reviews: ReviewsRepository;
    private _users: UsersRepository;
    private _roles: RolesRepository;
    private _suggestions: SuggestionsRepository;
    private _auth: AuthRepository;

    constructor() {
        this.database = new MongoClient(`${process.env.DATABASE_URL}?retryWrites=true&retryReads=true`, { ignoreUndefined: true, maxPoolSize: 10, connectTimeoutMS: 5000 });
        this.connectDb();

        this.redis = createClient({
            url: process.env.REDIS_HOST
        });
        this.connectRedis();
    }

    private async connectDb() {
        try {
            await this.database.db().command({ ping: 1 });
            // Confirms that MongoDB is running
            logger.info(`MongoDB connected to ${this.database.db().databaseName}`);

            this._projects = new ProjectsRepository(this.database);
            this._cards = new CardsRepository(this.database);
            this._reviews = new ReviewsRepository(this.database);
            this._users = new UsersRepository(this.database);
            this._roles = new RolesRepository(this.database);
            this._suggestions = new SuggestionsRepository(this.database);
            this._auth = new AuthRepository(this.database);
            return true;
        } catch (err) {
            logger.error(err);
            return false;
        }
    }

    private async connectRedis() {
        try {
            await this.redis.connect();
            logger.info(`Redis connected at ${process.env.REDIS_HOST}`);
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
            if (!this.connectDb()) {
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

    get auth() {
        return this.getRepository<AuthRepository>("auth");
    }
}

export default DataService;