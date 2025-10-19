from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    """
    Handles converting user data between the database and API responses.

    This takes user information from our database and turns it into a format that can be
    sent over the internet as JSON. It also validates and processes data when creating
    or updating user accounts.

    Includes these user details:
        - id: Unique identifier for each user
        - username: The user's login name
        - email: User's email address for notifications
        - role: What job they do (like waiter, kitchen staff, or admin)
    """
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']
        read_only_fields = ['id']  # The ID can't be changed once created
