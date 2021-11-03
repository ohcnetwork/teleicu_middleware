FROM node:17-alphine3.12

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
#RUN npm ci

COPY . .

EXPOSE 3010
CMD [ "node", "server.js" ]