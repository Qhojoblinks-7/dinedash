from django.db import models
import uuid
import random
from meals.models import Meal 
from django.conf import settings 

class Order(models.Model):
    """
    Represents a customer order in the system.
    """
    
    # Status Choices (Ensuring Fulfillment Clarity)
    STATUS_PENDING = 'pending'
    STATUS_IN_PROGRESS = 'in progress'
    STATUS_READY = 'ready'
    STATUS_DELIVERED = 'delivered'
    STATUS_COMPLETED = 'completed'
    STATUS_CANCELLED = 'cancelled'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending Payment/Confirmation'),
        (STATUS_IN_PROGRESS, 'In Progress (Kitchen)'),
        (STATUS_READY, 'Ready for Handover'),
        (STATUS_DELIVERED, 'Delivered'),
        (STATUS_COMPLETED, 'Completed/Closed'),
        (STATUS_CANCELLED, 'Cancelled'),
    ]

    TYPE_DINE_IN = 'dine in'
    TYPE_TAKE_OUT = 'takeaway'
    TYPE_DELIVERY = 'delivery'
    TYPE_PICKUP = 'pickup'

    ORDER_TYPE_CHOICES = [
        (TYPE_DINE_IN, 'Dine In'),
        (TYPE_TAKE_OUT, 'Takeaway'),
        (TYPE_DELIVERY, 'Delivery'),
        (TYPE_PICKUP, 'Pickup'),
    ]
    
    # Relationships
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='placed_orders',
        help_text="The registered user who placed the order."
    )

    # Customer and Logistics
    customer_identifier = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True,
        help_text="Unique identifier for the customer, useful for guest orders."
    )

    tracking_code = models.CharField(
        max_length=12,
        editable=False,
        help_text="Short code for customers to track their order."
    )

    customer_name = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        help_text="Customer name or table number."
    )
    customer_email = models.EmailField(blank=True, null=True)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    table_number = models.CharField(max_length=10, blank=True, null=True)
    delivery_address = models.TextField(blank=True, null=True)
    delivery_instructions = models.TextField(blank=True, null=True)
    pickup_time = models.DateTimeField(null=True, blank=True)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    # Core Status and Pricing
    order_type = models.CharField(max_length=10, choices=ORDER_TYPE_CHOICES, default=TYPE_DINE_IN)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_PENDING)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Order"
        verbose_name_plural = "Orders"

    def save(self, *args, **kwargs):
        # Generate tracking code if not already set
        if not self.tracking_code:
            while True:
                code = f"ORD{random.randint(10000, 99999)}"
                if not Order.objects.filter(tracking_code=code).exists():
                    self.tracking_code = code
                    break
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.tracking_code} - {self.customer_name or self.customer_identifier}"


class OrderItem(models.Model):
    """
    Represents an individual meal item within an order.
    """
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    meal = models.ForeignKey(Meal, on_delete=models.SET_NULL, null=True)
    item_name = models.CharField(max_length=255, default='Unknown Item')
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    quantity = models.PositiveIntegerField(default=1)

    @property
    def total_price(self):
        return self.unit_price * self.quantity

    class Meta:
        verbose_name = "Order Item"
        verbose_name_plural = "Order Items"

    def __str__(self):
        return f"{self.quantity} x {self.item_name} ({self.order.tracking_code})"
