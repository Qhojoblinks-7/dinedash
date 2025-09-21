from rest_framework import serializers
from .models import Payment
from orders.models import Order

class PaymentSerializer(serializers.ModelSerializer):
    """
    Serializer for the Payment model.
    Converts Payment model instances to JSON for API responses
    and ensures read-only fields like `id` and `order` cannot be modified.
    """
    
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['id', 'order', 'transaction_id', 'created_at', 'updated_at']


class PaymentCreateSerializer(serializers.Serializer):
    """
    Serializer for creating a Payment.
    Validates incoming data for payment creation including order existence,
    payment method, and amount.
    """
    order_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    payment_method = serializers.ChoiceField(choices=Payment.PAYMENT_METHOD_CHOICES)
    
    def validate_order_id(self, value):
        """
        Ensure the order exists and is eligible for payment.
        """
        try:
            order = Order.objects.get(id=value)
        except Order.DoesNotExist:
            raise serializers.ValidationError("Order does not exist.")
        
        # Optional: Prevent payment if order is already marked as paid
        if order.status == 'completed' or getattr(order, 'is_paid', False):
            raise serializers.ValidationError("Order is already paid or completed.")
        
        return value
    
    def validate_amount(self, value):
        """
        Ensure the payment amount is positive.
        """
        if value <= 0:
            raise serializers.ValidationError("Payment amount must be positive.")
        return value