import { Joi } from "celebrate";
import * as Cards from "common/models/cards";
import * as Projects from "common/models/projects";
import { playedRanges, statementAnswers } from "common/models/reviews";
import { Regex } from "common/utils";

const JoiXNumber = Joi.alternatives().try(
    Joi.number(),
    Joi.string().valid("X")
);
const JoiXDashNumber = Joi.alternatives().try(
    Joi.number(),
    Joi.string().valid("X", "-")
);

const Permission = Joi.number();

export const SingleOrArray = (object: Joi.ObjectSchema) => Joi.alternatives().try(object, Joi.array().items(object));

export const Card = {
    Full: Joi.object({
        code: Joi.string().regex(Regex.Card.code).required(),
        faction: Joi.string().required().valid(...Cards.factions),
        name: Joi.string().required(),
        type: Joi.string().required().valid(...Cards.types),
        loyal: Joi.when("faction", {
            is: Joi.not("neutral"),
            then: Joi.boolean().required()
        }),
        traits: Joi.array().items(Joi.string()),
        text: Joi.string(),
        illustrator: Joi.string(),
        flavor: Joi.string(),
        designer: Joi.string(),
        deckLimit: Joi.number(),
        quantity: Joi.number(),
        cost: Joi.when("type", {
            is: Joi.valid("character", "location", "attachment", "event"),
            then: JoiXDashNumber.required()
        }),
        unique: Joi.when("type", {
            is: Joi.valid("character", "location", "attachment"),
            then: Joi.boolean().required()
        }),
        strength: Joi.when("type", {
            is: Joi.valid("character"),
            then: JoiXNumber.required()
        }),
        icons: Joi.when("type", {
            is: Joi.valid("character"),
            then: Joi.object({
                military: Joi.boolean().required(),
                intrigue: Joi.boolean().required(),
                power: Joi.boolean().required()
            }).required()
        }),
        plotStats: Joi.when("type", {
            is: Joi.valid("plot"),
            then: Joi.object({
                income: JoiXNumber.required(),
                initiative: JoiXNumber.required(),
                claim: JoiXNumber.required(),
                reserve: JoiXNumber.required()
            }).required()
        })
    }),
    Partial: Joi.object({
        code: Joi.string().regex(Regex.Card.code),
        faction: Joi.string().valid(...Cards.factions),
        name: Joi.string(),
        type: Joi.string().valid(...Cards.types),
        loyal: Joi.boolean(),
        traits: Joi.array().items(Joi.string()),
        text: Joi.string(),
        illustrator: Joi.string(),
        flavor: Joi.string(),
        designer: Joi.string(),
        deckLimit: Joi.number(),
        quantity: Joi.number(),
        cost: JoiXDashNumber,
        unique: Joi.boolean(),
        strength: JoiXNumber,
        icons: Joi.object({
            military: Joi.boolean(),
            intrigue: Joi.boolean(),
            power: Joi.boolean()
        }),
        plotStats: Joi.object({
            income: JoiXNumber,
            initiative: JoiXNumber,
            claim: JoiXNumber,
            reserve: JoiXNumber
        })
    })
};

export const PlaytestingCard = {
    Full: Card.Full.keys({
        project: Joi.number().required(),
        version: Joi.string().required().regex(Regex.SemanticVersion),
        number: Joi.number().required(),
        note: Joi.object({
            type: Joi.string().required().valid(...Cards.noteTypes),
            text: Joi.string().when("type", {
                is: Joi.not("implemented"),
                then: Joi.required()
            })
        }),
        playtesting: Joi.string().regex(Regex.SemanticVersion),
        github: Joi.object({
            status: Joi.string().required().valid(...Cards.githubStatuses),
            issueUrl: Joi.string().required()
        }),
        release: Joi.object({
            short: Joi.string().required(),
            number: Joi.number().required()
        })
    }),
    Partial: Card.Partial.keys({
        project: Joi.number(),
        version: Joi.string().regex(Regex.SemanticVersion),
        number: Joi.number(),
        note: Joi.object({
            type: Joi.string().valid(...Cards.noteTypes),
            text: Joi.string()
        }),
        playtesting: Joi.string().regex(Regex.SemanticVersion),
        github: Joi.object({
            status: Joi.string().valid(...Cards.githubStatuses),
            issueUrl: Joi.string()
        }),
        release: Joi.object({
            short: Joi.string(),
            number: Joi.number()
        })
    })
};

export const RenderedCard = {
    Full: Card.Full.keys({
        watermark: Joi.object({
            top: Joi.string(),
            middle: Joi.string(),
            bottom: Joi.string()
        })
    }),
    Partial: Card.Partial.keys({
        watermark: Joi.object({
            top: Joi.string(),
            middle: Joi.string(),
            bottom: Joi.string()
        })
    })
};

export const Project = {
    Full: Joi.object({
        number: Joi.number().required(),
        name: Joi.string().required(),
        code: Joi.string().required(),
        active: Joi.boolean().required(),
        script: Joi.string().required(),
        short: Joi.string().required(),
        type: Joi.string().required().valid(...Projects.types),
        perFaction: Joi.number().required(),
        neutral: Joi.number().required(),
        releases: Joi.number().required(),
        milestone: Joi.number().required(),
        formUrl: Joi.string().required(),
        emoji: Joi.string()
    }),
    Partial: Joi.object({
        number: Joi.number(),
        name: Joi.string(),
        code: Joi.string(),
        active: Joi.boolean(),
        script: Joi.string(),
        short: Joi.string(),
        type: Joi.string().valid(...Projects.types),
        perFaction: Joi.number(),
        neutral: Joi.number(),
        releases: Joi.number(),
        milestone: Joi.number(),
        formUrl: Joi.string(),
        emoji: Joi.string()
    })
};

export const PlaytestingReview = {
    Full: Joi.object({
        reviewer: Joi.string().required(),
        project: Joi.number().required(),
        number: Joi.number().required(),
        version: Joi.string().required().regex(Regex.SemanticVersion),
        decks: Joi.array().items(Joi.string()),
        played: Joi.string().required().valid(...playedRanges),
        statements: Joi.object({
            boring: Joi.string().required().valid(...statementAnswers),
            competitive: Joi.string().required().valid(...statementAnswers),
            creative: Joi.string().required().valid(...statementAnswers),
            balanced: Joi.string().required().valid(...statementAnswers),
            releasable: Joi.string().required().valid(...statementAnswers)
        }).required(),
        additional: Joi.string(),
        epoch: Joi.number().required()
    }),
    Partial: Joi.object({
        reviewer: Joi.string(),
        project: Joi.number(),
        number: Joi.number(),
        version: Joi.string().regex(Regex.SemanticVersion),
        decks: Joi.array().items(Joi.string()),
        played: Joi.string().valid(...playedRanges),
        statements: Joi.object({
            boring: Joi.string().valid(...statementAnswers),
            competitive: Joi.string().valid(...statementAnswers),
            creative: Joi.string().valid(...statementAnswers),
            balanced: Joi.string().valid(...statementAnswers),
            releasable: Joi.string().valid(...statementAnswers)
        }),
        additional: Joi.string(),
        epoch: Joi.number()
    })
};

export const Role = {
    Full: Joi.object({
        discordId: Joi.string().required(),
        name: Joi.string().required(),
        permissions: Joi.array().items(Permission).default([])
    }),
    Partial: Joi.object({
        discordId: Joi.string(),
        name: Joi.string(),
        permissions: Joi.array().items(Permission)
    })
};

export const User = {
    Full: Joi.object({
        username: Joi.string().required(),
        displayname: Joi.string().required(),
        discordId: Joi.string().required(),
        avatarUrl: Joi.string().required(),
        lastLogin: Joi.date(),
        permissions: Joi.array().items(Permission).default([]),
        roles: Joi.array().items(Role.Full).default([])
    }),
    Partial: Joi.object({
        username: Joi.string(),
        displayname: Joi.string(),
        discordId: Joi.string(),
        avatarUrl: Joi.string(),
        lastLogin: Joi.date(),
        permissions: Joi.array().items(Permission),
        roles: Joi.array().items(Role.Partial)
    })
};