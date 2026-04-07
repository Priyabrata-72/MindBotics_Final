#!/bin/bash

# start.sh - Single command to start the Mindbotics project inside Docker

echo "🚀 Starting Mindbotics Project Deployment..."

# Check for .env file
if [ ! -f ./server/.env ]; then
    echo "❌ Error: ./server/.env file not found!"
    echo "Please create a .env file based on the environment requirements before starting."
    exit 1
fi

# Stop and remove existing containers, networks, and images (optional clean start)
echo "🧹 Cleaning up old containers..."
docker compose down --remove-orphans

# Build and start services
echo "🛠️  Building and starting services in detached mode..."
docker compose up -d --build

echo "-------------------------------------------------------"
echo "✅ Project successfully started!"
echo "🌍 Frontend (via Proxy): http://localhost:8000"
echo "📂 Services are running in the background."
echo "💡 Use 'docker compose logs -f' to view real-time logs."
echo "-------------------------------------------------------"

# Display container status
docker compose ps
