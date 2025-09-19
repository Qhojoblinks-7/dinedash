from rest_framework import generics, permissions
from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderItemSerializer

# Staff Permissions
class IsStaff(permissions.BasePermission):
    
    def has_object_permission(self, request, view, obj):
        return super().has_object_permission(request, view, obj) and request.user.is_staff
    
# API View
class OrderCreateAPIView(generics.CreateAPIView):
    """
    API endpoint for creating orders.
    customers will use this to place orders
    """
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
        
    # Allow any user (authenticated or not) to create orders
    permission_classes = [permissions.AllowAny]
    
class OrderListAPIView(generics.ListAPIView):
    """
    API endpoint for listing all orders.
    Staff users will use this to view all orders
    """
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    
    # Only staff users can view the list of orders
    permission_classes = [IsStaff]