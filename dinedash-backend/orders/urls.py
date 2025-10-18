from django.urls import path
from .views import (
    OrderCreateAPIView,
    OrderListAPIView,
    OrderRetrieveAPIView,
    CheckoutAPIView,
    StaffOrderRetrieveAPIView,
    OrderStatusUpdateAPIView,
    AnalyticsAPIView,
)

app_name = "orders"  # Optional: allows namespacing URLs for reverse lookups

urlpatterns = [
    # List all orders (staff only)
    path('', OrderListAPIView.as_view(), name='order-list'),

    # Create a new order
    path('create/', OrderCreateAPIView.as_view(), name='order-create'),

    # Checkout endpoint (must be before tracking_code to avoid conflict)
    path('checkout/', CheckoutAPIView.as_view(), name='checkout'),

    # Analytics endpoint (must be before tracking_code to avoid conflict)
    path('analytics/', AnalyticsAPIView.as_view(), name='analytics'),

    # Staff retrieve by internal DB ID (must be before tracking_code to avoid conflict)
    path('staff/<int:pk>/', StaffOrderRetrieveAPIView.as_view(), name='staff-order-detail'),

    # Update order status by internal ID (must be before tracking_code to avoid conflict)
    path('<int:id>/status/', OrderStatusUpdateAPIView.as_view(), name='order-status-update'),

    # Retrieve a single order by tracking code (customers/guests) - this must be last
    path('<str:tracking_code>/', OrderRetrieveAPIView.as_view(), name='order-detail'),
]
