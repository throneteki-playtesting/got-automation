import express, { Request } from "express";
import { celebrate, Joi, Segments } from "celebrate";
import asyncHandler from "express-async-handler";
import PlaytestingCard from "@/data/models/cards/playtestingCard";
import { eq, inc } from "semver";
import { dataService, logger, renderService } from "@/services";
import { hasPermission, parseCardCode, SemanticVersion } from "common/utils";
import { IPlaytestCard, NoteType } from "common/models/cards";
import * as Schemas from "common/models/schemas";
import { DeepPartial, SingleOrArray } from "common/types";
import { Permission } from "common/models/user";
import { ApiErrorResponse } from "@/errors";
import { StatusCodes } from "http-status-codes";
import { validateRequest } from "@/middleware/permissions";
import { NoteVersion } from "@/utils";
import { ICardVersionCollection } from "common/collections/cardCollection";

export type ResourceFormat = "JSON" | "TXT" | "PNG" | "PDF";

const router = express.Router();

type ProjectParam = { project: number };
type CardParam = { number: number };
type FilterQuery = { filter?: SingleOrArray<DeepPartial<IPlaytestCard>>, hard?: boolean, latest?: boolean }
type RenderQuery = { copies?: number, perPage?: number };
type FormatQuery = { format?: ResourceFormat }
type CardBody = SingleOrArray<IPlaytestCard>;

const handleGetCards = [
    validateRequest((user) => hasPermission(user, Permission.READ_CARDS)),
    celebrate({
        [Segments.QUERY]: {
            filter: Schemas.SingleOrArray(Schemas.PlaytestingCard.Partial),
            latest: Joi.boolean().default(true),
            format: Joi.string().insensitive().valid("JSON", "PNG", "PDF").default("JSON"),
            copies: Joi.number().default(3),
            perPage: Joi.number().default(9)
        }
    }),
    asyncHandler<unknown, unknown, unknown, RenderQuery & FilterQuery & FormatQuery>(async (req, res) => {
        const { format, filter, latest, copies, perPage } = req.query;
        const result = await dataService.cards.collection(filter);
        const cards = latest ? result.latest : result.all;

        switch (format) {
            case "JSON":
                const json = cards.map((card) => card.toJSON());
                res.status(StatusCodes.OK).json(json);
                break;
            case "PNG":
                if (cards.length > 1) {
                    throw new ApiErrorResponse(StatusCodes.BAD_REQUEST, "Invalid Arguments", `Cannot render PNG for multiple cards: found ${cards.length} cards. Refine filter, use PDF, or set latest=true`);
                }
                const png = await renderService.asPNG(cards[0].toRenderedCard());
                res.type("png");
                res.status(StatusCodes.OK).send(png);
                break;
            case "PDF":
                const pdf = await renderService.asPDF(cards.map((card) => card.toRenderedCard()), { copies, perPage });
                res.contentType("application/pdf");
                res.status(StatusCodes.OK).send(pdf);
                break;
        }
    })
];

router.get("/", ...handleGetCards);

/**
 * @openapi
 * /cards/{projectNo}:
 *   get:
 *     tags:
 *       - cards
 *     summary: Finds cards within project
 *     description: Returns one or many cards within a project
 *     operationId: getCardsInProject
 *     parameters:
 *       - name: projectNo
 *         in: path
 *         description: Number of the project to find cards in
 *         required: true
 *         schema:
 *           type: integer
 *       - name: filter
 *         in: query
 *         description: Filter cards by data
 *         required: false
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/playtestingCard/query'
 *             example: ''
 *         allowReserved: true
 *       - name: latest
 *         in: query
 *         description: Whether to only get the latest versions of cards
 *         required: false
 *         schema:
 *           type: boolean
 *           default: true
 *       - name: hard
 *         in: query
 *         description: Whether to hard refresh data before finding
 *         required: false
 *         schema:
 *           type: boolean
 *           default: false
 *       - name: format
 *         in: query
 *         description: Format to present cards in
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - json
 *             - html
 *             - pdf
 *           default: json
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/playtestingCard/body'
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           text/html:
 *               type: string
 *       404:
 *         description: No cards or project found
 *       400:
 *         description: Invalid parameters provided
 *
 */
router.get("/:project", celebrate({
    [Segments.PARAMS]: {
        project: Joi.number().required()
    }
}), (req: Request<ProjectParam, unknown, unknown, FilterQuery>, res: unknown, next: (arg?: unknown) => void) => {
    const { project } = req.params;
    let { filter } = req.query;
    try {
        filter = filter || {};
        if (Array.isArray(filter)) {
            filter.forEach((f) => f.project = project);
        } else {
            filter.project = project;
        }
        req.query.filter = filter;
        next();
    } catch (err) {
        next(err);
    }
}, ...handleGetCards);

/**
 * @openapi
 * /cards/{projectNo}/{cardNo}:
 *   get:
 *     tags:
 *       - cards
 *     summary: Find card versions within project
 *     description: Returns versions of a card within a project
 *     operationId: getCardInProject
 *     parameters:
 *       - name: projectNo
 *         in: path
 *         description: Number of the project to find card in
 *         required: true
 *         schema:
 *           type: integer
 *       - name: cardNo
 *         in: path
 *         description: Number of the card (within project)
 *         required: true
 *         schema:
 *           type: integer
 *       - name: filter
 *         in: query
 *         description: Filter card versions by data
 *         required: false
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/playtestingCard/query'
 *             example: ''
 *         allowReserved: true
 *       - name: latest
 *         in: query
 *         description: Whether to only get the latest version of the card. This will return a single response object, rather than an array
 *         required: false
 *         schema:
 *           type: boolean
 *           default: true
 *       - name: hard
 *         in: query
 *         description: Whether to hard refresh data before finding
 *         required: false
 *         schema:
 *           type: boolean
 *           default: false
 *       - name: format
 *         in: query
 *         description: Format to present the card
 *         required: false
 *         schema:
 *           type: string
 *           enum:
 *             - json
 *             - html
 *             - png
 *             - pdf
 *           default: json
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/playtestingCard/body'
 *                 - type: array
 *                   items:
 *                     $ref: '#/components/schemas/playtestingCard/body'
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *           text/html:
 *               type: string
 *       404:
 *         description: No card or project found
 *       400:
 *         description: Invalid parameters provided
 */
router.get("/:project/:number", celebrate({
    [Segments.PARAMS]: {
        project: Joi.number().required(),
        number: Joi.number().required()
    }
}), (req: Request<ProjectParam & CardParam, unknown, unknown, FilterQuery>, res: unknown, next: (arg?: unknown) => void) => {
    const { project, number } = req.params;
    let { filter } = req.query;
    try {
        filter = filter || {};
        if (Array.isArray(filter)) {
            filter.forEach((f) => {
                f.project = project;
                f.number = number;
            });
        } else {
            filter.project = project;
            filter.number = number;
        }
        req.query.filter = filter;
        next();
    } catch (err) {
        next(err);
    }
}, ...handleGetCards);

router.put("/:project/:number/draft",
    celebrate({
        [Segments.PARAMS]: {
            project: Joi.number().required(),
            number: Joi.number().required()
        },
        [Segments.BODY]: Schemas.PlaytestingCard.Draft
    }),
    validateRequest(async (user, req) => {
        const { project: projectNumber, number } = req.params;
        const { version } = req.body;
        const [project] = await dataService.projects.read({ number: projectNumber });
        if (!project) {
            throw new ApiErrorResponse(StatusCodes.BAD_REQUEST, "Invalid Data", `Project #${projectNumber} does not exist`);
        }
        const existing = (await dataService.cards.collection({ project: projectNumber, number }))[number];
        if (!project.draft && !existing) {
            throw new ApiErrorResponse(StatusCodes.BAD_REQUEST, "Invalid Data", `Card #${number} does not exist for project #${projectNumber}`);
        }
        if (project.draft && !eq(version, "0.0.0")) {
            throw new ApiErrorResponse(StatusCodes.BAD_REQUEST, "Invalid Data", `Project #${projectNumber} is in draft and cannot accept cards with non-0.0.0 version`);
        }

        req.params.existing = existing;
        return hasPermission(user, (existing?.draft ? Permission.EDIT_CARDS : Permission.CREATE_CARDS));
    }),
    asyncHandler<ProjectParam & CardParam & { existing?: ICardVersionCollection<PlaytestingCard> }, IPlaytestCard, IPlaytestCard, unknown>(async (req, res) => {
        const { project, number, existing } = req.params;
        const body = req.body;
        const code = parseCardCode(false, project, number);

        // If card does not exist, version should be preview (0.0.0)
        let version = "0.0.0";
        if (existing) {
            // Preview cards are simply updated, without version incrementing
            // To initialise all preview cards to 1.0.0, use /:project/initialise
            const latest = existing.latest;
            version = latest?.isPreview ? latest.version : inc(body.playtesting, NoteVersion[body.note.type]) as SemanticVersion;

            // Existing draft with different version needs to be removed first as upsert will not match (as version is a primary key)
            const draft = existing.draft;
            if (draft && draft.version !== version) {
                const { project, number, version } = draft;
                await dataService.cards.destroy({ project, number, version });
            }
        }

        let card = { ...body, code, version } as IPlaytestCard;
        card = await dataService.cards.update(card, true);

        res.status(StatusCodes.OK).json(card);
    })
);

router.delete("/:project/:number/draft",
    validateRequest((user) => hasPermission(user, Permission.DELETE_CARDS)),
    celebrate({
        [Segments.PARAMS]: {
            project: Joi.number().required(),
            number: Joi.number().required()
        }
    }),
    asyncHandler<ProjectParam & CardParam, unknown, unknown, unknown>(async (req, res) => {
        const { project, number } = req.params;

        const existing = (await dataService.cards.collection({ project, number }))[number];

        let result = 0;
        if (existing) {
            const { project, number, version } = existing.draft;
            result = await dataService.cards.destroy({ project, number, version });
        }
        res.send({
            deleted: result
        });
    })
);

/**
 * @openapi
 * /cards:
 *   post:
 *     tags:
 *       - cards
 *     summary: Adds one or more cards
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/playtestingCard/body'
 *               - type: array
 *                 items:
 *                   $ref: '#/components/schemas/playtestingCard/body'
 *     responses:
 *       200:
 *         description: Success
 */
router.post("/",
    validateRequest((user) => hasPermission(user, Permission.CREATE_CARDS)),
    celebrate({
        [Segments.BODY]: Schemas.SingleOrArray(Schemas.PlaytestingCard.Full)
    }),
    asyncHandler<unknown, unknown, CardBody, unknown>(async (req, res) => {
        const body = req.body;
        const cards = Array.isArray(body) ? body.map((b) => new PlaytestingCard(b)) as [] : [new PlaytestingCard(body)];

        const incType = (type: NoteType) => {
            switch (type) {
                case "replaced": return "major";
                case "reworked": return "minor";
                case "updated": return "patch";
            }
        };
        logger.verbose(`Recieved ${cards.length} card update(s) from sheets`);
        const latest: IPlaytestCard[] = [];
        const upsert: IPlaytestCard[] = [];
        const destroy: DeepPartial<IPlaytestCard>[] = [];

        for (const card of cards) {
        // If card is not in playtesting, push updates
            if (!card.playtesting) {
                upsert.push(card);
            }

            // If card is currently being drafted (eg. edited)
            if (card.isDraft) {
                const expectedVersion = inc(card.playtesting, incType(card.note.type));
                // If it's version has not been incremented, increment it, and push new id card to database/archive
                if (card.version !== expectedVersion) {
                    const newCard = card.clone();
                    // Setting the incremented version of "latest" (card) for sheet and to the newly upserted card into database
                    card.version = newCard.version = inc(card.playtesting, incType(card.note.type)) as SemanticVersion;
                    upsert.push(newCard);
                } else {
                    upsert.push(card);
                }
                // Either way, push changes to latest to properly sync
                latest.push(card);
            }
            // If versions do not match (and is not in draft), then a draft has been reverted, and thus should be deleted in database/archive, and version reverted in latest
            else if (card.version !== card.playtesting) {
                destroy.push({ project: card.project, number: card.number, version: card.version });
                card.version = card.playtesting;
                latest.push(card);
            }
        }

        await dataService.cards.update(upsert, true);
        if (destroy.length > 0) {
            await dataService.cards.destroy(destroy);
        }
        await dataService.cards.spreadsheet.update(latest, { sheets: ["latest"] });

        res.status(StatusCodes.OK).send({
            updated: upsert.length + latest.length,
            deleted: destroy.length
        });
    }));

export default router;