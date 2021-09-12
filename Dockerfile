# test
FROM node:14-alpine
COPY . .
RUN npm i --production
RUN npm run build
RUN npm run serve
CMD ["ls"]