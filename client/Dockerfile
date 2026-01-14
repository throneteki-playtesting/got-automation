FROM node:22

WORKDIR /app

ARG VITE_SERVER_HOST
ARG VITE_NODE_ENV
ARG VITE_VERBOSE
ENV VITE_SERVER_HOST=$VITE_SERVER_HOST
ENV VITE_NODE_ENV=$VITE_NODE_ENV
ENV VITE_VERBOSE=$VITE_VERBOSE

RUN npm install -g serve

# Context should be repository root
COPY common/package*.json ./common/
COPY client/package*.json ./client/

WORKDIR /app/common
RUN npm install

WORKDIR /app/client
RUN npm install

WORKDIR /app
COPY common/ ./common/
COPY client/ ./client/

# Include server types, but only for reference
RUN mkdir -p server/src
COPY server/src/types.ts ./server/src/types.ts
RUN sed -i '1i // @ts-nocheck' ./server/src/types.ts

WORKDIR /app/client
ENV NODE_OPTIONS=--max-old-space-size=4096
RUN npx vite build

EXPOSE 5173

CMD ["npm", "run", "start"]