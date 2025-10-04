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
    API endpoint for staff/admin to view a list of all payment records for auditing.
    """
    queryset = Payment.objects.all().select_related('order').order_by('-created_at')
    serializer_class = PaymentSerializer 
    permission_classes = [IsAdminUser] 


# --- MOCK PAYMENT GATEWAY (Capstone Simulation) ---

class MockPaymentAPIView(generics.GenericAPIView):
    """
    Simulates the initiation of an external payment gateway.
    1. Validates order and amount.
    2. Creates a PENDING Payment record.
    3. Returns a redirect URL to the local MockVerifyAPIView.
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
        
        # Security check: Prevent re-initiating a successful payment
        if order.status != Order.STATUS_PENDING:
             return Response({"error": "Order is not in a pending state and cannot initiate payment."}, 
                             status=status.HTTP_400_BAD_REQUEST)
        
        # 2. Create PENDING Payment Record
        with transaction.atomic():
            tx_ref = f"MOCK-{order.id}-{uuid.uuid4().hex[:6]}" 
            
            payment = Payment.objects.create(
                order=order,
                amount=amount,
                method=method, 
                status=Payment.STATUS_PENDING,
                transaction_ref=tx_ref
            )

        # 3. Return a local URL that simulates the gateway redirect
        # We include order_id in the redirect for robustness
        mock_redirect_url = f"/api/payments/mock-verify/?tx_ref={tx_ref}&order_id={order.id}&status=successful"
        
        return Response({
            "status": "success",
            "message": "Mock payment initiated. Redirecting for verification.",
            "payment_link": mock_redirect_url, 
            "tx_ref": tx_ref
        }, status=status.HTTP_200_OK)


class MockVerifyAPIView(generics.GenericAPIView):
    """
    Simulates the verification process after a successful gateway payment.
    1. Locates the PENDING payment.
    2. Marks payment as COMPLETED.
    3. Updates order status to IN_PROGRESS.
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
                # 1. Locate Payment Record (Using tx_ref and order_id)
                payment = Payment.objects.select_related('order').get(
                    transaction_ref=tx_ref,
                    order_id=order_id # Better lookup ensures correctness
                ) 
                order = payment.order
                
                # Check for idempotency (prevent double processing)
                if payment.status == Payment.STATUS_COMPLETED:
                     return Response({
                         "message": "Payment already verified successfully.",
                         "order_id": order.id
                     }, status=status.HTTP_200_OK)

                # 2. Simulate Success Logic
                if mock_status.lower() == "successful":
                    
                    # Update Payment Status
                    payment.status = Payment.STATUS_COMPLETED
                    payment.transaction_id = f"MOCK-SUCCESS-{tx_ref}"
                    payment.save()

                    # Update Order Status
                    order.status = Order.STATUS_IN_PROGRESS # Use the constant you defined
                    order.save()

                    return Response({
                        "message": "Mock Payment successful and verified.",
                        "order": PaymentSerializer(payment).data # Return payment details
                    }, status=status.HTTP_200_OK)

                # 3. Simulate Failure Logic
                else:
                    payment.status = Payment.STATUS_FAILED 
                    payment.save()
                    
                    # Note: Order status remains PENDING/unchanged on payment failure
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
    API endpoint for staff/admin to finalize payment for an order.
    Creates a completed payment record and updates order status.
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

            # Check if order is in sentToKitchen status
            if order.status != 'sentToKitchen':
                return Response({"error": "Order must be sent to kitchen before payment can be finalized."},
                                status=status.HTTP_400_BAD_REQUEST)

            # Check if payment already exists
            if Payment.objects.filter(order=order, status=Payment.STATUS_COMPLETED).exists():
                return Response({"error": "Payment already finalized for this order."},
                                status=status.HTTP_400_BAD_REQUEST)

            # Create completed payment record
            tx_ref = f"STAFF-{order.id}-{uuid.uuid4().hex[:6]}"
            payment = Payment.objects.create(
                order=order,
                amount=amount,
                method=payment_method,
                status=Payment.STATUS_COMPLETED,
                transaction_ref=tx_ref,
                transaction_id=f"STAFF-COMPLETE-{tx_ref}"
            )

            # Update order status to completed
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
