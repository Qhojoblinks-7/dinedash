from django.db import models
import uuid

#importing the Meal model from the meals app to establish a relationship between orders and meals
from meals.models import Meal
# Create your models here.

class Order(models.Model):
    """
    A model representing a customer order
    """
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled')
    ]
    
    ORDER_TYPE_CHOICES = [
        ('dine_in', 'Dine In'),
        ('take-out', 'Take-out')
    ]
    customer_identifier = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    
    customer_name = models.CharField(max_length=200, help_text="e.g.., table  number or customer name", blank=True, null=False)
    
    order_type = models.CharField(max_length=10, choices=ORDER_TYPE_CHOICES, default='dinne_in')
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    total_amount = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # A magic string method to return a string representation of the object
    def __str__(self):
        return f"Order {self.id} - {self.customer_name or self.customer_identifier}"
    
    
    
    
    # A class for the order item to represent individual items within an order
class OrderItem(models.Model):
    
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    
    meal = models.ForeignKey(Meal, on_delete=models.CASCADE)
    
    quantity = models.PositiveBigIntegerField(default=1)
    
    
    def __str__(self):
        return f"{self.meal.name} X {self.quantity} for Order # {self.order.id}"