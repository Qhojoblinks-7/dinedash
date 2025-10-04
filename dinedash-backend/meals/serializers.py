from rest_framework import serializers
from .models import Meal


class MealSerializer(serializers.ModelSerializer):
    class Meta:
        model = Meal
        fields = ['id', 'category', 'name', 'description', 'price', 'prep_time', 'is_available', 'is_veg', 'image']
