#!/bin/bash

echo "🏌️  Golf Scoreboard Setup"
echo "=========================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created. Please edit it with your configuration."
else
    echo "✅ .env file already exists."
fi

# Generate a secure secret key if not set
if ! grep -q "SECRET_KEY=your_super_secret_jwt_key_here" .env; then
    echo "🔑 Generating secure secret key..."
    SECRET_KEY=$(openssl rand -hex 32)
    sed -i "s/SECRET_KEY=your_super_secret_jwt_key_here/SECRET_KEY=$SECRET_KEY/" .env
    echo "✅ Secret key generated and updated in .env"
fi

# Generate a secure database password if not set
if ! grep -q "POSTGRES_PASSWORD=your_secure_password_here" .env; then
    echo "🔐 Generating secure database password..."
    DB_PASSWORD=$(openssl rand -base64 32)
    sed -i "s/POSTGRES_PASSWORD=your_secure_password_here/POSTGRES_PASSWORD=$DB_PASSWORD/" .env
    sed -i "s/your_secure_password_here/$DB_PASSWORD/" .env
    echo "✅ Database password generated and updated in .env"
fi

echo ""
echo "🚀 Ready to start the application!"
echo ""
echo "To start the application:"
echo "  docker compose up --build"
echo ""
echo "To start in background:"
echo "  docker compose up -d --build"
echo ""
echo "Access the application at:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:8000"
echo "  API Docs: http://localhost:8000/docs"
echo ""
echo "Test team credentials:"
echo "  Team Alpha / password123"
echo "  Team Beta / password123"
echo "  Team Gamma / password123"
echo "  Team Delta / password123"
echo "  Team Echo / password123"
echo ""
echo "For production deployment, see README.md" 