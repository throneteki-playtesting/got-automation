import express from "express";
import { celebrate, Joi, Segments } from "celebrate";
import asyncHandler from "express-async-handler";
import { dataService, renderService } from "@/services";
import * as Schemas from "common/models/schemas";
import { RenderableCard } from "common/models/cards";
import RenderedCard from "@/data/models/cards/renderedCard";
import { asArray, Regex } from "common/utils";
import { SingleOrArray } from "common/types";
import { ApiErrorResponse } from "@/errors";
import { StatusCodes } from "http-status-codes";
import { UUID } from "crypto";
import archiver from "archiver";

export type ResourceFormat = "JSON" | "TXT" | "PNG" | "PDF";

const router = express.Router();

type FormatQuery = { format?: ResourceFormat }
type CardBody = SingleOrArray<RenderableCard>;

router.post("/", celebrate({
    [Segments.QUERY]: {
        format: Joi.string().insensitive().valid("JSON", "PDF", "PNG").default("PNG")
    },
    [Segments.BODY]: Schemas.SingleOrArray(Schemas.RenderedCard.Full)
}), asyncHandler<unknown, unknown, CardBody, FormatQuery>(async (req, res) => {
    const { format } = req.query;
    const body = req.body;

    const cards = asArray(body).map((card) => new RenderedCard(card));
    if (cards.length === 0) {
        throw new ApiErrorResponse(StatusCodes.BAD_REQUEST, "Invalid Arguments", "Must provide at least one card to render");
    }

    switch (format) {
        case "JSON": {
            const json = cards.map((card) => card.toJSON());
            res.status(StatusCodes.OK).json(Array.isArray(body) ? json : json[0]);
            break;
        }
        case "PDF": {
            const pdf = await renderService.asPDF(cards);
            res.contentType("application/pdf");
            res.status(StatusCodes.OK).send(pdf);
            break;
        }
        case "PNG": {
            if (cards.length === 1) {
                const [card] = cards;
                const image = await renderService.asPNG(card);
                res.type("png");
                res.status(StatusCodes.OK).send(image.buffer);
            } else {
                res.type("application/zip");
                const images = await renderService.asPNG(cards);
                const archive = archiver("zip", { zlib: { level: 9 } });
                archive.pipe(res);

                archive.on("error", (err: unknown) => {
                    throw new ApiErrorResponse(StatusCodes.INTERNAL_SERVER_ERROR, "Archive Error", "An internal server error has occurred during archive process of multiple rendered images", err);
                });
                for (const image of images) {
                    archive.append(image.buffer, { name: image.filename });
                }
                // Sends to client
                archive.finalize();
            }
            break;
        }
    }
}));

router.get("/job", celebrate({
    [Segments.QUERY]: {
        id: Joi.string().regex(Regex.UUID).required()
    }
}), asyncHandler<unknown, unknown, unknown, { id: UUID }>(async (req, res) => {
    const { id } = req.query;

    const job = await dataService.redis.get(id);
    if (!job || typeof job !== "string") {
        throw new ApiErrorResponse(StatusCodes.BAD_REQUEST, "Invalid Id", `No render job exists for id "${id}"`);
    }
    const jobData = JSON.parse(job);

    res.status(StatusCodes.OK).json(jobData);

    await dataService.redis.del(id);
}));

export default router;