import express from "express";
import { celebrate, Joi, Segments } from "celebrate";
import asyncHandler from "express-async-handler";
import { dataService } from "@/services";
import * as Schemas from "@/data/schemas";
import { JsonProject } from "common/models/projects";
import { SingleOrArray } from "common/types";

const router = express.Router();

type ProjectBody = SingleOrArray<JsonProject>;

// TODO: Openapi spec
// TODO: More endpoint options (get, post = create, put = complete update, patch = partial update)
router.post("/", celebrate({
    [Segments.BODY]: Joi.alternatives().try(Schemas.Project.Body, Joi.array().items(Schemas.Project.Body))
}), asyncHandler<unknown, unknown, ProjectBody, unknown>(async (req, res) => {
    const body = req.body;
    // TODO: Change to create, error if exists
    const result = await dataService.projects.update(body);

    res.send({
        updated: result
    });
}));

export default router;