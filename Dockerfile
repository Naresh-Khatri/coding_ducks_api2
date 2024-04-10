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

COPY package.json .
COPY yarn.lock .

RUN yarn install

COPY . .
RUN npx prisma generate && \
    mkdir -p dist/turbodrive/.tmp && \
    mkdir -p turbodrive/.tmp \
    mkdir -p dist/tmp/templates && \
    mkdir -p tmp/templates 

RUN yarn build


FROM node:18 as production

ENV NODE_ENV=production

WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN yarn install --frozen-lockfile --production

COPY --from=base /app/dist ./dist

RUN npx prisma generate
# CMD [ "echo", "start" ]