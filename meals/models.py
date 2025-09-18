from django.db import models

# Create your models here.

class Meal(models.Model):
    """
    A model representing a meal in the restaurant or to store manu items
    """
    
    name = models.CharField(max_length = 200, unique = True)
    description = models.TextField(blank = True)
    price = models.DecimalField(max_digits = 6, decimal_places = 2)
    prep_time = models.IntegerField(help_text = "Preparation time in minutes")
    is_available = models.BooleanField(default = True)
    image = models.ImageField(upload_to = 'meal_images/', blank = True, null = True)
    
    def __str__(self): 
        # this method returns the string representation of the object
        # it is used in the admin interface and in the shell to display the object so we can easily identify it and differentiate it from other objects
        #the __str_ method returns the name of the meal with which we can easily identify it by the meal name in a string format
        return self.name