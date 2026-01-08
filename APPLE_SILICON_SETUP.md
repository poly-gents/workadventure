# WorkAdventure Setup Guide for Apple Silicon Macs (ARM64)

This guide provides step-by-step instructions for setting up WorkAdventure on Apple Silicon Macs (M1, M2, M3, etc.) and addresses common issues encountered during installation.

## 🎯 Overview

Apple Silicon Macs use ARM64 architecture, which can cause compatibility issues with Docker containers and Node.js dependencies that were originally designed for x86_64 systems. This guide resolves these issues.

## 🔧 Prerequisites

- macOS with Apple Silicon (M1/M2/M3)
- Docker Desktop for Mac (latest version)
- Node.js 18+ 
- npm/yarn

## 🚨 Common Issues & Solutions

### Issue 1: NPM Installation Failures

**Problem**: npm install fails with peer dependency conflicts
```bash
npm ERR! peer dep missing
npm ERR! Could not resolve dependency conflicts
```

**Solution**: Use the legacy peer deps flag
```bash
npm install --legacy-peer-deps
```

### Issue 2: Docker Architecture Conflicts

**Problem**: TypeScript errors about conflicting axios types from different node_modules paths
```
Type 'AxiosInstance' is not assignable to parameter of type 'AxiosStatic | AxiosInstance'
Error: Cannot find module 'zod/lib/types'
```

**Solution**: Force ARM64 Docker platform and clean rebuild

## 🛠 Setup Instructions

### Step 1: Clone and Initial Setup

```bash
git clone https://github.com/workadventure/workadventure.git
cd workadventure
```

### Step 2: Install Dependencies with Compatibility Flags

```bash
# Install root dependencies
npm install --legacy-peer-deps

# Install play dependencies
cd play
npm install --legacy-peer-deps
cd ..
```

### Step 3: Clean Docker Environment

```bash
# Stop any running containers
docker-compose down

# Clean up Docker system
docker system prune -f

# Remove all node_modules (crucial for ARM64 compatibility)
find . -name "node_modules" -type d -exec rm -rf {} +
```

### Step 4: Set Environment Variables

```bash
# Add to your ~/.zshrc or ~/.bash_profile
echo 'export START_ROOM_URL="/_/global/maps.workadventure.localhost/starter/map.json"' >> ~/.zshrc
echo 'export DOCKER_DEFAULT_PLATFORM=linux/arm64' >> ~/.zshrc

# Reload shell
source ~/.zshrc
```

### Step 5: Start with ARM64 Platform

```bash
# Start containers with explicit ARM64 platform
DOCKER_DEFAULT_PLATFORM=linux/arm64 docker-compose up -d
```

### Step 6: Wait for Complete Initialization

The first startup takes longer as Docker rebuilds all dependencies for ARM64:

```bash
# Wait for containers to fully initialize (2-3 minutes)
sleep 180

# Check container status
docker-compose ps
```

## 🌐 Access URLs

Once setup is complete, access WorkAdventure at:

- **Main Application**: http://play.workadventure.localhost
- **With Demo Map**: http://play.workadventure.localhost/_/global/maps.workadventure.localhost/starter/map.json
- **Traefik Dashboard**: http://traefik.workadventure.localhost/dashboard/
- **Maps Service**: http://maps.workadventure.localhost

⚠️ **Note**: Use HTTP, not HTTPS for local development.

## 🔍 Troubleshooting

### TypeScript Errors Still Showing

If you see TypeScript warnings in logs like:
```
[svelte-check-watch] Error: Cannot find module 'zod/lib/types'
[svelte-check-watch] svelte-check found 4 errors and 0 warnings in 4 files
```

**Don't worry!** These are non-blocking warnings. The application will work correctly despite these messages.

### Application Shows "Cannot Connect" Error

This usually means no map is loaded. Ensure you're accessing the URL with the demo map:
```
http://play.workadventure.localhost/_/global/maps.workadventure.localhost/starter/map.json
```

### Container Restart Issues

If containers fail to restart properly:

```bash
# Full reset
docker-compose down
find . -name "node_modules" -type d -exec rm -rf {} +
DOCKER_DEFAULT_PLATFORM=linux/arm64 docker-compose up -d
```

## 🧪 Verification Steps

1. **Check all containers are running**:
   ```bash
   docker-compose ps
   ```
   All services should show "Up" status.

2. **Test main application**:
   ```bash
   curl -I http://play.workadventure.localhost
   ```
   Should return HTTP 200 OK.

3. **Test demo map**:
   ```bash
   curl -I "http://play.workadventure.localhost/_/global/maps.workadventure.localhost/starter/map.json"
   ```
   Should return HTTP 200 OK.

4. **Access in browser**: Open http://play.workadventure.localhost/_/global/maps.workadventure.localhost/starter/map.json

## 🚀 Quick Start Script

Save this as `start-workadventure-arm64.sh`:

```bash
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
```

## 📝 Contributing Back

This setup has been tested on:
- macOS Sonoma 14.5.0 with Apple M2
- Docker Desktop 4.x
- Node.js 20.x

If you encounter additional issues or have improvements, please contribute back to the main repository.

## 🏗 Technical Details

### Root Cause Analysis

The primary issues stem from:

1. **Mixed Architecture Dependencies**: NPM packages compiled for different architectures
2. **Docker Platform Conflicts**: Default x86_64 containers vs ARM64 host
3. **TypeScript Type Conflicts**: Multiple axios installations with different type definitions
4. **Build System Incompatibilities**: Native modules requiring recompilation for ARM64

### Key Solutions Implemented

1. **Platform Specification**: Explicit `linux/arm64` Docker platform
2. **Dependency Isolation**: Complete node_modules cleanup and rebuild
3. **Legacy Compatibility**: `--legacy-peer-deps` for NPM conflicts
4. **Environment Standardization**: Consistent environment variable setup

This approach ensures all dependencies are correctly compiled for ARM64 architecture while maintaining compatibility with the existing codebase. 