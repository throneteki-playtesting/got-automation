import { Cards as CardsModel } from "./cards";
import { Projects } from "./projects";
import { Reviews as ReviewsModel } from "./reviews";

/* eslint-disable @typescript-eslint/no-namespace */
namespace GASAPI {
    export type Sheet = GASAPI.Cards.CardSheet | "review";

    export interface Response<T> {
        error?: object,
        request: GoogleAppsScript.Events.DoGet,
        data?: T
    }

    export namespace Cards {
        export type CardSheet = "archive" | "latest";

        export interface CreateResponse { created: CardsModel.Model[] }
        export interface ReadResponse { cards: CardsModel.Model[] }
        export interface UpdateResponse { updated: CardsModel.Model[] }
        export interface DestroyResponse { destroyed: CardsModel.Model[] }

    }
    export namespace Forms {
        export interface ReadReviewsResponse { reviews: ReviewsModel.Model[] }
        export interface SetValuesResponse { cards: number, reviewers: number }
    }
    export namespace Project {
        export interface GetResponse { project: Projects.Model }
        export interface SetResponse { project: Projects.Model }
    }
    export namespace Reviews {
        export interface CreateResponse { created: ReviewsModel.Model[] }
        export interface ReadResponse { reviews: ReviewsModel.Model[] }
        export interface UpdateResponse { updated: ReviewsModel.Model[] }
        export interface DestroyResponse { destroyed: ReviewsModel.Model[] }
    }
}

export {
    GASAPI
};