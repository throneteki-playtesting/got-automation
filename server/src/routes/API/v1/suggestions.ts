import * as Schemas from "common/models/schemas";
import { celebrate, Joi, Segments } from "celebrate";
import { Permission, User } from "common/models/user";
import asyncHandler from "express-async-handler";
import express, { Request } from "express";
import { DeepPartial } from "common/types";
import { CardSuggestion } from "common/models/cards";
import { dataService } from "@/services";
import { hasPermission, validate } from "common/utils";
import { validateRequest } from "@/middleware/permissions";
import { IGetEndpoint } from "@/types";

const router = express.Router();

const handleGetSuggestions = [
    validateRequest((user) => validate(user, Permission.READ_SUGGESTIONS)),
    celebrate({
        [Segments.QUERY]: {
            filter: Schemas.SingleOrArray(Schemas.CardSuggestion.Partial),
            orderBy: Joi.object({
                name: Joi.string(),
                type: Joi.string()
            })
        }
    }, { allowUnknown: true }),
    asyncHandler<unknown, unknown, unknown, IGetEndpoint<CardSuggestion>>(async (req, res, next) => {
        const { filter, orderBy, page, perPage } = req.query;
        const result = await dataService.suggestions.read(filter, orderBy, page, perPage);

        req.body = result;
        next();
    })
];

router.get("/tags", asyncHandler<unknown, unknown, unknown, unknown>(async (req, res) => {
    const result = await dataService.suggestions.tags();

    res.json(result);
}));

router.get("/", ...handleGetSuggestions, (req, res) => res.json(req.body));

router.get("/:id",
    celebrate({
        [Segments.PARAMS]: {
            id: Joi.string().required()
        }
    }), (req: Request<{ id: string }, unknown, unknown, IGetEndpoint<CardSuggestion>>, res: unknown, next: (arg?: unknown) => void) => {
        const { id } = req.params;
        let { filter } = req.query;
        try {
            filter = filter || {};
            if (Array.isArray(filter)) {
                filter.forEach((f) => f.id = id);
            } else {
                filter.id = id;
            }
            req.query.filter = filter;
            next();
        } catch (err) {
            next(err);
        }
    },
    ...handleGetSuggestions,
    (req, res) => res.json(req.body[0] ?? {})
);

router.get("/:suggestedBy",
    celebrate({
        [Segments.PARAMS]: {
            suggestedBy: Joi.string().required()
        }
    }), (req: Request<{ suggestedBy: string }, unknown, unknown, IGetEndpoint<CardSuggestion>>, res: unknown, next: (arg?: unknown) => void) => {
        const { suggestedBy } = req.params;
        let { filter } = req.query;
        try {
            filter = filter || {};
            if (Array.isArray(filter)) {
                filter.forEach((f) => f.suggestedBy = suggestedBy);
            } else {
                filter.suggestedBy = suggestedBy;
            }
            req.query.filter = filter;
            next();
        } catch (err) {
            next(err);
        }
    },
    ...handleGetSuggestions,
    (req, res) => res.json(req.body)
);

// Create suggestion
router.post("/",
    validateRequest((user: User, req: Request<unknown, unknown, Omit<CardSuggestion, "_id" | "updated" | "created">, unknown>) =>
        validate(user, Permission.MAKE_SUGGESTIONS, (user) => user.discordId === req.body.suggestedBy)
    ),
    celebrate({
        [Segments.BODY]: Schemas.CardSuggestion.Full.options({ abortEarly: false })
    }), asyncHandler<unknown, unknown, Omit<CardSuggestion, "_id" | "updated" | "created">, unknown>(async (req, res) => {
        const baseSuggestion = req.body;
        const suggestion = {
            ...baseSuggestion,
            created: new Date().toUTCString(),
            updated: new Date().toUTCString()
        } as CardSuggestion;

        const [result] = await dataService.suggestions.create(suggestion);

        res.send({
            created: result
        });
    })
);

// Update suggestion
router.put("/:id",
    validateRequest(async (user: User, req: Request<{ id: string }, unknown, CardSuggestion, unknown>) => {
        const [suggestion] = await dataService.suggestions.read({ id: req.params.id });
        return !!suggestion && hasPermission(user, Permission.EDIT_SUGGESTIONS) || validate(user, Permission.MAKE_SUGGESTIONS, (user) => user.discordId === suggestion.suggestedBy);
    }),
    celebrate({
        [Segments.PARAMS]: {
            id: Joi.string().required()
        },
        [Segments.BODY]: Schemas.CardSuggestion.Full.options({ abortEarly: false })
    }), asyncHandler<{ id: string }, unknown, CardSuggestion, unknown>(async (req, res) => {
        const { id } = req.params;
        const suggestion = req.body;
        // Prevent id from being changed
        suggestion.id = id;

        const result = await dataService.suggestions.update(suggestion);

        res.send({
            updated: result
        });
    })
);

// Delete suggestion
router.delete("/:id",
    validateRequest(async (user: User, req: Request<{ id: string }, unknown, unknown, unknown>) => {
        const [suggestion] = await dataService.suggestions.read({ id: req.params.id });
        return !!suggestion && hasPermission(user, Permission.DELETE_SUGGESTIONS) || validate(user, Permission.MAKE_SUGGESTIONS, (user) => user.discordId === suggestion.suggestedBy);
    }),
    celebrate({
        [Segments.PARAMS]: {
            id: Joi.string().required()
        }
    }),
    asyncHandler<{ id: string }, unknown, unknown, unknown>(async (req, res) => {
        const { id } = req.params;
        const filter: DeepPartial<CardSuggestion> = {
            id: id
        };

        const result = await dataService.suggestions.destroy(filter);

        res.send({
            deleted: result
        });
    })
);

export default router;