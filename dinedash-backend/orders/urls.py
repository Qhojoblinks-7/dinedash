from django.urls import path
from .views import OrderCreateAPIView, OrderListAPIView

urlpatterns = [
    path('', OrderListAPIView.as_view(), name='order-list'),
    path('create/', OrderCreateAPIView.as_view(), name='order-create'),
]