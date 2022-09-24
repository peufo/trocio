FROM node:16-alpine
RUN apk add --no-cache python2 g++ make
WORKDIR /app
COPY . .
RUN npm install
RUN npm run dev