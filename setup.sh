#!/bin/bash
# Setup script for Stock Management System

echo "📦 Stock Management System - Setup"
echo "==================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm found: $(npm --version)"

# Install dependencies
echo ""
echo "📥 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"

# Create .env file if not exists
if [ ! -f .env ]; then
    echo ""
    echo "⚙️  Creating .env file..."
    cp .env.example .env
    echo "✅ .env file created"
else
    echo "✅ .env file already exists"
fi

echo ""
echo "==================================="
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your MySQL credentials (if different)"
echo "2. Run database initialization: mysql -u root -p < database/init.sql"
echo "   (When prompted, enter password: root)"
echo "3. Start the server: npm run dev"
echo ""
echo "Access the application at: http://localhost:3000"
