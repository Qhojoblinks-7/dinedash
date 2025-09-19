from rest_framework import serializers
from .models import Order, OrderItem

from meals.serializers import MealSerializer
"""
A serializer for the Order model
A serializer translates complex data types such as querysets and model instances into native Python datatypes that can then be easily rendered into JSON, XML or other content types. It also provides deserialization, allowing parsed data to be converted back into complex types, after first validating the incoming data.
it converts django models into json
"""
class OrderItemSerializer(serializers.ModelSerializer):
    meal = MealSerializer(read_only=True)
    class Meta:
        model = OrderItem
        fields = [ 'meal', 'quantity']
        
        
class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    class Meta:
        model = Order
        fields = '__all__'       