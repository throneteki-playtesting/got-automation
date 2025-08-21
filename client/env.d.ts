interface ImportMetaEnv {
    readonly VITE_VERBOSE: boolean;
    readonly VITE_SERVER_PORT: number;
    readonly VITE_SERVER_HOST: string;
    readonly VITE_CLIENT_PORT: number;
    readonly VITE_CLIENT_HOST: string;
}
interface ImportMeta {
    readonly env: ImportMetaEnv;
}

export type AppEnv = ImportMetaEnv;