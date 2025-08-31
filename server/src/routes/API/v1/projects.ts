import express, { Request } from "express";
import { celebrate, Joi, Segments } from "celebrate";
import asyncHandler from "express-async-handler";
import { dataService } from "@/services";
import * as Schemas from "@/data/schemas";
import { JsonProject } from "common/models/projects";
import { DeepPartial, SingleOrArray } from "common/types";

const router = express.Router();

type ProjectParam = { number: number };
type FilterQuery = { filter?: SingleOrArray<DeepPartial<JsonProject>> }
type ProjectBody = SingleOrArray<JsonProject>;

const handleGetProjects = [
    celebrate({
        [Segments.QUERY]: {
            filter: Schemas.SingleOrArray(Schemas.Project.Partial)
        }
    }),
    asyncHandler<unknown, unknown, unknown, FilterQuery>(async (req, res, next) => {
        const { filter } = req.query;
        const projects = await dataService.projects.read(filter);

        const json = projects.map((project) => project.toJSON());
        req.body = json;
        next();
    })
];
router.get("/", ...handleGetProjects, (req, res) => res.json(req.body));

router.get("/:number",
    celebrate({
        [Segments.PARAMS]: {
            number: Joi.number().required()
        }
    }), (req: Request<ProjectParam, unknown, unknown, FilterQuery>, res: unknown, next: (arg?: unknown) => void) => {
        const { number } = req.params;
        let { filter } = req.query;
        try {
            filter = filter || {};
            if (Array.isArray(filter)) {
                filter.forEach((f) => f.number = number);
            } else {
                filter.number = number;
            }
            req.query.filter = filter;
        } catch (err) {
            next(err);
        }
        next();
    }, ...handleGetProjects, (req, res) => res.json(req.body[0] ?? {}));

// TODO: Openapi spec
// TODO: More endpoint options (get, post = create, put = complete update, patch = partial update)
router.put("/", celebrate({
    [Segments.BODY]: Schemas.SingleOrArray(Schemas.Project.Full)
}), asyncHandler<unknown, unknown, ProjectBody, unknown>(async (req, res) => {
    const body = req.body;
    // TODO: Change to create, error if exists
    const result = await dataService.projects.update(body);

    res.send({
        updated: result
    });
}));

export default router;