from django.core.management.base import BaseCommand
from orders.models import OrderItem, Order
import random

class Command(BaseCommand):
    help = 'Fix OrderItem item_name and unit_price fields based on related Meal and fix Orders with temporary tracking_code'

    def generate_human_readable_code(self, length=8):
        # Generate a memorable, human-readable code (e.g., alternating consonants and vowels)
        consonants = "BCDFGHJKLMNPQRSTVWXYZ"
        vowels = "AEIOU"
        code = ""
        for i in range(length):
            if i % 2 == 0:
                code += random.choice(consonants)
            else:
                code += random.choice(vowels)
        return code

    def handle(self, *args, **options):
        order_items = OrderItem.objects.all()
        updated_count = 0
        for item in order_items:
            if item.meal:
                if item.item_name == 'Unknown Item' or item.unit_price == 0:
                    item.item_name = item.meal.name
                    item.unit_price = item.meal.price
                    item.save()
                    updated_count += 1
        self.stdout.write(self.style.SUCCESS(f'Updated {updated_count} OrderItem records'))

        temp_orders = Order.objects.filter(tracking_code__startswith='temp')
        fixed_count = 0
        for order in temp_orders:
            order.tracking_code = self.generate_human_readable_code()
            order.save()
            fixed_count += 1
        self.stdout.write(self.style.SUCCESS(f'Fixed {fixed_count} Orders with temporary tracking_code'))
