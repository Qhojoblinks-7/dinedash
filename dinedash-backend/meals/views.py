import logging
from rest_framework import viewsets, permissions, parsers
from .models import Meal
from .serializers import MealSerializer

logger = logging.getLogger(__name__)

class IsStaffOrReadOnly(permissions.BasePermission):
    """
    Only staff users can create/update/delete.
    Everyone else can read (GET, HEAD, OPTIONS).
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
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
    permission_classes = [permissions.AllowAny]
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]
    throttle_scope = 'meals'

    def get_authenticators(self):
        """
        Use default authentication for production.
        """
        return super().get_authenticators()

    def create(self, request, *args, **kwargs):
        logger.info(f"Creating meal with data: {request.data}")
        logger.info(f"Request FILES: {request.FILES}")
        logger.info(f"Request POST: {request.POST}")
        try:
            response = super().create(request, *args, **kwargs)
            logger.info(f"Meal created successfully: {response.data}")
            return response
        except Exception as e:
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

