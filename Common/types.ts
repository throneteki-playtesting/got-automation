import type { StatusCodes } from "http-status-codes";

export type DeepPartial<T> =
    T extends (infer U)[]
        ? DeepPartial<U>[] | undefined
        : T extends object
            ? { [P in keyof T]?: DeepPartial<T[P]> }
            : T;

export type SingleOrArray<T> = T | T[];

export type AuthStatus = "success" | "error" | "unauthorized";

export type ApiError = {
    code: StatusCodes,
    error: string,
    message: string,
}