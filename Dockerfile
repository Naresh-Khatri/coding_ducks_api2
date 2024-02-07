FROM node:18 as base

RUN apt-get update && apt-get install -y \
    unzip \
    curl \
    python3 \
    python-is-python3 \
    g++ \
    libc-dev \
    openjdk-17-jdk  

WORKDIR /app

COPY package*.json .
COPY yarn.lock .

RUN yarn

COPY . .
RUN npx prisma generate && \
    mkdir -p dist/turbodrive/.tmp && \
    mkdir -p turbodrive/.tmp

RUN yarn build


FROM node:18 as production

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json .
COPY yarn.lock .

RUN yarn install --frozen-lockfile --production

COPY --from=base /app/dist ./dist

CMD [ "node", "dist/index.js" ]