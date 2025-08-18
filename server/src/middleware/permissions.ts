import { Permission, User } from "common/models/user";
import { NextFunction, Request, Response } from "express";

export const requiresPermission = (...permissions: Permission[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = req["user"] as User;
        if (!user) {
            res.status(400).send({ error: "invalid token" });
        } else if (!user.permissions.some((up) => permissions.includes(up))) {
            res.status(403).send({ error: "access denied" });
        } else {
            next();
        }
    };
};