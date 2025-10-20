from django.urls import path
from .views import MockPaymentAPIView, MockVerifyAPIView, PaymentListAPIView, finalize_payment

app_name = "payments" 

urlpatterns = [
    # Capstone Mock Payment Gateway Endpoints
    path('mock-pay/', MockPaymentAPIView.as_view(), name='mock-pay'),
    path('mock-verify/', MockVerifyAPIView.as_view(), name='mock-verify'),

    # Staff/Admin Audit Endpoint
    path('list/', PaymentListAPIView.as_view(), name='payment-list'),

    # Staff Finalize Payment Endpoint
    path('finalize/', finalize_payment, name='finalize-payment'),
]

