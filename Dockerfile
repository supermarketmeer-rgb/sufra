FROM node:20-alpine

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install dependencies cleanly
RUN npm install --legacy-peer-deps

# Copy full application code including server.js, api-routes.js, and src
COPY . .

# Build production bundle (generates /app/dist)
RUN npm run build

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["node", "server.js"]
