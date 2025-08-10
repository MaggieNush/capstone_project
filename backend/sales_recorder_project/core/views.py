from django.shortcuts import render
from rest_framework import viewsets
from .models import Flavor
from .serializers import FlavorSerializer
from users.permissions import IsAdminUser # Import custom permission

class FlavorViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows flavors to be viewed or edited by admin.
    """
    queryset = Flavor.objects.all().order_by('name')
    serializer_class = FlavorSerializer
    permission_classes = [IsAdminUser] # Only admin can manage flavors