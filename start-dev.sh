#!/bin/bash

# Development startup script for the Construction Management System

echo "🏗️  Starting Construction Management System"
echo "==========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

# Check if both package.json files exist
if [ ! -f "package.json" ]; then
    echo "❌ Frontend package.json not found. Make sure you're in the project root."
    exit 1
fi

if [ ! -f "backend/package.json" ]; then
    echo "❌ Backend package.json not found. Make sure backend directory exists."
    exit 1
fi

echo "📦 Installing frontend dependencies..."
npm install

echo "📦 Installing backend dependencies..."
cd backend && npm install && cd ..

echo "🔧 Setting up backend environment..."
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "⚙️  Backend .env file created from template. Please configure your database settings."
fi

echo ""
echo "🚀 Starting development servers..."
echo ""
echo "Frontend will be available at: http://localhost:3000"
echo "Backend API will be available at: http://localhost:5000"
echo "Backend API documentation: http://localhost:5000/api"
echo ""
echo "Press Ctrl+C to stop both servers"
echo ""

# Start both frontend and backend in parallel
npm run dev &
FRONTEND_PID=$!

cd backend && npm run dev &
BACKEND_PID=$!

# Function to cleanup processes
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $FRONTEND_PID 2>/dev/null
    kill $BACKEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for any process to exit
wait