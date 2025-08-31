import { dataService } from "@/services";
import { JWTPayload } from "@/types";
import asyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";

export const authenticate = asyncHandler<unknown, unknown, unknown, unknown>(
    async (req, res, next) => {
        // TODO: Update to "integration token"
        if (process.env.NODE_ENV === "development" && req.header("Authorization")?.startsWith("Basic")) {
            const encoded = req.header("Authorization").replace("Basic ", "");
            const decoded = Buffer.from(encoded, "base64").toString();
            const [username, password] = decoded.split(":");
            if (username !== process.env.BASIC_USERNAME || password !== process.env.BASIC_PASSWORD) {
                res.status(401).json({ message: "Invalid basic credentials" });
            }
            next();
        } else {
            const token = (req.cookies?.jwt || req.header("Authorization")?.replace("Bearer ", "")) as string;

            if (!token) {
                res.status(401).json({ message: "No authentication token provided" });
                return;
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
    }
);