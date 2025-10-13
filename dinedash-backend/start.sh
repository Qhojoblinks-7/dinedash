#!/usr/bin/env bash
# Start script for Render deployment

# Run database migrations
python manage.py migrate

# Start Gunicorn server
gunicorn --config gunicorn.conf.py dinedash.wsgi:application