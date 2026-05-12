#!/bin/bash
set -e

# Create migrations if they don't exist
echo "Creating database migrations..."
# Run makemigrations for all apps - this will create migrations for any new models
# We use set +e temporarily to allow this to fail without stopping the script
set +e
python manage.py makemigrations --noinput
MAKEMIGRATIONS_EXIT=$?
set -e
if [ $MAKEMIGRATIONS_EXIT -eq 0 ]; then
    echo "Migrations created/verified successfully."
elif [ $MAKEMIGRATIONS_EXIT -eq 1 ]; then
    echo "Warning: makemigrations had issues. This may be normal if no changes detected."
else
    echo "Warning: makemigrations exited with code $MAKEMIGRATIONS_EXIT. Continuing..."
fi

# Run migrations
echo "Running database migrations..."
python manage.py migrate || {
    echo "Error: Database migrations failed!"
    exit 1
}

# Create superuser if it doesn't exist
echo "Checking for superuser..."
python << EOF
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.db import IntegrityError
from core.models import UserProfile

User = get_user_model()

# Get superuser credentials from environment variables
SUPERUSER_EMAIL = os.environ.get('SUPERUSER_EMAIL', 'admin@example.com')
SUPERUSER_USERNAME = os.environ.get('SUPERUSER_USERNAME', 'admin')
SUPERUSER_PASSWORD = os.environ.get('SUPERUSER_PASSWORD', '')

# Only create superuser if password is provided and superuser doesn't exist
if SUPERUSER_PASSWORD:
    if not User.objects.filter(is_superuser=True).exists():
        try:
            superuser = User.objects.create_superuser(
                username=SUPERUSER_USERNAME,
                email=SUPERUSER_EMAIL,
                password=SUPERUSER_PASSWORD
            )
            # Create profile for superuser (get_or_create prevents duplicates)
            UserProfile.objects.get_or_create(
                user=superuser,
                defaults={'user_type': 'admin'}
            )
            print(f"Superuser created successfully: {SUPERUSER_USERNAME}")
        except IntegrityError:
            print(f"Superuser with username {SUPERUSER_USERNAME} already exists.")
            # Ensure existing superuser has a profile
            try:
                existing_superuser = User.objects.get(username=SUPERUSER_USERNAME)
                UserProfile.objects.get_or_create(
                    user=existing_superuser,
                    defaults={'user_type': 'admin'}
                )
            except User.DoesNotExist:
                pass
    else:
        print("Superuser already exists. Skipping creation.")
        # Ensure existing superuser has a profile
        try:
            existing_superuser = User.objects.filter(is_superuser=True).first()
            if existing_superuser:
                UserProfile.objects.get_or_create(
                    user=existing_superuser,
                    defaults={'user_type': 'admin'}
                )
        except Exception:
            pass
else:
    print("SUPERUSER_PASSWORD not set. Skipping superuser creation.")
    print("To create a superuser, set SUPERUSER_EMAIL, SUPERUSER_USERNAME, and SUPERUSER_PASSWORD in .env file")
EOF

# Seed users if they don't exist
echo "Seeding sample users..."
# Run seed_users command - it handles duplicates internally using get_or_create
# This is non-critical, so we continue even if there are minor issues
set +e  # Temporarily disable exit on error for seeding
python manage.py seed_users
SEED_EXIT_CODE=$?
set -e  # Re-enable exit on error
if [ $SEED_EXIT_CODE -ne 0 ]; then
    echo "Warning: User seeding completed with exit code $SEED_EXIT_CODE."
    echo "This is usually fine if users already exist or there were minor issues."
    echo "Continuing with server startup..."
fi

# Start uvicorn server
echo "Starting uvicorn server..."
uvicorn core.asgi:application --host 0.0.0.0 --port 8100 #Updated port to 8100 to avoid port conflict with the python-project-starter port.