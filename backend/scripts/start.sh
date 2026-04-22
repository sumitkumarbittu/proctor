#!/bin/bash

# Wait for database
echo "Waiting for postgres..."
while ! nc -z db 5432; do
  sleep 0.1
done
echo "PostgreSQL started"

export PYTHONPATH=$PYTHONPATH:/app

# Check if migrations exist (this check is naive as migrations/versions implies committed migrations)
# In dev/demo environment we might want to ensure tables exist even if user didn't mount volume correctly.
# But for now, we follow standard flow: commit migration file or auto-generate if we are confident.
# Since we are creating from scratch, we auto-generate if empty.
if [ -z "$(ls -A migrations/versions)" ]; then
   echo "No migrations found. Generating initial migration..."
   alembic revision --autogenerate -m "Initial migration"
fi

# Run migrations
echo "Running migrations..."
alembic upgrade head

# Create initial data
echo "Creating initial data..."
python app/create_superuser.py

# Start server
echo "Starting backend..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
