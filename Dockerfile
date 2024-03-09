FROM node:latest

ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

WORKDIR /code

COPY ./package.json /code/package.json
COPY ./package-lock.json /code/package-lock.json
RUN npm ci

# copy in our source code last, as it changes the most
COPY . /code

CMD [ "node", "src/index.mjs" ]
