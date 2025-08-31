import { Permission, User } from "common/models/user";
import { SingleOrArray } from "common/types";
import { asArray, hasPermission } from "common/utils";

export type PageInfo = { path?: string, label: string, permission?: SingleOrArray<Permission>, subPages?: PageInfo[] }
export const navigationItems: PageInfo[] = [
    {
        path: "/",
        label: "Home"
    },
    {
        path: "/cards",
        label: "Cards",
        permission: Permission.READ_CARDS
    },
    {
        path: "/suggestions",
        label: "Suggestions",
        permission: Permission.SUGGEST_CARDS
    },
    {
        label: "Admin",
        subPages: [
            {
                path: "/users",
                label: "Users",
                permission: Permission.READ_USERS
            },
            {
                path: "/roles",
                label: "Roles",
                permission: Permission.READ_ROLES
            }
        ]
    }
];
export const profileMenuItems: PageInfo[] = [
    {
        path: "/profile",
        label: "Profile"
    }
];

export const isVisibleFor = (page: PageInfo, user?: User): boolean => {
    const pagePermissions = asArray(page.permission ?? []);

    let isVisible = false;
    if (page.subPages && page.subPages.length > 0) {
        isVisible = page.subPages.some((subPage) => isVisibleFor(subPage, user));

        if (!isVisible && pagePermissions.length > 0) {
            isVisible = hasPermission(user, ...pagePermissions);
        }
    } else {
        isVisible = hasPermission(user, ...pagePermissions);
    }
    return isVisible;
};