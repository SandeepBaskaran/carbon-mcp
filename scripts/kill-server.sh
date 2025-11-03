#!/bin/bash
# Script to kill the carbon-mcp server running on port 4000

PORT=${PORT:-4000}

echo "Looking for process on port $PORT..."

PID=$(lsof -ti:$PORT 2>/dev/null)

if [ -z "$PID" ]; then
  echo "✅ No process found on port $PORT"
  exit 0
fi

echo "Found process $PID on port $PORT"
kill -9 $PID 2>/dev/null

if [ $? -eq 0 ]; then
  echo "✅ Successfully killed process $PID"
else
  echo "❌ Failed to kill process $PID"
  exit 1
fi

