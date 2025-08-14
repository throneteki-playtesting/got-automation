import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { JsonPlaytestingCard } from "common/models/cards";
import { JsonProject } from "common/models/projects";
import { DeepPartial, SingleOrArray } from "common/types";
import { asArray, buildUrl } from "common/utils";


export const cardsApi = createApi({
    reducerPath: "cardsApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
    endpoints: (builder) => ({
        getCards: builder.query<JsonPlaytestingCard[], { filter?: SingleOrArray<DeepPartial<JsonPlaytestingCard>>, latest?: boolean } | void>({
            query: (options) => {
                const url = buildUrl("cards", { filter: options?.filter, latest: options?.latest });
                return { url, method: "GET" };
            }
        }),
        getCard: builder.query<JsonPlaytestingCard[], { project: number, number: number, latest?: boolean }>({
            query: (options) => {
                const url = buildUrl(`cards/${options.project}/${options.number}`, { latest: options.latest });
                return { url, method: "GET" };
            }
        }),
        getProject: builder.query<JsonProject, { number: number }>({
            query: (options) => {
                const url = buildUrl(`projects/${options.number}`);
                return { url, method: "GET" };
            }
        }),
        pushCards: builder.mutation<JsonPlaytestingCard[], SingleOrArray<JsonPlaytestingCard>>({
            query: (cards) => {
                const url = buildUrl("cards");
                const body = asArray(cards);
                return { url, method: "POST", body };
            }
        })
    })
});

export const { useGetCardsQuery, useGetCardQuery, useGetProjectQuery, usePushCardsMutation } = cardsApi;