import { dataService } from "@/services";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";
import { ApiErrorResponse } from "@/errors";
import { StatusCodes } from "http-status-codes";
import { AccessTokenPayload } from "@/types";

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
            const { accessToken } = req.cookies;

            if (!accessToken) {
                throw new ApiErrorResponse(StatusCodes.UNAUTHORIZED, "Invalid Authentication", "No access token provided");
            }
            try {
                const { discordId } = jwt.verify(accessToken, process.env.JWT_SECRET) as AccessTokenPayload;
                const [user] = await dataService.users.read({ discordId });
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