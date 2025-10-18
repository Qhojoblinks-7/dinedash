"""
Custom utilities for DineDash backend.
"""
import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    """
    Custom exception handler for DRF that provides better error responses.
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)

    if response is not None:
        # Add additional error information
        error_data = {
            'error': True,
            'message': 'An error occurred while processing your request.',
            'details': response.data
        }

        # Log the error for debugging
        logger.error(f"API Error: {exc.__class__.__name__}: {str(exc)}", extra={
            'status_code': response.status_code,
            'request_path': context.get('request').path if context.get('request') else None,
            'user': context.get('request').user.username if context.get('request') and context.get('request').user else None,
        })

        response.data = error_data
        return response

    # Handle unhandled exceptions
    logger.critical(f"Unhandled exception: {exc.__class__.__name__}: {str(exc)}", exc_info=True)
    return Response({
        'error': True,
        'message': 'An unexpected error occurred. Please try again later.',
        'details': {'internal_error': True}
    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def validate_file_upload(file, max_size=10*1024*1024, allowed_types=None):
    """
    Validate uploaded file size and type.

    Args:
        file: File object to validate
        max_size: Maximum file size in bytes (default 10MB)
        allowed_types: List of allowed MIME types

    Returns:
        tuple: (is_valid, error_message)
    """
    if file.size > max_size:
        return False, f"File size exceeds maximum allowed size of {max_size // (1024*1024)}MB"

    if allowed_types and file.content_type not in allowed_types:
        return False, f"File type {file.content_type} is not allowed. Allowed types: {', '.join(allowed_types)}"

    return True, None


def sanitize_input(data):
    """
    Sanitize user input to prevent XSS and other attacks.

    Args:
        data: String or dict to sanitize

    Returns:
        Sanitized data
    """
    if isinstance(data, str):
        # Basic HTML escaping
        return data.replace('<', '<').replace('>', '>').replace('&', '&').replace('"', '"').replace("'", '&#x27;')
    elif isinstance(data, dict):
        return {key: sanitize_input(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [sanitize_input(item) for item in data]
    else:
        return data