from django.contrib import admin
from .models import Order, OrderItem

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    """
    Admin view for Orders.
    Displays key order information and allows filtering/searching.
    """
    list_display = ('id', 'customer_name', 'customer_identifier', 'order_type', 'status', 'total_amount', 'created_at')
    list_filter = ('status', 'order_type', 'created_at')
    search_fields = ('customer_name', 'customer_identifier')
    ordering = ('-created_at',)


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    """
    Admin view for individual Order Items.
    Shows which meals are associated with which orders.
    """
    list_display = ('id', 'order', 'meal', 'quantity')
    search_fields = ('meal__name', 'order__customer_name')
    ordering = ('order',)
