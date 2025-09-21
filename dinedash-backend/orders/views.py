from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import Order
from .serializers import OrderSerializer, OrderCreateSerializer


class IsStaff(permissions.BasePermission):
    """
    Custom permission to allow access only to staff users.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_staff


class OrderCreateAPIView(generics.GenericAPIView):
    """
    API endpoint to create an Order with nested OrderItems.
    Accepts a payload containing customer info and a list of items.
    """
    serializer_class = OrderCreateSerializer
    permission_classes = [permissions.AllowAny]  # Adjust if needed

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        # Serialize the created order for response
        response_serializer = OrderSerializer(order)
        return Response(response_serializer.data)


class OrderListAPIView(generics.ListAPIView):
    """
    API endpoint to list all orders.
    Only accessible by staff users.
    """
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsStaff]
