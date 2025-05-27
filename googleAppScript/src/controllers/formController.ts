import * as RestClient from "../restClient";
import * as Forms from "../forms/form";
import * as Reviews from "common/models/reviews";

export function doGet(path: string[], e: GoogleAppsScript.Events.DoGet) {
    const { reviewer, number, version } = e.parameter;
    const reviews = Forms.toReviews(...Forms.get().getResponses()).filter((review) => (!reviewer || reviewer === review.reviewer) && (!number || parseInt(number) === review.number) && (!version || version === review.version));
    const response = { request: e, data: { reviews } } as RestClient.Response<ReadReviewsResponse>;
    return RestClient.generateResponse(response);
}

export function doPost(path: string[], e: GoogleAppsScript.Events.DoPost) {
    const { reviewers, cards } = JSON.parse(e.postData.contents) as { reviewers: string[], cards: string[] };
    const result = Forms.syncFormValues(cards, reviewers);
    const response = { request: e, data: { cards: result.cards.length, reviewers: result.reviewers.length } } as RestClient.Response<SetValuesResponse>;
    return RestClient.generateResponse(response);
}

export interface ReadReviewsResponse { reviews: Reviews.Model[] }
export interface SetValuesResponse { cards: number, reviewers: number }