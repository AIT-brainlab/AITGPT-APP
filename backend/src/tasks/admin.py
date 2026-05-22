from django.contrib import admin
from .models import ChatLog, TaskLog


@admin.register(TaskLog)
class TaskLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'status', 'created_at', 'updated_at')
    list_filter = ('status', 'created_at')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)


@admin.register(ChatLog)
class ChatLogAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'user_id', 'session_id', 'model_name', 'reasoning_enabled', 'turn_index',
        'generation_latency', 'retrieval_latency', 'end_to_end_latency', 'status', 'created_at',
    )
    list_filter = ('role', 'status', 'created_at', 'session_id', 'reasoning_enabled')
    search_fields = ('user_id', 'session_id', 'role', 'user_prompt', 'generated_answer', 'model_name')
    readonly_fields = ('id', 'created_at')
    ordering = ('-created_at',)
    fieldsets = (
        ('Basic', {
            'fields': ('id', 'user_id', 'session_id', 'model_name', 'reasoning_enabled', 'turn_index', 'role', 'status')
        }),
        ('Content', {
            'fields': ('user_prompt', 'generated_answer')
        }),
        ('Retrieval & tokens', {
            'fields': ('top_k', 'chunks_and_score', 'prompt_token_count', 'completion_token_count', 'total_token_count')
        }),
        ('Latency (s)', {
            'fields': ('generation_latency', 'retrieval_latency', 'end_to_end_latency')
        }),
        ('Timestamps', {
            'fields': ('created_at',)
        }),
    )
