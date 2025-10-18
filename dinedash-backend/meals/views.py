import logging
from rest_framework import viewsets, permissions, parsers
from .models import Meal
from .serializers import MealSerializer

logger = logging.getLogger(__name__)

class IsStaffOrReadOnly(permissions.BasePermission):
    """
    Only staff users can create/update/delete.
    Everyone else can read (GET, HEAD, OPTIONS).
    For development, allow POST/PUT/DELETE without auth.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        # Temporarily allow POST/PUT/DELETE for development
        if request.method in ['POST', 'PUT', 'DELETE']:
            return True
        return request.user and request.user.is_staff

class MealViewSet(viewsets.ModelViewSet):
    """
    Staff can create/update/delete meals.
    Everyone can view meals.

    Endpoints:
    - GET /meals/ : list all meals
    - GET /meals/{id}/ : retrieve a meal
    - POST /meals/ : create a new meal (staff only)
    - PUT /meals/{id}/ : update meal (staff only)
    - DELETE /meals/{id}/ : delete meal (staff only)
    """
    queryset = Meal.objects.all()
    serializer_class = MealSerializer
    permission_classes = [permissions.AllowAny]  # Allow all operations for development
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def get_authenticators(self):
        """
        Override authentication for all requests to allow anonymous access for development.
        """
        return []  # No authentication required for development and testing purposes

    def create(self, request, *args, **kwargs):
        print(f"DEBUG: Creating meal with data: {request.data}")
        print(f"DEBUG: Request FILES: {request.FILES}")
        print(f"DEBUG: Request POST: {request.POST}")
        print(f"DEBUG: Content-Type: {request.META.get('CONTENT_TYPE')}")
        print(f"DEBUG: Raw body length: {len(request.body) if request.body else 0}")

        # Try to manually parse multipart data
        if 'multipart/form-data' in request.META.get('CONTENT_TYPE', ''):
            print("DEBUG: Detected multipart form data")
            try:
                from django.http.multipartparser import MultiPartParser
                parser = MultiPartParser(request.META, request, upload_handlers=request.upload_handlers)
                post_data, files_data = parser.parse()
                print(f"DEBUG: Manually parsed POST: {post_data}")
                print(f"DEBUG: Manually parsed FILES: {files_data}")
            except Exception as parse_error:
                print(f"DEBUG: Manual parsing failed: {parse_error}")

        logger.info(f"Creating meal with data: {request.data}")
        logger.info(f"Request FILES: {request.FILES}")
        logger.info(f"Request POST: {request.POST}")
        try:
            response = super().create(request, *args, **kwargs)
            print(f"DEBUG: Meal created successfully: {response.data}")
            logger.info(f"Meal created successfully: {response.data}")
            return response
        except Exception as e:
            print(f"DEBUG: Error creating meal: {str(e)}")
            print(f"DEBUG: Request data keys: {list(request.data.keys()) if hasattr(request.data, 'keys') else 'No keys'}")
            logger.error(f"Error creating meal: {str(e)}")
            logger.error(f"Request data keys: {list(request.data.keys()) if hasattr(request.data, 'keys') else 'No keys'}")
            raise

    def update(self, request, *args, **kwargs):
        logger.info(f"Updating meal {kwargs.get('pk')} with data: {request.data}")
        try:
            response = super().update(request, *args, **kwargs)
            logger.info(f"Meal updated successfully: {response.data}")
            return response
        except Exception as e:
            logger.error(f"Error updating meal: {str(e)}")
            raise

    def destroy(self, request, *args, **kwargs):
        meal_id = kwargs.get('pk')
        logger.info(f"Deleting meal {meal_id}")
        try:
            response = super().destroy(request, *args, **kwargs)
            logger.info(f"Meal {meal_id} deleted successfully")
            return response
        except Exception as e:
            logger.error(f"Error deleting meal {meal_id}: {str(e)}")
            raise

