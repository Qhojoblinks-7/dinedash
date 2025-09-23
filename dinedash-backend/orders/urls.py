from django.urls import path
from .views import OrderCreateAPIView, OrderListAPIView, OrderRetrieveAPIView, CheckoutAPIView

app_name = "orders"  # Optional: allows namespacing URLs for reverse lookups

urlpatterns = [
    # List all orders (staff only)
    path('', OrderListAPIView.as_view(), name='order-list'),

    # Create a new order
    path('create/', OrderCreateAPIView.as_view(), name='order-create'),

    # Retrieve a single order
    path('<int:pk>/', OrderRetrieveAPIView.as_view(), name='order-detail'),

    # Checkout endpoint
    path('checkout/', CheckoutAPIView.as_view(), name='checkout'),
]
