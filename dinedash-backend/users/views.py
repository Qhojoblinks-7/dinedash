from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .models import User
from rest_framework import generics
from .serializers import UserSerializer

"""
Api endpoint to list all users
Staff users will use this to view all users
"""

class StaffListView(generics.ListAPIView):
    queryset = User.objects.filter(is_staff = True)
    serializer_class = UserSerializer   