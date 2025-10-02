from django.urls import path
from .views import (
    OrderCreateAPIView,
    OrderListAPIView,
    OrderRetrieveAPIView,
    CheckoutAPIView,
    StaffOrderRetrieveAPIView,
    OrderStatusUpdateAPIView,
    OrderUpdateStatusAPIView,
)

app_name = "orders"  # Optional: allows namespacing URLs for reverse lookups

urlpatterns = [
    # List all orders (staff only)
    path('', OrderListAPIView.as_view(), name='order-list'),

    # Create a new order
    path('create/', OrderCreateAPIView.as_view(), name='order-create'),

    # Retrieve a single order by tracking code (customers/guests)
    path('<str:tracking_code>/', OrderRetrieveAPIView.as_view(), name='order-detail'),

    # Staff retrieve by internal DB ID
    path('staff/<int:pk>/', StaffOrderRetrieveAPIView.as_view(), name='staff-order-detail'),

    # Update order status by internal ID
    path('<int:id>/status/', OrderStatusUpdateAPIView.as_view(), name='order-status-update'),
    # Update order status by ID
    path('<int:pk>/status/', OrderUpdateStatusAPIView.as_view(), name='order-update-status'),

    # Checkout endpoint
    path('checkout/', CheckoutAPIView.as_view(), name='checkout'),
]
