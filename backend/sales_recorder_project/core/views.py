from rest_framework import viewsets
from .models import Flavor
from .serializers import FlavorSerializer
from users.permissions import IsAdminUser 
from rest_framework import permissions 

class FlavorViewSet(viewsets.ModelViewSet):
    queryset = Flavor.objects.all().order_by('name')
    serializer_class = FlavorSerializer
    # Admins can create/update/delete. Salespersons can only read active flavors.
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            # All authenticated users can read flavors
            permission_classes = [permissions.IsAuthenticated]
        else:
            # Only admins can create, update, delete flavors
            permission_classes = [permissions.IsAuthenticated, IsAdminUser]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user and self.request.user.is_authenticated and \
           hasattr(self.request.user, 'profile') and self.request.user.profile.role == 'salesperson':
            # Salespersons only see active flavors
            return queryset.filter(is_active=True)
        # Admins see all flavors
        return queryset