from rest_framework import generics
from .models import User
from .serializers import UserSerializer

"""
Api endpoint to list all users
Staff users will use this to view all users
"""

class UserListAPIView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer   