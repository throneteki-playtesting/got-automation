import { Forms } from "../forms/form";
import { Controller } from "./controller";
import { GASAPI } from "common/models/googleAppScriptAPI";

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace FormController {
    export function doGet(path: string[], e: GoogleAppsScript.Events.DoGet) {
        const { reviewer, number, version } = e.parameter;
        const reviews = Forms.toReviews(...Forms.get().getResponses()).filter((review) => (!reviewer || reviewer === review.reviewer) && (!number || parseInt(number) === review.number) && (!version || version === review.version));
        const response = { request: e, data: { reviews } } as GASAPI.Response<GASAPI.Forms.ReadReviewsResponse>;
        return Controller.sendResponse(response);
    }

    export function doPost(path: string[], e: GoogleAppsScript.Events.DoPost) {
        const { reviewers, cards } = JSON.parse(e.postData.contents) as { reviewers: string[], cards: string[] };
        const result = Forms.syncFormValues(cards, reviewers);
        const response = { request: e, data: { cards: result.cards.length, reviewers: result.reviewers.length } } as GASAPI.Response<GASAPI.Forms.SetValuesResponse>;
        return Controller.sendResponse(response);
    }
}

export {
    FormController
};