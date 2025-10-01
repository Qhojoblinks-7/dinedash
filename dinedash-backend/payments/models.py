from django.db import models
from orders.models import Order


class Payment(models.Model):
    """
    Represents a payment for an order.
    """

    # Payment method choices
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('card', 'Card'),
        ('online', 'Online'),
        ('momo', 'Mobile Money'),
        ('mono', 'Mono'),
    ]

    # Payment status choices
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    # Relationships
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='payments',
        help_text='The order associated with this payment.'
    )

    # Core fields
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text='The amount paid.'
    )
    method = models.CharField(
        max_length=10,
        choices=PAYMENT_METHOD_CHOICES,
        default='cash',
        help_text='The method used for the payment.'
    )
    status = models.CharField(
        max_length=10,
        choices=PAYMENT_STATUS_CHOICES,
        default='pending',
        help_text='The current status of the payment.'
    )

    # Transaction details
    transaction_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text='Transaction ID for online or card payments.'
    )
    transaction_ref = models.CharField(
        max_length=100,
        blank=True,
        help_text='Transaction reference for mobile money or bank transfers.'
    )

    # Provider details
    provider = models.CharField(
        max_length=50,
        blank=True,
        help_text='Mobile money provider (e.g., MTN, Vodafone).'
    )
    phone = models.CharField(
        max_length=20,
        blank=True,
        help_text='Phone number for mobile money payments.'
    )
    bank_details = models.TextField(
        blank=True,
        help_text='Bank details for Mono payments.'
    )
    payment_token = models.CharField(
        max_length=255,
        blank=True,
        help_text='Payment token for Flutterwave or other payment processors.'
    )

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Payment'
        verbose_name_plural = 'Payments'

    def __str__(self):
        return f"Payment {self.id} for Order {self.order.id} - {self.amount}"


# Serializers
from rest_framework import serializers


class PaymentSerializer(serializers.ModelSerializer):
    """
    General read-only serializer for the Payment model, used for display/auditing.
    """
    
    class Meta:
        model = Payment
        fields = '__all__'
        read_only_fields = ['id', 'order', 'transaction_id', 'transaction_ref', 'created_at', 'updated_at']

# ----------------------------------------------------------------------
# --- INITIATION SERIALIZER (for separate MockPaymentAPIView) ---
# ----------------------------------------------------------------------

class PaymentCreateSerializer(serializers.Serializer):
    """
    Serializer for validating incoming data before payment initiation 
    (used when an Order already exists and the client initiates payment separately).
    """
    # Fields expected from the front-end
    order_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    payment_method = serializers.ChoiceField(choices=Payment.PAYMENT_METHOD_CHOICES)
    
    # Optional fields for gateway interaction
    email = serializers.EmailField(required=False)
    
    def validate_order_id(self, value):
        """
        Ensure the order exists and is eligible for payment.
        """
        try:
            order = Order.objects.get(id=value)
        except Order.DoesNotExist:
            raise serializers.ValidationError("Order does not exist.")
        
        # Ensure the order status allows for payment (e.g., must be PENDING)
        if order.status != Order.STATUS_PENDING:
             raise serializers.ValidationError(f"Order is not eligible for payment. Current status: {order.status}")

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
        Add the fetched order object and verify the amount matches the order total.
        """
        order_id = data.get('order_id')
        if order_id in getattr(self, '_order_cache', {}):
            order = self._order_cache[order_id]
            data['order'] = order
        
        # Security check: Ensure the provided amount covers the order total + delivery fee
        # Assuming total payment required is order.total_amount + order.delivery_fee
        required_total = order.total_amount + order.delivery_fee
        if data.get('amount') < required_total:
             raise serializers.ValidationError({
                 "amount": f"Payment amount ({data.get('amount')}) is less than the required total ({required_total})."
             })
        
        return data

# ----------------------------------------------------------------------
# --- CHECKOUT NESTED SERIALIZER (for CheckoutAPIView) ---
# ----------------------------------------------------------------------

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