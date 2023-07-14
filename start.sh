#!/bin/sh

#migrate database
npx prisma generate
npx prisma migrate deploy

# compile typescript code
npm run compile

# start server
npm run start