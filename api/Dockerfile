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
# Instalar dependencias de desarrollo completas (incluye nodemon)
RUN npm install

# Instalar nodemon globalmente por seguridad (evita "Permission denied")
RUN npm install -g nodemon

# Copiar código fuente
COPY . .

# Exponer puerto
EXPOSE 3000

# Comando de arranque para desarrollo
CMD ["npm", "run", "dev"]

# ==============================
# Fase producción
# ==============================
FROM base AS production
ENV NODE_ENV=production
# Instalar solo dependencias necesarias para producción
RUN npm ci --omit=dev
COPY . .

# Exponer puerto
EXPOSE 3000

# Comando de arranque para producción
CMD ["npm", "start"]

