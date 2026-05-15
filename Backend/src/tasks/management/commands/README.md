# Seed Users Management Command

This management command seeds the database with dummy users for testing purposes.

## User Types Created

The command creates **4 users** for each of the following user types (excluding guest):

1. **candidate** - Prospective Students
2. **student** - Current Students  
3. **faculty** - Faculty Members
4. **staff** - Staff Members
5. **alumni** - Alumni
6. **management** - Management

**Total: 25 users** (24 regular users + 1 admin user)

### Admin User

The command also creates an **admin user** who can retrieve chat logs:
- **Username**: `admin`
- **Email**: `admin@university.edu`
- **Password**: `admin123!`
- **Permissions**: Staff (`is_staff=True`) and Superuser (`is_superuser=True`)

The admin user can access the chat log retrieval endpoint: `GET /api/tasks/chat-log/`

## Usage

### Basic Usage
```bash
python manage.py seed_users
```

### Clear Existing Users First
```bash
python manage.py seed_users --clear
```

**Note:** The `--clear` flag will delete all non-superuser accounts before seeding.

## User Credentials

All users follow a consistent password pattern:
- Format: `<role>123!`
- Examples:
  - `candidate123!` for candidate users
  - `student123!` for student users
  - `faculty123!` for faculty users
  - `staff123!` for staff users
  - `alumni123!` for alumni users
  - `management123!` for management users

## Example Users Created

### Candidates
- `candidate1` / `alex.johnson@applicant.edu` / `candidate123!`
- `candidate2` / `sarah.martinez@applicant.edu` / `candidate123!`
- `candidate3` / `michael.chen@applicant.edu` / `candidate123!`
- `candidate4` / `emily.davis@applicant.edu` / `candidate123!`

### Students
- `student1` / `sarah.chen@university.edu` / `student123!`
- `student2` / `james.wilson@university.edu` / `student123!`
- `student3` / `priya.patel@university.edu` / `student123!`
- `student4` / `david.kim@university.edu` / `student123!`

### Faculty
- `faculty1` / `michael.rodriguez@university.edu` / `faculty123!`
- `faculty2` / `prof.anderson@university.edu` / `faculty123!`
- `faculty3` / `dr.lee@university.edu` / `faculty123!`
- `faculty4` / `prof.singh@university.edu` / `faculty123!`

### Staff
- `staff1` / `emily.parker@university.edu` / `staff123!`
- `staff2` / `thomas.brown@university.edu` / `staff123!`
- `staff3` / `lisa.taylor@university.edu` / `staff123!`
- `staff4` / `mark.johnson@university.edu` / `staff123!`

### Alumni
- `alumni1` / `james.wilson@alumni.edu` / `alumni123!`
- `alumni2` / `maria.garcia@alumni.edu` / `alumni123!`
- `alumni3` / `kevin.zhang@alumni.edu` / `alumni123!`
- `alumni4` / `rachel.moore@alumni.edu` / `alumni123!`

### Management
- `management1` / `patricia.thompson@university.edu` / `management123!`
- `management2` / `richard.white@university.edu` / `management123!`
- `management3` / `susan.martin@university.edu` / `management123!`
- `management4` / `william.harris@university.edu` / `management123!`

## Admin User Capabilities

The admin user can:
- Retrieve chat logs via `GET /api/tasks/chat-log/` endpoint
- Filter logs by `user_id`, `session_id`, `status`, `turn_index`
- Use pagination with `limit` and `offset` parameters
- Access Django admin panel at `/admin/`

### Example API Usage

```bash
# Get all chat logs (requires admin authentication token)
curl -X GET http://localhost:8100/api/tasks/chat-log/ \
  -H "Authorization: Token <admin-token>"

# Filter by user_id
curl -X GET "http://localhost:8100/api/tasks/chat-log/?user_id=<user-uuid>" \
  -H "Authorization: Token <admin-token>"

# Filter by session_id
curl -X GET "http://localhost:8100/api/tasks/chat-log/?session_id=<session-id>" \
  -H "Authorization: Token <admin-token>"

# Pagination
curl -X GET "http://localhost:8100/api/tasks/chat-log/?limit=50&offset=0" \
  -H "Authorization: Token <admin-token>"
```

## Notes

- The command uses database transactions to ensure data integrity
- Existing users with the same username or email will be skipped (unless using `--clear`)
- All created users are set as active (`is_active=True`)
- Superusers are never deleted, even when using `--clear`
- The admin user is created first, before regular users