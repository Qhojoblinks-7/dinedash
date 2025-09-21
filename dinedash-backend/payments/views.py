import requests
from django.conf import settings
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Payment
from orders.models import Order


class FlutterwavePaymentAPIView(generics.GenericAPIView):
    """
    Initiates a Flutterwave payment for an order.
    Creates a Payment record and returns the Flutterwave payment link.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        order_id = request.data.get('order_id')
        payment_method = request.data.get('payment_method')

        # Validate order
        try:
            order = Order.objects.get(id=order_id)
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

        if order.status == 'completed':
            return Response({"error": "Order is already paid."}, status=status.HTTP_400_BAD_REQUEST)

        # Create Payment record
        payment = Payment.objects.create(
            order=order,
            amount=order.total_amount,
            method=payment_method,
            status=Payment.STATUS_PENDING
        )

        # Flutterwave payload
        flutterwave_payload = {
            "tx_ref": f"order_{order.id}_payment_{payment.id}",
            "amount": str(payment.amount),
            "currency": "GHS",  # Ghana Cedis
            "redirect_url": settings.FLUTTERWAVE_REDIRECT_URL,
            "payment_options": payment.method,
            "customer": {
                "email": order.customer_email or "guest@example.com",
                "name": order.customer_name or f"Customer {order.customer_identifier}"
            },
            "customizations": {
                "title": "DineDash Payment",
                "description": f"Payment for Order {order.id}",
                "logo": settings.FLUTTERWAVE_LOGO_URL
            }
        }

        headers = {
            "Authorization": f"Bearer {settings.FLUTTERWAVE_SECRET_KEY}",
            "Content-Type": "application/json"
        }

        # Call Flutterwave API
        response = requests.post(
            "https://api.flutterwave.com/v3/payments",
            json=flutterwave_payload,
            headers=headers
        )

        if response.status_code != 200:
            return Response({"error": "Failed to initiate payment with Flutterwave."},
                            status=status.HTTP_502_BAD_GATEWAY)

        data = response.json()
        if data.get("status") != "success":
            return Response({"error": "Flutterwave payment initiation failed."}, status=status.HTTP_400_BAD_REQUEST)

        # Save tx_ref for verification
        payment.transaction_id = flutterwave_payload["tx_ref"]
        payment.save()

        return Response({
            "payment_link": data['data']['link'],
            "payment_id": payment.id,
            "order_id": order.id
        }, status=status.HTTP_200_OK)


class FlutterwaveVerifyAPIView(generics.GenericAPIView):
    """
    Verifies a Flutterwave payment after redirect/callback.
    Updates Payment and Order status.
    """
    permission_classes = []  # allow Flutterwave to call this endpoint

    def get(self, request, *args, **kwargs):
        transaction_id = request.query_params.get('transaction_id')  # Flutterwave's transaction ID
        tx_ref = request.query_params.get('tx_ref')  # our unique reference

        if not transaction_id or not tx_ref:
            return Response({"error": "transaction_id and tx_ref are required."},
                            status=status.HTTP_400_BAD_REQUEST)

        headers = {
            "Authorization": f"Bearer {settings.FLUTTERWAVE_SECRET_KEY}"
        }

        # Verify with Flutterwave
        response = requests.get(
            f"https://api.flutterwave.com/v3/transactions/{transaction_id}/verify",
            headers=headers
        )

        if response.status_code != 200:
            return Response({"error": "Failed to verify payment with Flutterwave."},
                            status=status.HTTP_502_BAD_GATEWAY)

        data = response.json()
        status_str = data.get("data", {}).get("status")

        # Get our payment using tx_ref
        try:
            payment = Payment.objects.get(transaction_id=tx_ref)
        except Payment.DoesNotExist:
            return Response({"error": "Payment not found."}, status=status.HTTP_404_NOT_FOUND)

        if status_str == "successful":
            payment.status = Payment.STATUS_COMPLETED
            payment.save()

            order = payment.order
            order.status = 'completed'
            order.save()

            return Response({
                "message": "Payment verified successfully.",
                "order_id": order.id
            }, status=status.HTTP_200_OK)

        else:
            payment.status = Payment.STATUS_FAILED
            payment.save()
            return Response({"error": "Payment verification failed or pending."},
                            status=status.HTTP_400_BAD_REQUEST)
