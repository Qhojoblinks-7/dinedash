from django.urls import path
from .views import MealListAPIView, MealDetailAPIView

urlpatterns = [
    path('meals/', MealListAPIView.as_view(), name='meal-list'),
    path('meals/<int:pk>/', MealDetailAPIView.as_view(), name='meal-detail'),
]