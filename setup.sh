#!/bin/bash

# Setup script for Green && Blue Blog
# Makes initial setup easier

echo "🚀 Green && Blue Blog - Setup Script"
echo "===================================="
echo ""

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

echo "✅ Docker found"

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not found. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker Compose found"
echo ""

# Create .env if not exists
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend/.env from .env.example..."
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env (update values if needed)"
else
    echo "✅ backend/.env already exists"
fi

echo ""
echo "🐳 Building Docker images..."
docker-compose up -d --build

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

echo ""
echo "✅ Setup complete!"
echo ""
echo "🌍 Access your blog:"
echo "   Frontend:  http://localhost"
echo "   Backend:   http://localhost:4000"
echo "   Adminer:   http://localhost:8080"
echo "   Admin:     http://localhost/admin.html"
echo ""
echo "👤 Default credentials:"
echo "   Email:    admin@example.com"
echo "   Password: Admin@123"
echo ""
echo "📖 View logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 To stop:"
echo "   docker-compose down"
echo ""
