FROM node:18-alpine
RUN apk add bash
RUN apk add g++ make py3-pip
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD [ "npm", "start" ]