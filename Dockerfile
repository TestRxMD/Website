FROM node:18-bullseye

WORKDIR /app

COPY package*.json ./

RUN npm install -g nodemon
RUN npm install

COPY . /app

EXPOSE 7000

CMD ["npm", "start"]
