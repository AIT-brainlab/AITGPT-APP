# Generated migration for ChatLog final metrics

from django.db import migrations, models


def copy_old_to_new(apps, schema_editor):
    ChatLog = apps.get_model("tasks", "ChatLog")
    for row in ChatLog.objects.iterator():
        row.user_prompt = (row.request or "") if hasattr(row, "request") else ""
        row.generated_answer = (row.response or "") if hasattr(row, "response") else ""
        row.generation_latency = getattr(row, "langflow_time", None)
        row.end_to_end_latency = getattr(row, "total_round_trip_time", None)
        row.save(update_fields=["user_prompt", "generated_answer", "generation_latency", "end_to_end_latency"])


def noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ("tasks", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="chatlog",
            name="model_name",
            field=models.CharField(blank=True, db_index=True, help_text="Model or run identifier used for generation", max_length=255, null=True, verbose_name="Model Name"),
        ),
        migrations.AddField(
            model_name="chatlog",
            name="reasoning_enabled",
            field=models.BooleanField(blank=True, help_text="Whether reasoning mode was used", null=True, verbose_name="Reasoning Enabled"),
        ),
        migrations.AddField(
            model_name="chatlog",
            name="user_prompt",
            field=models.TextField(blank=True, default="", help_text="User's request/message", verbose_name="User Prompt"),
        ),
        migrations.AddField(
            model_name="chatlog",
            name="generated_answer",
            field=models.TextField(blank=True, default="", help_text="Assistant's response or error indication", verbose_name="Generated Answer"),
        ),
        migrations.AddField(
            model_name="chatlog",
            name="top_k",
            field=models.IntegerField(blank=True, help_text="Retrieval top_k parameter", null=True, verbose_name="Top K"),
        ),
        migrations.AddField(
            model_name="chatlog",
            name="chunks_and_score",
            field=models.JSONField(blank=True, default=None, help_text="Retrieved chunks and relevance scores", null=True, verbose_name="Chunks and Score"),
        ),
        migrations.AddField(
            model_name="chatlog",
            name="generation_latency",
            field=models.FloatField(blank=True, help_text="Time taken by generation in seconds", null=True, verbose_name="Generation Latency (s)"),
        ),
        migrations.AddField(
            model_name="chatlog",
            name="retrieval_latency",
            field=models.FloatField(blank=True, help_text="Time taken by retrieval in seconds", null=True, verbose_name="Retrieval Latency (s)"),
        ),
        migrations.AddField(
            model_name="chatlog",
            name="end_to_end_latency",
            field=models.FloatField(blank=True, help_text="Total request-to-response time in seconds", null=True, verbose_name="End-to-End Latency (s)"),
        ),
        migrations.AddField(
            model_name="chatlog",
            name="prompt_token_count",
            field=models.IntegerField(blank=True, null=True, verbose_name="Prompt Token Count"),
        ),
        migrations.AddField(
            model_name="chatlog",
            name="completion_token_count",
            field=models.IntegerField(blank=True, null=True, verbose_name="Completion Token Count"),
        ),
        migrations.AddField(
            model_name="chatlog",
            name="total_token_count",
            field=models.IntegerField(blank=True, null=True, verbose_name="Total Token Count"),
        ),
        migrations.RunPython(copy_old_to_new, noop),
        migrations.RemoveField(model_name="chatlog", name="request"),
        migrations.RemoveField(model_name="chatlog", name="response"),
        migrations.RemoveField(model_name="chatlog", name="langflow_time"),
        migrations.RemoveField(model_name="chatlog", name="total_round_trip_time"),
    ]
