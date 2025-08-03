import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { JsonPlaytestingCard } from "common/models/cards";
import { buildUrl } from "common/utils";


export const cardsApi = createApi({
    reducerPath: "cardsApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
    endpoints: (builder) => ({
        getCards: builder.query<JsonPlaytestingCard[], { filter: Partial<JsonPlaytestingCard> | Partial<JsonPlaytestingCard>[], latest: boolean } | void>({
            query: (options) => {
                const url = buildUrl("cards", { filter: options?.filter, latest: options?.latest });
                return { url, method: "GET" };
            }
        })
    })
});

export const { useGetCardsQuery } = cardsApi;