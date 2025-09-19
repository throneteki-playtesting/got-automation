import { ApiErrorResponse } from "@/errors";
import { User } from "common/models/user";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import asyncHandler from "express-async-handler";

export function validateRequest<A, B, C, D>(validateFunc: (user: User, req: Request<A, B, C, D>, res: Response) => boolean | Promise<boolean>) {
    return asyncHandler<A, B, C, D>(async (req, res, next) => {
        const user = req["user"] as User;
        const isValid = await validateFunc(user, req, res);
        if (!isValid) {
            throw new ApiErrorResponse(StatusCodes.FORBIDDEN, "Access Denied", "User has insufficient permissions to perform this action");
        }
        next();
    });
}