from django.db import transaction
import logging
import json
from decimal import Decimal
from rest_framework import status, permissions, generics, parsers
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


class CheckoutAPIView(APIView):
    """Handle checkout process."""
    permission_classes = [permissions.AllowAny]
    parser_classes = [parsers.JSONParser]  # Explicitly set JSON parser
    throttle_scope = 'checkout'

    def post(self, request, *args, **kwargs):
        # Parse JSON manually if request.data is empty
        if not request.data and request.body:
            try:
                parsed_data = json.loads(request.body.decode('utf-8'))
                order_data = parsed_data.get('order', {})
                payment_data = parsed_data.get('payment', {})
            except json.JSONDecodeError:
                logger.error("Invalid JSON format in request body")
                return Response(
                    {"error": "Invalid JSON format"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            order_data = request.data.get('order', {})
            payment_data = request.data.get('payment', {})

        # Log incoming data for debugging
        logger.info(f"Processing checkout request - Order data keys: {list(order_data.keys()) if order_data else 'None'}")
        logger.info(f"Processing checkout request - Payment data keys: {list(payment_data.keys()) if payment_data else 'None'}")

        order_serializer = OrderCreateSerializer(data=order_data)
        if not order_serializer.is_valid():
            logger.warning(f"Order validation failed: {order_serializer.errors}")
            return Response(
                {"error": "Order validation failed", "details": order_serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        payment_serializer = CheckoutPaymentSerializer(data=payment_data)
        if not payment_serializer.is_valid():
            logger.warning(f"Payment validation failed: {payment_serializer.errors}")
            return Response(
                {"error": "Payment validation failed", "details": payment_serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        payment_validated_data = payment_serializer.validated_data

        payment = None

        try:
            with transaction.atomic():
                order = order_serializer.save()
                final_amount = Decimal(order.total_amount) + Decimal(order.delivery_fee)

                payment_method = payment_validated_data.get('method', 'cash')
                initial_status = (
                    'completed'
                    if payment_method == 'cash'
                    else 'pending'
                )

                payment = Payment.objects.create(
                    order=order,
                    amount=final_amount,
                    status=initial_status,
                    **payment_validated_data,
                )

                if payment.status == 'completed':
                    order.status = 'pending'
                    order.save()

                if payment_method != 'cash':
                    tx_ref = f"MOCK-PAY-{order.id}-{uuid.uuid4().hex[:6]}"
                    payment.transaction_ref = tx_ref

                    if "fail" not in tx_ref.lower():
                        payment.status = 'pending'
                    else:
                        payment.status = 'failed'

                    payment.save()

                    if payment.status == 'pending':
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
            logger.error(f"Checkout failed: {str(e)}")
            return Response(
                {"error": "Checkout failed. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
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


class OrderCreateAPIView(APIView):
    """Create a new order."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = OrderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            with transaction.atomic():
                order = serializer.save()
                return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Order creation failed: {str(e)}")
            return Response(
                {"error": "Order creation failed. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class OrderListAPIView(generics.ListAPIView):
    """List all orders."""
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.AllowAny]

    def get_authenticators(self):
        if self.request.method in permissions.SAFE_METHODS:
            return []
        return super().get_authenticators()

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return []
        return super().get_permissions()

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        return response


class OrderRetrieveAPIView(APIView):
    """Retrieve order by tracking code."""
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


class StaffOrderRetrieveAPIView(generics.RetrieveAPIView):
    """Retrieve order by ID."""
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = 'id'


class OrderStatusUpdateAPIView(APIView):
    """Update order status."""
    permission_classes = [permissions.AllowAny]

    def patch(self, request, id, *args, **kwargs):
        new_status = request.data.get('status')
        if not new_status:
            return Response({"error": "Missing 'status'."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            order = Order.objects.get(id=id)
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        allowed_statuses = {choice[0] for choice in Order.STATUS_CHOICES}
        if new_status not in allowed_statuses:
            return Response({"error": f"Invalid status '{new_status}'."}, status=status.HTTP_400_BAD_REQUEST)

        order.status = new_status
        order.save()

        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)
      


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

        # Ordered quantities for pending orders
        ordered_quantities = {}
        for order in completed_orders:
            if order.status == 'pending':
                for item in order.items.all():
                    meal_id = str(item.meal.id)
                    ordered_quantities[meal_id] = ordered_quantities.get(meal_id, 0) + item.quantity

        return Response({
            'total_revenue': total_revenue,
            'total_orders': total_orders,
            'avg_order_value': avg_order_value,
            'today_revenue': today_revenue,
            'daily_revenue': daily_revenue,
            'payment_breakdown': payment_breakdown,
            'most_profitable': most_profitable,
            'ordered_quantities': ordered_quantities
        })
    