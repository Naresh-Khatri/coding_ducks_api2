FROM node:18 as base

SHELL ["/bin/bash", "-c"]

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

# core libs 
RUN apt-get update && apt-get install -y \
    unzip \
    curl \
    python3 \
    python-is-python3 \
    g++ \
    libc-dev \
    openjdk-17-jdk  && \
    # For puppeteer and FSIM
    apt-get install -y libxkbcommon-x11-0 libgbm-dev python3-pip && \
    pip3 install --no-cache-dir opencv-python scikit-image image-similarity-measures pyfftw  --break-system-packages &&\
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN npx prisma generate && \
    mkdir -p dist/turbodrive/.tmp && \
    mkdir -p turbodrive/.tmp \
    mkdir -p dist/tmp/templates && \
    mkdir -p tmp/templates \
    mkdir -p python/tmp 

RUN yarn build


FROM node:18 as production

SHELL ["/bin/bash", "-c"]

RUN apt-get update && apt-get install -y \
    unzip \
    curl \
    python3 \
    python-is-python3 \
    g++ \
    libc-dev \
    openjdk-17-jdk  && \
    # For puppeteer and FSIM
    apt-get install -y libxkbcommon-x11-0 libgbm-dev python3-pip && \
    pip3 install --no-cache-dir opencv-python scikit-image image-similarity-measures pyfftw  --break-system-packages &&\
    apt-get clean && rm -rf /var/lib/apt/lists/*

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

WORKDIR /app

COPY package.json yarn.lock prisma/ ./

RUN yarn install --frozen-lockfile --production && \
    yarn cache clean && \
    npx prisma generate && \
    rm -rf /tmp/* /usr/local/share/.cache/yarn/v6

COPY --from=base /app/dist ./dist
COPY --from=base /app/python ./dist/python
