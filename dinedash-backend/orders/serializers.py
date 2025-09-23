from rest_framework import serializers
from .models import Order, OrderItem
from meals.models import Meal
from meals.serializers import MealSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    """
    Serializer for individual OrderItem objects.
    Includes nested Meal details (read-only).
    """
    meal = MealSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ['meal', 'quantity']


class OrderSerializer(serializers.ModelSerializer):
    """
    Serializer for Order objects.
    Includes nested OrderItemSerializer for all items in the order.
    """
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = '__all__'


class OrderCreateItemSerializer(serializers.Serializer):
    """
    Serializer for creating a single item within an order.
    Accepts meal ID and quantity.
    """
    meal = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)


class OrderCreateSerializer(serializers.Serializer):
    """
    Serializer for creating an Order with multiple items.
    Handles validation and nested creation of OrderItems.
    """
    customer_name = serializers.CharField(
        allow_blank=True,
        required=False,
        help_text="Optional customer name or table number."
    )
    customer_email = serializers.EmailField(
        required=False,
        allow_blank=True,
        help_text="Customer email address."
    )
    contact_phone = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Customer contact phone number."
    )
    table_number = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Table number for dine-in orders."
    )
    delivery_address = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Delivery address for delivery orders."
    )
    delivery_instructions = serializers.CharField(
        required=False,
        allow_blank=True,
        help_text="Special delivery instructions."
    )
    pickup_time = serializers.DateTimeField(
        required=False,
        allow_null=True,
        help_text="Preferred pickup time for takeaway/pickup orders."
    )
    delivery_fee = serializers.DecimalField(
        max_digits=6,
        decimal_places=2,
        required=False,
        default=0.00,
        help_text="Delivery fee for delivery orders."
    )
    order_type = serializers.ChoiceField(
        choices=Order.ORDER_TYPE_CHOICES,
        default=Order.TYPE_DINE_IN
    )
    items = OrderCreateItemSerializer(many=True)

    def validate_items(self, value):
        """
        Ensure that the order contains at least one item.
        """
        if not value:
            raise serializers.ValidationError('Order must contain at least one item.')
        return value

    def create(self, validated_data):
        """
        Create an Order instance along with its OrderItems.
        Calculates the total amount automatically.
        """
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)

        total_amount = 0
        for item_data in items_data:
            meal_id = item_data.get('meal')
            quantity = item_data.get('quantity', 1)

            try:
                meal = Meal.objects.get(pk=meal_id)
            except Meal.DoesNotExist:
                raise serializers.ValidationError(f"Meal with id {meal_id} does not exist.")

            # Create OrderItem
            OrderItem.objects.create(order=order, meal=meal, quantity=quantity)

            # Calculate total
            total_amount += float(meal.price) * int(quantity)

        # Save total amount to order
        order.total_amount = total_amount
        order.save()

        return order
