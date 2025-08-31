export interface User {
    username: string,
    displayname: string,
    discordId: string,
    avatarUrl: string,
    lastLogin: Date;
    permissions: Permission[],
    roles: Role[]
}

export interface Role {
    discordId: string,
    name: string,
    permissions: Permission[]
}

export enum Permission {
    READ_CARDS,
    EDIT_CARDS,
    CREATE_CARDS,
    DELETE_CARDS,
    SUGGEST_CARDS,
    READ_USERS,
    EDIT_USERS,
    READ_ROLES,
    EDIT_ROLES,
}