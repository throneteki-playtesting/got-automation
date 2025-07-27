import express from "express";
import { celebrate, Joi, Segments } from "celebrate";
import asyncHandler from "express-async-handler";
import { dataService } from "@/services";
import { Pack } from "@/data/models/pack";

const router = express.Router();

type ProjectParam = { project: number };
type ReleaseQuery = { short: string, name: string, release: Date };

// TODO: Openapi spec
router.get("/:project/development", celebrate({
    [Segments.PARAMS]: {
        project: Joi.number().required()
    }
}), asyncHandler<ProjectParam, unknown, unknown, unknown>(async (req, res) => {
    const { project } = req.params;

    // TODO: Error if project does not exist
    const [pack] = await dataService.projects.read({ number: project });
    const cards = await dataService.cards.read({ project });
    const latest = cards.latest.filter((card) => !card.isReleasable);
    const developmentPack = new Pack(pack.code, pack.name, latest);

    res.json(developmentPack.toPackData());
}));

router.get("/:project/release", celebrate({
    [Segments.PARAMS]: {
        project: Joi.number().required()
    },
    [Segments.QUERY]: {
        short: Joi.string().required(),
        name: Joi.string().required(),
        release: Joi.date().required()
    }
}), asyncHandler<ProjectParam, unknown, unknown, ReleaseQuery>(async (req, res) => {
    const { project } = req.params;
    const { short, name, release } = req.query;

    // TODO: Error if project does not exist
    const cards = await dataService.cards.read({ project });
    const releasing = cards.latest.filter((card) => card.release?.short === short);
    // TODO: Add validation
    const releasePack = new Pack(short, name, releasing, release);

    res.json(releasePack.toPackData());
}));

export default router;