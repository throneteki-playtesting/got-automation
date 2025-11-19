import { DeepPartial, SingleOrArray } from "common/types";
import RenderedCard from "./data/models/cards/renderedCard";
import { StatusCodes } from "http-status-codes";
import { UUID } from "crypto";

export interface AccessTokenPayload {
    discordId: string,
    expiresAt: Date
}
export type AuthStatus = "success" | "error" | "cancelled";

export interface ApiError {
    code: StatusCodes,
    error: string,
    message: string,
}

export function isApiError(err: unknown): err is ApiError {
    return err instanceof Error && "code" in err && "message" in err && "error" in err;
}

export interface RefreshAuthResponse {
    status: "success" | "failure",
    message?: string
}

export interface IRepository<T> {
    create(creating: SingleOrArray<T>): Promise<unknown>;
    read(reading?: SingleOrArray<DeepPartial<T>>): Promise<unknown>;
    update(updating: SingleOrArray<T>): Promise<unknown>;
    destroy(destroying: SingleOrArray<DeepPartial<T>>): Promise<unknown>;
}

export type RenderType = "single" | "batch";
export interface RenderJob { id: UUID, type: RenderType, data: { id: UUID, card: RenderedCard }[] };
export interface SingleRenderJob extends RenderJob { type: "single", options?: SingleRenderJobOptions };
export type SingleRenderJobOptions = { orientation?: "horizontal" | "vertical", rounded?: boolean };
export interface BatchRenderJob extends RenderJob { type: "batch", options?: BatchRenderJobOptions };
export type BatchRenderJobOptions = { copies?: number, perPage?: number, rounded?: boolean };