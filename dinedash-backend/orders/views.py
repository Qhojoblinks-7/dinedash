from django.db import transaction
import logging
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

logger = logging.getLogger(__name__)

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
            logger.exception("[orders:checkout] error during checkout")
            return Response(
                {"error": f"An error occurred during checkout: {e}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # --- STEP 4: Final Response ---
        logger.info(
            "[orders:checkout] success", extra={
                "order_id": order.id,
                "tracking_code": order.tracking_code,
                "payment_id": payment.id if payment else None,
            }
        )
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
                logger.info("[orders:create] success", extra={"order_id": order.id})
                return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.exception("[orders:create] error while creating order")
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

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        try:
            count = len(response.data) if hasattr(response, 'data') else 0
        except Exception:
            count = 0
        logger.info("[orders:list] returned", extra={"count": count})
        return response


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


# ----------------------------------------------------------------------
# Update Order Status API
# ----------------------------------------------------------------------
class OrderStatusUpdateAPIView(APIView):
    """Update the status of an order by internal ID."""
    permission_classes = [permissions.AllowAny]

    def get_authenticators(self):
        # Allow anonymous for testing; tighten in production
        return []

    def patch(self, request, id, *args, **kwargs):
        logger.info(f"[orders:status_update] request data: {request.data}")
        new_status = request.data.get('status')
        if not new_status:
            return Response({"error": "Missing 'status' in request body."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            order = Order.objects.get(id=id)
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        # Validate new_status against allowed choices
        allowed_statuses = {choice[0] for choice in Order.STATUS_CHOICES}
        if new_status not in allowed_statuses:
            return Response({"error": f"Invalid status '{new_status}'."}, status=status.HTTP_400_BAD_REQUEST)

        previous_status = order.status
        order.status = new_status
        order.save()

        logger.info(
            "[orders:status_update] success",
            extra={"order_id": order.id, "from": previous_status, "to": new_status}
        )
        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)
      
class OrderUpdateStatusAPIView(generics.UpdateAPIView):
    """ Update order status (staff only). """
    queryset = Order.objects.all()
    serializer_class = None  # Will set in get_serializer_class
    permission_classes = [permissions.IsAdminUser]
    lookup_field = 'id'
    http_method_names = ['patch']  # Only allow PATCH

    def get_serializer_class(self):
        from .serializers import OrderStatusUpdateSerializer
        return OrderStatusUpdateSerializer

    def get_authenticators(self):
        """
        Allow anonymous access for PATCH requests (for testing purposes).
        In production, this should require proper authentication.
        """
        if self.request.method == 'PATCH':
            return []  # No authentication required for PATCH requests
        return super().get_authenticators()

    def get_permissions(self):
        """
        Allow anonymous access for PATCH requests (for testing purposes).
        In production, this should require proper authentication.
        """
        if self.request.method == 'PATCH':
            return []  # No permissions required for PATCH requests
        return super().get_permissions()

    def patch(self, request, *args, **kwargs):
        try:
            return super().patch(request, *args, **kwargs)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error updating order status: {e}", exc_info=True)
            return Response(
                {"error": "An error occurred while updating order status."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


# ----------------------------------------------------------------------
# Analytics API
# ----------------------------------------------------------------------
class AnalyticsAPIView(APIView):
    """ Analytics data for dashboard. """
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        # Get all orders (for demo purposes, using all instead of completed)
        orders = Order.objects.all()

        # Filter by date range if provided
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if start_date:
            orders = orders.filter(created_at__date__gte=start_date)
        if end_date:
            orders = orders.filter(created_at__date__lte=end_date)

        completed_orders = orders

        # Total revenue
        total_revenue = sum(float(order.total_amount) for order in completed_orders)

        # Total orders
        total_orders = completed_orders.count()

        # Average order value
        avg_order_value = total_revenue / total_orders if total_orders > 0 else 0

        # Today's revenue
        from django.utils import timezone
        today = timezone.now().date()
        today_orders = completed_orders.filter(created_at__date=today)
        today_revenue = sum(float(order.total_amount) for order in today_orders)

        # Daily revenue for the selected period
        daily_revenue = []
        if start_date and end_date:
            start = timezone.datetime.fromisoformat(start_date).date()
            end = timezone.datetime.fromisoformat(end_date).date()
            current_date = start
            while current_date <= end:
                day_orders = completed_orders.filter(created_at__date=current_date)
                revenue = sum(float(order.total_amount) for order in day_orders)
                daily_revenue.append({
                    'date': current_date.isoformat(),
                    'revenue': revenue,
                    'orders': day_orders.count()
                })
                current_date += timezone.timedelta(days=1)
        else:
            # Default to last 7 days if no date range specified
            for i in range(6, -1, -1):
                date = today - timezone.timedelta(days=i)
                day_orders = completed_orders.filter(created_at__date=date)
                revenue = sum(float(order.total_amount) for order in day_orders)
                daily_revenue.append({
                    'date': date.isoformat(),
                    'revenue': revenue,
                    'orders': day_orders.count()
                })

        # Payment method breakdown
        payment_breakdown = {}
        for order in completed_orders:
            try:
                payment = order.payments.first()  # Get the first payment
                method = payment.method if payment else 'cash'
            except:
                method = 'cash'
            payment_breakdown[method] = payment_breakdown.get(method, 0) + float(order.total_amount)

        # Most profitable meals
        from meals.models import Meal
        meal_revenue = {}
        for order in completed_orders:
            for item in order.items.all():
                meal_id = str(item.meal.id)
                revenue = float(item.unit_price) * item.quantity
                meal_revenue[meal_id] = meal_revenue.get(meal_id, 0) + revenue

        most_profitable = []
        for meal_id, revenue in sorted(meal_revenue.items(), key=lambda x: x[1], reverse=True)[:5]:
            try:
                meal = Meal.objects.get(id=meal_id)
                most_profitable.append({
                    'name': meal.name,
                    'revenue': revenue
                })
            except Meal.DoesNotExist:
                continue

        return Response({
            'total_revenue': total_revenue,
            'total_orders': total_orders,
            'avg_order_value': avg_order_value,
            'today_revenue': today_revenue,
            'daily_revenue': daily_revenue,
            'payment_breakdown': payment_breakdown,
            'most_profitable': most_profitable
        })
    