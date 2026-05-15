import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _


STATUS_CHOICES = [
    ('pending', 'Pending'),
    ('in_progress', 'In Progress'),
    ('completed', 'Completed'),
    ('failed', 'Failed'),
    ('cancelled', 'Cancelled'),
]


class TaskLog(models.Model):
    STATUS_CHOICES = STATUS_CHOICES
    
    name = models.CharField(
        max_length=255,
        verbose_name=_('Task Name'),
        help_text=_('Name of the task')
    )
    description = models.TextField(
        blank=True,
        null=True,
        verbose_name=_('Description'),
        help_text=_('Detailed description of the task')
    )
    status = models.CharField(
        max_length=50,
        choices=STATUS_CHOICES,
        default='pending',
        verbose_name=_('Status'),
        help_text=_('Current status of the task')
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Created At'),
        db_index=True
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name=_('Updated At'),
        db_index=True
    )
    metadata = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_('Metadata'),
        help_text=_('Additional metadata in JSON format')
    )

    class Meta:
        db_table = 'task_logs'
        verbose_name = _('Task Log')
        verbose_name_plural = _('Task Logs')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
            models.Index(fields=['status', 'created_at']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(status__in=['pending', 'in_progress', 'completed', 'failed', 'cancelled']),
                name='valid_status'
            ),
        ]

    def __str__(self) -> str:
        return f"{self.name} - {self.status}"
    
    def __repr__(self) -> str:
        return f"<TaskLog(id={self.id}, name='{self.name}', status='{self.status}')>"


class ChatLog(models.Model):
    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
        verbose_name=_('ID')
    )
    user_id = models.UUIDField(
        verbose_name=_('User ID'),
        help_text=_('UUID of the user'),
        db_index=True
    )
    session_id = models.CharField(
        max_length=255,
        verbose_name=_('Session ID'),
        help_text=_('Session ID used for the chat'),
        db_index=True,
        null=True,
        blank=True
    )
    model_name = models.CharField(
        max_length=255,
        verbose_name=_('Model Name'),
        help_text=_('Model or run identifier used for generation'),
        null=True,
        blank=True,
        db_index=True
    )
    reasoning_enabled = models.BooleanField(
        verbose_name=_('Reasoning Enabled'),
        help_text=_('Whether reasoning mode was used'),
        null=True,
        blank=True
    )
    turn_index = models.IntegerField(
        verbose_name=_('Turn Index'),
        help_text=_('Turn number in the conversation'),
        db_index=True
    )
    user_prompt = models.TextField(
        verbose_name=_('User Prompt'),
        help_text=_('User\'s request/message')
    )
    generated_answer = models.TextField(
        verbose_name=_('Generated Answer'),
        help_text=_('Assistant\'s response or error indication')
    )
    top_k = models.IntegerField(
        verbose_name=_('Top K'),
        help_text=_('Retrieval top_k parameter'),
        null=True,
        blank=True
    )
    chunks_and_score = models.JSONField(
        verbose_name=_('Chunks and Score'),
        help_text=_('Retrieved chunks and relevance scores'),
        null=True,
        blank=True,
        default=None
    )
    generation_latency = models.FloatField(
        verbose_name=_('Generation Latency (s)'),
        help_text=_('Time taken by generation in seconds'),
        null=True,
        blank=True
    )
    retrieval_latency = models.FloatField(
        verbose_name=_('Retrieval Latency (s)'),
        help_text=_('Time taken by retrieval in seconds'),
        null=True,
        blank=True
    )
    end_to_end_latency = models.FloatField(
        verbose_name=_('End-to-End Latency (s)'),
        help_text=_('Total request-to-response time in seconds'),
        null=True,
        blank=True
    )
    prompt_token_count = models.IntegerField(
        verbose_name=_('Prompt Token Count'),
        null=True,
        blank=True
    )
    completion_token_count = models.IntegerField(
        verbose_name=_('Completion Token Count'),
        null=True,
        blank=True
    )
    total_token_count = models.IntegerField(
        verbose_name=_('Total Token Count'),
        null=True,
        blank=True
    )
    role = models.CharField(
        max_length=50,
        verbose_name=_('Role'),
        help_text=_('Role of the person (e.g., user, assistant, admin)'),
        db_index=True
    )
    status = models.CharField(
        max_length=20,
        choices=[('success', 'Success'), ('fail', 'Fail')],
        default='success',
        verbose_name=_('Status'),
        help_text=_('Status of the chat (success or fail)'),
        db_index=True
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Created At'),
        db_index=True
    )

    class Meta:
        db_table = 'chat_logs'
        verbose_name = _('Chat Log')
        verbose_name_plural = _('Chat Logs')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user_id']),
            models.Index(fields=['session_id']),
            models.Index(fields=['turn_index']),
            models.Index(fields=['created_at']),
            models.Index(fields=['user_id', 'session_id', 'turn_index']),
        ]

    def __str__(self) -> str:
        return f"ChatLog(user_id={self.user_id}, turn_index={self.turn_index}, role={self.role})"
    
    def __repr__(self) -> str:
        return f"<ChatLog(id={self.id}, user_id={self.user_id}, turn_index={self.turn_index}, role={self.role})>"