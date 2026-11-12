# ---- Etapa 1: build ----
# Compila el proyecto NestJS a JavaScript (carpeta dist/).
FROM node:22-alpine AS builder

WORKDIR /app

# Copiamos solo los manifiestos primero para aprovechar la cache de Docker:
# si no cambian las dependencias, no se reinstala todo en cada build.
COPY package*.json ./
RUN npm install

# Copiamos el resto del codigo y compilamos.
COPY . .
RUN npm run build

# ---- Etapa 2: produccion ----
# Imagen final liviana: solo dependencias de produccion + el dist compilado.
FROM node:22-alpine AS production

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force

# Traemos unicamente el resultado de la compilacion desde la etapa builder.
COPY --from=builder /app/dist ./dist

# Puerto interno en el que escucha Nest (se puede sobreescribir con PORT).
EXPOSE 3000

CMD ["node", "dist/main"]
