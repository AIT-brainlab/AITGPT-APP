"""
Utility functions for the application.
"""
import logging
import re
from typing import Any, Dict, Optional

from django.conf import settings
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)


def create_response(
    data: Any = None,
    message: Optional[str] = None,
    status_code: int = status.HTTP_200_OK,
    errors: Optional[Dict] = None
) -> Response:
    response_data: Dict[str, Any] = {
        'success': status_code < 400,
    }
    if message:
        response_data['message'] = message
    if data is not None:
        response_data['data'] = data
    if errors:
        response_data['errors'] = errors
    return Response(response_data, status=status_code)


def log_error(error: Exception, context: Optional[Dict] = None) -> None:
    """Log errors with optional context. Always logs in production; in DEBUG mode logs at DEBUG level."""
    msg = str(error)
    if context:
        msg = f"{msg} | Context: {context}"
    if settings.DEBUG:
        logger.debug("Error: %s", msg, exc_info=True)
    else:
        logger.error("Error: %s", msg, exc_info=True)


def clean_assistant_text(text: Optional[str]) -> Optional[str]:
    if not text:
        return text
    text = text.replace('\\n', '\n').replace('\\t', '\t').replace('\\r', '\r')
    emoji_pattern = re.compile(
        "["
        "\U0001F600-\U0001F64F"
        "\U0001F300-\U0001F5FF"
        "\U0001F680-\U0001F6FF"
        "\U0001F1E0-\U0001F1FF"
        "\U00002702-\U000027B0"
        "\U000024C2-\U0001F251"
        "\U0001F900-\U0001F9FF"
        "\U0001FA00-\U0001FA6F"
        "\U0001FA70-\U0001FAFF"
        "\U00002600-\U000026FF"
        "\U00002700-\U000027BF"
        "]+", flags=re.UNICODE
    )
    text = emoji_pattern.sub('', text)
    text = re.sub(r'—\s+', ', ', text)
    text = re.sub(r'—\s*$', '.', text, flags=re.MULTILINE)
    text = text.replace('—', ', ')
    text = re.sub(r' +', ' ', text)
    text = re.sub(r'\n\s*\n\s*\n+', '\n\n', text)
    text = re.sub(r'\t+', ' ', text)
    lines = text.split('\n')
    cleaned_lines = []
    for line in lines:
        cleaned_line = line.strip()
        if cleaned_line:
            cleaned_lines.append(cleaned_line)
    text = '\n'.join(cleaned_lines)
    text = re.sub(r' +', ' ', text)
    text = re.sub(r'\n\s*\n\s*\n+', '\n\n', text)
    text = text.strip()
    return text
