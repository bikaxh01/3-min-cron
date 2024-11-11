FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json ./


RUN  npm install

COPY . .

RUN npx prisma generate


CMD ["npm", "run", "start"]