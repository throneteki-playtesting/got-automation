import GasClient from "@/google/gasClient";

abstract class GASDataSource<T> {
    protected client: GasClient;
    constructor() {
        this.client = new GasClient();
    }
    abstract create(creating: T | T[], options?: object): Promise<T[]>
    abstract read(reading?: Partial<T> | Partial<T>[], options?: object): Promise<T[]>
    abstract update(updating: T | T[], options?: object): Promise<T[]>
    abstract destroy(deleting: Partial<T> | Partial<T>[], options?: object): Promise<number>
}

export default GASDataSource;