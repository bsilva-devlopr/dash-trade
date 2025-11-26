# ----------------------------
# Etapa 1 - Build
# ----------------------------
FROM node:20-alpine AS builder
WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instalar dependências
RUN pnpm install --frozen-lockfile

# Copiar código fonte (excluindo node_modules via .dockerignore)
COPY prisma ./prisma
COPY src ./src
COPY public ./public
COPY next.config.* ./
COPY tsconfig.json ./
COPY tailwind.config.* ./
COPY postcss.config.* ./
COPY *.config.* ./

# Gerar Prisma Client
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
RUN pnpm prisma generate

# Build da aplicação
RUN pnpm run build

# ----------------------------
# Etapa 2 - Runtime
# ----------------------------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN npm install -g pnpm

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

# Instalar Prisma CLI para migrações
RUN npm install -g prisma

EXPOSE 3000

CMD ["pnpm", "start"]

