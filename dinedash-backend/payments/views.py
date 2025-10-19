import uuid
from django.db import transaction
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.decorators import api_view, permission_classes

from orders.models import Order 
from .models import Payment
from .serializers import PaymentCreateSerializer, PaymentSerializer 

# --- STAFF/ADMIN VIEWS ---

class PaymentListAPIView(generics.ListAPIView):
    """
    API endpoint that lets staff and admins see all payment records for review and auditing purposes.
    """
    queryset = Payment.objects.all().select_related('order').order_by('-created_at')
    serializer_class = PaymentSerializer 
    permission_classes = [IsAdminUser] 


# --- MOCK PAYMENT GATEWAY (Capstone Simulation) ---

class MockPaymentAPIView(generics.GenericAPIView):
    """
    Simulates how a real payment gateway would work for testing purposes.
    1. Checks that the order and payment amount are valid.
    2. Creates a payment record that's waiting to be processed.
    3. Provides a link to complete the payment verification.
    """
    permission_classes = [AllowAny]
    serializer_class = PaymentCreateSerializer 

    def post(self, request, *args, **kwargs):
        # 1. Validate data
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated_data = serializer.validated_data
        
        order = validated_data['order']
        amount = validated_data['amount']
        method = validated_data['payment_method']
        
        # Security check: Make sure we don't try to pay for an order that's already been handled
        if order.status != Order.STATUS_PENDING:
             return Response({"error": "Order is not in a pending state and cannot initiate payment."},
                             status=status.HTTP_400_BAD_REQUEST)
        
        # 2. Create a payment record that's waiting to be completed
        with transaction.atomic():
            tx_ref = f"MOCK-{order.id}-{uuid.uuid4().hex[:6]}"

            payment = Payment.objects.create(
                order=order,
                amount=amount,
                method=method,
                status=Payment.STATUS_PENDING,
                transaction_ref=tx_ref
            )

        # 3. Provide a link that simulates where the customer would go to complete payment
        # We include the order ID to make sure everything connects properly
        mock_redirect_url = f"/api/payments/mock-verify/?tx_ref={tx_ref}&order_id={order.id}&status=successful"
        
        return Response({
            "status": "success",
            "message": "Mock payment initiated. Redirecting for verification.",
            "payment_link": mock_redirect_url, 
            "tx_ref": tx_ref
        }, status=status.HTTP_200_OK)


class MockVerifyAPIView(generics.GenericAPIView):
    """
    Simulates what happens when a payment gateway confirms a successful payment.
    1. Finds the payment that's waiting to be verified.
    2. Marks the payment as completed.
    3. Updates the order status to show it's now being prepared.
    """
    permission_classes = [AllowAny] 

    def get(self, request, *args, **kwargs):
        tx_ref = request.query_params.get('tx_ref')
        mock_status = request.query_params.get('status')
        order_id = request.query_params.get('order_id') # Use this for better lookup

        if not tx_ref or not mock_status:
            return Response({"error": "Missing transaction reference or status."}, 
                            status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                # 1. Find the payment record using both the transaction reference and order ID
                payment = Payment.objects.select_related('order').get(
                    transaction_ref=tx_ref,
                    order_id=order_id # Using both ensures we get the right payment
                )
                order = payment.order

                # Make sure we don't process the same payment twice
                if payment.status == Payment.STATUS_COMPLETED:
                     return Response({
                         "message": "Payment already verified successfully.",
                         "order_id": order.id
                     }, status=status.HTTP_200_OK)

                # 2. Handle successful payment scenario
                if mock_status.lower() == "successful":

                    # Mark the payment as completed
                    payment.status = Payment.STATUS_COMPLETED
                    payment.transaction_id = f"MOCK-SUCCESS-{tx_ref}"
                    payment.save()

                    # Update the order to show it's now being prepared
                    order.status = Order.STATUS_IN_PROGRESS # Use the constant you defined
                    order.save()

                    return Response({
                        "message": "Mock Payment successful and verified.",
                        "order": PaymentSerializer(payment).data # Return payment details
                    }, status=status.HTTP_200_OK)

                # 3. Handle failed payment scenario
                else:
                    payment.status = Payment.STATUS_FAILED
                    payment.save()

                    # The order stays pending when payment fails, so customer can try again
                    return Response({
                        "error": "Mock verification failed.",
                        "tx_ref": tx_ref
                    }, status=status.HTTP_400_BAD_REQUEST)

        except Payment.DoesNotExist:
            return Response({"error": f"Mock payment record for reference '{tx_ref}' not found."}, 
                            status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": f"An unexpected error occurred during verification: {e}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAdminUser])
def finalize_payment(request):
    """
    API endpoint that allows staff and admins to mark an order's payment as completed.
    This creates the payment record and updates the order status accordingly.
    """
    order_id = request.data.get('order_id')
    payment_method = request.data.get('payment_method')
    amount = request.data.get('amount')

    if not all([order_id, payment_method, amount]):
        return Response({"error": "order_id, payment_method, and amount are required."},
                        status=status.HTTP_400_BAD_REQUEST)

    try:
        with transaction.atomic():
            order = Order.objects.get(id=order_id)

            # Make sure the order has been sent to the kitchen first
            if order.status != 'sentToKitchen':
                return Response({"error": "Order must be sent to kitchen before payment can be finalized."},
                                status=status.HTTP_400_BAD_REQUEST)

            # Double-check that payment hasn't already been completed
            if Payment.objects.filter(order=order, status=Payment.STATUS_COMPLETED).exists():
                return Response({"error": "Payment already finalized for this order."},
                                status=status.HTTP_400_BAD_REQUEST)

            # Create a payment record showing the transaction is done
            tx_ref = f"STAFF-{order.id}-{uuid.uuid4().hex[:6]}"
            payment = Payment.objects.create(
                order=order,
                amount=amount,
                method=payment_method,
                status=Payment.STATUS_COMPLETED,
                transaction_ref=tx_ref,
                transaction_id=f"STAFF-COMPLETE-{tx_ref}"
            )

            # Mark the order as fully completed
            order.status = 'completed'
            order.save()

            return Response({
                "message": "Payment finalized successfully.",
                "payment": PaymentSerializer(payment).data
            }, status=status.HTTP_200_OK)

    except Order.DoesNotExist:
        return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"error": f"An unexpected error occurred: {e}"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)
