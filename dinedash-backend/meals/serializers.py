from rest_framework import serializers
from .models import Meal
"""
Serializer for the Meal model.

Converts Meal model instances to JSON for API responses and
validates incoming JSON data for creating/updating meals.
"""

class MealSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meal
        fields = '__all__'