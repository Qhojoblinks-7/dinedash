#!/usr/bin/env python
"""
DineDash Maintenance Script
Run regular maintenance tasks for the application
"""

import os
import sys
import django
from datetime import datetime, timedelta

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'dinedash.settings')
django.setup()

from django.core.management import execute_from_command_line
from django.db import connection
from meals.models import Meal
from orders.models import Order
from payments.models import Payment
import logging

logger = logging.getLogger(__name__)

def run_maintenance():
    """Run all maintenance tasks"""
    print("Starting DineDash maintenance tasks...")

    # 1. Database cleanup
    cleanup_old_data()

    # 2. Update meal availability
    update_meal_availability()

    # 3. Process pending payments
    process_pending_payments()

    # 4. Generate maintenance report
    generate_report()

    print("Maintenance tasks completed successfully!")

def cleanup_old_data():
    """Clean up old data to maintain database performance"""
    print("Cleaning up old data...")

    # Delete orders older than 2 years
    two_years_ago = datetime.now() - timedelta(days=730)
    old_orders = Order.objects.filter(created_at__lt=two_years_ago)
    old_count = old_orders.count()
    old_orders.delete()
    print(f"Deleted {old_count} orders older than 2 years")

    # Delete completed payments older than 1 year
    one_year_ago = datetime.now() - timedelta(days=365)
    old_payments = Payment.objects.filter(
        created_at__lt=one_year_ago,
        status='completed'
    )
    payment_count = old_payments.count()
    old_payments.delete()
    print(f"Deleted {payment_count} completed payments older than 1 year")

def update_meal_availability():
    """Update meal availability based on inventory or time"""
    print("Updating meal availability...")

    # Example: Mark meals as unavailable if they're seasonal
    # This would need to be customized based on your business logic
    seasonal_meals = Meal.objects.filter(
        category__icontains='seasonal',
        is_available=True
    )

    # For now, just log the count
    print(f"Found {seasonal_meals.count()} seasonal meals to review")

def process_pending_payments():
    """Process any pending payments that may have timed out"""
    print("Processing pending payments...")

    # Find payments that have been pending for more than 24 hours
    yesterday = datetime.now() - timedelta(hours=24)
    pending_payments = Payment.objects.filter(
        status='pending',
        created_at__lt=yesterday
    )

    for payment in pending_payments:
        # Mark as failed or attempt to reprocess
        payment.status = 'failed'
        payment.save()
        print(f"Marked payment {payment.id} as failed due to timeout")

def generate_report():
    """Generate a maintenance report"""
    print("Generating maintenance report...")

    report = {
        'timestamp': datetime.now(),
        'total_meals': Meal.objects.count(),
        'total_orders': Order.objects.count(),
        'total_payments': Payment.objects.count(),
        'pending_orders': Order.objects.filter(status='pending').count(),
        'completed_orders': Order.objects.filter(status='completed').count(),
    }

    # Log report
    logger.info(f"Maintenance Report: {report}")

    # Print summary
    print("Maintenance Report:")
    for key, value in report.items():
        print(f"  {key}: {value}")

if __name__ == '__main__':
    try:
        run_maintenance()
    except Exception as e:
        logger.error(f"Maintenance failed: {e}")
        sys.exit(1)