from rest_framework import viewsets, mixins, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Sum # For future outstanding balance calculation
from django.db.models import Q # For complex queryset filters
from .models import Client
from .serializers import ClientSerializer
from users.permissions import IsAdminUser, IsSalesperson, IsOwnerOfClient 
from users.models import UserProfile 
from rest_framework import permissions 

class ClientViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows clients to be viewed or edited.
    Salespersons can manage their assigned clients and request new ones.
    Admins can manage all clients.
    """
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOfClient] # Apply custom permission

    def get_queryset(self):
        """
        Filter clients based on user role.
        Salespersons only see their assigned clients or clients they requested.
        Admins see all clients.
        """
        user = self.request.user
        if hasattr(user, 'profile'):
            if user.profile.role == 'admin':
                # Admins can filter by status or salesperson_id
                queryset = Client.objects.all()
                status_filter = self.request.query_params.get('status')
                salesperson_id_filter = self.request.query_params.get('salesperson_id')
                is_new_client_filter = self.request.query_params.get('is_new_client')

                if status_filter:
                    queryset = queryset.filter(status=status_filter)
                if salesperson_id_filter:
                    # Filter by UserProfile ID, assuming salesperson_id_filter is UserProfile.id
                    queryset = queryset.filter(assigned_salesperson__id=salesperson_id_filter) 
                if is_new_client_filter is not None:
                    queryset = queryset.filter(is_new_client=(is_new_client_filter.lower() == 'true'))
                
                # Eager load related user and profile data to avoid N+1 queries
                return queryset.select_related('assigned_salesperson__user', 'requested_by_salesperson__user').order_by('name')
            elif user.profile.role == 'salesperson':
                # Salespersons see clients assigned to them OR clients they requested (pending approval)
                return Client.objects.filter(
                    Q(assigned_salesperson=user.profile) |
                    Q(requested_by_salesperson=user.profile, status='pending_approval', is_new_client=True, assigned_salesperson__isnull=True)
                ).select_related('assigned_salesperson__user', 'requested_by_salesperson__user').order_by('name')
        return Client.objects.none() # No profile or invalid role

    def perform_create(self, serializer):
        """
        Set `requested_by_salesperson` automatically for salespersons when creating a client.
        The ClientSerializer has `requested_by_salesperson = UserProfileSerializer(read_only=True)`,
        so it cannot be directly set via `validated_data`. We inject it here.
        """
        user = self.request.user
        if hasattr(user, 'profile') and user.profile.role == 'salesperson':
            # For a salesperson creating a client, inject their UserProfile as the requester
            serializer.save(requested_by_salesperson=user.profile)
        else:
            # For admin, or other roles, save the serializer data as is.
            # `requested_by_salesperson` will be null unless explicitly handled otherwise for admin.
            serializer.save()

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def approve(self, request, pk=None):
        """
        Admin action to approve a pending client request.
        Can optionally assign to a specific salesperson.
        """
        client = self.get_object()
        if client.status != 'pending_approval':
            return Response({"detail": "Client is not pending approval."}, status=status.HTTP_400_BAD_REQUEST)

        assign_to_salesperson_id = request.data.get('assign_to_salesperson_id')
        assigned_salesperson_profile = None # Changed variable name to avoid confusion with model field
        if assign_to_salesperson_id:
            try:
                # Ensure the ID corresponds to an actual salesperson profile
                # Assuming `assign_to_salesperson_id` is UserProfile ID
                assigned_salesperson_profile = UserProfile.objects.get(id=assign_to_salesperson_id, role='salesperson')
            except UserProfile.DoesNotExist:
                return Response({"detail": "Assigned salesperson not found or is not a salesperson."}, status=status.HTTP_400_BAD_REQUEST)

        client.status = 'approved'
        client.is_new_client = False # Once approved, it's no longer a 'new request' pending approval
        client.assigned_salesperson = assigned_salesperson_profile # Assign the selected salesperson (can be None)
        client.save()
        serializer = self.get_serializer(client)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], permission_classes=[IsAdminUser])
    def reject(self, request, pk=None):
        """
        Admin action to reject a pending client request.
        """
        client = self.get_object()
        if client.status != 'pending_approval':
            return Response({"detail": "Client is not pending approval."}, status=status.HTTP_400_BAD_REQUEST)

        client.status = 'rejected'
        client.is_new_client = False # No longer considered a new client request
        client.assigned_salesperson = None # Clear any potential assignment
        client.save()
        serializer = self.get_serializer(client)
        return Response(serializer.data)
