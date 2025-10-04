from rest_framework import serializers
from django.db import transaction
from decimal import Decimal
from .models import Order, OrderItem
from meals.models import Meal
from payments.models import Payment


# Read and Display serializers

class OrderItemSerializer(serializers.ModelSerializer):
    """ Read-only serializer for individual items.
        Uses stored item_name or unit_price for historical accuracy. """
    class Meta:
        model = OrderItem
        fields = ['meal', 'item_name', 'quantity', 'unit_price']


class OrderSerializer(serializers.ModelSerializer):
    """ General read-only serializer for Order objects. """
    items = OrderItemSerializer(many=True, read_only=True)
    payment_method = serializers.SerializerMethodField()
    payment_tx_ref = serializers.SerializerMethodField()

    def get_payment_method(self, obj):
        payment = obj.payments.first()  # Get the first payment associated with the order
        return payment.method if payment else None

    def get_payment_tx_ref(self, obj):
        payment = obj.payments.first()
        return payment.transaction_ref if payment else None

    class Meta:
        model = Order
        fields = [
            'id',
            'tracking_code',
            'customer_name',
            'customer_email',
            'contact_phone',
            'order_type',
            'status',
            'total_amount',
            'delivery_fee',
            'delivery_address',
            'delivery_instructions',
            'pickup_time',
            'created_at',
            'items',
            'payment_method',
            'payment_tx_ref',
        ]
        read_only_fields = ['tracking_code', 'status', 'total_amount', 'created_at']


# UPDATE SERIALIZERS

class OrderStatusUpdateSerializer(serializers.ModelSerializer):
    """ Serializer for updating only the order status. """
    class Meta:
        model = Order
        fields = ['status']


# WRITE/CREATE SERIALIZERS
class OrderCreateItemSerializer(serializers.Serializer):
    """ Accepts meal ID and quantity from the client. """
    meal_id = serializers.IntegerField(min_value=1)
    quantity = serializers.IntegerField(min_value=1)


class OrderCreateSerializer(serializers.Serializer):
    """ Securely creates an Order and nested OrderItems. """
    customer_name = serializers.CharField(allow_blank=True, required=False)
    customer_email = serializers.EmailField(required=False, allow_blank=True)
    contact_phone = serializers.CharField(required=False, allow_blank=True)
    table_number = serializers.CharField(required=False, allow_blank=True)
    delivery_address = serializers.CharField(required=False, allow_blank=True)
    delivery_instructions = serializers.CharField(required=False, allow_blank=True)
    pickup_time = serializers.DateTimeField(required=False, allow_null=True)
    delivery_fee = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    order_type = serializers.ChoiceField(
        choices=Order.ORDER_TYPE_CHOICES, default=Order.TYPE_DINE_IN
    )
    items = OrderCreateItemSerializer(many=True)

    def validate(self, data):
        items_data = data.get('items', [])
        if not items_data:
            raise serializers.ValidationError({"items": "Order must contain at least one item."})

        calculated_total = Decimal('0.00')
        delivery_fee = data.get('delivery_fee') or Decimal('0.00')
        processed_items = []

        for item_data in items_data:
            meal_id = item_data['meal_id']
            quantity = item_data['quantity']

            try:
                meal = Meal.objects.get(pk=meal_id)
            except Meal.DoesNotExist:
                raise serializers.ValidationError(f"Meal with ID {meal_id} does not exist.")

            if not getattr(meal, 'is_available', True):
                raise serializers.ValidationError(f"Meal '{meal.name}' is currently unavailable.")

            item_price = meal.price * quantity
            calculated_total += item_price

            processed_items.append({
                'meal': meal,
                'quantity': quantity,
                'unit_price': meal.price,
                'item_name': meal.name,
            })

        data['total_amount'] = calculated_total + delivery_fee
        data['items_processed'] = processed_items
        return data

    @transaction.atomic
    def create(self, validated_data):
        items_processed = validated_data.pop('items_processed')
        validated_data.pop('items', None)

        order = Order.objects.create(**validated_data)

        order_items_to_create = [
            OrderItem(
                order=order,
                meal=item['meal'],
                quantity=item['quantity'],
                unit_price=item['unit_price'],
                item_name=item['item_name'],
            )
            for item in items_processed
        ]
        OrderItem.objects.bulk_create(order_items_to_create)

        return order
