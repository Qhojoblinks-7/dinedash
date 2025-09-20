from rest_framework import serializers
from .models import Order, OrderItem

from meals.serializers import MealSerializer
from meals.models import Meal
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


class OrderCreateItemSerializer(serializers.Serializer):
    meal = serializers.IntegerField()
    quantity = serializers.IntegerField()


class OrderCreateSerializer(serializers.Serializer):
    customer_name = serializers.CharField(allow_blank=True, required=False)
    order_type = serializers.ChoiceField(choices=Order.ORDER_TYPE_CHOICES, default='dine_in')
    items = OrderCreateItemSerializer(many=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError('Order must contain at least one item')
        return value

    def create(self, validated_data):
        items = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        total = 0
        for it in items:
            meal_id = it.get('meal')
            qty = it.get('quantity', 1)
            try:
                meal = Meal.objects.get(pk=meal_id)
            except Meal.DoesNotExist:
                raise serializers.ValidationError(f"Meal id {meal_id} does not exist")
            OrderItem.objects.create(order=order, meal=meal, quantity=qty)
            total += float(meal.price) * int(qty)
        order.total_amount = total
        order.save()
        return order