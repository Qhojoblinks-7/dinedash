from rest_framework import serializers
from .models import Payment
from orders.models import Order 

class PaymentSerializer(serializers.ModelSerializer):
    """
    Shows payment information in a format that's easy to send over the internet.
    """
    
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['id', 'order', 'transaction_id', 'transaction_ref', 'created_at', 'updated_at']


class PaymentCreateSerializer(serializers.Serializer):
    """
    Checks that all the payment information is correct before starting the payment process.
    """
    # Fields expected from the front-end
    order_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    payment_method = serializers.ChoiceField(choices=Payment.PAYMENT_METHOD_CHOICES)
    
    # Optional field needed for the payment gateway payload (used in the View)
    email = serializers.EmailField(required=False)
    
    def validate_order_id(self, value):
        """
        Make sure the order actually exists and can still be paid for.
        """
        try:
            order = Order.objects.get(id=value)
        except Order.DoesNotExist:
            raise serializers.ValidationError("Order does not exist.")


        if order.status == 'completed' or getattr(order, 'is_paid', False):
            raise serializers.ValidationError("Order is already paid or completed.")


        # Keep the order object handy for the view to use later
        if not hasattr(self, '_order_cache'):
            self._order_cache = {}
        self._order_cache[value] = order

        return value
    def validate_amount(self, value):
        """
        Make sure the payment amount is a positive number.
        """
        if value <= 0:
            raise serializers.ValidationError("Payment amount must be positive.")
        return value
    
    def validate(self, data):
        """
        Add the order object we found earlier to the cleaned data.
        """
        order_id = data.get('order_id')
        if order_id in getattr(self, '_order_cache', {}):
            data['order'] = self._order_cache[order_id]

        # Make sure the payment amount covers at least the order total
        if data.get('order') and data.get('amount') < data['order'].total_amount:
            raise serializers.ValidationError({"amount": "Payment amount is less than the order total."})

        return data

# Checkout Nested Serializer (for CheckoutAPIView)
class CheckoutPaymentSerializer(serializers.Serializer):
    """
    Checks payment information during the checkout process.
    Handles the payment method and any extra details needed for that payment type.
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
        Checks that all required information for the chosen payment method is provided.
        """
        method = data.get('method')

        # For mobile money payments, we need a phone number
        if method in ['momo'] and not data.get('phone'):
            raise serializers.ValidationError({"phone": "Phone number is required for Mobile Money payments."})

        return data
