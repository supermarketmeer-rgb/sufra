FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json .npmrc* ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY package*.json .npmrc* ./
RUN npm install --legacy-peer-deps --omit=dev express dotenv

COPY --from=builder /app/dist ./dist
COPY server.js ./

EXPOSE 3000

CMD ["node", "server.js"]
