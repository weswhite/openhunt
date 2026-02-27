FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY dist/ ./dist/
COPY data/ ./data/

EXPOSE 3002

CMD ["node", "dist/index.js"]
