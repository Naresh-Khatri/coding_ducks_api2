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

COPY package*.json ./
COPY yarn.lock ./

RUN yarn
RUN npx prisma generate
RUN mkdir -p ./turbodrive/.tmp
RUN mkdir -p ./dist/turbodrive/.tmp

COPY . .


FROM base as production

ENV NODE_PATH=./dist

RUN yarn build