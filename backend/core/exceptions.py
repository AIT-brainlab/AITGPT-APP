"""
Custom exceptions for the application.
"""
from rest_framework import status
from rest_framework.exceptions import APIException


class BaseAPIException(APIException):
    """Base exception class for API exceptions"""
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_detail = 'A server error occurred.'
    default_code = 'server_error'

    def __init__(self, detail=None, code=None, status_code=None):
        if status_code is not None:
            self.status_code = status_code
        super().__init__(detail, code)


class ValidationError(BaseAPIException):
    """Custom validation error"""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Validation error occurred.'
    default_code = 'validation_error'


class NotFoundError(BaseAPIException):
    """Custom not found error"""
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'Resource not found.'
    default_code = 'not_found'


class AuthenticationError(BaseAPIException):
    """Custom authentication error"""
    status_code = status.HTTP_401_UNAUTHORIZED
    default_detail = 'Authentication failed.'
    default_code = 'authentication_failed'


class DatabaseError(BaseAPIException):
    """Custom database error"""
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_detail = 'Database operation failed.'
    default_code = 'database_error'
