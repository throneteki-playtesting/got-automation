import config from "config";
import express, { NextFunction, Request, Response } from "express";
import partials from "express-partials";
import compression from "compression";
import cors from "cors";
import { errors } from "celebrate";
import api from "./routes/API/index";
import auth from "./routes/auth/index";
import { logger } from "@/services";
import swaggerRouter from "./swagger";
import cookieParser from "cookie-parser";
import { authenticate } from "./middleware/auth";

export const apiUrl = config.get("server.host") || `http://localhost:${config.get("server.ports.api")}`;
function initialise(apiHost: string, serverPort: number, clientPort: number) {
    // Add express
    const app = express();

    // Add middleware
    app.use(cors({
        origin: `${apiHost}:${clientPort}`
    }));
    app.use(partials());
    app.use(compression());
    app.use(express.static("public"));
    app.use(express.json());

    app.use(cookieParser());

    // Register API
    app.use("/api", authenticate, api);

    // Route authentication services (eg. Discord)
    app.use("/auth", auth);

    app.use(swaggerRouter);

    app.use(errors());
    app.use(errorHandler);

    app.use((req, res) => {
        res.status(404).send("Route does not exist");
    });

    app.listen(serverPort, () => {
        logger.info(`Server running on port ${serverPort}: ${apiUrl}`);
        logger.info(`Environment configured as "${process.env.NODE_ENV || "development"}"`);
    });

    return app;
}

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(err);
    if (process.env.NODE_ENV !== "production") {
        res.status(500).send(err);
    } else {
        res.status(500).send("Internal Server Error");
    }
    next();
};

initialise(config.get("server.host"), config.get("server.ports.api"), config.get("server.ports.client"));