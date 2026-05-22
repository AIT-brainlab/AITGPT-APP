#!/bin/sh
set -e

echo "Starting frontend startup script..."

# Check if build directory exists
if [ ! -d "/app/build" ] || [ -z "$(ls -A /app/build)" ]; then
    echo "Error: Build directory is empty or missing!"
    exit 1
fi

echo "Build directory found. Contents:"
ls -la /app/build | head -10

# Inject API URL into HTML for runtime configuration
# This allows the frontend to read the API URL from environment variables at runtime
if [ -n "$VITE_API_URL" ]; then
    echo "Injecting API URL: $VITE_API_URL"
    # Use a more robust replacement that handles the script tag properly
    # Replace the entire window.__API_BASE_URL__ assignment
    if [ -f "/app/build/index.html" ]; then
        # Escape forward slashes and other special characters for sed
        ESCAPED_URL=$(echo "$VITE_API_URL" | sed 's|/|\\/|g' | sed 's|&|\\&|g')
        # Replace the default value in the script tag
        sed -i "s|window.__API_BASE_URL__ = window.__API_BASE_URL__ || 'http://localhost:8000'|window.__API_BASE_URL__ = '$VITE_API_URL'|g" /app/build/index.html 2>/dev/null || \
        sed -i "s|'http://localhost:8000'|'$VITE_API_URL'|g" /app/build/index.html 2>/dev/null || \
        sed -i "s|http://localhost:8000|$VITE_API_URL|g" /app/build/index.html 2>/dev/null
        
        if [ $? -eq 0 ]; then
            echo "✓ API URL injected successfully: $VITE_API_URL"
        else
            echo "⚠ Warning: Could not inject API URL, using default or build-time value"
        fi
    else
        echo "⚠ Warning: index.html not found in /app/build/"
    fi
else
    echo "VITE_API_URL not set, using default: http://localhost:8000"
fi

# Get port from environment variable or use default
PORT=${PORT:-3000}

# Start serve
echo "Starting serve on port $PORT..."
exec serve -s build -l $PORT
