import MongoDataSource from "./dataSources/mongoDataSource";
import { MongoClient } from "mongodb";
import { RefreshToken } from "common/models/auth";

export default class AuthRepository {
    private refreshTokens: MongoDataSource<RefreshToken>;
    constructor(mongoClient: MongoClient) {
        this.refreshTokens = new MongoDataSource<RefreshToken>(mongoClient, "refreshTokens", { discordId: 1 });
        // Ensures that refresh tokens are automatically deleted once they expire
        this.refreshTokens.collection.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });
    }
    /**
     * Adds a new refresh token to the database. Will remove existing token if exists
     */
    public async addRefreshToken(refreshToken: RefreshToken) {
        await this.refreshTokens.destroy({ discordId: refreshToken.discordId });
        return await this.refreshTokens.create(refreshToken);
    }
    /**
     * Returns refresh token for provided tokenHash, and deletes it from database
     */
    public async popRefreshToken(tokenHash: string) {
        const result = await this.refreshTokens.readOne({ tokenHash });
        await this.refreshTokens.destroy({ tokenHash });
        return result;
    }
}