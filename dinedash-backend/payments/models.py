from django.db import models

from orders.models import Order


class Payment(models.Model):
    """
    Represents a payment made for an order.
    Each payment is linked to a specific order and includes details
    about the payment method, amount, and status.
    """

    METHOD_CASH = 'cash'
    METHOD_CARD = 'card'
    METHOD_ONLINE = 'online'
    METHOD_MOMO = 'momo'
    METHOD_MONO = 'mono'

    PAYMENT_METHOD_CHOICES = [
        (METHOD_CASH, 'Cash'),
        (METHOD_CARD, 'Card'),
        (METHOD_ONLINE, 'Online'),
        (METHOD_MOMO, 'Mobile Money'),
        (METHOD_MONO, 'Mono'),
    ]

    STATUS_PENDING = 'pending'
    STATUS_COMPLETED = 'completed'
    STATUS_FAILED = 'failed'

    PAYMENT_STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_COMPLETED, 'Completed'),
        (STATUS_FAILED, 'Failed'),
    ]

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='payments',
        help_text="The order associated with this payment."
    )
    amount = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        help_text="The amount paid."
    )
    method = models.CharField(
        max_length=10,
        choices=PAYMENT_METHOD_CHOICES,
        default=METHOD_CASH,
        help_text="The method used for the payment."
    )
    status = models.CharField(
        max_length=10,
        choices=PAYMENT_STATUS_CHOICES,
        default=STATUS_PENDING,
        help_text="The current status of the payment."
    )
    transaction_id = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        help_text="Transaction ID for online or card payments."
    )
    provider = models.CharField(
        max_length=50,
        blank=True,
        help_text="Mobile money provider (e.g., MTN, Vodafone)."
    )
    phone = models.CharField(
        max_length=20,
        blank=True,
        help_text="Phone number for mobile money payments."
    )
    bank_details = models.TextField(
        blank=True,
        help_text="Bank details for Mono payments."
    )
    transaction_ref = models.CharField(
        max_length=100,
        blank=True,
        help_text="Transaction reference for mobile money or bank transfers."
    )
    payment_token = models.CharField(
        max_length=255,
        blank=True,
        help_text="Payment token for Flutterwave or other payment processors."
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Payment {self.id} for Order {self.order.id} - {self.amount} via {self.method}"
