FROM node:4.5.0
RUN git clone https://github.com/linnovate/replay-api.git
WORKDIR /replay-api/authorization-service
RUN git checkout develop
RUN npm install -g yarn
RUN yarn global add sails
RUN yarn

EXPOSE 1340:1340
ARG HOST_IP

ENV MONGO_HOST=$HOST_IP MONGO_PORT=27017 MONGO_DATABASE=replay_dev MONGO_USERNAME=replay MONGO_PASSWORD=replay
CMD ["sails", "lift"]
