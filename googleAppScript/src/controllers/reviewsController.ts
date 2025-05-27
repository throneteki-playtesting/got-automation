import { DataSheet } from "../spreadsheets/spreadsheet";
import { ReviewSerializer } from "../spreadsheets/serializers/reviewSerializer";
import * as Reviews from "common/models/reviews";
import * as RestClient from "../restClient";

export function doGet(path: string[], e: GoogleAppsScript.Events.DoGet) {
    // TODO: Allow lists of any Reviews.Model value, then & them all in the get query to GAS
    const { ids } = e.parameter;

    const models = ids?.split(",").map((id: Reviews.Id) => Reviews.expandId(id) as Reviews.Model);
    const readFunc = models ? (values: string[], index: number) => models.some((model) => ReviewSerializer.instance.filter(values, index, model)) : undefined;
    const reviews = DataSheet.sheets.review.read(readFunc);
    const response = { request: e, data: { reviews } } as RestClient.Response<ReadResponse>;
    return RestClient.generateResponse(response);
}
export function doPost(path: string[], e: GoogleAppsScript.Events.DoPost) {
    const { upsert, ids } = e.parameter;
    const reviews: Reviews.Model[] = e.postData ? JSON.parse(e.postData.contents) : undefined;

    const action = path.shift();
    switch (action) {
        case "create": {
            const created = DataSheet.sheets.review.create(reviews);
            const response = { request: e, data: { created } } as RestClient.Response<CreateResponse>;
            return RestClient.generateResponse(response);
        }
        case "update": {
            const isUpsert = upsert === "true";
            const updated = DataSheet.sheets.review.update(reviews, false, isUpsert);
            const reponse = { request: e, data: { updated } } as RestClient.Response<UpdateResponse>;
            return RestClient.generateResponse(reponse);
        }
        case "destroy": {
            const models = ids?.split(",").map((id: Reviews.Id) => Reviews.expandId(id) as Reviews.Model);
            const deleteFunc = models ? (values: string[], index: number) => models.some((model) => ReviewSerializer.instance.filter(values, index, model)) : undefined;
            const destroyed = DataSheet.sheets.review.delete(deleteFunc);
            const response = { request: e, data: { destroyed } } as RestClient.Response<DestroyResponse>;
            return RestClient.generateResponse(response);
        }
        default:
            throw Error(`"${action}" is not a valid review post action`);
    }
}

export interface CreateResponse { created: Reviews.Model[] }
export interface ReadResponse { reviews: Reviews.Model[] }
export interface UpdateResponse { updated: Reviews.Model[] }
export interface DestroyResponse { destroyed: Reviews.Model[] }