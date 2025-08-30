#!/bin/bash

# Mini-Game Tournament - Easy Startup Script
# This script helps you get the project running quickly

set -e

echo "🎮 Mini-Game Tournament Startup Script"
echo "======================================="

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if port is in use
port_in_use() {
    lsof -i:$1 >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 20+ from https://nodejs.org/"
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

if ! command_exists docker; then
    echo "⚠️  Docker is not installed. You can still run without database."
    DOCKER_AVAILABLE=false
else
    DOCKER_AVAILABLE=true
fi

echo "✅ Prerequisites check completed"

# Navigate to project directory
if [ ! -f "package.json" ]; then
    echo "❌ Not in project root directory. Please run this script from the mini-game-tournament directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup choice
echo ""
echo "Choose how to run the project:"
echo "1) With Docker (includes PostgreSQL database) - Recommended"
echo "2) Without Docker (backend only, no database)"
echo "3) Development mode (backend with nodemon)"

read -p "Enter your choice (1-3): " choice

case $choice in
    1)
        if [ "$DOCKER_AVAILABLE" = false ]; then
            echo "❌ Docker is not available. Please install Docker or choose option 2 or 3."
            exit 1
        fi
        
        echo "🐳 Starting with Docker..."
        cd backend
        
        # Check if port 4000 is in use
        if port_in_use 4000; then
            echo "⚠️  Port 4000 is already in use. Stopping any existing containers..."
            docker compose down || true
        fi
        
        # Start services
        echo "🚀 Starting PostgreSQL and backend server..."
        docker compose up -d
        
        echo ""
        echo "✅ Services started successfully!"
        echo ""
        echo "🌐 Backend server: http://localhost:4000"
        echo "🏥 Health check: http://localhost:4000/healthz"
        echo "📊 API status: http://localhost:4000/api/status"
        echo "🎮 Jetpack scores: http://localhost:4000/api/score/jetpack"
        echo "🗄️  PostgreSQL: localhost:5432 (user: postgres, password: password, db: minigamehub)"
        echo ""
        echo "📋 To view logs: docker compose logs -f"
        echo "🛑 To stop: docker compose down"
        ;;
    2)
        echo "🔧 Starting backend without Docker..."
        cd backend
        
        # Create .env if it doesn't exist
        if [ ! -f ".env" ]; then
            echo "📄 Creating .env file..."
            cp env.example .env
        fi
        
        # Find available port
        PORT=4000
        while port_in_use $PORT; do
            PORT=$((PORT + 1))
        done
        
        echo "🚀 Starting backend server on port $PORT..."
        PORT=$PORT npm start &
        SERVER_PID=$!
        
        # Wait a moment for server to start
        sleep 3
        
        echo ""
        echo "✅ Backend server started successfully!"
        echo ""
        echo "🌐 Backend server: http://localhost:$PORT"
        echo "🏥 Health check: http://localhost:$PORT/healthz"
        echo "📊 API status: http://localhost:$PORT/api/status"
        echo "🎮 Jetpack scores: http://localhost:$PORT/api/score/jetpack"
        echo ""
        echo "⚠️  Note: Database features will not work without PostgreSQL"
        echo "🛑 To stop: kill $SERVER_PID or press Ctrl+C"
        
        # Keep script running
        wait $SERVER_PID
        ;;
    3)
        echo "🔧 Starting development mode..."
        cd backend
        
        # Create .env if it doesn't exist
        if [ ! -f ".env" ]; then
            echo "📄 Creating .env file..."
            cp env.example .env
        fi
        
        # Find available port
        PORT=4000
        while port_in_use $PORT; do
            PORT=$((PORT + 1))
        done
        
        echo "🚀 Starting development server on port $PORT..."
        PORT=$PORT npm run dev
        ;;
    *)
        echo "❌ Invalid choice. Please run the script again and choose 1, 2, or 3."
        exit 1
        ;;
esac