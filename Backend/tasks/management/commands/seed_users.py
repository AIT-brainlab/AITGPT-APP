"""
Django management command to seed the database with dummy users.
Creates at least 4 users for each user type (excluding guest):
- candidate (Prospective Student)
- student (Current Student)
- faculty (Faculty Member)
- staff (Staff Member)
- alumni (Alumni)
- management (Management)

Also creates an admin user who can retrieve chat logs.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.db import transaction
from core.models import UserProfile

User = get_user_model()

# Admin user data
ADMIN_USER = {
    'username': 'admin',
    'email': 'admin@university.edu',
    'first_name': 'Admin',
    'last_name': 'User',
    'password': 'admin123!',
    'is_staff': True,
    'is_superuser': True,
}

# User data organized by role
USER_DATA = {
    'candidate': [
        {
            'username': 'candidate1',
            'email': 'alex.johnson@applicant.edu',
            'first_name': 'Alex',
            'last_name': 'Johnson',
            'password': 'candidate123!'
        },
        {
            'username': 'candidate2',
            'email': 'sarah.martinez@applicant.edu',
            'first_name': 'Sarah',
            'last_name': 'Martinez',
            'password': 'candidate123!'
        },
        {
            'username': 'candidate3',
            'email': 'michael.chen@applicant.edu',
            'first_name': 'Michael',
            'last_name': 'Chen',
            'password': 'candidate123!'
        },
        {
            'username': 'candidate4',
            'email': 'emily.davis@applicant.edu',
            'first_name': 'Emily',
            'last_name': 'Davis',
            'password': 'candidate123!'
        },
    ],
    'student': [
        {
            'username': 'student1',
            'email': 'sarah.chen@university.edu',
            'first_name': 'Sarah',
            'last_name': 'Chen',
            'password': 'student123!'
        },
        {
            'username': 'student2',
            'email': 'james.wilson@university.edu',
            'first_name': 'James',
            'last_name': 'Wilson',
            'password': 'student123!'
        },
        {
            'username': 'student3',
            'email': 'priya.patel@university.edu',
            'first_name': 'Priya',
            'last_name': 'Patel',
            'password': 'student123!'
        },
        {
            'username': 'student4',
            'email': 'david.kim@university.edu',
            'first_name': 'David',
            'last_name': 'Kim',
            'password': 'student123!'
        },
    ],
    'faculty': [
        {
            'username': 'faculty1',
            'email': 'michael.rodriguez@university.edu',
            'first_name': 'Michael',
            'last_name': 'Rodriguez',
            'password': 'faculty123!'
        },
        {
            'username': 'faculty2',
            'email': 'prof.anderson@university.edu',
            'first_name': 'Robert',
            'last_name': 'Anderson',
            'password': 'faculty123!'
        },
        {
            'username': 'faculty3',
            'email': 'dr.lee@university.edu',
            'first_name': 'Jennifer',
            'last_name': 'Lee',
            'password': 'faculty123!'
        },
        {
            'username': 'faculty4',
            'email': 'prof.singh@university.edu',
            'first_name': 'Amit',
            'last_name': 'Singh',
            'password': 'faculty123!'
        },
    ],
    'staff': [
        {
            'username': 'staff1',
            'email': 'emily.parker@university.edu',
            'first_name': 'Emily',
            'last_name': 'Parker',
            'password': 'staff123!'
        },
        {
            'username': 'staff2',
            'email': 'thomas.brown@university.edu',
            'first_name': 'Thomas',
            'last_name': 'Brown',
            'password': 'staff123!'
        },
        {
            'username': 'staff3',
            'email': 'lisa.taylor@university.edu',
            'first_name': 'Lisa',
            'last_name': 'Taylor',
            'password': 'staff123!'
        },
        {
            'username': 'staff4',
            'email': 'mark.johnson@university.edu',
            'first_name': 'Mark',
            'last_name': 'Johnson',
            'password': 'staff123!'
        },
    ],
    'alumni': [
        {
            'username': 'alumni1',
            'email': 'james.wilson@alumni.edu',
            'first_name': 'James',
            'last_name': 'Wilson',
            'password': 'alumni123!'
        },
        {
            'username': 'alumni2',
            'email': 'maria.garcia@alumni.edu',
            'first_name': 'Maria',
            'last_name': 'Garcia',
            'password': 'alumni123!'
        },
        {
            'username': 'alumni3',
            'email': 'kevin.zhang@alumni.edu',
            'first_name': 'Kevin',
            'last_name': 'Zhang',
            'password': 'alumni123!'
        },
        {
            'username': 'alumni4',
            'email': 'rachel.moore@alumni.edu',
            'first_name': 'Rachel',
            'last_name': 'Moore',
            'password': 'alumni123!'
        },
    ],
    'management': [
        {
            'username': 'management1',
            'email': 'patricia.thompson@university.edu',
            'first_name': 'Patricia',
            'last_name': 'Thompson',
            'password': 'management123!'
        },
        {
            'username': 'management2',
            'email': 'richard.white@university.edu',
            'first_name': 'Richard',
            'last_name': 'White',
            'password': 'management123!'
        },
        {
            'username': 'management3',
            'email': 'susan.martin@university.edu',
            'first_name': 'Susan',
            'last_name': 'Martin',
            'password': 'management123!'
        },
        {
            'username': 'management4',
            'email': 'william.harris@university.edu',
            'first_name': 'William',
            'last_name': 'Harris',
            'password': 'management123!'
        },
    ],
}


class Command(BaseCommand):
    help = 'Seed the database with dummy users for all user types (excluding guest)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing users before seeding',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        clear_existing = options['clear']
        
        if clear_existing:
            self.stdout.write(self.style.WARNING('Clearing existing users...'))
            # Don't delete superusers
            User.objects.filter(is_superuser=False).delete()
            self.stdout.write(self.style.SUCCESS('Existing users cleared.'))

        total_created = 0
        total_skipped = 0
        
        # Create admin user first
        self.stdout.write('\n' + '='*60)
        self.stdout.write('Creating admin user...')
        self.stdout.write('='*60)
        
        admin_username = ADMIN_USER['username']
        admin_email = ADMIN_USER['email']
        
        if User.objects.filter(username=admin_username).exists():
            admin = User.objects.get(username=admin_username)
            self.stdout.write(
                self.style.WARNING(f'  Admin user "{admin_username}" already exists. Skipping.')
            )
            # Ensure admin has a profile (get_or_create prevents duplicates)
            profile, created = UserProfile.objects.get_or_create(
                user=admin,
                defaults={'user_type': 'admin'}
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'  ✓ Created profile for existing admin user')
                )
            elif profile.user_type != 'admin':
                # Update if user_type doesn't match
                profile.user_type = 'admin'
                profile.save()
                self.stdout.write(
                    self.style.SUCCESS(f'  ✓ Updated profile for existing admin user')
                )
        elif User.objects.filter(email=admin_email).exists():
            self.stdout.write(
                self.style.WARNING(f'  Admin email "{admin_email}" already exists. Skipping.')
            )
        else:
            try:
                admin = User.objects.create_user(
                    username=admin_username,
                    email=admin_email,
                    password=ADMIN_USER['password'],
                    first_name=ADMIN_USER['first_name'],
                    last_name=ADMIN_USER['last_name'],
                    is_staff=ADMIN_USER['is_staff'],
                    is_superuser=ADMIN_USER['is_superuser'],
                    is_active=True
                )
                # Create profile for admin user (get_or_create prevents duplicates)
                UserProfile.objects.get_or_create(
                    user=admin,
                    defaults={'user_type': 'admin'}
                )
                self.stdout.write(
                    self.style.SUCCESS(f'  ✓ Created admin user: {admin_username}')
                )
                self.stdout.write(
                    self.style.SUCCESS(f'    Email: {admin_email}')
                )
                self.stdout.write(
                    self.style.SUCCESS(f'    Password: {ADMIN_USER["password"]}')
                )
                self.stdout.write(
                    self.style.SUCCESS(f'    Staff: {admin.is_staff}, Superuser: {admin.is_superuser}')
                )
                total_created += 1
            except Exception as e:
                self.stdout.write(
                    self.style.ERROR(f'  ✗ Failed to create admin user: {str(e)}')
                )

        for role, users in USER_DATA.items():
            self.stdout.write(f'\nCreating {role} users...')
            
            for user_data in users:
                username = user_data['username']
                email = user_data['email']
                
                # Check if user already exists
                if User.objects.filter(username=username).exists():
                    user = User.objects.get(username=username)
                    # Ensure profile exists with correct user_type (get_or_create prevents duplicates)
                    profile, profile_created = UserProfile.objects.get_or_create(
                        user=user,
                        defaults={'user_type': role}
                    )
                    if profile_created:
                        self.stdout.write(
                            self.style.SUCCESS(f'  ✓ Created profile for existing user "{username}" - Type: {role}')
                        )
                    elif profile.user_type != role:
                        # Update profile if user_type doesn't match
                        profile.user_type = role
                        profile.save()
                        self.stdout.write(
                            self.style.SUCCESS(f'  ✓ Updated profile for existing user "{username}" - Type: {role}')
                        )
                    self.stdout.write(
                        self.style.WARNING(f'  User "{username}" already exists. Skipping user creation.')
                    )
                    total_skipped += 1
                    continue
                
                # Check if email already exists
                if User.objects.filter(email=email).exists():
                    self.stdout.write(
                        self.style.WARNING(f'  Email "{email}" already exists. Skipping.')
                    )
                    total_skipped += 1
                    continue
                
                try:
                    # Create user using create_user which properly hashes the password
                    # This will raise IntegrityError if user already exists (handled by outer check)
                    user = User.objects.create_user(
                        username=username,
                        email=email,
                        password=user_data['password'],
                        first_name=user_data['first_name'],
                        last_name=user_data['last_name'],
                        is_active=True
                    )
                    
                    # Create profile for user with the appropriate user_type (get_or_create prevents duplicates)
                    UserProfile.objects.get_or_create(
                        user=user,
                        defaults={'user_type': role}
                    )
                    self.stdout.write(
                        self.style.SUCCESS(f'  ✓ Created user: {username} ({user_data["first_name"]} {user_data["last_name"]}) - Type: {role}')
                    )
                    total_created += 1
                except Exception as e:
                    # If user creation fails (e.g., duplicate), ensure we don't crash
                    # The outer checks should have caught this, but this is a safety net
                    error_msg = str(e).lower()
                    if 'unique' in error_msg or 'duplicate' in error_msg or 'already exists' in error_msg:
                        self.stdout.write(
                            self.style.WARNING(f'  User "{username}" already exists (caught by exception handler). Skipping.')
                        )
                        # Try to get existing user and ensure profile exists
                        try:
                            existing_user = User.objects.get(username=username)
                            UserProfile.objects.get_or_create(
                                user=existing_user,
                                defaults={'user_type': role}
                            )
                        except User.DoesNotExist:
                            pass
                        total_skipped += 1
                    else:
                        self.stdout.write(
                            self.style.ERROR(f'  ✗ Failed to create user "{username}": {str(e)}')
                        )

        self.stdout.write('\n' + '='*60)
        self.stdout.write(self.style.SUCCESS(f'\nSummary:'))
        self.stdout.write(f'  Total users created: {total_created}')
        self.stdout.write(f'  Total users skipped: {total_skipped}')
        self.stdout.write(f'  Total user types: {len(USER_DATA)}')
        self.stdout.write(f'  Users per type: {len(list(USER_DATA.values())[0])}')
        self.stdout.write('\n' + '='*60)
        
        self.stdout.write(self.style.SUCCESS('\nUser credentials:'))
        self.stdout.write('  All passwords follow the pattern: <role>123!')
        self.stdout.write('  Example: candidate123!, student123!, faculty123!, etc.')
        
        self.stdout.write(self.style.SUCCESS('\nAdmin user:'))
        self.stdout.write(f'  Username: {ADMIN_USER["username"]}')
        self.stdout.write(f'  Email: {ADMIN_USER["email"]}')
        self.stdout.write(f'  Password: {ADMIN_USER["password"]}')
        self.stdout.write('  Note: Admin user can retrieve chat logs via GET /api/tasks/chat-log/')
        
        self.stdout.write('\nYou can now log in with any of these users!')
