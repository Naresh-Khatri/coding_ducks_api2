FROM node:18


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
RUN ["npm", "install"]
COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3333/tcp

CMD [ "node", "dist/index.js" ]