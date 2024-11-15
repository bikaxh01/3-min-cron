FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json ./


RUN  npm install

COPY . .

RUN npx prisma generate

RUN npm run build

CMD ["node", "dist/index.js"]