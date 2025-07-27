import { Model as Card } from 'common/models/cards';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const cardsApi = createApi({
  reducerPath: 'cardsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/v1' }),
  endpoints: (builder) => ({
    getCards: builder.query<Card[], Record<string, string> | void>({
      query: (filters) => {
        const query = filters
          ? '?' + new URLSearchParams(filters).toString()
          : '';
          // TODO: Improve to not need project number
        return { url: `cards/26${query}`, method: 'GET' };
      },
    }),
  }),
});

export const { useGetCardsQuery } = cardsApi;