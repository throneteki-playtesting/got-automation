import { SemanticVersion } from "../utils";

export const statementAnswers = ["strongly agree", "somewhat agree", "neither agree nor disagree", "somewhat disagree", "strongly disagree"];
export type StatementAnswer = typeof statementAnswers[number];
export const playedRanges = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
export type PlayedRange = typeof playedRanges[number];
export type Statements = {
    boring: StatementAnswer,
    competitive: StatementAnswer,
    creative: StatementAnswer,
    balanced: StatementAnswer,
    releasable: StatementAnswer
};

export interface JsonPlaytestingReview {
    reviewer: string,
    project: number,
    number: number,
    version: SemanticVersion,
    decks: string[],
    played: PlayedRange,
    statements: Statements,
    additional?: string,
    epoch: number
}

export enum StatementQuestions {
    boring = "It is boring",
    competitive = "It will see competitive play",
    creative = "It inspires creative, fun or jank ideas",
    balanced = "It is balanced",
    releasable = "It could be released as is"
}