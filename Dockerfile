FROM node:17-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
#RUN npm ci

COPY . .

EXPOSE 8090
CMD [ "node", "src/server.js" ]
