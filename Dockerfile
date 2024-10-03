FROM node:20.17.0-alpine AS build

WORKDIR /app

COPY package.*json ./
RUN npm --mount=type=cache,target=/root/.npm install

COPY . .
RUN npm run build


FROM node:20.17.0-alpine AS production

WORKDIR /app

RUN mkdir /app/images

COPY package.*json ./
RUN npm --mount=type=cache,target=/root/.npm install --omit=dev

COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist ./dist

COPY start.sh ./
RUN chmod +x start.sh

EXPOSE 8090
CMD ["./start.sh"]
