#!/bin/bash

set -euo pipefail

export PYTHONPATH="${PYTHONPATH:-}:/app"

WAIT_FOR_DB_HOST="${WAIT_FOR_DB_HOST:-${POSTGRES_SERVER:-}}"
WAIT_FOR_DB_PORT="${WAIT_FOR_DB_PORT:-${POSTGRES_PORT:-5432}}"
RUN_MIGRATIONS_ON_STARTUP="${RUN_MIGRATIONS_ON_STARTUP:-false}"
CREATE_SUPERUSER_ON_STARTUP="${CREATE_SUPERUSER_ON_STARTUP:-false}"
UVICORN_RELOAD="${UVICORN_RELOAD:-false}"
PORT="${PORT:-8000}"

if [ -n "$WAIT_FOR_DB_HOST" ]; then
  echo "Waiting for postgres at ${WAIT_FOR_DB_HOST}:${WAIT_FOR_DB_PORT}..."
  until nc -z "$WAIT_FOR_DB_HOST" "$WAIT_FOR_DB_PORT"; do
    sleep 0.25
  done
  echo "PostgreSQL is reachable"
fi

if [ "$RUN_MIGRATIONS_ON_STARTUP" = "true" ]; then
  echo "Running migrations..."
  set +e
  MIGRATION_OUTPUT=$(alembic upgrade head 2>&1)
  MIGRATION_STATUS=$?
  set -e
  printf '%s\n' "$MIGRATION_OUTPUT"

  if [ "$MIGRATION_STATUS" -ne 0 ]; then
    if printf '%s' "$MIGRATION_OUTPUT" | grep -q "Can't locate revision identified by"; then
      echo "Recovering from stale Alembic revision state..."
      python scripts/recover_alembic_state.py
      alembic upgrade head
    else
      echo "Migration failed; backend startup aborted."
      exit "$MIGRATION_STATUS"
    fi
  fi
fi

if [ "$CREATE_SUPERUSER_ON_STARTUP" = "true" ]; then
  echo "Creating initial data..."
  python app/create_superuser.py
fi

echo "Starting backend..."
UVICORN_ARGS=(app.main:app --host 0.0.0.0 --port "$PORT" --proxy-headers)
if [ "$UVICORN_RELOAD" = "true" ]; then
  UVICORN_ARGS+=(--reload)
fi

exec uvicorn "${UVICORN_ARGS[@]}"
