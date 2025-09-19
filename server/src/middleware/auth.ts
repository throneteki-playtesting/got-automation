import { dataService } from "@/services";
import { JWTPayload } from "@/types";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { ApiErrorResponse } from "@/errors";
import { StatusCodes } from "http-status-codes";

export const authenticate = asyncHandler<unknown, unknown, unknown, unknown>(
    async (req, res, next) => {
        // TODO: Update to "integration token"
        if (process.env.NODE_ENV === "development" && req.header("Authorization")?.startsWith("Basic")) {
            const encoded = req.header("Authorization").replace("Basic ", "");
            const decoded = Buffer.from(encoded, "base64").toString();
            const [username, password] = decoded.split(":");
            if (username !== process.env.BASIC_USERNAME || password !== process.env.BASIC_PASSWORD) {
                throw new ApiErrorResponse(StatusCodes.UNAUTHORIZED, "Invalid Authentication", "Basic credentials are invalid or missing");
            }
            next();
        } else {
            const token = (req.cookies?.jwt || req.header("Authorization")?.replace("Bearer ", "")) as string;

            if (!token) {
                throw new ApiErrorResponse(StatusCodes.UNAUTHORIZED, "Invalid Authentication", "No authentication token provided");
            }
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
                const [user] = await dataService.users.read({ username: decoded.username });
                req["user"] = user;
                next();
            } catch (err) {
                if ("name" in err && err.name === "TokenExpiredError") {
                    throw new ApiErrorResponse(StatusCodes.UNAUTHORIZED, "Invalid Authentication", "Token Expired");
                }
                throw new ApiErrorResponse(StatusCodes.UNAUTHORIZED, "Invalid Authentication", "Token Invalid");
            }
        }
    }
);