#!/bin/bash

# start-frontend.sh - Deploys Frontend and Nginx on VPS 2

echo "🚀 Starting Mindbotics Frontend/Nginx Deployment (VPS 2)..."

# Check if Nginx config has the IP placeholder
if grep -q "<VPS_1_BACKEND_IP>" ./nginx/nginx.conf; then
    echo "⚠️ Warning: You haven't replaced <VPS_1_BACKEND_IP> in nginx/nginx.conf!"
    echo "Please update the configuration before starting."
    exit 1
fi

docker compose -f docker-compose.frontend.yml down --remove-orphans
docker compose -f docker-compose.frontend.yml up -d --build

echo "✅ Frontend/Nginx is running on port 8000"
docker compose -f docker-compose.frontend.yml ps
