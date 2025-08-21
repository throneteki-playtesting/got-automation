import { dataService } from "@/services";
import { JWTPayload } from "@/types";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";

export const authenticate = asyncHandler<unknown, unknown, unknown, unknown>(
    async (req, res, next) => {
        const token = (req.cookies?.jwt || req.header("Authorization")?.replace("Bearer ", "")) as string;

        if (!token) {
            res.status(401).json({ message: "No authentication token provided" });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
            const [user] = await dataService.users.read({ username: decoded.username });
            req["user"] = user;
            next();
        } catch {
            res.status(401).json({ message: "Invalid or expired token" });
        }
    }
);