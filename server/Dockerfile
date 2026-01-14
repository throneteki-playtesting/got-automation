FROM node:22

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

RUN apt-get update && apt-get install curl gnupg -y \
  && curl --location --silent https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install google-chrome-stable -y --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY common/package*.json ./common/
COPY server/package*.json ./server/

WORKDIR /app/common
RUN npm install

WORKDIR /app/server
RUN npm install

WORKDIR /app
COPY common/ ./common/
COPY server/ ./server/

EXPOSE 8080

WORKDIR /app/server
CMD ["npm", "run", "start"]