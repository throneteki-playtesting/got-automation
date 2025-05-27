import { Collection, MongoClient } from "mongodb";

abstract class MongoDataSource<C, R> {
    protected collection: Collection<C>;
    constructor(client: MongoClient, protected name: string) {
        this.collection = client.db().collection<C>(name);
    }
    abstract create(model?: object): Promise<R[]>
    abstract read(model?: object): Promise<R[]>
    abstract update(model?: object): Promise<R[]>
    abstract destroy(model?: object): Promise<R[]>
};

export default MongoDataSource;