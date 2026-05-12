from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from core.models import UserProfile

User = get_user_model()


class UserAdmin(BaseUserAdmin):
    """Admin configuration for User model"""
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active', 'date_joined')
    list_filter = ('is_staff', 'is_active', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-date_joined',)


# Unregister the default User admin if it's already registered
# This prevents "AlreadyRegistered" error when Django's default User admin is present
# Then register our custom User admin
try:
    admin.site.unregister(User)
except admin.sites.NotRegistered:
    # User model is not registered yet, which is fine
    pass

admin.site.register(User, UserAdmin)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """Admin configuration for UserProfile model"""
    list_display = ('user', 'user_type', 'created_at', 'updated_at')
    list_filter = ('user_type', 'created_at')
    search_fields = ('user__username', 'user__email', 'user_type')
    ordering = ('-created_at',)
    raw_id_fields = ('user',)
