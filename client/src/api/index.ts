import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { JsonPlaytestingCard } from "common/models/cards";
import { JsonProject } from "common/models/projects";
import { User } from "common/models/user";
import { DeepPartial, SingleOrArray } from "common/types";
import { asArray, buildUrl } from "common/utils";

const tagTypes = {
    User: "User",
    Card: "Card",
    Project: "Project"
};

const baseQuery = fetchBaseQuery({
    baseUrl: "/api/v1",
    credentials: "include"
});

const api = createApi({
    reducerPath: "api",
    baseQuery,
    tagTypes: Object.values(tagTypes),
    endpoints: (builder) => ({
        // Login API (only used in authSlice.ts)
        login: builder.query<User, void>({
            query: () => "login"
        }),
        logout: builder.mutation<void, void>({
            query: () => ({
                url: "logout",
                method: "POST",
                credentials: "include"
            })
        }),
        // Cards API
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
        pushCards: builder.mutation<JsonPlaytestingCard[], SingleOrArray<JsonPlaytestingCard>>({
            query: (cards) => {
                const url = buildUrl("cards");
                const body = asArray(cards);
                return { url, method: "POST", body };
            }
        }),
        // Projects API
        getProject: builder.query<JsonProject, { number: number }>({
            query: (options) => {
                const url = buildUrl(`projects/${options.number}`);
                return { url, method: "GET" };
            }
        })
    })
});

export const {
    useGetCardsQuery,
    useGetCardQuery,
    usePushCardsMutation,
    useGetProjectQuery
} = api;

export default api;