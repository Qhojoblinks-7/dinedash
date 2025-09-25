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


class IsStaffOrReadOnly(permissions.BasePermission):
    """
    Only staff users can create/update/delete.
    Everyone else can read (GET, HEAD, OPTIONS).
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
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
    Everyone can read orders (for dashboard), staff can manage.
    """
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsStaffOrReadOnly]


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

        # Simulate payment processing for testing
        payment_response = None
        if payment.method in ['online', 'card', 'momo', 'mono']:
            # Simulate payment processing with realistic outcomes
            import random
            import time

            # Simulate processing delay
            time.sleep(0.5)

            # Simulate different payment outcomes for testing
            test_scenarios = {
                'success': Payment.STATUS_COMPLETED,
                'pending': Payment.STATUS_PENDING,
                'failed': Payment.STATUS_FAILED,
            }

            # Use transaction_ref to determine test outcome
            transaction_ref = payment_data.get('transaction_ref', '').lower()

            if 'fail' in transaction_ref:
                payment.status = Payment.STATUS_FAILED
                payment.transaction_id = f"TEST_FAIL_{random.randint(1000, 9999)}"
            elif 'pending' in transaction_ref:
                payment.status = Payment.STATUS_PENDING
                payment.transaction_id = f"TEST_PENDING_{random.randint(1000, 9999)}"
            else:
                # Default to success for most cases
                payment.status = Payment.STATUS_COMPLETED
                payment.transaction_id = f"TEST_SUCCESS_{random.randint(1000, 9999)}"

            payment.save()

            payment_response = {
                'status': payment.status,
                'transaction_id': payment.transaction_id,
                'message': f"Payment {payment.status} via {payment.method}"
            }

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
