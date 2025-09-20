from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import Order, OrderItem
from .serializers import OrderSerializer, OrderItemSerializer

# Staff Permissions
class IsStaff(permissions.BasePermission):
    
    def has_object_permission(self, request, view, obj):
        return super().has_object_permission(request, view, obj) and request.user.is_staff
    
# API View
class OrderCreateAPIView(generics.GenericAPIView):
    """
    API endpoint for creating orders with nested items payload.
    """
    queryset = Order.objects.all()
    serializer_class = None
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        from .serializers import OrderCreateSerializer, OrderSerializer
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        out = OrderSerializer(order)
        return Response(out.data)
    
class OrderListAPIView(generics.ListAPIView):
    """
    API endpoint for listing all orders.
    Staff users will use this to view all orders
    """
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    
    # Only staff users can view the list of orders
    permission_classes = [IsStaff]