from rest_framework import serializers

from .models import ChatLog, TaskLog


class TaskLogSerializer(serializers.ModelSerializer):
    """Serializer for TaskLog model"""
    class Meta:
        model = TaskLog
        fields = ('id', 'name', 'description', 'status', 'created_at', 'updated_at', 'metadata')
        read_only_fields = ('id', 'created_at', 'updated_at')


class TaskLogCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating TaskLog"""
    class Meta:
        model = TaskLog
        fields = ('name', 'description', 'status', 'metadata')


class ChatLogSerializer(serializers.ModelSerializer):
    """Serializer for ChatLog model (final metrics)."""
    class Meta:
        model = ChatLog
        fields = (
            'id', 'session_id', 'user_id', 'model_name', 'reasoning_enabled', 'turn_index',
            'user_prompt', 'generated_answer', 'top_k', 'chunks_and_score',
            'generation_latency', 'retrieval_latency', 'end_to_end_latency',
            'prompt_token_count', 'completion_token_count', 'total_token_count',
            'role', 'status', 'created_at',
        )
        read_only_fields = ('id', 'created_at')


class ChatLogCreateSerializer(serializers.Serializer):
    """Serializer for creating ChatLog from Langflow API response"""
    user_id = serializers.UUIDField(required=True, help_text="UUID of the user")
    role = serializers.CharField(required=True, help_text="Role of the person (e.g., user, assistant, admin)")
    request = serializers.CharField(required=True, help_text="User's message (stored as user_prompt)")
    turn_index = serializers.IntegerField(
        required=False,
        allow_null=True,
        help_text="Turn number; if omitted, assigned atomically using session_id",
    )
    session_id = serializers.CharField(
        required=False,
        allow_blank=True,
        allow_null=True,
        help_text="Session ID; required when turn_index is omitted",
    )
    model_name = serializers.CharField(required=False, allow_blank=True, allow_null=True, help_text="Model or run identifier")
    reasoning_enabled = serializers.BooleanField(required=False, allow_null=True, help_text="Whether reasoning mode was used")
    langflow_response = serializers.JSONField(required=True, help_text="Success or error response from Langflow API")
    request_start_time = serializers.FloatField(required=False, help_text="Unix timestamp when the request started")
