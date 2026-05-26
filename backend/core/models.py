"""
Core models for the backend application.
"""
from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _

User = get_user_model()

USER_TYPE_CHOICES = [
    ('candidate', 'Candidate (Prospective Student)'),
    ('student', 'Student (Current Student)'),
    ('faculty', 'Faculty Member'),
    ('staff', 'Staff Member'),
    ('alumni', 'Alumni'),
    ('management', 'Management'),
    ('admin', 'Admin'),
]


class UserProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile',
        verbose_name=_('User'),
        help_text=_('The user this profile belongs to')
    )
    user_type = models.CharField(
        max_length=20,
        choices=USER_TYPE_CHOICES,
        verbose_name=_('User Type'),
        help_text=_('Type of user (candidate, student, faculty, staff, alumni, management, admin)'),
        db_index=True
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Created At')
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_('Updated At')
    )

    class Meta:
        db_table = 'user_profiles'
        verbose_name = _('User Profile')
        verbose_name_plural = _('User Profiles')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.get_user_type_display()}"

    def __repr__(self):
        return f"<UserProfile(user='{self.user.username}', user_type='{self.user_type}')>"
