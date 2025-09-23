from rest_framework import viewsets, permissions
from .models import Meal
from .serializers import MealSerializer

class IsStaffOrReadOnly(permissions.BasePermission):
    """
    Only staff users can create/update/delete.
    Everyone else can read (GET, HEAD, OPTIONS).
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff

class MealViewSet(viewsets.ModelViewSet):  # <- Allow CRUD for staff
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
    permission_classes = [IsStaffOrReadOnly]

