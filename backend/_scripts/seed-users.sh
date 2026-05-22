#!/bin/bash
# Helper script to seed users manually on the remote backend container
# This can be used if you need to re-seed users or seed them manually
#
# Usage:
#   docker exec -it aitgpt_backend_web /app/seed-users.sh
#   OR
#   docker exec -it aitgpt_backend_web python manage.py seed_users
#   docker exec -it aitgpt_backend_web python manage.py seed_users --clear

set -e

echo "Seeding sample users..."
python manage.py seed_users "$@"

echo ""
echo "Seeding completed!"
echo ""
echo "Sample user credentials:"
echo "  Admin: admin / admin123!"
echo "  Candidates: candidate1-4 / candidate123!"
echo "  Students: student1-4 / student123!"
echo "  Faculty: faculty1-4 / faculty123!"
echo "  Staff: staff1-4 / staff123!"
echo "  Alumni: alumni1-4 / alumni123!"
echo "  Management: management1-4 / management123!"
