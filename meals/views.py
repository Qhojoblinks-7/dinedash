from rest_framework import generics
from .models import Meal
from .serializers import MealSerializer
"""
class MealListCreateView(generics.ListCreateAPIView):
    queryset = Meal.objects.all()
"""
class MealListAPIView(generics.ListAPIView):
    queryset = Meal.objects.all()
    serializer_class = MealSerializer
    
    
class MealDetailAPIView(generics.RetrieveAPIView):
    queryset = Meal.objects.all()
    serializer_class = MealSerializer    