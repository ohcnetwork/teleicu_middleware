#stage 1
FROM node:17-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
#RUN npm ci

COPY . .

RUN npm run compile

#stage 2
FROM node:17-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/prisma ./prisma

#RUN chmod +x ./start.sh


EXPOSE 8090

CMD npm prisma generate && npm prisma migrate deploy && npm run start

#ENTRYPOINT [ "./start.sh" ]
