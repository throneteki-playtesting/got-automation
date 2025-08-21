import "@/config";
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

function initialise() {
    // Add express
    const app = express();

    // Add middleware
    app.use(cors({
        origin: process.env.CLIENT_HOST
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

    app.listen(process.env.SERVER_PORT, () => {
        logger.info(`Server running on port ${process.env.SERVER_PORT}: ${process.env.SERVER_HOST}`);
        logger.info(`Environment configured as "${process.env.NODE_ENV}"`);
    });

    return app;
}

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(err);
    if (process.env.NODE_ENV !== "production") {
        res.status(500).json({
            name: err.name,
            message: err.message,
            cause: err.cause,
            stack: err.stack
        });
    } else {
        res.status(500).send("Internal Server Error");
    }
    next();
};

initialise();
