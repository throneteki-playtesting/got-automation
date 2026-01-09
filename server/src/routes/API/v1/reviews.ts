import express from "express";
import { celebrate, Joi, Segments } from "celebrate";
import asyncHandler from "express-async-handler";
import { dataService, discordService } from "@/services";
import ReviewThreads from "@/discord/reviewThreads";
import * as Schemas from "common/models/schemas";
import { IPlaytestReview } from "common/models/reviews";
import { asArray, Regex, SemanticVersion } from "common/utils";
import { SingleOrArray } from "common/types";
import { StatusCodes } from "http-status-codes";

const router = express.Router();

type ReviewBody = SingleOrArray<IPlaytestReview>;

// TODO: More endpoint options (post = create, put = complete update, patch = partial update)
router.post("/", celebrate({
    [Segments.BODY]: Joi.array().items(Schemas.PlaytestingReview)
}), asyncHandler<unknown, unknown, ReviewBody, unknown>(async (req, res) => {
    const body = req.body;

    await dataService.reviews.update(body, true);

    const allCreated = [];
    const allUpdated = [];
    const allFailed = [];

    const reviews = asArray(body);
    const guilds = await discordService.getGuilds();
    for (const guild of guilds) {
        const { created, updated, failed } = await ReviewThreads.sync(guild, true, ...reviews);
        allCreated.push(...created);
        allUpdated.push(...updated);
        allFailed.push(...failed);
    }

    res.send({
        created: allCreated,
        updated: allUpdated,
        failed: allFailed
    });
}));

router.get("/:project/:number", celebrate({
    [Segments.PARAMS]: {
        project: Joi.number().required(),
        number: Joi.number().required()
    }
}), asyncHandler<{ project: number, number: number }, unknown, unknown, unknown>(async (req, res) => {
    const { project, number } = req.params;

    const reviews = await dataService.reviews.read({ project, number });

    res.status(StatusCodes.OK).json(reviews);
}));

router.get("/:project/:number/:version", celebrate({
    [Segments.PARAMS]: {
        project: Joi.number().required(),
        number: Joi.number().required(),
        version: Joi.string().regex(Regex.SemanticVersion).required()
    }
}), asyncHandler<{ project: number, number: number, version: SemanticVersion }, unknown, unknown, unknown>(async (req, res) => {
    const { project, number, version } = req.params;

    const reviews = await dataService.reviews.read({ project, number, version });

    res.status(StatusCodes.OK).json(reviews.all);
}));

export default router;