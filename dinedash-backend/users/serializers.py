from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the custom User model.

    This serializer converts the User model instances into native Python datatypes,
    which can then be rendered into JSON or other content types. It also handles
    deserialization and validation when creating or updating user instances.

    Fields included:
        - id: Primary key of the user
        - username: Username of the user
        - email: User's email address
        - role: Role of the staff member (e.g., waiter, kitchen, admin)
    """
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']
        read_only_fields = ['id']  # Prevents modification of the primary key
