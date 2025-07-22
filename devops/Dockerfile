FROM node:24-alpine AS build

WORKDIR /app

ENV PATH=$PATH:./node_modules/.bin

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

CMD ["npm", "run", "start:dev"]
