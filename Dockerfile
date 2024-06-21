FROM node:18 as base

# core libs 
RUN apt-get update && apt-get install -y \
    unzip \
    curl \
    python3 \
    python-is-python3 \
    g++ \
    libc-dev \
    openjdk-17-jdk  

# For puppeteer and FSIM
RUN apt-get install -y libxkbcommon-x11-0 libgbm-dev\
    python3-skimage python3-opencv python3-image-similarity-measures


WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN yarn install

COPY . .
RUN npx prisma generate && \
    mkdir -p dist/turbodrive/.tmp && \
    mkdir -p turbodrive/.tmp \
    mkdir -p dist/tmp/templates && \
    mkdir -p tmp/templates \
    mkdir -p FSIM/tmp 

RUN yarn build


FROM node:18 as production

ENV NODE_ENV=production

WORKDIR /app

COPY package.json .
COPY yarn.lock .

RUN yarn install --frozen-lockfile --production

COPY --from=base /app/dist ./dist

RUN npx prisma generate