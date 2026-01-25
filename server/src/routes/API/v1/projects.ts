import express, { Request } from "express";
import { celebrate, Joi, Segments } from "celebrate";
import asyncHandler from "express-async-handler";
import { dataService } from "@/services";
import * as Schemas from "common/models/schemas";
import { IProject } from "common/models/projects";
import { DeepPartial, SingleOrArray } from "common/types";
import { validateRequest } from "@/middleware/permissions";
import { hasPermission } from "common/utils";
import { Permission } from "common/models/user";
import { StatusCodes } from "http-status-codes";
import { ApiErrorResponse } from "@/errors";
import { cloneDeep, isEqual } from "lodash-es";
import { factions, IPlaytestCard } from "common/models/cards";

const router = express.Router();

type ProjectParam = { number: number };
type FilterQuery = { filter?: SingleOrArray<DeepPartial<IProject>> }
type ProjectBody = SingleOrArray<IProject>;

const handleGetProjects = [
    celebrate({
        [Segments.QUERY]: {
            filter: Schemas.SingleOrArray(Schemas.Project.Partial)
        }
    }),
    asyncHandler<unknown, unknown, unknown, FilterQuery>(async (req, res, next) => {
        const { filter } = req.query;
        const projects = await dataService.projects.read(filter);

        req.body = projects;
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
            next();
        } catch (err) {
            next(err);
        }
    }, ...handleGetProjects, (req, res) => res.json(req.body[0] ?? {}));

router.post("/:number/initialise",
    validateRequest((user) => hasPermission(user, Permission.INITIALISE_PROJECTS)),
    celebrate({
        [Segments.PARAMS]: {
            number: Joi.number().required()
        }
    }),
    asyncHandler(async (req, res, next) => {
        const { number } = req.params;
        const [project] = await dataService.projects.read({ number });
        if (!project) {
            throw new ApiErrorResponse(StatusCodes.NOT_FOUND, "Invalid Number", "Project with that number does not exist");
        }
        const cards = await dataService.cards.read({ project: number });
        const totalSlots = Object.values(project.cardCount).reduce((acc, num) => acc + num, 0);
        if (cards.length < totalSlots) {
            throw new ApiErrorResponse(StatusCodes.NOT_ACCEPTABLE, "Invalid Card Slots", "Project is missing cards for allocated slots; either provide cards, or adjust card slots");
        }
        req["project"] = project;
        req["cards"] = cards;
        next();
    }),
    asyncHandler<{ number: number }, unknown, unknown, unknown>(async (req, res) => {
        let project = req["project"] as IProject;
        const cards = req["cards"] as IPlaytestCard[];
        let newCards: IPlaytestCard[] = [];
        // Mapping suggestion id's to the card numbers they have been consumed for
        const suggestionNumbers: Record<string, number> = {};

        project.draft = false;
        for (const card of cards) {
            const newCard = { ...cloneDeep(card), version: "1.0.0" } as IPlaytestCard;
            if (newCard.suggestionId) {
                suggestionNumbers[newCard.suggestionId] = newCard.number;
            }
            newCards.push(newCard);
        }

        project = await dataService.projects.update(project);
        // Need to destroy old versions (0.0.0) and create new (1.0.0)
        // Destory + Create required, as version is a primary key
        await dataService.cards.destroy(cards);
        newCards = await dataService.cards.create(newCards);

        const suggestionIds = Object.keys(suggestionNumbers);
        if (suggestionIds.length > 0) {
            const suggestions = await dataService.suggestions.read(suggestionIds.map((id) => ({ id })));
            for (const suggestion of suggestions) {
                suggestion.archivedReason = `Used for ${project.code} card #${suggestionNumbers[suggestion.id]}`;
            }

            await dataService.suggestions.update(suggestions);
        }
        res.status(StatusCodes.OK).json({
            project,
            cards: newCards
        });
    })
);

router.post("/",
    validateRequest((user) => hasPermission(user, Permission.CREATE_PROJECTS)),
    celebrate({
        [Segments.BODY]: Schemas.Project.Draft
    }),
    asyncHandler(async (req, res, next) => {
        const { number, name, code } = req.body;
        const [existing] = await dataService.projects.read([{ number }, { name }, { code }]);
        if (existing) {
            throw new ApiErrorResponse(StatusCodes.CONFLICT, "Already Exists", "Project with that number, name or code already exists");
        }
        next();
    }),
    asyncHandler<unknown, unknown, IProject, unknown>(async (req, res) => {
        const body = req.body;
        body.created = body.updated = new Date();
        const project = await dataService.projects.create(body);
        res.status(StatusCodes.OK).json(project);
    })
);

router.put("/",
    validateRequest((user) => hasPermission(user, Permission.EDIT_PROJECTS)),
    celebrate({
        [Segments.BODY]: Schemas.SingleOrArray(Schemas.Project.Full)
    }),
    asyncHandler<unknown, unknown, ProjectBody, unknown>(async (req, res) => {
        const body = req.body;
        let project = {
            ...body,
            updated: new Date()
        } as IProject;

        const [previous] = await dataService.projects.read({ number: project.number });
        project = await dataService.projects.update(project);

        // If card counts changed, we need to adjust existing card numbers to ensure they move with the faction adjustments.
        // This means dynamically updating each card number based on the slots each previous faction should have.
        // NOTE: When a faction loses slots, any cards which can no longer fit are deleted.
        if (!isEqual(project.cardCount, previous.cardCount)) {
            const toDelete: IPlaytestCard[] = [];
            const toUpsert: IPlaytestCard[] = [];
            const shifts: Record<string, { offset: number; newMax: number }> = {};
            let previousLimit = 0;
            let totalShift = 0;

            for (const faction of factions) {
                const oldVal = previous.cardCount[faction];
                const newVal = project.cardCount[faction];
                previousLimit += oldVal;
                const newMax = previousLimit + totalShift + (newVal - oldVal);

                shifts[faction] = {
                    offset: totalShift,
                    newMax: newMax
                };

                totalShift += (newVal - oldVal);
            }

            const cards = await dataService.cards.read({ project: project.number });
            for (const card of cards) {
                const { offset, newMax } = shifts[card.faction];
                const newNumber = card.number + offset;

                if (newNumber > newMax) {
                    toDelete.push(card);
                } else if (offset !== 0) {
                    toDelete.push(card);
                    toUpsert.push({ ...card, number: newNumber });
                }
            }

            await dataService.cards.destroy(toDelete);
            await dataService.cards.update(toUpsert, true);
        }

        res.status(StatusCodes.OK).json(project);
    })
);

router.delete("/:number",
    validateRequest((user) => hasPermission(user, Permission.DELETE_PROJECTS)),
    celebrate({
        [Segments.PARAMS]: {
            number: Joi.number().required()
        }
    }),
    asyncHandler<{ number: number }, unknown, unknown, unknown>(async (req, res) => {
        const { number } = req.params;
        const result = await dataService.projects.destroy({ number });
        await dataService.cards.destroy({ project: number });

        res.send({
            deleted: result
        });
    })
);

export default router;