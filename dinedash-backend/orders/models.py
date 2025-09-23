from django.db import models
import uuid
from meals.models import Meal


class Order(models.Model):
    """
    Represents a customer order in the system.
    An order can be 'dine in' or 'take-out', and has a status
    indicating its progress.
    """

    STATUS_PENDING = 'pending'
    STATUS_IN_PROGRESS = 'in_progress'
    STATUS_COMPLETED = 'completed'
    STATUS_CANCELLED = 'cancelled'

    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_IN_PROGRESS, 'In Progress'),
        (STATUS_COMPLETED, 'Completed'),
        (STATUS_CANCELLED, 'Cancelled'),
    ]

    TYPE_DINE_IN = 'dine_in'
    TYPE_TAKE_OUT = 'takeaway'
    TYPE_DELIVERY = 'delivery'
    TYPE_PICKUP = 'pickup'

    ORDER_TYPE_CHOICES = [
        (TYPE_DINE_IN, 'Dine In'),
        (TYPE_TAKE_OUT, 'Takeaway'),
        (TYPE_DELIVERY, 'Delivery'),
        (TYPE_PICKUP, 'Pickup'),
    ]

    customer_identifier = models.UUIDField(
        default=uuid.uuid4,
        editable=False,
        unique=True,
        help_text="Unique identifier for the customer, useful for anonymous or guest orders."
    )
    customer_name = models.CharField(
        max_length=200,
        blank=True,
        help_text="Customer name or table number. Optional for guest orders."
    )
    customer_email = models.EmailField(
        blank=True,
        null=True,
        help_text="Customer email address (needed for payments and receipts)."
    )
    contact_phone = models.CharField(
        max_length=20,
        blank=True,
        help_text="Customer contact phone number."
    )
    table_number = models.CharField(
        max_length=10,
        blank=True,
        help_text="Table number for dine-in orders."
    )
    delivery_address = models.TextField(
        blank=True,
        help_text="Delivery address for delivery orders."
    )
    delivery_instructions = models.TextField(
        blank=True,
        help_text="Special delivery instructions."
    )
    pickup_time = models.DateTimeField(
        null=True,
        blank=True,
        help_text="Preferred pickup time for takeaway/pickup orders."
    )
    delivery_fee = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=0.00,
        help_text="Delivery fee for delivery orders."
    )
    order_type = models.CharField(
        max_length=10,
        choices=ORDER_TYPE_CHOICES,
        default=TYPE_DINE_IN,
        help_text="Type of order: Dine In, Takeaway, Delivery, or Pickup."
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default=STATUS_PENDING,
        help_text="Current status of the order."
    )
    total_amount = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0.00,
        help_text="Total amount for the order, calculated from OrderItems."
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Order"
        verbose_name_plural = "Orders"

    def __str__(self):
        return f"Order {self.id} - {self.customer_name or self.customer_identifier}"


class OrderItem(models.Model):
    """
    Represents an individual meal item within an order.
    Each OrderItem is linked to a Meal and belongs to an Order.
    """

    order = models.ForeignKey(
        Order,
        related_name='items',
        on_delete=models.CASCADE,
        help_text="The order this item belongs to."
    )
    meal = models.ForeignKey(
        Meal,
        on_delete=models.CASCADE,
        help_text="The meal included in this order item."
    )
    quantity = models.PositiveBigIntegerField(
        default=1,
        help_text="Number of units of the meal in this order item."
    )

    class Meta:
        verbose_name = "Order Item"
        verbose_name_plural = "Order Items"

    def __str__(self):
        return f"{self.quantity} x {self.meal.name} (Order {self.order.id})"
