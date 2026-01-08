#!/bin/bash
set -e

echo "🚀 Starting WorkAdventure for Apple Silicon..."

# Set environment variables
export DOCKER_DEFAULT_PLATFORM=linux/arm64
export START_ROOM_URL="/_/global/maps.workadventure.localhost/starter/map.json"

# Stop any running containers
echo "📦 Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Start containers
echo "🔄 Starting containers with ARM64 platform..."
docker-compose up -d

# Wait for initialization
echo "⏳ Waiting for containers to initialize..."
sleep 60

# Check status
echo "✅ Container status:"
docker-compose ps

echo ""
echo "🌐 WorkAdventure is ready!"
echo "📱 Open: http://play.workadventure.localhost/_/global/maps.workadventure.localhost/starter/map.json"
echo "📊 Dashboard: http://traefik.workadventure.localhost/dashboard/" 