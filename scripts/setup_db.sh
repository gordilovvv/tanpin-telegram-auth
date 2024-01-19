#!/bin/bash
source .env

# Параметры подключения к контейнеру PostgreSQL
CONTAINER_NAME="tanpin_telegram_auth_db"
MIGRATION_FILE="./migrations/init.sql"

# Выполнить миграцию внутри контейнера PostgreSQL
docker exec -i $CONTAINER_NAME psql -h localhost -U $PGUSER -d $PGDATABASE -a < $MIGRATION_FILE

# Проверить код завершения psql (0 - успешно, не 0 - ошибка)
if [ $? -eq 0 ]; then
  echo "Migration applied successfully: $MIGRATION_FILE"
else
  echo "Error applying migration: $MIGRATION_FILE"
  exit 1  # Выход с ошибкой, если миграция не удалась
fi

echo "All migrations applied successfully!"
