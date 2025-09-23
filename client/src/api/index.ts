import { BaseQueryFn, createApi, FetchArgs, fetchBaseQuery, FetchBaseQueryError, FetchBaseQueryMeta } from "@reduxjs/toolkit/query/react";
import { CardSuggestion, PlaytestableCard } from "common/models/cards";
import { JsonProject } from "common/models/projects";
import { Role, User } from "common/models/user";
import { DeepPartial, RefreshAuthResponse, SingleOrArray } from "common/types";
import { asArray, buildUrl } from "common/utils";
import { clearUser } from "./authSlice";
import { StatusCodes } from "http-status-codes";

const tag = {
    Me: "Me",
    User: "User",
    Role: "Role",
    Card: "Card",
    Suggestion: "Suggestion",
    Tag: "Tag",
    Project: "Project"
};

const baseQuery = fetchBaseQuery({
    baseUrl: "/api/v1",
    credentials: "include"
});

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>
    = async (args, api, extraOptions) =>
    {
        let result = await baseQuery(args, api, extraOptions);
        if (result.meta?.response?.status === StatusCodes.UNAUTHORIZED) {
            // Attempt to refresh token
            const baseAuthQuery = fetchBaseQuery({ baseUrl: "/auth", credentials: "include" }) as BaseQueryFn<string | FetchArgs, RefreshAuthResponse, FetchBaseQueryError, unknown, FetchBaseQueryMeta>;
            const refreshResult = await baseAuthQuery("/refresh", api, extraOptions);

            if (refreshResult.data?.status === "success") {
                result = await baseQuery(args, api, extraOptions);
            } else {
                api.dispatch(clearUser());
                // Expired refresh token should result in reauthentication
                if (refreshResult.meta?.response?.status === StatusCodes.FORBIDDEN) {
                    // TODO: Move this into a more stable process, possibly it's own api slice for /login & /logout
                    window.location.href = `${import.meta.env.VITE_SERVER_HOST}/auth/discord`;
                }
            }
        }
        return result;
    };

const api = createApi({
    reducerPath: "api",
    baseQuery: baseQueryWithReauth,
    tagTypes: Object.values(tag),
    endpoints: (builder) => ({
        // Login API
        login: builder.mutation<void, void>({
            query: () => ({
                url: "login",
                method: "POST"
            })
        }),
        logout: builder.mutation<void, void>({
            query: () => ({
                url: "logout",
                method: "POST",
                credentials: "include",
                responseHandler: (response) => response.text()
            }),
            invalidatesTags: [{ type: tag.Me }]
        }),
        // Users API
        authenticate: builder.query<User | undefined, void>({
            query: () => {
                const url = buildUrl("users/auth");
                return {
                    url,
                    method: "GET",
                    // 401 (eg. no authentication provided) is treated as an undefined user rather than an error
                    validateStatus: (response) => [StatusCodes.OK, StatusCodes.UNAUTHORIZED].includes(response.status) };
            },
            transformResponse: (response: User, meta: FetchBaseQueryMeta) => (meta?.response?.status === StatusCodes.UNAUTHORIZED ? undefined : response),
            providesTags: (result) => {
                return result ? [
                    { type: tag.Me, id: result.discordId },
                    ...result.roles.map((role) => ({ type: tag.Role, id: role.discordId }))
                ] : [];
            }
        }),
        getUsers: builder.query<User[], { filter?: SingleOrArray<DeepPartial<User>> } | void>({
            query: (options) => {
                const url = buildUrl("users", { filter: options?.filter });
                return { url, method: "GET" };
            },
            providesTags: [{ type: tag.User, id: "LIST" }]
        }),
        getUser: builder.query<User, { discordId: string & DeepPartial<Omit<User, "discordId">> }>({
            query: (options) => {
                const { discordId, ...filter } = options;
                const url = buildUrl(`users/${discordId}`, { filter });
                return { url, method: "GET" };
            },
            providesTags: (result) => {
                return result ? [
                    { type: tag.User, id: result.discordId }
                ] : [];
            }
        }),
        updateUser: builder.mutation<User, User>({
            query: (user) => {
                const url = buildUrl(`users/${user.discordId}`);
                return { url, method: "PUT", body: user };
            },
            invalidatesTags: (_result, _error, arg) => {
                return [
                    { type: tag.Me, id: arg.discordId },
                    { type: tag.User, id: arg.discordId },
                    { type: tag.User, id: "LIST" }
                ];
            }
        }),
        // Roles API
        getRoles: builder.query<Role[], { filter?: SingleOrArray<DeepPartial<Role>> } | void>({
            query: (options) => {
                const url = buildUrl("roles", { filter: options?.filter });
                return { url, method: "GET" };
            },
            providesTags: [{ type: tag.Role, id: "LIST" }]
        }),
        updateRole: builder.mutation<void, Role>({
            query: (role) => {
                const url = buildUrl(`roles/${role.discordId}`);
                return { url, method: "PUT", body: role };
            },
            invalidatesTags: (_result, _error, arg) => {
                return [
                    { type: tag.Role, id: arg.discordId },
                    { type: tag.Role, id: "LIST" }
                ];
            }
        }),
        // Cards API
        getCards: builder.query<PlaytestableCard[], { filter?: SingleOrArray<DeepPartial<PlaytestableCard>>, latest?: boolean } | void>({
            query: (options) => {
                const url = buildUrl("cards", { filter: options?.filter, latest: options?.latest });
                return { url, method: "GET" };
            },
            providesTags: [{ type: tag.Card, id: "LIST" }]
        }),
        getCard: builder.query<PlaytestableCard[], { project: number, number: number, latest?: boolean }>({
            query: (options) => {
                const url = buildUrl(`cards/${options.project}/${options.number}`, { latest: options.latest });
                return { url, method: "GET" };
            },
            providesTags: (result) => {
                return result && result.length > 0 ? [
                    { type: tag.Card, id: result[0].code }
                ] : [];
            }
        }),
        pushCards: builder.mutation<PlaytestableCard[], SingleOrArray<PlaytestableCard>>({
            query: (cards) => {
                const url = buildUrl("cards");
                const body = asArray(cards);
                return { url, method: "POST", body };
            },
            invalidatesTags: (_result, _error, arg) => {
                return [
                    ...asArray(arg).map((a) => ({ type: tag.Card, id: a.code })),
                    { type: tag.Card, id: "LIST" }
                ];
            }
        }),
        // Suggestions API
        getSuggestions: builder.query<CardSuggestion[], { filter?: SingleOrArray<DeepPartial<CardSuggestion>> } | void>({
            query: (options) => {
                const url = buildUrl("suggestions", { filter: options?.filter });
                return { url, method: "GET" };
            },
            providesTags: [{ type: tag.Suggestion, id: "LIST" }]
        }),
        getSuggestionsBy: builder.query<CardSuggestion[], { discordId: string, filter?: SingleOrArray<DeepPartial<CardSuggestion>> }>({
            query: (options) => {
                const url = buildUrl(`suggestions/${options.discordId}`, { filter: options?.filter });
                return { url, method: "GET" };
            },
            providesTags: (result) => {
                return result && result.length > 0 ? [
                    { type: tag.Suggestion, id: result[0].suggestedBy }
                ] : [];
            }
        }),
        submitSuggestion: builder.mutation<CardSuggestion, CardSuggestion>({
            query: (card) => {
                const url = buildUrl("suggestions");
                const body = card;
                return { url, method: "POST", body };
            },
            invalidatesTags: (_result, _error, arg) => {
                return [
                    { type: tag.Suggestion, id: arg.suggestedBy },
                    { type: tag.Suggestion, id: "LIST" },
                    { type: tag.Tag, id: "LIST" }
                ];
            }
        }),
        updateSuggestion: builder.mutation<CardSuggestion, CardSuggestion>({
            query: (card) => {
                const { id, ...body } = card;
                const url = buildUrl(`suggestions/${id}`);
                return { url, method: "PUT", body };
            },
            invalidatesTags: (_result, _error, arg) => {
                return [
                    { type: tag.Suggestion, id: arg.suggestedBy },
                    { type: tag.Suggestion, id: "LIST" },
                    { type: tag.Tag, id: "LIST" }
                ];
            }
        }),
        deleteSuggestion: builder.mutation<number, CardSuggestion>({
            query: (card) => {
                const url = buildUrl(`suggestions/${card.id}`);
                return { url, method: "DELETE" };
            },
            invalidatesTags: (_result, _error, arg) => {
                return [
                    { type: tag.Suggestion, id: arg.suggestedBy },
                    { type: tag.Suggestion, id: "LIST" },
                    { type: tag.Tag, id: "LIST" }
                ];
            }
        }),
        getTags: builder.query<string[], void>({
            query: () => {
                const url = buildUrl("suggestions/tags");
                return { url, method: "GET" };
            },
            providesTags: [{ type: tag.Tag, id: "LIST" }]
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
    useLoginMutation,
    useLogoutMutation,
    useGetUsersQuery,
    useGetUserQuery,
    useUpdateUserMutation,
    useGetRolesQuery,
    useUpdateRoleMutation,
    useGetCardsQuery,
    useGetCardQuery,
    usePushCardsMutation,
    useGetSuggestionsQuery,
    useGetSuggestionsByQuery,
    useSubmitSuggestionMutation,
    useUpdateSuggestionMutation,
    useDeleteSuggestionMutation,
    useGetTagsQuery,
    useGetProjectQuery
} = api;

export default api;