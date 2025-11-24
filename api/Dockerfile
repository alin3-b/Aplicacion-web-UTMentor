# ==============================
# Fase base (común)
# ==============================
FROM node:18-alpine AS base
WORKDIR /usr/src/app

# ==============================
# Fase de dependencias
# ==============================
FROM base AS dependencies
COPY package*.json ./
RUN npm ci --only=production && \
    npm cache clean --force

# ==============================
# Fase desarrollo
# ==============================
FROM base AS development
COPY package*.json ./
# Instalar todas las dependencias (incluye nodemon)
RUN npm install
# Instalar nodemon globalmente
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
FROM node:18-alpine AS production

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /usr/src/app

# Copiar dependencias de producción desde la fase dependencies
COPY --from=dependencies --chown=nodejs:nodejs /usr/src/app/node_modules ./node_modules
COPY --from=dependencies --chown=nodejs:nodejs /usr/src/app/package*.json ./

# Copiar código fuente
COPY --chown=nodejs:nodejs . .

# Hacer el script de startup ejecutable
RUN chmod +x startup.sh

# Cambiar al usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando de arranque para producción
CMD ["sh", "startup.sh"]

