FROM node:17-alpine AS build

WORKDIR /app

COPY package.*json ./
RUN npm install

COPY . .
RUN npm run build


FROM node:17-alpine AS production

WORKDIR /app

COPY package.*json ./
RUN npm install --only=production

COPY --from=build /app/prisma ./prisma
COPY --from=build /app/dist ./dist

EXPOSE 8090
CMD ["npm", "run", "start:prod"]
