#!/bin/bash

# Simple Docker Deployment

set -e

echo "🚀 Deploying Image-to-Video AI..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  Creating .env file - please edit it with your API keys!"
    cat > .env << EOF
KLING_AI_ACCESS_KEY=your_key_here
KLING_AI_SECRET_KEY=your_secret_here
DAILYMOTION_CLIENT_ID=your_id_here
DAILYMOTION_CLIENT_SECRET=your_secret_here
DAILYMOTION_USER_ID=your_user_id_here
SCRAPE_GRAPH_API_KEY=your_key_here
DATABASE_URL=file:./data/production.db
EOF
fi

# Generate lock file if needed
if [ ! -f "bun.lock" ]; then
    echo "📦 Generating lock file..."
    bun install
fi

# Create data directory
mkdir -p ./data

# Build and start
echo "🔨 Building and starting containers..."
docker-compose up -d --build

echo "✅ Deployment complete!"
echo ""
echo "🌐 Your app is running at:"
echo "   • API: http://localhost:8000" 
echo "   • Frontend: http://localhost (if using domain)"
echo ""
echo "📝 Useful commands:"
echo "   • View logs: docker-compose logs -f"
echo "   • Stop: docker-compose down"
echo "   • Restart: docker-compose restart"