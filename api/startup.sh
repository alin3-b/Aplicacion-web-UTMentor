#!/bin/sh
# startup.sh - Script de inicio con verificaciones

echo "=================================================="
echo "🚀 INICIANDO UTMENTOR API"
echo "=================================================="
echo ""
echo "📅 Fecha: $(date)"
echo "🖥️  Node: $(node --version)"
echo "📦 NPM: $(npm --version)"
echo "📂 Directorio: $(pwd)"
echo ""

# Verificar que existen los archivos necesarios
echo "🔍 Verificando archivos..."
if [ ! -f "server.js" ]; then
    echo "❌ ERROR: server.js no encontrado"
    exit 1
fi
echo "✅ server.js encontrado"

if [ ! -f "package.json" ]; then
    echo "❌ ERROR: package.json no encontrado"
    exit 1
fi
echo "✅ package.json encontrado"

if [ ! -d "node_modules" ]; then
    echo "❌ ERROR: node_modules no encontrado"
    exit 1
fi
echo "✅ node_modules encontrado"

# Verificar variables críticas
echo ""
echo "🔍 Verificando variables de entorno críticas..."
ERROR=0

if [ -z "$MYSQL_HOST" ]; then
    echo "❌ MYSQL_HOST no configurado"
    ERROR=1
else
    echo "✅ MYSQL_HOST: $MYSQL_HOST"
fi

if [ -z "$MYSQL_USER" ]; then
    echo "❌ MYSQL_USER no configurado"
    ERROR=1
else
    echo "✅ MYSQL_USER: $MYSQL_USER"
fi

if [ -z "$MYSQL_PASSWORD" ]; then
    echo "❌ MYSQL_PASSWORD no configurado"
    ERROR=1
else
    echo "✅ MYSQL_PASSWORD: ***"
fi

if [ -z "$MYSQL_DATABASE" ]; then
    echo "❌ MYSQL_DATABASE no configurado"
    ERROR=1
else
    echo "✅ MYSQL_DATABASE: $MYSQL_DATABASE"
fi

if [ -z "$JWT_SECRET" ]; then
    echo "⚠️  JWT_SECRET no configurado (requerido para auth)"
    ERROR=1
else
    echo "✅ JWT_SECRET: ***"
fi

if [ $ERROR -eq 1 ]; then
    echo ""
    echo "❌ Faltan variables de entorno críticas"
    echo "⚠️  La aplicación puede no funcionar correctamente"
    echo ""
    echo "Variables requeridas:"
    echo "  - MYSQL_HOST"
    echo "  - MYSQL_USER"
    echo "  - MYSQL_PASSWORD"
    echo "  - MYSQL_DATABASE"
    echo "  - JWT_SECRET"
    echo ""
    echo "Configúralas en Azure Container App -> Environment variables"
    echo ""
    exit 1
fi

echo ""
echo "=================================================="
echo "✅ VERIFICACIONES COMPLETADAS"
echo "🚀 INICIANDO SERVIDOR..."
echo "=================================================="
echo ""

# Iniciar la aplicación
exec node server.js
