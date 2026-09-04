FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

# Prisma needs a valid database URL while the app is being built.
ENV DATABASE_URL=postgresql://decision_queue:decision_queue@db:5432/decision_queue

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm start -- -H 0.0.0.0"]