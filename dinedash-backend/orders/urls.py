from django.urls import path
from .views import OrderCreateAPIView, OrderListAPIView

app_name = "orders"  # Optional: allows namespacing URLs for reverse lookups

urlpatterns = [
    # List all orders (staff only)
    path('', OrderListAPIView.as_view(), name='order-list'),

    # Create a new order
    path('create/', OrderCreateAPIView.as_view(), name='order-create'),
]
