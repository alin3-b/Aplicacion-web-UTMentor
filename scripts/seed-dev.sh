#!/bin/sh

set -eu

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker no está instalado o no está disponible en PATH." >&2
  exit 1
fi

if ! docker compose ps --status running mysql | grep -q mysql; then
  echo "El servicio mysql no está activo. Ejecuta: docker compose up -d mysql" >&2
  exit 1
fi

docker compose exec -T mysql sh -c \
  'mysql --default-character-set=utf8mb4 -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE"' \
  < mysql/seed-dev.sql
