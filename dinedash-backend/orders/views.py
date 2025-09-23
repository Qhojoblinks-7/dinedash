from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Order
from .serializers import OrderSerializer, OrderCreateSerializer
from payments.models import Payment


class OrderRetrieveAPIView(generics.RetrieveAPIView):
    """
    API endpoint to retrieve a single order by ID.
    """
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.AllowAny]  # Adjust if needed


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


class CheckoutAPIView(APIView):
    """
    API endpoint to handle complete checkout process.
    Creates order and initiates payment if needed.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        # Extract order and payment data
        order_data = request.data.get('order', {})
        payment_data = request.data.get('payment', {})

        # Create order
        order_serializer = OrderCreateSerializer(data=order_data)
        order_serializer.is_valid(raise_exception=True)
        order = order_serializer.save()

        # Create payment record
        payment = Payment.objects.create(
            order=order,
            amount=order.total_amount + order.delivery_fee,
            method=payment_data.get('method', 'cash'),
            provider=payment_data.get('provider', ''),
            phone=payment_data.get('phone', ''),
            bank_details=payment_data.get('bank_details', ''),
            transaction_ref=payment_data.get('transaction_ref', ''),
            payment_token=payment_data.get('payment_token', ''),
        )

        # Handle payment initiation for online methods
        payment_response = None
        if payment.method in ['online', 'card', 'momo', 'mono']:
            # For now, just mark as pending
            # In production, integrate with payment processors
            payment.status = Payment.STATUS_PENDING
            payment.save()

        response_data = {
            'order': OrderSerializer(order).data,
            'payment': {
                'id': payment.id,
                'method': payment.method,
                'status': payment.status,
                'amount': payment.amount,
            }
        }

        return Response(response_data, status=status.HTTP_201_CREATED)
