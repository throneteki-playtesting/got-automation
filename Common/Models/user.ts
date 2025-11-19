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
    /** Can view playtesting cards */
    READ_CARDS,
    /** Can edit playtesting cards */
    EDIT_CARDS,
    /** Can create playtesting cards or updates */
    CREATE_CARDS,
    /** Can delete playtesting cards */
    DELETE_CARDS,
    /** Can view all card suggestions */
    READ_SUGGESTIONS,
    /** Can create, edit and delete their own card suggestions */
    MAKE_SUGGESTIONS,
    /** Can edit other users card suggestions */
    EDIT_SUGGESTIONS,
    /** Can delete other users card suggestions */
    DELETE_SUGGESTIONS,
    /** Can view all users */
    READ_USERS,
    /** Can edit all users */
    EDIT_USERS,
    /** Can view all roles */
    READ_ROLES,
    /** Can edit all roles */
    EDIT_ROLES,
    /** Can render cards to another format (eg. PDF, PNG)*/
    RENDER_CARDS,
}