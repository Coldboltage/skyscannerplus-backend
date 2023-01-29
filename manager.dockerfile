FROM node:16.17.0
# install glxgears
RUN apt-get update -y \
  && apt-get install -y mesa-utils libasound2 xvfb libgconf-2-4 libatk1.0-0 libatk-bridge2.0-0 libgdk-pixbuf2.0-0 libgtk-3-0 libgbm-dev libnss3-dev libxss-dev \
  && rm -rf /var/lib/apt/lists/* /var/cache/apt/* 

WORKDIR /

COPY . /
RUN npm install


# Start server on port 3000∂
EXPOSE 3000:3001
ENV PORT=3001

USER node

# Start script on Xvfb
CMD Xvfb :0 -screen 0 1024x768x16 & node server/dist/src/docker/manager.docker.js
