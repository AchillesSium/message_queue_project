FROM node:16

WORKDIR /intermediate

COPY package.json /intermediate
COPY package-lock.json /intermediate
COPY service_intermediate.js /intermediate
COPY wait-for-it.sh /intermediate

RUN chmod +x /intermediate/wait-for-it.sh
RUN npm install
RUN ls -la /intermediate
