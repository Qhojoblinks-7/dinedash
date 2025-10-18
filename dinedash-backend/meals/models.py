from django.db import models
from django.core.validators import MinValueValidator
from decimal import Decimal


class Meal(models.Model):
    CATEGORY_MAIN_COURSE = 'main_course'
    CATEGORY_DESSERTS = 'desserts'
    CATEGORY_DRINKS = 'drinks'
    CATEGORY_APPETIZERS = 'appetizers'
    CATEGORY_SIDES = 'sides'

    CATEGORY_CHOICES = [
        (CATEGORY_MAIN_COURSE, 'Main Course'),
        (CATEGORY_DESSERTS, 'Desserts'),
        (CATEGORY_DRINKS, 'Drinks'),
        (CATEGORY_APPETIZERS, 'Appetizers'),
        (CATEGORY_SIDES, 'Sides'),
    ]

    category = models.CharField(
        max_length=20,
        choices=CATEGORY_CHOICES,
        default=CATEGORY_MAIN_COURSE,
        db_index=True
    )

    name = models.CharField(max_length=200, unique=True, db_index=True)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    prep_time = models.PositiveSmallIntegerField(help_text="Preparation time in minutes")
    is_available = models.BooleanField(default=True, db_index=True)
    is_veg = models.BooleanField(default=True, db_index=True)
    image = models.ImageField(upload_to='meal_images/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['category']),
            models.Index(fields=['is_available']),
            models.Index(fields=['created_at']),
            models.Index(fields=['is_veg']),
        ]

    def __str__(self):
        return self.name
    
    
    
    