from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.

class User(AbstractUser):
    """
    A custom user model for staff authentication
    The the username, email and password fields are inherited from AbstractUser
    """
    
    STAFF_ROLES = [
        ('waiter', 'Waiter'),
        ('kitchen', 'Kitchen Staff'),
        ('admin', 'Administrator')
    ]
    
    #the role field to define a staff member's role
    role = models.CharField(max_length=100, choices=STAFF_ROLES)