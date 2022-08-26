FROM node:16.17.0
# install glxgears
RUN apt-get update -y \
  && apt-get install --no-install-recommends -y mesa-utils \
  && rm -rf /var/lib/apt/lists/* \
  && apt-get -y install \
    xvfb \
  && rm -rf /var/lib/apt/lists/* /var/cache/apt/*

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . /app

# Start server on port 3000∂
EXPOSE 3000:3001
ENV PORT=3001

USER node

# Start script on Xvfb
CMD Xvfb :0 -screen 0 1024x768x16 & node server/src/checker.js
