from django.db import transaction
from rest_framework import status, permissions, generics
from rest_framework.views import APIView
from rest_framework.response import Response
import uuid

from .models import Order, OrderItem
from .serializers import (
    OrderSerializer,
    OrderCreateSerializer,
    OrderCreateItemSerializer,
)

from payments.models import Payment
from payments.serializers import CheckoutPaymentSerializer, PaymentSerializer


# ----------------------------------------------------------------------
# Checkout API
# ----------------------------------------------------------------------
class CheckoutAPIView(APIView):
    """
    Handle complete checkout process atomically.
    1. Creates Order and all OrderItems.
    2. Validates Payment data.
    3. Creates PENDING Payment record (or COMPLETED for mock/cash).
    """
    permission_classes = [permissions.AllowAny]

    def get_authenticators(self):
        """
        Allow anonymous access for checkout.
        """
        return []

    def post(self, request, *args, **kwargs):
        order_data = request.data.get('order', {})
        payment_data = request.data.get('payment', {})

        # --- STEP 1: Validate Order Data (Outside Transaction) ---
        order_serializer = OrderCreateSerializer(data=order_data)
        order_serializer.is_valid(raise_exception=True)

        # --- STEP 2: Validate Payment Data (Outside Transaction) ---
        payment_serializer = CheckoutPaymentSerializer(data=payment_data)
        payment_serializer.is_valid(raise_exception=True)
        payment_validated_data = payment_serializer.validated_data

        payment = None  # Initialize for final response

        try:
            with transaction.atomic():
                # A. Create the Order
                order = order_serializer.save()

                # B. Calculate final amount (items + delivery fee)
                final_amount = order.total_amount + order.delivery_fee

                # C. Create Payment record
                payment_method = payment_validated_data.get('method', 'cash')
                initial_status = (
                    Payment.STATUS_COMPLETED
                    if payment_method == Payment.METHOD_CASH
                    else Payment.STATUS_PENDING
                )

                payment = Payment.objects.create(
                    order=order,
                    amount=final_amount,
                    method=payment_method,
                    status=initial_status,
                    **payment_validated_data,
                )

                # D. Update order status for cash
                if payment.status == Payment.STATUS_COMPLETED:
                    order.status = Order.STATUS_IN_PROGRESS
                    order.save()

                # E. Simulate payment (mock)
                if payment_method != Payment.METHOD_CASH:
                    tx_ref = f"MOCK-PAY-{order.id}-{uuid.uuid4().hex[:6]}"
                    payment.transaction_ref = tx_ref

                    if "fail" not in tx_ref.lower():
                        payment.status = Payment.STATUS_PENDING
                    else:
                        payment.status = Payment.STATUS_FAILED

                    payment.save()

                    if payment.status == Payment.STATUS_PENDING:
                        mock_link = (
                            f"/api/payments/mock-verify/?tx_ref={payment.transaction_ref}"
                            f"&order_id={order.id}&status=successful"
                        )
                        return Response(
                            {
                                "order_id": order.id,
                                "tracking_code": order.tracking_code,
                                "status": "PENDING_PAYMENT_REDIRECT",
                                "payment_link": mock_link,
                            },
                            status=status.HTTP_202_ACCEPTED,
                        )

        except Exception as e:
            return Response(
                {"error": f"An error occurred during checkout: {e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # --- STEP 4: Final Response ---
        return Response(
            {
                "order": OrderSerializer(order).data,
                "payment": {
                    "id": payment.id,
                    "method": payment.method,
                    "status": payment.status,
                    "amount": payment.amount,
                    "transaction_id": getattr(payment, "transaction_id", None),
                },
            },
            status=status.HTTP_201_CREATED,
        )


# ----------------------------------------------------------------------
# Create Order API
# ----------------------------------------------------------------------
class OrderCreateAPIView(APIView):
    """ Create a new order with items atomically. """
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            with transaction.atomic():
                order = serializer.save()
                return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {"error": f"An error occurred while creating the order: {e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# ----------------------------------------------------------------------
# List Orders API
# ----------------------------------------------------------------------
class OrderListAPIView(generics.ListAPIView):
    """ List all orders (staff only). """
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_authenticators(self):
        """
        Allow anonymous access for GET requests (for testing purposes).
        In production, this should require proper authentication.
        """
        if self.request.method in permissions.SAFE_METHODS:
            return []  # No authentication required for GET requests
        return super().get_authenticators()

    def get_permissions(self):
        """
        Allow anonymous access for GET requests (for testing purposes).
        In production, this should require proper authentication.
        """
        if self.request.method in permissions.SAFE_METHODS:
            return []  # No permissions required for GET requests
        return super().get_permissions()


# ----------------------------------------------------------------------
# Retrieve Order API (by tracking code for guests)
# ----------------------------------------------------------------------
class OrderRetrieveAPIView(APIView):
    """
    Retrieve a single order by its tracking code.
    Guests (no login) can use this to track their order.
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request, tracking_code, *args, **kwargs):
        try:
            order = Order.objects.get(tracking_code=tracking_code)
        except Order.DoesNotExist:
            return Response(
                {"error": "Order not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)


# ----------------------------------------------------------------------
# Staff Retrieve Order by ID (optional)
# ----------------------------------------------------------------------
class StaffOrderRetrieveAPIView(generics.RetrieveAPIView):
    """ Retrieve a single order by internal ID (staff only). """
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'id'
    