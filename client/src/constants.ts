import { Permission } from "common/models/user";
import { enumToArray } from "./utilities";

export const availablePermissions = enumToArray(Permission);