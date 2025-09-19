import express from "express";
import { celebrate, Joi, Segments } from "celebrate";
import asyncHandler from "express-async-handler";
import { dataService, discordService } from "@/services";
import ReviewThreads from "@/discord/reviewThreads";
import * as Schemas from "common/models/schemas";
import { JsonPlaytestingReview } from "common/models/reviews";
import { asArray } from "common/utils";
import { SingleOrArray } from "common/types";

const router = express.Router();

type ReviewBody = SingleOrArray<JsonPlaytestingReview>;

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

export default router;