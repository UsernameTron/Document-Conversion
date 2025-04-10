#!/bin/bash

# Document Conversion App Launcher for macOS
# This is a clickable script for macOS that launches the application

# Get the directory containing the script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Make the script executable if it's not already
chmod +x "$DIR/launch.sh"

# Run the main launcher script
exec "$DIR/launch.sh"