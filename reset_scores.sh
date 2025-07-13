#!/bin/bash

echo "🧹 Resetting all golf scores..."
echo "This will delete ALL scores and teams from the database."
echo ""

# Confirm with user
read -p "Are you sure you want to reset all scores? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Reset cancelled."
    exit 1
fi

echo "🛑 Stopping containers..."
sudo docker compose down

echo "🗑️  Removing database volume..."
sudo docker volume rm golfscoreboard_postgres_data

echo "🚀 Rebuilding and starting containers..."
sudo docker compose up --build -d

echo "⏳ Waiting for containers to start..."
sleep 10

echo "✅ Reset complete!"
echo ""
echo "The database has been reset with:"
echo "  - Fresh teams (Team Alpha through Team Echo)"
echo "  - No scores"
echo "  - Springdale Golf Club course configuration"
echo ""
echo "You can now log in with any team using password: password123" 