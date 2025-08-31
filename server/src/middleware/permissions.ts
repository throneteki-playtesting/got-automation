import { Permission, User } from "common/models/user";
import { hasPermission } from "common/utils";
import { NextFunction, Request, Response } from "express";

export const requiresPermission = (...permissions: Permission[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req["user"] as User;
        if (!hasPermission(user, ...permissions)) {
            res.status(403).send({ error: "access denied" });
        } else {
            next();
        }
    };
};