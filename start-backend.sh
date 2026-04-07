#!/bin/bash

# start-backend.sh - Deploys only the Backend on VPS 1

echo "🚀 Starting Mindbotics Backend Deployment (VPS 1)..."

if [ ! -f ./server/.env ]; then
    echo "❌ Error: ./server/.env not found!"
    exit 1
fi

docker compose -f docker-compose.backend.yml down --remove-orphans
docker compose -f docker-compose.backend.yml up -d --build

echo "✅ Backend is running on port 5050"
docker compose -f docker-compose.backend.yml ps
