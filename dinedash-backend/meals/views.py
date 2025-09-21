from rest_framework import viewsets, permissions
from .models import Meal
from .serializers import MealSerializer


class IsStaffOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow staff users to edit objects.
    Non-staff users can only read (GET, HEAD, OPTIONS).
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff
    
    
class MealViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A viewset for viewing meals.
    1. ReadOnlyModelViewSet provides default 'list' and 'retrieve' actions.
    2. This viewset allows users to view the list of meals and details of a specific meal.
    3. It does not allow creation, updating, or deletion of meals via the API.
    4. The queryset includes all Meal objects.
    5. The serializer class used is MealSerializer which converts Meal model instances to JSON format and vice versa.
    6. This viewset can be registered with a router in urls.py to create the appropriate endpoints.
    
    A simple viewSet for viewing meals.
    Provides:
    -Get /meals/ : List all meals
    -Get /meals/{id}/ : Retrieve a specific meal by ID
    """
    queryset = Meal.objects.all()
    serializer_class = MealSerializer
    permission_classes = [IsStaffOrReadOnly]



