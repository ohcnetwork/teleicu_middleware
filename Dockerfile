FROM node:17-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
#RUN npm ci

COPY . .

EXPOSE 3010
CMD [ "node", "src/server.js" ]