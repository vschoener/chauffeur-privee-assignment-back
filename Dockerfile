FROM node:alpine as base
WORKDIR /app

ADD package.json .
ADD package-lock.json .

RUN npm install

CMD [ "npm", "start" ]

# If deployment / testing are used, we could also use other build stages
