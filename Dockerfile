FROM node:18-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install

COPY . .
RUN pnpm build

CMD ["node", "src/index.js"]

RUN adduser -D appuser
USER appuser