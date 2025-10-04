from rest_framework import serializers
from .models import Payment
from orders.models import Order 

class PaymentSerializer(serializers.ModelSerializer):
    """
    General read-only serializer for the Payment model.
    """
    
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['id', 'order', 'transaction_id', 'transaction_ref', 'created_at', 'updated_at']


class PaymentCreateSerializer(serializers.Serializer):
    """
    Serializer for validating incoming data before payment initiation.
    """
    # Fields expected from the front-end
    order_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    payment_method = serializers.ChoiceField(choices=Payment.PAYMENT_METHOD_CHOICES)
    
    # Optional field needed for the payment gateway payload (used in the View)
    email = serializers.EmailField(required=False)
    
    def validate_order_id(self, value):
        """
        Ensure the order exists and is eligible for payment.
        """
        try:
            order = Order.objects.get(id=value)
        except Order.DoesNotExist:
            raise serializers.ValidationError("Order does not exist.")
        

        if order.status == 'completed' or getattr(order, 'is_paid', False):
            raise serializers.ValidationError("Order is already paid or completed.")
        
        # Attach the order object to the serializer instance for the view's use
        if not hasattr(self, '_order_cache'):
            self._order_cache = {}
        self._order_cache[value] = order
        
        return value
    
    def validate_amount(self, value):
        """
        Ensure the payment amount is positive.
        """
        if value <= 0:
            raise serializers.ValidationError("Payment amount must be positive.")
        return value
    
    def validate(self, data):
        """
        Add the fetched order object to the validated data.
        """
        order_id = data.get('order_id')
        if order_id in getattr(self, '_order_cache', {}):
            data['order'] = self._order_cache[order_id]
        
        # Optional: Check if amount matches order total if required
        if data.get('order') and data.get('amount') < data['order'].total_amount:
            raise serializers.ValidationError({"amount": "Payment amount is less than the order total."})

        return data

# Checkout Nested Serializer (for CheckoutAPIView)
class CheckoutPaymentSerializer(serializers.Serializer):
    """
    Validates payment details when nested within the CheckoutAPIView payload.
    It focuses only on the method and required provider/contact details.
    """
    # Fields that map directly to the Payment model
    method = serializers.ChoiceField(
        choices=Payment.PAYMENT_METHOD_CHOICES, 
        default='cash'
    )
    provider = serializers.CharField(max_length=50, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    bank_details = serializers.CharField(required=False, allow_blank=True)
    transaction_ref = serializers.CharField(required=False, allow_blank=True)
    payment_token = serializers.CharField(required=False, allow_blank=True)
    
    # Optional field needed for some online gateways 
    email = serializers.EmailField(required=False, allow_blank=True) 

    def validate(self, data):
        """
        Ensures method-specific fields are present (e.g., phone for MoMo).
        """
        method = data.get('method')
        
        # Example validation: Mobile Money needs a phone number
        # Use getattr() for safe access to constants if they are not directly imported
        if method in ['momo'] and not data.get('phone'):
            raise serializers.ValidationError({"phone": "Phone number is required for Mobile Money payments."})
        
        return data
