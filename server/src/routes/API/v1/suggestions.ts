import * as Schemas from "common/models/schemas";
import { celebrate, Joi, Segments } from "celebrate";
import { Permission, User } from "common/models/user";
import asyncHandler from "express-async-handler";
import express, { Request } from "express";
import { ICardSuggestion } from "common/models/cards";
import { dataService } from "@/services";
import { hasPermission, validate } from "common/utils";
import { validateRequest } from "@/middleware/permissions";
import { IGetEndpoint, IGetResponse } from "@/types";
import { StatusCodes } from "http-status-codes";

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
    asyncHandler<{ result: string[] }, unknown, unknown, IGetEndpoint<ICardSuggestion>>(async (req, res, next) => {
        const { filter, orderBy, page, perPage } = req.query;
        const result = await dataService.suggestions.read(filter, orderBy, page, perPage);
        const count = await dataService.suggestions.count(filter);

        const response: IGetResponse<ICardSuggestion> = {
            total: count,
            data: result
        };
        req["response"] = response;
        next();
    })
];

router.get("/tags", asyncHandler<unknown, unknown, unknown, unknown>(async (req, res) => {
    const result = await dataService.suggestions.tags();

    res.json(result);
}));

router.get("/",
    ...handleGetSuggestions,
    (req, res) => {
        const response = req["response"] as IGetResponse<ICardSuggestion>;
        res.status(StatusCodes.OK).json(response);
    }
);

router.get("/:id",
    celebrate({
        [Segments.PARAMS]: {
            id: Joi.string().required()
        }
    }), (req: Request<{ id: string }, unknown, unknown, IGetEndpoint<ICardSuggestion>>, res: unknown, next: (arg?: unknown) => void) => {
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
    (req, res) => {
        const response = req["response"] as IGetResponse<ICardSuggestion>;
        res.status(StatusCodes.OK).json(response.data[0]);
    }
);

router.get("/:userDiscordId",
    celebrate({
        [Segments.PARAMS]: {
            userDiscordId: Joi.string().required()
        }
    }), (req: Request<{ userDiscordId: string }, unknown, unknown, IGetEndpoint<ICardSuggestion>>, res: unknown, next: (arg?: unknown) => void) => {
        const { userDiscordId } = req.params;
        let { filter } = req.query;
        try {
            filter = filter || {};
            if (Array.isArray(filter)) {
                filter.forEach((f) => f.user.discordId = userDiscordId);
            } else {
                filter.user.discordId = userDiscordId;
            }
            req.query.filter = filter;
            next();
        } catch (err) {
            next(err);
        }
    },
    ...handleGetSuggestions,
    (req, res) => {
        const response = req["response"] as IGetResponse<ICardSuggestion>;
        res.status(StatusCodes.OK).json(response);
    }
);

// Create suggestion
router.post("/",
    validateRequest((user: User) => validate(user, Permission.MAKE_SUGGESTIONS)),
    celebrate({
        [Segments.BODY]: Schemas.CardSuggestion.Draft.options({ abortEarly: false })
    }), asyncHandler<unknown, unknown, Omit<ICardSuggestion, "id" | "updated" | "created">, unknown>(async (req, res) => {
        const body = req.body;

        const created = new Date();
        let suggestion = {
            ...body,
            created,
            updated: created
        } as ICardSuggestion;
        suggestion = await dataService.suggestions.create(suggestion);

        res.status(StatusCodes.OK).json(suggestion);
    })
);

// Update suggestion
router.put("/:id",
    validateRequest(async (user: User, req: Request<{ id: string }, unknown, ICardSuggestion, unknown>) => {
        const [suggestion] = await dataService.suggestions.read({ id: req.params.id });
        return !!suggestion && hasPermission(user, Permission.EDIT_SUGGESTIONS) || validate(user, Permission.MAKE_SUGGESTIONS, (user) => user.discordId === suggestion.user.discordId);
    }),
    celebrate({
        [Segments.PARAMS]: {
            id: Joi.string().required()
        },
        [Segments.BODY]: Schemas.CardSuggestion.Full.options({ abortEarly: false })
    }), asyncHandler<{ id: string }, unknown, ICardSuggestion, unknown>(async (req, res) => {
        const { id } = req.params;
        const body = req.body;
        // Prevent id from being changed
        body.id = id;

        const suggestion = await dataService.suggestions.update(body);

        res.status(StatusCodes.OK).json(suggestion);
    })
);

// Delete suggestion
router.delete("/:id",
    validateRequest(async (user: User, req: Request<{ id: string }, unknown, unknown, unknown>) => {
        const [suggestion] = await dataService.suggestions.read({ id: req.params.id });
        return !!suggestion && hasPermission(user, Permission.DELETE_SUGGESTIONS) || validate(user, Permission.MAKE_SUGGESTIONS, (user) => user.discordId === suggestion.user.discordId);
    }),
    celebrate({
        [Segments.PARAMS]: {
            id: Joi.string().required()
        }
    }),
    asyncHandler<{ id: string }, unknown, unknown, unknown>(async (req, res) => {
        const { id } = req.params;
        const result = await dataService.suggestions.destroy({ id });

        res.send({
            deleted: result
        });
    })
);

export default router;