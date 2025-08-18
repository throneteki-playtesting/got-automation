import { Permission, User } from "common/models/user";
import { SingleOrArray } from "common/types";
import { asArray } from "common/utils";

export type PageInfo = { path: string, label: string, permission?: SingleOrArray<Permission>, subPages?: PageInfo[] }
export const navigationItems: PageInfo[] = [
    {
        path: "/",
        label: "Home"
    },
    {
        path: "/cards",
        label: "Cards"
        // permission: Permission.READ_CARDS
    },
    {
        path: "/suggestions",
        label: "Suggestions"
        // permission: Permission.SUGGEST_CARDS
    },
    {
        path: "/admin",
        label: "Admin"
    }
];
export const profileMenuItems: PageInfo[] = [
    {
        path: "/profile",
        label: "Profile"
    }
];

export const isVisibleFor = (page: PageInfo, user?: User) => {
    const pagePermissions = asArray(page.permission);
    if (!pagePermissions || pagePermissions.length === 0) {
        return true;
    }
    if (!user) {
        return false;
    }
    return user.permissions.some((up) => pagePermissions.some((pp) => up === pp));
};