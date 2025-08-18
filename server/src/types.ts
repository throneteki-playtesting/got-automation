import { Permission } from "common/models/user";

export type JWTPayload = {
    username: string,
    permissions: Permission[]
}