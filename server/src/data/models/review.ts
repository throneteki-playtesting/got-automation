import { IPlaytestReview, PlayedRange, Statements } from "common/models/reviews";
import { SemanticVersion } from "common/utils";

class Review implements IPlaytestReview {
    public reviewer: string;
    public project: number;
    public number: number;
    public version: SemanticVersion;
    public decks: string[];
    public played: PlayedRange;
    public statements: Statements;
    public additional?: string;
    public created: number;
    public updated: number;

    constructor(data: IPlaytestReview) {
        this.reviewer = data.reviewer;
        this.project = data.project;
        this.number = data.number;
        this.version = data.version;
        this.decks = data.decks;
        this.played = data.played;
        this.statements = data.statements;
        this.additional = data.additional;
        this.created = data.created;
        this.updated = data.updated;
    }

    toString() {
        return `${this.number} | ${this.version} | ${this.reviewer}`;
    }
}

export default Review;