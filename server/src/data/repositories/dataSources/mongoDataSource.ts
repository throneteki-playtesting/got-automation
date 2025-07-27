import { Collection, Filter, MongoClient, WithId } from "mongodb";
import { flatten } from "flat";

abstract class MongoDataSource<T> {
    protected collection: Collection<T>;
    constructor(client: MongoClient, protected name: string) {
        this.collection = client.db().collection<T>(name);
    }
    protected buildFilterQuery(values?: Partial<T> | Partial<T>[]): Filter<T> {
        let query = {};

        if (values) {
            if (!Array.isArray(values)) {
                query = flatten(values);
            } else if (values.length > 0) {
                query = values.length === 1
                    ? flatten(values[0])
                    : { "$or": values.map(v => flatten(v)) };
            }
        }

        // By default, MongoDB treats "undefined" as value not existing.
        // This converts any "undefined" to count as any value for existing
        for (const [key, value] of Object.entries(query)) {
            if (value === undefined) {
                query[key] = { $exists: true };
            }
        }
        return query as Filter<T>;
    }
    protected withoutId(values: WithId<T>[]) {
        return values.map((value) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { _id, ...rest } = value;
            return rest as T;
        });
    }
    abstract create(creating: T | T[], options?: object): Promise<T[]>
    abstract read(reading?: Partial<T> | Partial<T>[], options?: object): Promise<T[]>
    abstract update(updating: T | T[], options?: object): Promise<T[]>
    abstract destroy(deleting: Partial<T> | Partial<T>[], options?: object): Promise<number>
};

export default MongoDataSource;