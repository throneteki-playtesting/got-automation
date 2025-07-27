import express from "express";
import { celebrate, Joi, Segments } from "celebrate";
import asyncHandler from "express-async-handler";
import { renderService } from "@/services";
import * as Schemas from "@/data/schemas";
import { JsonRenderableCard } from "common/models/cards";
import RenderedCard from "@/data/models/cards/renderedCard";

export type ResourceFormat = "JSON" | "HTML" | "TXT" | "PNG" | "PDF";

const router = express.Router();
type FormatQuery = { format?: ResourceFormat }
type CardBody = JsonRenderableCard | JsonRenderableCard[];

router.post("/", celebrate({
    [Segments.QUERY]: {
        format: Joi.string().insensitive().valid("JSON", "HTML", "PDF", "PNG").default("PNG")
    },
    [Segments.BODY]: Joi.alternatives(Schemas.RenderedCard.Body, Joi.array().items(Schemas.RenderedCard.Body))
}), asyncHandler<unknown, unknown, CardBody, FormatQuery>(async (req, res) => {
    const { format } = req.query;
    const body = req.body;

    const cards = Array.isArray(body) ? body.map((b) => new RenderedCard(b)) as [] : [new RenderedCard(body)];

    switch (format) {
        case "JSON": {
            const json = cards.map((card) => card.toJSON());
            res.json(Array.isArray(body) ? json : json[0]);
        }
        case "HTML": {
            const html = await renderService.asHtml(Array.isArray(body) ? "batch" : "single", cards);
            res.send(html);
        }
        case "PDF": {
            const pdf = await renderService.asPDF(cards);
            res.contentType("application/pdf");
            res.send(pdf);
        }
        case "PNG": {
            // TODO: Make this handling more generic
            if (cards.length > 1) {
                res.status(400).json({ message: `Cannot render PNG for multiple cards: found ${cards.length} cards. Use PDF instead` });
                break;
            }
            const png = await renderService.asPNG(cards[0]);
            res.type("png");
            res.send(png);
        }
    }
}));

export default router;