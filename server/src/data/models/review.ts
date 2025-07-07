import Card from "./card";
import { Joi } from "celebrate";
import { dataService } from "@/services";
import { condenseId, Id, Model, playedRange, PlayedRange, statementAnswer, Statements } from "common/models/reviews";
import { Regex } from "common/utils";
import { factions } from "common/models/cards";

class Review {
    public _id: Id;
    constructor(
        public reviewer: string,
        public card: Card,
        public decks: string[],
        public played: PlayedRange,
        public statements: Statements,
        public additional: string,
        public date: Date
    ) {
        this._id = condenseId({ reviewer, projectId: card.project._id, number: card.number, version: card.version });
    }

    static async fromModels(...models: Model[]) {
        if (models.length === 0) {
            return [];
        }
        const matchers = models.map((model) => ({ projectId: model.projectId, number: model.number, version: model.version }));
        const cards = await dataService.cards.read({ matchers });
        return models.map((model) => {
            const card = cards.find((c) => c.project._id === model.projectId && c.number === model.number && c.version === model.version);
            const date = new Date(model.epoch);
            return new Review(model.reviewer, card, model.decks, model.played, model.statements, model.additional, date);
        });
    }

    static async toModels(...reviews: Review[]) {
        return reviews.map((review) => ({
            _id: review._id,
            reviewer: review.reviewer,
            projectId: review.card.project._id,
            number: review.card.number,
            version: review.card.version,
            faction: review.card.faction,
            name: review.card.name,
            decks: review.decks,
            played: review.played,
            statements: review.statements,
            additional: review.additional,
            epoch: review.date.getTime()
        }) as Model);
    }

    public static schema = Joi.object({
        _id: Joi.string().regex(Regex.Review.id.full),
        reviewer: Joi.string().required(),
        projectId: Joi.number().required(),
        number: Joi.number().required(),
        version: Joi.string().required().regex(Regex.SemanticVersion),
        faction: Joi.string().valid(...factions),
        name: Joi.string(),
        decks: Joi.array().items(Joi.string()),
        played: Joi.string().required().valid(...playedRange),
        statements: Joi.object({
            boring: Joi.string().required().valid(...statementAnswer),
            competitive: Joi.string().required().valid(...statementAnswer),
            creative: Joi.string().required().valid(...statementAnswer),
            balanced: Joi.string().required().valid(...statementAnswer),
            releasable: Joi.string().required().valid(...statementAnswer)
        }).required(),
        additional: Joi.string(),
        epoch: Joi.number().required()
    });
}

export default Review;