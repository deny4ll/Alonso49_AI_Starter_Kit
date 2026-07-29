FROM node:20-slim

WORKDIR /app

RUN apt-get update -y && \
    apt-get install -y openssl procps && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3001

CMD ["npm", "run", "start:dev"]
