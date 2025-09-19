import { dataService } from "@/services";
import { celebrate, Joi, Segments } from "celebrate";
import * as Schemas from "common/models/schemas";
import express, { Request } from "express";
import asyncHandler from "express-async-handler";
import { DeepPartial, SingleOrArray } from "common/types";
import { Permission, User } from "common/models/user";
import { validateRequest } from "@/middleware/permissions";
import { hasPermission } from "common/utils";

const router = express.Router();

type UserParam = { discordId: string };
type FilterQuery = { filter?: SingleOrArray<DeepPartial<User>> }

router.get("/auth",
    (req, res) => {
        res.json(req["user"]);
    }
);

const handleGetUsers = [
    validateRequest((user) => hasPermission(user, Permission.READ_USERS)),
    celebrate({
        [Segments.QUERY]: {
            filter: Schemas.SingleOrArray(Schemas.User.Partial)
        }
    }),
    asyncHandler<unknown, unknown, unknown, FilterQuery>(async (req, res, next) => {
        const { filter } = req.query;
        const result = await dataService.users.read(filter);

        req.body = result;
        next();
    })
];

router.get("/", ...handleGetUsers, (req, res) => res.json(req.body));

router.get("/:discordId",
    celebrate({
        [Segments.PARAMS]: {
            discordId: Joi.string().required()
        }
    }), (req: Request<UserParam, unknown, unknown, FilterQuery>, res: unknown, next: (arg?: unknown) => void) => {
        const { discordId } = req.params;
        let { filter } = req.query;
        try {
            filter = filter || {};
            if (Array.isArray(filter)) {
                filter.forEach((f) => f.discordId = discordId);
            } else {
                filter.discordId = discordId;
            }
            req.query.filter = filter;
        } catch (err) {
            next(err);
        }
        next();
    },
    ...handleGetUsers,
    (req, res) => res.json(req.body[0] ?? {})
);

router.put("/:discordId",
    celebrate({
        [Segments.BODY]: Schemas.User.Full
    }), asyncHandler<UserParam, unknown, User, unknown>(async (req, res) => {
        const { discordId } = req.params;
        const user = req.body;
        // Prevent discordId from being changed
        user.discordId = discordId;

        const result = await dataService.users.update(user);

        res.send({
            updated: result
        });
    })
);

export default router;