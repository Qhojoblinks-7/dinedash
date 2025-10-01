from django.urls import path
from .views import MockPaymentAPIView, MockVerifyAPIView, PaymentListAPIView

app_name = "payments" 

urlpatterns = [
    # Capstone Mock Payment Gateway Endpoints
    path('mock-pay/', MockPaymentAPIView.as_view(), name='mock-pay'),
    path('mock-verify/', MockVerifyAPIView.as_view(), name='mock-verify'),
    
    # Staff/Admin Audit Endpoint
    path('list/', PaymentListAPIView.as_view(), name='payment-list'),
]

# REMINDER: You must include this file in your main project's urls.py:
# 