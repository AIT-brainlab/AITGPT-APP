import hashlib
import time
import uuid

import requests
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from core.exceptions import AuthenticationError, DatabaseError
from core.utils import clean_assistant_text, create_response, log_error
from core.serializers import (
    LangflowRequestSerializer,
    UserLoginSerializer,
    UserRegistrationSerializer,
    UserSerializer
)
from tasks.views import log_chat_async
User = get_user_model()


def get_appropriate_status_code(langflow_status_code: int) -> int:
    if 400 <= langflow_status_code < 500:
        # Client errors from Langflow API -> Bad Request
        return status.HTTP_400_BAD_REQUEST
    elif 500 <= langflow_status_code < 600:
        # Server errors from Langflow API -> Bad Gateway (proxy error)
        return status.HTTP_502_BAD_GATEWAY
    else:
        # Other status codes -> Internal Server Error
        return status.HTTP_500_INTERNAL_SERVER_ERROR


def is_reasoning_mode_enabled() -> bool:
    return bool(
        settings.LANGFLOW_REASONING_API_URL and
        settings.LANGFLOW_REASONING_API_KEY and
        settings.LANGFLOW_REASONING_RUN_ID
    )


def get_langflow_config(use_reasoning: bool = False):
    # Use reasoning endpoint if requested AND reasoning mode is configured
    if use_reasoning and is_reasoning_mode_enabled():
        return (
            settings.LANGFLOW_REASONING_API_URL,
            settings.LANGFLOW_REASONING_API_KEY,
            settings.LANGFLOW_REASONING_RUN_ID
        )
    else:
        return (
            settings.LANGFLOW_API_URL,
            settings.LANGFLOW_API_KEY,
            settings.LANGFLOW_RUN_ID
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request: Request) -> Response:
    try:
        serializer = UserRegistrationSerializer(data=request.data)
        if not serializer.is_valid():
            return create_response(
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        
        return create_response(
            data={
                'token': token.key,
                'user': UserSerializer(user).data
            },
            message='User registered successfully',
            status_code=status.HTTP_201_CREATED
        )
    except Exception as e:
        log_error(e, {'endpoint': 'signup', 'username': request.data.get('username')})
        raise DatabaseError('Failed to register user. Please try again.')


@api_view(['POST'])
@authentication_classes([])  # Disable authentication for login endpoint
@permission_classes([AllowAny])
def login(request: Request) -> Response:
    try:
        serializer = UserLoginSerializer(data=request.data, context={'request': request})
        if not serializer.is_valid():
            return create_response(
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        
        return create_response(
            data={
                'token': token.key,
                'user': UserSerializer(user).data
            },
            message='Login successful',
            status_code=status.HTTP_200_OK
        )
    except Exception as e:
        log_error(e, {'endpoint': 'login', 'username': request.data.get('username')})
        raise AuthenticationError('Login failed. Please check your credentials.')


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request: Request) -> Response:
    try:
        user_id = str(request.user.id)
        if hasattr(request.user, 'auth_token'):
            # Get session_id before deleting token for logging
            token = request.user.auth_token
            token_hash = hashlib.sha256(token.key.encode()).hexdigest()[:16]
            session_id = f"user-{user_id}-{token_hash}"
            token.delete()
        else:
            pass
        
        return create_response(
            message='Logout successful',
            status_code=status.HTTP_200_OK
        )
    except Exception as e:
        log_error(e, {'endpoint': 'logout', 'user': str(request.user)})
        raise DatabaseError('Failed to logout. Please try again.')


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_profile(request: Request) -> Response:
    try:
        serializer = UserSerializer(request.user)
        return create_response(
            data=serializer.data,
            status_code=status.HTTP_200_OK
        )
    except Exception as e:
        log_error(e, {'endpoint': 'user_profile', 'user': str(request.user)})
        raise DatabaseError('Failed to retrieve user profile.')


@api_view(['POST'])
@permission_classes([AllowAny])
def langflow_chat(request: Request) -> Response:
    # Track request start time when logging is enabled (for both auth and guest)
    request_start_time = time.time() if getattr(settings, 'IS_LOGGING_ENABLED', False) else None
    
    try:
        serializer = LangflowRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return create_response(
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Get validated data
        validated_data = serializer.validated_data
        input_value = validated_data['input_value']
        
        # Determine session_id and user_id based on authentication status
        if request.user.is_authenticated:
            # Authenticated user: use deterministic UUID (ChatLog.user_id is UUIDField)
            # Format: user-{user_id}-{token_hash} ensures uniqueness per user and per login session
            token, created = Token.objects.get_or_create(user=request.user)
            user_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"aitgpt-user-{request.user.id}"))
            # Generate session_id that's user-specific and unique per login session
            # Token key changes on each login (since token is deleted on logout), ensuring uniqueness
            token_hash = hashlib.sha256(token.key.encode()).hexdigest()[:16]
            session_id = f"user-{user_id}-{token_hash}"
            
            # Get role from conversation history (turn_index is assigned atomically when logging)
            from tasks.views import get_user_role
            role = get_user_role(user_id, session_id)
        else:
            # Guest user: use request session_id so we can log when IS_LOGGING_ENABLED
            session_id = request.data.get('session_id', f'guest-session-{uuid.uuid4().hex[:16]}')
            user_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"aitgpt-guest-{session_id}")) if settings.IS_LOGGING_ENABLED else None
            role = 'user' if settings.IS_LOGGING_ENABLED else None
        output_type = validated_data.get('output_type', 'any')
        input_type = validated_data.get('input_type', 'chat')
        output_component = validated_data.get('output_component', 'CustomComponent-YcKiJ')
        include_generation_raw = validated_data.get('include_generation_raw', 'True')
        include_retrieval_chunks = validated_data.get('include_retrieval_chunks', 'True')
        reasoning_mode = validated_data.get('reasoning_mode', False)
        
        # Get appropriate Langflow configuration (reasoning or regular)
        langflow_api_url, langflow_api_key, default_run_id = get_langflow_config(use_reasoning=reasoning_mode)
        run_id = validated_data.get('run_id', default_run_id)
        
        # Build Langflow API URL
        langflow_url = f"{langflow_api_url}/run/{run_id}?stream=false"
        
        # Prepare request payload
        payload = {
            "input_value": input_value,
            "input_type": input_type,
            "output_type": output_type,
            "output_component": output_component,
            "session_id": session_id,
            "tweaks": {
                output_component: {
                    "include_generation_raw": include_generation_raw,
                    "include_retrieval_chunks": include_retrieval_chunks
                }
            }
        }

        # Make request to Langflow API
        headers = {
            'Content-Type': 'application/json',
            'x-api-key': langflow_api_key
        }

        response = requests.post(
            langflow_url,
            json=payload,
            headers=headers,
            timeout=30
        )

        # Check if request was successful
        if response.status_code == 200:
            response_data = response.json()

            # Extract message from Langflow: outputs[0].outputs[0].outputs.payload.message or artifacts.payload.raw
            assistant_text = None
            metrics = None
            message = None
            try:
                out0 = response_data.get('outputs') and len(response_data['outputs']) > 0 and response_data['outputs'][0]
                out1 = out0 and out0.get('outputs') and len(out0['outputs']) > 0 and out0['outputs'][0]
                if out1:
                    # Prefer outputs.payload.message (same structure as sample)
                    payload_out = out1.get('outputs') and out1['outputs'].get('payload')
                    if payload_out and payload_out.get('message'):
                        message = payload_out['message']
                    # Fallback: artifacts.payload.raw (ensure message is dict for .get() calls)
                    if not message and out1.get('artifacts') and out1['artifacts'].get('payload') and out1['artifacts']['payload'].get('raw'):
                        raw_val = out1['artifacts']['payload']['raw']
                        message = raw_val if isinstance(raw_val, dict) else None
                    if message and isinstance(message, dict):
                        assistant_text = message.get('assistant_text')
                        metrics = message.get('metrics')
            except (KeyError, IndexError, TypeError, AttributeError):
                pass

            # Session ID: top-level or from our request
            response_session_id = response_data.get('session_id') or session_id
            
            # Clean the assistant_text
            if assistant_text:
                assistant_text = clean_assistant_text(assistant_text)
            
            # Log chat asynchronously when logging is enabled (authenticated or guest with logging on)
            if settings.IS_LOGGING_ENABLED and user_id is not None:
                log_data = {
                    'assistant_text': assistant_text,
                    'metrics': metrics,
                    'session_id': response_session_id,
                    'retrieval_chunks': message.get('retrieval_chunks') if (message and isinstance(message, dict)) else None,
                    'model': message.get('model') if (message and isinstance(message, dict)) else None,
                }
                langflow_response = {
                    'success': True,
                    'data': log_data
                }
                log_chat_async(
                    user_id=user_id,
                    session_id=session_id,
                    role=role,
                    request_text=input_value,
                    langflow_response=langflow_response,
                    request_start_time=request_start_time,
                    model_name=run_id,
                    reasoning_enabled=reasoning_mode,
                )

            # Return structured response with extracted assistant_text and metrics
            return create_response(
                data={
                    'assistant_text': assistant_text,
                    'metrics': metrics,
                    'session_id': response_session_id,
                },
                message='Langflow API call successful',
                status_code=status.HTTP_200_OK
            )
        else:
            error_detail = response.text
            try:
                error_detail = response.json()
            except:
                pass

            # Map Langflow API status to appropriate HTTP status
            http_status = get_appropriate_status_code(response.status_code)
            
            # Adjust message based on error type
            if 400 <= response.status_code < 500:
                error_message = 'Invalid request. Please check your input and try again.'
            else:
                error_message = 'Unable to process your request at this time. Please try again later.'
            
            # Log chat asynchronously when logging is enabled
            if settings.IS_LOGGING_ENABLED and user_id is not None:
                langflow_response = {
                    'success': False,
                    'errors': {
                        'message': error_message,
                        'reason': f'Langflow API returned status {response.status_code}: {error_detail}'
                    }
                }
                log_chat_async(
                    user_id=user_id,
                    session_id=session_id,
                    role=role,
                    request_text=input_value,
                    langflow_response=langflow_response,
                    request_start_time=request_start_time,
                    model_name=run_id,
                    reasoning_enabled=reasoning_mode,
                )
            
            return create_response(
                errors={
                    'message': error_message,
                    'reason': f'Langflow API returned status {response.status_code}: {error_detail}'
                },
                status_code=http_status
            )
            
    except requests.exceptions.RequestException as e:
        log_error(e, {'endpoint': 'langflow_chat', 'user': str(request.user) if request.user.is_authenticated else 'guest'})
        
        # Log chat asynchronously when logging is enabled
        if settings.IS_LOGGING_ENABLED and user_id is not None:
            langflow_response = {
                'success': False,
                'errors': {
                    'message': 'Service temporarily unavailable. Please try again later.',
                    'reason': f'Failed to connect to Langflow API: {str(e)}'
                }
            }
            log_chat_async(
                user_id=user_id,
                session_id=session_id,
                role=role,
                request_text=input_value,
                langflow_response=langflow_response,
                request_start_time=request_start_time,
                model_name=run_id,
                reasoning_enabled=reasoning_mode,
            )
        
        return create_response(
            errors={
                'message': 'Service temporarily unavailable. Please try again later.',
                'reason': f'Failed to connect to Langflow API: {str(e)}'
            },
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    except Exception as e:
        log_error(e, {'endpoint': 'langflow_chat', 'user': str(request.user)})
        raise DatabaseError('Failed to process Langflow API request. Please try again.')


@api_view(['POST'])
@permission_classes([AllowAny])
def langflow_chat_test(request: Request) -> Response:
    # Track request start time for round trip calculation
    request_start_time = time.time()
    
    # Get user_id from request (optional). Must be a valid UUID for ChatLog; normalize numeric IDs.
    raw_user_id = request.data.get('user_id')
    if raw_user_id is None:
        user_id = str(uuid.uuid4())
    else:
        raw_user_id = str(raw_user_id).strip()
        try:
            uuid.UUID(raw_user_id)
            user_id = raw_user_id
        except (ValueError, AttributeError):
            if raw_user_id.isdigit():
                user_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"aitgpt-user-{raw_user_id}"))
            else:
                user_id = str(uuid.uuid4())
    
    try:
        # Create a modified serializer that allows optional session_id
        serializer = LangflowRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return create_response(
                errors=serializer.errors,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Get validated data
        validated_data = serializer.validated_data
        
        # Use provided session_id or generate a test one
        session_id = validated_data.get('session_id')
        if not session_id:
            session_id = f'test-session-{uuid.uuid4().hex[:16]}'
        input_value = validated_data['input_value']
        
        # Get role from conversation history (turn_index assigned atomically when logging)
        from tasks.views import get_user_role
        role = get_user_role(user_id, session_id)
        output_type = validated_data.get('output_type', 'any')
        input_type = validated_data.get('input_type', 'chat')
        output_component = validated_data.get('output_component', 'CustomComponent-YcKiJ')
        include_generation_raw = validated_data.get('include_generation_raw', 'True')
        include_retrieval_chunks = validated_data.get('include_retrieval_chunks', 'True')
        reasoning_mode = validated_data.get('reasoning_mode', False)
        
        # Get appropriate Langflow configuration (reasoning or regular)
        langflow_api_url, langflow_api_key, default_run_id = get_langflow_config(use_reasoning=reasoning_mode)
        run_id = validated_data.get('run_id', default_run_id)
        
        # Build Langflow API URL
        langflow_url = f"{langflow_api_url}/run/{run_id}?stream=false"
        
        # Prepare request payload
        payload = {
            "input_value": input_value,
            "input_type": input_type,
            "output_type": output_type,
            "output_component": output_component,
            "session_id": session_id,
            "tweaks": {
                output_component: {
                    "include_generation_raw": include_generation_raw,
                    "include_retrieval_chunks": include_retrieval_chunks
                }
            }
        }

        # Make request to Langflow API
        headers = {
            'Content-Type': 'application/json',
            'x-api-key': langflow_api_key
        }

        response = requests.post(
            langflow_url,
            json=payload,
            headers=headers,
            timeout=30
        )

        # Check if request was successful
        if response.status_code == 200:
            response_data = response.json()

            # Extract message (same as main chat: outputs.payload.message or artifacts.payload.raw)
            assistant_text = None
            metrics = None
            message = None
            try:
                out0 = response_data.get('outputs') and len(response_data['outputs']) > 0 and response_data['outputs'][0]
                out1 = out0 and out0.get('outputs') and len(out0['outputs']) > 0 and out0['outputs'][0]
                if out1:
                    payload_out = out1.get('outputs') and out1['outputs'].get('payload')
                    if payload_out and payload_out.get('message'):
                        message = payload_out['message']
                    if not message and out1.get('artifacts') and out1['artifacts'].get('payload') and out1['artifacts']['payload'].get('raw'):
                        message = out1['artifacts']['payload']['raw']
                    if message:
                        assistant_text = message.get('assistant_text')
                        metrics = message.get('metrics')
            except (KeyError, IndexError, TypeError):
                pass

            response_session_id = response_data.get('session_id') or session_id
            if assistant_text:
                assistant_text = clean_assistant_text(assistant_text)
            
            log_data = {
                'assistant_text': assistant_text,
                'metrics': metrics,
                'session_id': response_session_id,
                'retrieval_chunks': message.get('retrieval_chunks') if message else None,
                'model': message.get('model') if message else None,
            }
            langflow_response = {'success': True, 'data': log_data}
            
            if settings.IS_LOGGING_ENABLED:
                log_chat_async(
                    user_id=user_id,
                    session_id=session_id,
                    role=role,
                    request_text=input_value,
                    langflow_response=langflow_response,
                    request_start_time=request_start_time,
                    model_name=run_id,
                    reasoning_enabled=reasoning_mode,
                )
            
            return create_response(
                data={
                    'assistant_text': assistant_text,
                    'metrics': metrics,
                    'session_id': response_session_id
                },
                status_code=status.HTTP_200_OK
            )
        else:
            error_detail = response.text
            try:
                error_detail = response.json()
            except:
                pass

            # Map Langflow API status to appropriate HTTP status
            http_status = get_appropriate_status_code(response.status_code)
            
            # Adjust message based on error type
            if 400 <= response.status_code < 500:
                error_message = 'Invalid request. Please check your input and try again.'
            else:
                error_message = 'Unable to process your request at this time. Please try again later.'
            
            # Prepare error response for logging
            langflow_response = {
                'success': False,
                'errors': {
                    'message': error_message,
                    'reason': f'Langflow API returned status {response.status_code}: {error_detail}'
                }
            }
            
            # Log chat asynchronously (backend-only) when logging is enabled
            if settings.IS_LOGGING_ENABLED:
                log_chat_async(
                    user_id=user_id,
                    session_id=session_id,
                    role=role,
                    request_text=input_value,
                    langflow_response=langflow_response,
                    request_start_time=request_start_time,
                    model_name=run_id,
                    reasoning_enabled=reasoning_mode,
                )
            
            return create_response(
                errors={
                    'message': error_message,
                    'reason': f'Langflow API returned status {response.status_code}: {error_detail}'
                },
                status_code=http_status
            )
            
    except requests.exceptions.RequestException as e:
        log_error(e, {'endpoint': 'langflow_chat_test', 'data': request.data})
        
        # Prepare error response for logging
        langflow_response = {
            'success': False,
            'errors': {
                'message': 'Service temporarily unavailable. Please try again later.',
                'reason': f'Failed to connect to Langflow API: {str(e)}'
            }
        }
        
        # Log chat asynchronously (backend-only) when logging is enabled
        if settings.IS_LOGGING_ENABLED:
            log_chat_async(
                user_id=user_id,
                session_id=session_id,
                role=role,
                request_text=input_value,
                langflow_response=langflow_response,
                request_start_time=request_start_time,
                model_name=run_id,
                reasoning_enabled=reasoning_mode,
            )
        
        return create_response(
            errors={
                'message': 'Service temporarily unavailable. Please try again later.',
                'reason': f'Failed to connect to Langflow API: {str(e)}'
            },
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    except Exception as e:
        log_error(e, {'endpoint': 'langflow_chat_test', 'data': request.data})
        raise DatabaseError('Failed to process Langflow API request. Please try again.')
