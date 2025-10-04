import logging
from rest_framework import serializers
from .models import Meal

logger = logging.getLogger(__name__)

"""
Serializer for the Meal model.

Converts Meal model instances to JSON for API responses and
validates incoming JSON data for creating/updating meals.
"""

class MealSerializer(serializers.ModelSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Log min_value for debugging
        if 'price' in self.fields:
            logger.warning(f"Price field min_value: {self.fields['price'].min_value}, type: {type(self.fields['price'].min_value)}")
        if 'prep_time' in self.fields:
            logger.warning(f"Prep_time field min_value: {self.fields['prep_time'].min_value}, type: {type(self.fields['prep_time'].min_value)}")

    def validate(self, data):
        logger.warning(f"Validating data: {data}")
        return data

    def create(self, validated_data):
        logger.warning(f"Creating meal with validated_data: {validated_data}")
        return super().create(validated_data)

    class Meta:
        model = Meal
        fields = ['id', 'category', 'name', 'description', 'price', 'prep_time', 'is_available', 'is_veg', 'image']
