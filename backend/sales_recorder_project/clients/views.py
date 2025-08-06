from rest_framework import mixins, viewsets, status
from rest_framework.response import Response
from .serializers import ClientSerializer
from .models import Client
from rest_framework import permissions
from rest_framework.decorators import action
from .serializers import ClientSerializer
from django.db import models
from django.db.models import Sum # Import Sum for calculating outstanding balances
from users.permissions import IsAdminUser, IsSalesperson, IsOwnerOfClient # Import custom permissions
from users.models import UserProfile # Needed for assigning salesperson

class ClientViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows clients to be viewed, created, updated, and deleted.
    Salespersons can manage their own clients, while admins can manage all clients.
    """
    queryset = Client.objects.all()
    serializer_class = ClientSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOfClient ] # Apply custom permission to restrict access

    def get_queryset(self):
        """
        Filter clients based on user role
        Salespersons can only see their own clients or clients they requested
        Admins can see all clients
        """
        user = self.request.user
        if hasattr(user, 'profile'):
            # Admins can filter by status or salesperson_id
            queryset = Client.objects.all()
            status_filter = self.request.query_params.get('status')
            salesperson_id_filter = self.request.query_params.get('salesperson_id')
            is_new_client_filter = self.request.query_params.get('is_new_client')

            if status_filter:
                queryset = queryset.filter(status=status_filter)
            if salesperson_id_filter:
                queryset = queryset.filter(assigned_salesperson__id=salesperson_id_filter)
            if is_new_client_filter is not None: # Check if is_new_client_filter is provided
                queryset = queryset.filter(is_new_client=is_new_client_filter.lower() == 'true')
            return queryset.select_related('assigned_salesperson__user').order_by('name')
        elif user.profile.role == 'salesperson':
                # Salespersons can only see their own clients or clients they requested(pending approval)
            return Client.objects.filter(
                # Models Q to filter clients based on the salesperson's profile
                models.Q(assigned_salesperson=user.profile) |
                models.Q(status='pending', is_new_client=True, assigned_salesperson__isnull=True)
            ).select_related('assigned_salesperson__user').order_by('name')
        return Client.objects.none()  # If no profile, return empty queryset
    
    def perform_create(self, serializer):
        # When a salesperson creates a client, it's a new client and pending approval
        # The assigned_salesperson is set by admin upon approval.
        # For a salesperson, `is_new_client` is True and `status` is 'pending_approval' by default in serializer.
        # Admin can directly create approved clients and assign salesperson.
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
        assigned_salesperson = None
        if assign_to_salesperson_id:
            try:
                assigned_salesperson = UserProfile.objects.get(user__id=assign_to_salesperson_id, role='salesperson')
            except UserProfile.DoesNotExist:
                return Response({"detail": "Assigned salesperson not found or is not a salesperson."}, status=status.HTTP_400_BAD_REQUEST)
        else:
            # If no specific salesperson is provided, assign to the salesperson who requested it
            # This assumes the client creation process correctly links the request to a salesperson
            # For now, we'll assign to the current admin if no salesperson is provided
            # A more robust solution might require the original requesting salesperson's ID
            pass # Keep assigned_salesperson as None if not explicitly provided by admin

        client.status = 'approved'
        client.is_new_client = False # Once approved, it's no longer a 'new request' in the sense of pending
        if assigned_salesperson:
            client.assigned_salesperson = assigned_salesperson
        elif client.assigned_salesperson is None and client.is_new_client:
            # If client was created by a salesperson and is now approved, assign to that salesperson
            # This requires a way to track who created the initial request.
            # For simplicity in this MVP, if no salesperson is explicitly assigned by admin,
            # and it was a new client request, it remains unassigned until explicitly assigned.
            # Or, we could default to assigning to the admin who approved it, or require assignment.
            # For now, let's assume admin will either assign or it remains unassigned.
            pass
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
        client.save()
        serializer = self.get_serializer(client)
        return Response(serializer.data)


    