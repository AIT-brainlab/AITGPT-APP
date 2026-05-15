import hashlib
import time
import uuid
from typing import Dict, Any, Optional

from asgiref.sync import sync_to_async
from django.conf import settings
from django.db import connection, models, transaction
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.request import Request
from rest_framework.response import Response

from core.exceptions import NotFoundError, DatabaseError, ValidationError
from core.utils import create_response, log_error

from .models import ChatLog, TaskLog
from .serializers import ChatLogCreateSerializer, ChatLogSerializer, TaskLogCreateSerializer, TaskLogSerializer


def _normalize_user_id_for_chat_log(user_id):
    """Convert any user_id (int, str, UUID, User object) to a valid UUID string for ChatLog.user_id."""
    if user_id is None:
        return str(uuid.uuid4())
    # Handle Django User objects: use pk for deterministic mapping
    if hasattr(user_id, "pk"):
        user_id = user_id.pk
    s = str(user_id).strip()
    if not s:
        return str(uuid.uuid4())
    try:
        parsed = uuid.UUID(s)
        return str(parsed)
    except (ValueError, AttributeError, TypeError):
        pass
    # Numeric IDs (1, 2, 6) from default Django User model
    if s.isdigit():
        return str(uuid.uuid5(uuid.NAMESPACE_DNS, f"aitgpt-user-{s}"))
    # Fallback for any other non-UUID string
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, f"aitgpt-user-{s}"))


def _advisory_lock_key(user_id, session_id):
    """Return a single bigint for pg_advisory_xact_lock(bigint). Must fit in signed bigint (0..2^63-1)."""
    raw = f"{user_id}|{session_id}".encode("utf-8")
    h = hashlib.sha256(raw).digest()[:8]
    return int.from_bytes(h, "big") % (2**63)


def _get_next_turn_index_locked(user_id, session_id):
    result = ChatLog.objects.filter(
        user_id=user_id,
        session_id=session_id,
    ).aggregate(max_turn=models.Max("turn_index"))["max_turn"]
    return (result or 0) + 1


def is_chat_logging_allowed(request) -> bool:
    configured = getattr(settings, "CHAT_RETRIEVAL_ACCESS_TOKEN", None)
    if not configured:
        return False
    provided = request.headers.get("X-Access-Token")
    return bool(provided and provided == configured)


def get_next_turn_index(user_id, session_id):
    try:
        uid = _normalize_user_id_for_chat_log(user_id)
        max_turn = ChatLog.objects.filter(
            user_id=uid,
            session_id=session_id,
        ).aggregate(max_turn=models.Max("turn_index"))["max_turn"]
        return (max_turn or 0) + 1
    except Exception as e:
        log_error(e, {"endpoint": "get_next_turn_index", "user_id": str(user_id), "session_id": session_id})
        return 1


def get_user_role(user_id, session_id):
    try:
        uid = _normalize_user_id_for_chat_log(user_id)
        # Get the most recent chat log for this user and session
        latest_log = ChatLog.objects.filter(
            user_id=uid,
            session_id=session_id
        ).order_by('-created_at').first()
        
        # If no previous logs exist, default to 'user'
        if latest_log is None:
            return 'user'
        
        # Return the role from the most recent log
        return latest_log.role
    except Exception as e:
        log_error(e, {'endpoint': 'get_user_role', 'user_id': str(user_id), 'session_id': session_id})
        # On error, default to 'user'
        return 'user'


def _extract_metrics_from_langflow(langflow_data, request_start_time):
    metrics = langflow_data.get("metrics") or {}
    gen = metrics.get("generation") or {}
    retrieval = metrics.get("retrieval") or {}
    out = {}

    out["generation_latency"] = gen.get("wall_time_s")

    out["retrieval_latency"] = retrieval.get("retrieval_wall_time_s") or retrieval.get("wall_time_s")

    out["prompt_token_count"] = gen.get("eval_count")
    out["completion_token_count"] = gen.get("prompt_eval_count")
    if out["prompt_token_count"] is not None and out["completion_token_count"] is not None:
        out["total_token_count"] = out["prompt_token_count"] + out["completion_token_count"]
    else:
        usage = metrics.get("usage") or gen.get("usage") or {}
        out["total_token_count"] = usage.get("total_tokens")
        if out["prompt_token_count"] is None:
            out["prompt_token_count"] = usage.get("prompt_tokens") or usage.get("input_tokens")
        if out["completion_token_count"] is None:
            out["completion_token_count"] = usage.get("completion_tokens") or usage.get("output_tokens")
        if out["total_token_count"] is None and out["prompt_token_count"] is not None and out["completion_token_count"] is not None:
            out["total_token_count"] = out["prompt_token_count"] + out["completion_token_count"]
    out["top_k"] = retrieval.get("top_k") or metrics.get("top_k")
    # retrieval_chunks is on the message (sibling to metrics), passed in langflow_data
    out["chunks_and_score"] = langflow_data.get("retrieval_chunks")
    if out["chunks_and_score"] is None:
        out["chunks_and_score"] = metrics.get("chunks_and_score") or metrics.get("retrieval_chunks") or retrieval.get("chunks")
    # Model name from Langflow (e.g. "qwen3:4b-instruct")
    out["model"] = gen.get("model") or langflow_data.get("model")
    # End-to-end latency
    if request_start_time is not None:
        out["end_to_end_latency"] = time.time() - request_start_time
    else:
        out["end_to_end_latency"] = gen.get("wall_time_s")
    return out


def log_chat_async(
    user_id,
    session_id,
    role,
    request_text,
    langflow_response,
    request_start_time=None,
    model_name=None,
    reasoning_enabled=None,
):
    def _log():
        try:
            # Ensure user_id is a valid UUID so ChatLog.objects.create() does not raise ValidationError.
            # Handles int/str (e.g. 1, "2", "6") from Django User.pk, User objects, and UUID strings.
            user_id_uuid = _normalize_user_id_for_chat_log(user_id)
            # Final validation: ensure we have a valid UUID string
            try:
                uuid.UUID(user_id_uuid)
            except (ValueError, TypeError):
                user_id_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"aitgpt-user-{str(user_id)}"))
            is_success = langflow_response.get("success", False)
            response_text = ""
            log_session_id = session_id
            extra = {}

            if is_success:
                langflow_data = langflow_response.get("data", {})
                response_text = langflow_data.get("assistant_text") or ""
                if langflow_data.get("session_id"):
                    log_session_id = langflow_data.get("session_id")
                extra = _extract_metrics_from_langflow(langflow_data, request_start_time)
                # Prefer model name from Langflow (e.g. "qwen3:4b-instruct") when available
                resolved_model = extra.pop("model", None) or model_name
                resolved_reasoning = reasoning_enabled if reasoning_enabled is not None else ((langflow_data.get("metrics") or {}).get("generation") or {}).get("reasoning")
            else:
                resolved_model = model_name
                resolved_reasoning = reasoning_enabled
                errors = langflow_response.get("errors", {})
                error_message = errors.get("message", "An error occurred while processing the request.")
                response_text = f"ERROR: {error_message}"
                if request_start_time is not None:
                    extra["end_to_end_latency"] = time.time() - request_start_time

            lock_key = _advisory_lock_key(user_id_uuid, session_id)
            with transaction.atomic():
                with connection.cursor() as cursor:
                    # Use single-arg pg_advisory_xact_lock(bigint); two-arg form expects (int,int) and our hash exceeds int range
                    cursor.execute("SELECT pg_advisory_xact_lock(%s::bigint)", [lock_key])
                next_turn = _get_next_turn_index_locked(user_id_uuid, session_id)
                ChatLog.objects.create(
                    user_id=user_id_uuid,
                    session_id=log_session_id,
                    model_name=resolved_model,
                    reasoning_enabled=resolved_reasoning,
                    turn_index=next_turn,
                    user_prompt=request_text or "",
                    generated_answer=response_text,
                    top_k=extra.get("top_k"),
                    chunks_and_score=extra.get("chunks_and_score"),
                    generation_latency=extra.get("generation_latency"),
                    retrieval_latency=extra.get("retrieval_latency"),
                    end_to_end_latency=extra.get("end_to_end_latency"),
                    prompt_token_count=extra.get("prompt_token_count"),
                    completion_token_count=extra.get("completion_token_count"),
                    total_token_count=extra.get("total_token_count"),
                    role=role,
                    status="success" if is_success else "fail",
                )
        except Exception as e:
            log_error(e, {"endpoint": "log_chat_async", "user_id": str(user_id), "session_id": session_id})

    # Run in request thread so logging always completes (daemon threads often never run in WSGI/gunicorn)
    _log()


@api_view(['GET', 'POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def chat_log_test_logic(request: Request) -> Response:
    if not getattr(settings, "IS_LOGGING_ENABLED", False):
        return create_response(
            errors={"message": "Chat logging is disabled. Set IS_LOGGING_ENABLED=True to enable."},
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    if not is_chat_logging_allowed(request):
        configured = getattr(settings, "CHAT_RETRIEVAL_ACCESS_TOKEN", None)
        if not configured:
            return create_response(
                errors={"message": "Chat logging is not configured. Please contact administrator."},
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return create_response(
            errors={"message": "Access token required for chat logging. Provide X-Access-Token header."},
            status_code=status.HTTP_401_UNAUTHORIZED,
        )
    try:
        test_user_id = uuid.uuid4()
        test_session_id = f"test-logic-{uuid.uuid4().hex[:12]}"

        if request.method == 'POST':
            scenario = (request.data.get('scenario') or 'success').strip().lower()
            if scenario not in ('success', 'fail'):
                scenario = 'success'
            scenarios = [scenario]
        else:
            scenarios = ['success', 'fail']

        created = []
        for scenario in scenarios:
            if scenario == 'success':
                generation_latency = 2.5
                end_to_end_latency = 3.1
                status_val = 'success'
                response_text = 'This is a sample assistant response for testing.'
            else:
                generation_latency = None
                end_to_end_latency = 5.2
                status_val = 'fail'
                response_text = 'ERROR: Sample error message for testing.'

            log = ChatLog.objects.create(
                user_id=test_user_id,
                session_id=test_session_id,
                model_name='test-model',
                reasoning_enabled=False,
                turn_index=len(created) + 1,
                user_prompt='Sample request for testing chat log logic.',
                generated_answer=response_text,
                top_k=None,
                chunks_and_score=None,
                generation_latency=generation_latency,
                retrieval_latency=None,
                end_to_end_latency=end_to_end_latency,
                prompt_token_count=10,
                completion_token_count=20,
                total_token_count=30,
                role='user',
                status=status_val,
            )
            created.append(log)

        serializer = ChatLogSerializer(created, many=True)
        return create_response(
            data={
                'message': 'Test chat log(s) created. Verify langflow_time, total_round_trip_time, status.',
                'count': len(created),
                'results': serializer.data,
            },
            status_code=status.HTTP_201_CREATED,
        )
    except Exception as e:
        log_error(e, {'endpoint': 'chat_log_test_logic'})
        raise DatabaseError('Failed to create test chat log(s). Please try again.')


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request: Request) -> Response:
    return create_response(
        data={
            'status': 'healthy',
            'timestamp': timezone.now().isoformat(),
            'service': 'backend-api'
        },
        status_code=status.HTTP_200_OK
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def async_write(request: Request) -> Response:
    serializer = TaskLogCreateSerializer(data=request.data)
    
    if not serializer.is_valid():
        return create_response(
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Use sync_to_async for database operations
        create_task = sync_to_async(TaskLog.objects.create)
        
        import asyncio
        
        async def create():
            return await create_task(
                name=serializer.validated_data.get('name'),
                description=serializer.validated_data.get('description', ''),
                status=serializer.validated_data.get('status', 'pending'),
                metadata=serializer.validated_data.get('metadata', {})
            )
        
        task_log = asyncio.run(create())
        result_serializer = TaskLogSerializer(task_log)

        return create_response(
            data=result_serializer.data,
            message='Task log created successfully',
            status_code=status.HTTP_201_CREATED
        )
    except Exception as e:
        log_error(e, {'endpoint': 'async_write', 'data': request.data})
        raise DatabaseError('Failed to create task log. Please try again.')


@api_view(['GET'])
@permission_classes([AllowAny])
def async_read(request: Request) -> Response:
    task_id = request.query_params.get('id')
    status_filter = request.query_params.get('status')
    
    try:
        import asyncio
        
        if task_id:
            # Read specific task by ID
            get_task = sync_to_async(lambda: TaskLog.objects.get(id=task_id))
            task_log = asyncio.run(get_task())
            serializer = TaskLogSerializer(task_log)
            return create_response(
                data=serializer.data,
                status_code=status.HTTP_200_OK
            )
        elif status_filter:
            # Read tasks filtered by status
            get_tasks = sync_to_async(
                lambda: list(TaskLog.objects.filter(status=status_filter)[:100])
            )
            task_logs = asyncio.run(get_tasks())
            serializer = TaskLogSerializer(task_logs, many=True)
            return create_response(
                data={
                    'count': len(task_logs),
                    'results': serializer.data
                },
                status_code=status.HTTP_200_OK
            )
        else:
            # Read all tasks (limited to 100 for performance)
            get_all = sync_to_async(lambda: list(TaskLog.objects.all()[:100]))
            task_logs = asyncio.run(get_all())
            serializer = TaskLogSerializer(task_logs, many=True)
            return create_response(
                data={
                    'count': len(task_logs),
                    'results': serializer.data
                },
                status_code=status.HTTP_200_OK
            )
    except TaskLog.DoesNotExist:
        raise NotFoundError('Task log not found.')
    except Exception as e:
        log_error(e, {'endpoint': 'async_read', 'task_id': task_id, 'status': status_filter})
        raise DatabaseError('Failed to read task logs. Please try again.')


@api_view(['POST'])
@authentication_classes([])
@permission_classes([AllowAny])
def chat_log_write(request: Request) -> Response:
    if not getattr(settings, "IS_LOGGING_ENABLED", False):
        return create_response(
            errors={"message": "Chat logging is disabled. Set IS_LOGGING_ENABLED=True to enable."},
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        )
    if not is_chat_logging_allowed(request):
        configured = getattr(settings, "CHAT_RETRIEVAL_ACCESS_TOKEN", None)
        if not configured:
            return create_response(
                errors={"message": "Chat logging is not configured. Please contact administrator."},
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            )
        return create_response(
            errors={"message": "Access token required for chat logging. Provide X-Access-Token header."},
            status_code=status.HTTP_401_UNAUTHORIZED,
        )

    serializer = ChatLogCreateSerializer(data=request.data)
    
    if not serializer.is_valid():
        return create_response(
            errors=serializer.errors,
            status_code=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        validated_data = serializer.validated_data
        langflow_response = validated_data['langflow_response']
        user_prompt = validated_data['request']  # API still uses 'request' for user message
        
        is_success = langflow_response.get('success', False)
        response_text = ""
        session_id = validated_data.get('session_id')
        extra = {}

        if is_success:
            langflow_data = langflow_response.get("data", {})
            response_text = langflow_data.get("assistant_text") or ""
            session_id = langflow_data.get("session_id") or session_id
            request_start_time = validated_data.get("request_start_time")
            extra = _extract_metrics_from_langflow(langflow_data, request_start_time)
        else:
            errors = langflow_response.get("errors", {})
            response_text = f"ERROR: {errors.get('message', 'An error occurred while processing the request.')}"
            request_start_time = validated_data.get("request_start_time")
            if request_start_time is not None:
                extra["end_to_end_latency"] = time.time() - request_start_time

        model_name = validated_data.get("model_name")
        reasoning_enabled = validated_data.get("reasoning_enabled")
        turn_index = validated_data.get('turn_index')
        user_id = validated_data['user_id']
        if turn_index is None:
            if not session_id:
                return create_response(
                    errors={'message': 'session_id is required when turn_index is omitted.'},
                    status_code=status.HTTP_400_BAD_REQUEST,
                )
            lock_key = _advisory_lock_key(user_id, session_id)
            with transaction.atomic():
                with connection.cursor() as cursor:
                    cursor.execute("SELECT pg_advisory_xact_lock(%s::bigint)", [lock_key])
                turn_index = _get_next_turn_index_locked(user_id, session_id)

        chat_log = ChatLog.objects.create(
            user_id=user_id,
            session_id=session_id,
            model_name=model_name,
            reasoning_enabled=reasoning_enabled,
            turn_index=turn_index,
            user_prompt=user_prompt or "",
            generated_answer=response_text,
            top_k=extra.get("top_k"),
            chunks_and_score=extra.get("chunks_and_score"),
            generation_latency=extra.get("generation_latency"),
            retrieval_latency=extra.get("retrieval_latency"),
            end_to_end_latency=extra.get("end_to_end_latency"),
            prompt_token_count=extra.get("prompt_token_count"),
            completion_token_count=extra.get("completion_token_count"),
            total_token_count=extra.get("total_token_count"),
            role=validated_data['role'],
            status='success' if is_success else 'fail',
        )
        
        result_serializer = ChatLogSerializer(chat_log)

        return create_response(
            data=result_serializer.data,
            message='Chat log created successfully',
            status_code=status.HTTP_201_CREATED
        )
    except Exception as e:
        log_error(e, {'endpoint': 'chat_log_write', 'data': request.data})
        raise DatabaseError('Failed to create chat log. Please try again.')


@api_view(['GET'])
@authentication_classes([])  # Skip DRF auth; access controlled by X-Access-Token below
@permission_classes([AllowAny])
def chat_log_read(request: Request) -> Response:
    try:
        provided_token = request.headers.get('X-Access-Token')
        configured_token = settings.CHAT_RETRIEVAL_ACCESS_TOKEN

        if not configured_token:
            return create_response(
                errors={'message': 'Access token not configured. Please contact administrator.'},
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        if not provided_token:
            return create_response(
                errors={'message': 'Access token required. Please provide X-Access-Token header.'},
                status_code=status.HTTP_401_UNAUTHORIZED
            )
        if provided_token != configured_token:
            return create_response(
                errors={'message': 'Invalid access token.'},
                status_code=status.HTTP_401_UNAUTHORIZED
            )

        user_id_filter = request.query_params.get('user_id')
        session_id_filter = request.query_params.get('session_id')
        status_filter = request.query_params.get('status')
        turn_index_filter = request.query_params.get('turn_index')

        try:
            limit_param = request.query_params.get('limit', '100')
            limit = int(limit_param)
            if limit < 1 or limit > 1000:
                return create_response(
                    errors={'message': 'limit must be between 1 and 1000.'},
                    status_code=status.HTTP_400_BAD_REQUEST
                )
        except ValueError:
            return create_response(
                errors={'message': 'limit must be an integer.'},
                status_code=status.HTTP_400_BAD_REQUEST
            )

        try:
            offset_param = request.query_params.get('offset', '0')
            offset = int(offset_param)
            if offset < 0:
                return create_response(
                    errors={'message': 'offset must be >= 0.'},
                    status_code=status.HTTP_400_BAD_REQUEST
                )
        except ValueError:
            return create_response(
                errors={'message': 'offset must be an integer.'},
                status_code=status.HTTP_400_BAD_REQUEST
            )

        query = ChatLog.objects.all()
        if user_id_filter:
            try:
                query = query.filter(user_id=user_id_filter)
            except ValueError:
                return create_response(
                    errors={'message': 'Invalid user_id parameter. Must be a valid UUID.'},
                    status_code=status.HTTP_400_BAD_REQUEST
                )
        if session_id_filter:
            query = query.filter(session_id=session_id_filter)
        if status_filter:
            query = query.filter(status=status_filter)
        if turn_index_filter:
            try:
                turn_index_value = int(turn_index_filter)
                query = query.filter(turn_index=turn_index_value)
            except ValueError:
                return create_response(
                    errors={'message': 'Invalid turn_index parameter. Must be an integer.'},
                    status_code=status.HTTP_400_BAD_REQUEST
                )

        query = query.order_by('-created_at')
        total_count = query.count()
        chat_logs = list(query[offset:offset + limit])
        count = len(chat_logs)
        has_next = (offset + count) < total_count
        next_offset = offset + limit if has_next else None

        serializer = ChatLogSerializer(chat_logs, many=True)
        return create_response(
            data={
                'count': count,
                'total': total_count,
                'offset': offset,
                'limit': limit,
                'has_next': has_next,
                'next_offset': next_offset,
                'results': serializer.data,
            },
            status_code=status.HTTP_200_OK
        )
    except Exception as e:
        log_error(e, {
            'endpoint': 'chat_log_read',
            'query_params': dict(request.query_params)
        })
        raise DatabaseError('Failed to read chat logs. Please try again.')
