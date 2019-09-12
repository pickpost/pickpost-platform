# create a file named Dockerfile
FROM node:latest

RUN mkdir /docker-pickpost
WORKDIR /docker-pickpost
COPY package.json /docker-pickpost
RUN npm config set registry http://registry.npm.taobao.org/
RUN npm install
COPY . /docker-pickpost
EXPOSE 3000
CMD ["npm", "run", "dev"]