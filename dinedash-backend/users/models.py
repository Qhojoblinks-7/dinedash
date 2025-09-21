from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    """
    Custom user model for staff authentication.
    
    Inherits:
        - username
        - email
        - password
        - first_name, last_name, is_staff, is_active, date_joined
      from Django's AbstractUser.
    
    Additional fields:
        - role: defines the staff member's role in the restaurant.
    """

    STAFF_ROLES = [
        ('waiter', 'Waiter'),
        ('kitchen', 'Kitchen Staff'),
        ('admin', 'Administrator'),
    ]

    role = models.CharField(
        max_length=50, 
        choices=STAFF_ROLES, 
        verbose_name='Staff Role',
        help_text='Select the role for the staff member'
    )

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
