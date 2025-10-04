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
