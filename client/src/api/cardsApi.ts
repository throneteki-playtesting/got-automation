import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { JsonPlaytestingCard } from "common/models/cards";


export const cardsApi = createApi({
    reducerPath: "cardsApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
    endpoints: (builder) => ({
        getCards: builder.query<JsonPlaytestingCard[], Partial<JsonPlaytestingCard> | Partial<JsonPlaytestingCard>[] | void>({
            query: (filter) => {
                const query = filter
                    ? `?filter=${encodeURIComponent(JSON.stringify(filter))}`
                    : "";
                // TODO: Improve to not need project number
                return { url: `cards/26${query}`, method: "GET" };
            }
        })
    })
});

export const { useGetCardsQuery } = cardsApi;