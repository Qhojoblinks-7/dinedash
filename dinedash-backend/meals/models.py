from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone



class Meal(models.Model):
    """
    A model representing a meal in the restaurant or to store menu items
    """
    
    name = models.CharField(max_length = 200, unique = True, db_index = True) 
    
    
    
    description = models.TextField(blank = True, null = True) # A null arg to distinguish between an "Empty string" and a NULL value
    
    
    
    price = models.DecimalField(
        max_digits = 8, 
        decimal_places = 2,
        validators = [MinValueValidator(0.0)]
    ) # max_digits is the total number of digits, decimal_places is the number of digits after the decimal point
    
    
    
    prep_time = models.PositiveSmallIntegerField(
        help_text = "Estimated Preparation time in minutes"
        ) # PositiveSmallIntegerField is used to store small positive integers (0 to 32767). This restricts negative values and is suitable for fields like preparation time.
    
    
    
    is_available = models.BooleanField(
        default = True,
        help_text = "Is the meal available for order?",
        db_index = True
        ) # db_index=True creates a database index on this field to optimize queries filtering by availability
    is_veg = models.BooleanField(
        default = True,
        help_text = "Is the meal vegetarian?",
        db_index = True
        ) # db_index=True creates a database index on this field to optimize queries filtering by dietary preference

    
    
    
    image = models.ImageField(upload_to = 'meal_images/', blank = True, null = True)
    
    created_at = models.DateTimeField(auto_now_add = True,)
    updated_at = models.DateTimeField(auto_now = True)
    
    
    class Meta:
        verbose_name = "Meal"
        verbose_name_plural = "Meals"
        ordering = ['name'] # default ordering for querysets, here it orders by name alphabetically
    
    def __str__(self): 
        # this method returns the string representation of the object
        # it is used in the admin interface and in the shell to display the object so we can easily identify it and differentiate it from other objects
        #the __str_ method returns the name of the meal with which we can easily identify it by the meal name in a string format
        return self.name
    
    
    
    