export type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;

export type SingleOrArray<T> = T | T[];

export type AuthStatus = "success" | "error" | "unauthorized";