#!/bin/bash

# Build script for DineDash Backend
# This script handles production builds for deployment platforms

set -e  # Exit on any error

echo "🚀 Starting DineDash Backend Build..."

# Install dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Run database migrations
echo "🗄️ Running database migrations..."
python manage.py migrate --noinput

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput --clear

# Create media directory if it doesn't exist
echo "📂 Ensuring media directory exists..."
mkdir -p media/meal_images

# Run basic checks
echo "🔍 Running system checks..."
python manage.py check --deploy

echo "✅ Build completed successfully!"
echo "🎉 Ready for deployment!"