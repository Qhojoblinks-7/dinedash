# Generated manually for data migration to update is_veg field

from django.db import migrations


def update_is_veg(apps, schema_editor):
    Meal = apps.get_model('meals', 'Meal')
    veg_meals = ['Margherita Pizza', 'banku']
    non_veg_meals = ['Caesar Salad', 'Spaghetti Bolognese', 'shawama', 'hdhdb']
    for meal in Meal.objects.all():
        if meal.name in veg_meals:
            meal.is_veg = True
        elif meal.name in non_veg_meals:
            meal.is_veg = False
        # For other meals, leave as is or set default, but since task specifies these, assume others are handled elsewhere
        meal.save()


def reverse_update_is_veg(apps, schema_editor):
    # Reverse operation: set all to default True (since original default was True)
    Meal = apps.get_model('meals', 'Meal')
    Meal.objects.all().update(is_veg=True)


class Migration(migrations.Migration):

    dependencies = [
        ('meals', '0004_meal_category'),
    ]

    operations = [
        migrations.RunPython(update_is_veg, reverse_update_is_veg),
    ]