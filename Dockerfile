FROM node:16-alpine AS builder

RUN apk --no-cache add make python3 g++

USER node
WORKDIR /home/node

COPY --chown=node:node ["package.json", "package-lock.json", "./"]
RUN npm install
COPY --chown=node:node . .
RUN npm run build



FROM node:16-alpine AS deps

USER node
WORKDIR /home/node

COPY --chown=node:node ["package.json", "package-lock.json", "./"]
RUN npm install --omit=dev



FROM node:16-alpine AS runner

USER node
WORKDIR /home/node

COPY --chown=node:node --from=deps ["/home/node/node_modules", "node_modules/"]
COPY --chown=node:node --from=builder ["/home/node/dist", "dist/"]
COPY --chown=node:node ["server/", "./server"]
COPY --chown=node:node ["public/", "./public"]

CMD [ "node", "server/start.js" ]
