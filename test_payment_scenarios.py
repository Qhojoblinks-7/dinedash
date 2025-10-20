#!/usr/bin/env python3
"""
Payment Testing Scenarios for DineDash

This script demonstrates how to test different payment outcomes
by using specific transaction references in the payment data.

Usage:
1. Run the Django server: python manage.py runserver
2. Use the client app to place orders with specific transaction refs
3. Or use this script to test directly

Payment Test Scenarios:
- SUCCESS: Any transaction_ref (default behavior)
- PENDING: Include "pending" in transaction_ref
- FAILED: Include "fail" in transaction_ref

Example transaction_refs:
- "TEST_SUCCESS_123" → Payment completed
- "TEST_PENDING_456" → Payment pending
- "TEST_FAIL_789" → Payment failed
"""

import requests
import json

BASE_URL = 'http://localhost:8000/api'

def test_payment_scenario(scenario_name, transaction_ref, expected_status):
    """Test a specific payment scenario"""
    print(f"\n[*] Testing {scenario_name}...")

    # Sample order data
    order_data = {
        "customer_name": "Test Customer",
        "customer_email": "test@example.com",
        "order_type": "dine in",
        "table_number": "T1",
        "contact_phone": "+1234567890",
        "delivery_address": "",
        "items": [
            {
                "meal_id": 1,  # Assuming meal ID 1 exists
                "quantity": 2,
                "special_instructions": f"Test order for {scenario_name}"
            }
        ]
    }

    # Payment data with test transaction reference
    payment_data = {
        "method": "card",
        "provider": "",
        "phone": "",
        "bank_details": "",
        "transaction_ref": transaction_ref,
        "payment_token": f"test_token_{transaction_ref}"
    }

    # Make checkout request
    checkout_payload = {
        "order": order_data,
        "payment": payment_data
    }

    try:
        response = requests.post(f"{BASE_URL}/orders/checkout/", json=checkout_payload)
        print(f"Status Code: {response.status_code}")

        if response.status_code == 201:
            data = response.json()
            payment_status = data['payment']['status']
            transaction_id = data['payment'].get('transaction_id', 'N/A')

            print(f"[+] Order created successfully!")
            print(f"Order ID: {data['order']['id']}")
            print(f"Payment Status: {payment_status}")
            print(f"Transaction ID: {transaction_id}")

            if payment_status == expected_status:
                print(f"[+] Expected status '{expected_status}' - TEST PASSED")
            else:
                print(f"[-] Expected '{expected_status}' but got '{payment_status}' - TEST FAILED")
        else:
            print(f"[-] Request failed: {response.text}")

    except requests.exceptions.RequestException as e:
        print(f"[-] Network error: {e}")

def main():
    """Run all payment test scenarios"""
    print("DineDash Payment Testing Scenarios")
    print("=" * 50)

    # Test scenarios
    scenarios = [
        ("SUCCESS Payment", "TEST_SUCCESS_001", "completed"),
        ("PENDING Payment", "TEST_PENDING_002", "pending"),
        ("FAILED Payment", "TEST_FAIL_003", "failed"),
    ]

    for scenario_name, transaction_ref, expected_status in scenarios:
        test_payment_scenario(scenario_name, transaction_ref, expected_status)

    print("\n" + "=" * 50)
    print("Testing Instructions:")
    print("1. Run: python manage.py runserver")
    print("2. Use client app at http://localhost:5176")
    print("3. Place orders with transaction refs above")
    print("4. Check dashboard at http://localhost:5175 for real-time updates")
    print("5. Orders should appear automatically within 30 seconds")

if __name__ == "__main__":
    main()