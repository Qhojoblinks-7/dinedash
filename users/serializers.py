from rest_framework import serializers
from .models import User

"""
A serializer for the User model
A serializer translates complex data types such as querysets and model instances into native Python datatypes that can then be easily rendered into JSON, XML or other content types. It also provides deserialization, allowing parsed data to be converted back into complex types, after first validating the incoming data.
it converts django models into json
"""
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [id, 'username', 'email', 'role']