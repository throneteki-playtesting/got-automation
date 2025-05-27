import GasClient from "@/google/gasClient";

abstract class GASDataSource<T> {
    protected client: GasClient;
    constructor() {
        this.client = new GasClient();
    }
    abstract create(model?: object): Promise<T[]>
    abstract read(model?: object): Promise<T[]>
    abstract update(model?: object): Promise<T[]>
    abstract destroy(model?: object): Promise<T[]>
}

export default GASDataSource;