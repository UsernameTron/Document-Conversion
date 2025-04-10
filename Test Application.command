#!/bin/bash

# Document Conversion Test App Launcher for macOS
# This is a clickable script for macOS that launches the test application

# Get the directory containing the script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Make the script executable if it's not already
chmod +x "$DIR/test_launcher.sh"

# Run the test launcher script
exec "$DIR/test_launcher.sh"