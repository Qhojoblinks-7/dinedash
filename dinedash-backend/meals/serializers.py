from rest_framework import serializers
from .models import Meal


class MealSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Meal
        fields = ['id', 'category', 'name', 'description', 'price', 'prep_time', 'is_available', 'is_veg', 'image']

    def validate_name(self, value):
        if self.instance and Meal.objects.filter(name=value).exclude(id=self.instance.id).exists():
            raise serializers.ValidationError("A meal with this name already exists.")
        elif not self.instance and Meal.objects.filter(name=value).exists():
            raise serializers.ValidationError("A meal with this name already exists.")
        return value

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0.")
        return value

    def validate_prep_time(self, value):
        if value <= 0:
            raise serializers.ValidationError("Preparation time must be greater than 0.")
        return value
