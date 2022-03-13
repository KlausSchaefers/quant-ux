FROM node:16-alpine

RUN apk --no-cache add git
RUN apk --no-cache add bash

RUN mkdir -p /usr/src/quant-ux

WORKDIR /usr/src/quant-ux

RUN rm /bin/sh && ln -s /bin/bash /bin/sh

ENV TZ=America/Chicago

## Set ENV vars here
ENV QUX_PROXY_URL=http://qux-be.quantux.com:8080

## Clone the frontend repo
RUN git clone https://github.com/KlausSchaefers/quant-ux.git

RUN cd quant-ux && npm install && npm run build

RUN cd

# Expose the Web Port
EXPOSE 8082

## Start the server running
CMD [ "node", "quant-ux/server/start.js" ]