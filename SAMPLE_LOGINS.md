# Sample Login Credentials

This document contains sample login credentials for testing the AITGPT application.

## Important: User Type Validation

**When logging in, you must select the correct user type that matches the account.** The backend validates that the selected user type matches the user's registered type. Login will fail if you select the wrong user type.

For example:
- If logging in as `student1`, you must select **Student** as the user type
- If logging in as `candidate1`, you must select **Candidate** as the user type
- If logging in as `admin`, you must select **Admin** as the user type (or the appropriate type if admin is mapped differently)

Each user account is associated with a specific user type, and the login system enforces this match.

## Admin User

- **Username**: `admin`
- **Email**: `admin@university.edu`
- **Password**: `admin123!`
- **User Type**: `admin` (must select **Admin** when logging in)
- **Role**: Admin (Staff & Superuser)
- **Note**: Admin user can retrieve chat logs via `GET /api/tasks/chat-log/`

## Candidate Users (Prospective Students)

All candidate users use password: `candidate123!`
**User Type**: `candidate` (must select **Candidate** when logging in)

| Username | Email | Name |
|----------|-------|------|
| `candidate1` | `alex.johnson@applicant.edu` | Alex Johnson |
| `candidate2` | `sarah.martinez@applicant.edu` | Sarah Martinez |
| `candidate3` | `michael.chen@applicant.edu` | Michael Chen |
| `candidate4` | `emily.davis@applicant.edu` | Emily Davis |

## Student Users (Current Students)

All student users use password: `student123!`
**User Type**: `student` (must select **Student** when logging in)

| Username | Email | Name |
|----------|-------|------|
| `student1` | `sarah.chen@university.edu` | Sarah Chen |
| `student2` | `james.wilson@university.edu` | James Wilson |
| `student3` | `priya.patel@university.edu` | Priya Patel |
| `student4` | `david.kim@university.edu` | David Kim |

## Faculty Users

All faculty users use password: `faculty123!`
**User Type**: `faculty` (must select **Faculty** when logging in)

| Username | Email | Name |
|----------|-------|------|
| `faculty1` | `michael.rodriguez@university.edu` | Michael Rodriguez |
| `faculty2` | `prof.anderson@university.edu` | Robert Anderson |
| `faculty3` | `dr.lee@university.edu` | Jennifer Lee |
| `faculty4` | `prof.singh@university.edu` | Amit Singh |

## Staff Users

All staff users use password: `staff123!`
**User Type**: `staff` (must select **Staff** when logging in)

| Username | Email | Name |
|----------|-------|------|
| `staff1` | `emily.parker@university.edu` | Emily Parker |
| `staff2` | `thomas.brown@university.edu` | Thomas Brown |
| `staff3` | `lisa.taylor@university.edu` | Lisa Taylor |
| `staff4` | `mark.johnson@university.edu` | Mark Johnson |

## Alumni Users

All alumni users use password: `alumni123!`
**User Type**: `alumni` (must select **Alumni** when logging in)

| Username | Email | Name |
|----------|-------|------|
| `alumni1` | `james.wilson@alumni.edu` | James Wilson |
| `alumni2` | `maria.garcia@alumni.edu` | Maria Garcia |
| `alumni3` | `kevin.zhang@alumni.edu` | Kevin Zhang |
| `alumni4` | `rachel.moore@alumni.edu` | Rachel Moore |

## Management Users

All management users use password: `management123!`
**User Type**: `management` (must select **Management** when logging in)

| Username | Email | Name |
|----------|-------|------|
| `management1` | `patricia.thompson@university.edu` | Patricia Thompson |
| `management2` | `richard.white@university.edu` | Richard White |
| `management3` | `susan.martin@university.edu` | Susan Martin |
| `management4` | `william.harris@university.edu` | William Harris |

## Quick Reference

### Password Pattern
All users follow a consistent password pattern: `<role>123!`

Examples:
- Candidates: `candidate123!`
- Students: `student123!`
- Faculty: `faculty123!`
- Staff: `staff123!`
- Alumni: `alumni123!`
- Management: `management123!`
- Admin: `admin123!`

### Total Users
- **25 total users**: 24 regular users (4 per role × 6 roles) + 1 admin user

### Seeding Users

Users are automatically seeded when the backend starts. To manually seed users:

```bash
# From the Backend directory
python manage.py seed_users

# To clear existing users and reseed
python manage.py seed_users --clear
```

### Testing Login

You can test login using any of the credentials above. **Important**: When logging in, make sure to select the correct user type that matches the account you're using. The system validates that the selected user type matches the user's registered type.

**Example Login Flow:**
1. Select user type (e.g., "Student")
2. Enter username (e.g., `student1`)
3. Enter password (e.g., `student123!`)
4. Click Login

If you select the wrong user type, login will fail with an error message indicating the mismatch.

After successful login, you will be redirected to the chat interface where you can interact with the AI assistant.
