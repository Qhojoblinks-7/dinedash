from django.urls import path
from .views import FlutterwaveVerifyAPIView,FlutterwaveVerifyAPIView

urlpatterns = [
    # Endpoint to initiate payment
    path('pay/', FlutterwaveVerifyAPIView.as_view(), name='flutterwave-pay'),
    
    #Endpoint to verify payment
    path('verify/', FlutterwaveVerifyAPIView.as_view(), name='flutterwave-verify'),
]