import { dataService } from "@/services";
import { celebrate, Segments } from "celebrate";
import * as Schemas from "@/data/schemas";
import express from "express";
import asyncHandler from "express-async-handler";
import { DeepPartial, SingleOrArray } from "common/types";
import { Permission, Role } from "common/models/user";
import { requiresPermission } from "@/middleware/permissions";

const router = express.Router();

type RoleParam = { discordId: string };
type FilterQuery = { filter?: SingleOrArray<DeepPartial<Role>> }

const handleGetRoles = [
    requiresPermission(Permission.READ_ROLES),
    celebrate({
        [Segments.QUERY]: {
            filter: Schemas.SingleOrArray(Schemas.Role.Partial)
        }
    }),
    asyncHandler<unknown, unknown, unknown, FilterQuery>(async (req, res, next) => {
        const { filter } = req.query;
        const result = await dataService.roles.read(filter);

        req.body = result;
        next();
    })
];

router.get("/", ...handleGetRoles, (req, res) => res.json(req.body));

router.put("/:discordId",
    celebrate({
        [Segments.BODY]: Schemas.Role.Full
    }), asyncHandler<RoleParam, unknown, Role, unknown>(async (req, res) => {
        const { discordId } = req.params;
        const role = req.body;
        // Prevent discordId from being changed
        role.discordId = discordId;

        const result = await dataService.roles.update(role);

        res.send({
            updated: result
        });
    })
);

export default router;