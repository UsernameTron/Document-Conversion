#!/bin/bash

# Document Conversion & Use-Case Selector Launcher
# This script launches both the frontend and backend services

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="$PROJECT_DIR/logs/app.log"

# Create logs directory if it doesn't exist
mkdir -p "$PROJECT_DIR/logs"

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Function to display a message
display_message() {
  echo "$1"
  if command_exists osascript; then
    osascript -e "display notification \"$1\" with title \"Document Conversion App\""
  fi
}

# Check for Node.js
if ! command_exists node; then
  display_message "Error: Node.js is not installed. Please install Node.js to run this application."
  exit 1
fi

# Check for npm
if ! command_exists npm; then
  display_message "Error: npm is not installed. Please install npm to run this application."
  exit 1
fi

# Function to kill processes on exit
cleanup() {
  echo "Shutting down services..."
  kill $SERVER_PID $FRONTEND_PID 2>/dev/null
  exit 0
}

# Set up trap for cleanup
trap cleanup EXIT INT TERM

# Navigate to project directory
cd "$PROJECT_DIR"

# Check if node_modules exists
if [ ! -d "$PROJECT_DIR/node_modules" ]; then
  display_message "Installing dependencies..."
  npm install
fi

# Start the backend server
display_message "Starting backend server..."
npm run server > "$LOG_FILE" 2>&1 &
SERVER_PID=$!

# Wait for the server to start (3 seconds)
sleep 3

# Check if server started successfully
if ! ps -p $SERVER_PID > /dev/null; then
  display_message "Error: Failed to start the backend server. Check the logs at $LOG_FILE"
  exit 1
fi

# Start the frontend
display_message "Starting frontend..."
npm run dev >> "$LOG_FILE" 2>&1 &
FRONTEND_PID=$!

# Wait for a moment
sleep 2

# Check if frontend started successfully
if ! ps -p $FRONTEND_PID > /dev/null; then
  display_message "Error: Failed to start the frontend. Check the logs at $LOG_FILE"
  kill $SERVER_PID
  exit 1
fi

# Open the application in the default browser
display_message "Opening application in browser..."
if command_exists open; then
  # macOS
  open http://localhost:3000
elif command_exists xdg-open; then
  # Linux
  xdg-open http://localhost:3000
elif command_exists explorer; then
  # Windows
  explorer "http://localhost:3000"
fi

display_message "Document Conversion Application is running!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:3333"
echo "Press Ctrl+C to stop the application"

# Keep the script running
wait $SERVER_PID $FRONTEND_PID