FROM node:10.1.0

WORKDIR /faredge-analytics-dashboard

COPY package.json /faredge-analytics-dashboard
COPY package-lock.json /faredge-analytics-dashboard
RUN npm install

COPY . /faredge-analytics-dashboard

EXPOSE 8000

CMD [ "node_modules/.bin/babel-node", "./scripts/start.js", "start" ]
