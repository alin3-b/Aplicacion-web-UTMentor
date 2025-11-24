# ==============================
# Fase base (común)
# ==============================
FROM node:18-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./

# ==============================
# Fase desarrollo
# ==============================
FROM base AS development
RUN npm install
COPY . .
CMD [ "npm", "run", "dev" ]

# ==============================
# Fase producción
# ==============================
FROM base AS production
RUN npm install --omit=dev
COPY . .
CMD [ "npm", "start" ]