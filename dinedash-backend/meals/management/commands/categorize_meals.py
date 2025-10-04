from django.core.management.base import BaseCommand
from meals.models import Meal

class Command(BaseCommand):
    help = 'Categorize existing meals based on their names'

    def handle(self, *args, **options):
        # Keywords for categories
        category_keywords = {
            'main_course': ['pizza', 'pasta', 'burger', 'steak', 'chicken', 'fish', 'rice', 'noodle', 'curry', 'grill'],
            'desserts': ['cake', 'ice cream', 'pie', 'cookie', 'brownie', 'pudding', 'tart', 'mousse', 'sorbet'],
            'drinks': ['soda', 'juice', 'water', 'coffee', 'tea', 'beer', 'wine', 'cocktail', 'smoothie', 'milkshake'],
            'appetizers': ['salad', 'soup', 'fries', 'wings', 'nachos', 'spring roll', 'dumpling', 'bruschetta'],
            'sides': ['bread', 'chips', 'sauce', 'dip', 'pickle', 'onion rings', 'coleslaw']
        }

        updated_count = 0
        for meal in Meal.objects.all():
            meal_name_lower = meal.name.lower()
            categorized = False
            for category, keywords in category_keywords.items():
                if any(keyword in meal_name_lower for keyword in keywords):
                    if meal.category != category:
                        meal.category = category
                        meal.save()
                        self.stdout.write(f"Updated {meal.name} to {category}")
                        updated_count += 1
                    categorized = True
                    break
            if not categorized and meal.category == 'main_course':
                # Keep as main_course if no match and already default
                pass

        self.stdout.write(self.style.SUCCESS(f'Successfully categorized {updated_count} meals'))