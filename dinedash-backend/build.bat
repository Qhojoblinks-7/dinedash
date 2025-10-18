@echo off
REM Build script for DineDash Backend (Windows)
REM This script handles production builds for deployment platforms

echo 🚀 Starting DineDash Backend Build...

REM Install dependencies
echo 📦 Installing Python dependencies...
pip install -r requirements.txt

REM Run database migrations
echo 🗄️ Running database migrations...
python manage.py migrate --noinput

REM Collect static files
echo 📁 Collecting static files...
python manage.py collectstatic --noinput --clear

REM Create media directory if it doesn't exist
echo 📂 Ensuring media directory exists...
if not exist media mkdir media
if not exist media\meal_images mkdir media\meal_images

REM Run basic checks
echo 🔍 Running system checks...
python manage.py check --deploy

echo ✅ Build completed successfully!
echo 🎉 Ready for deployment!