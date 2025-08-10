from rest_framework import permissions
from django.db.models import Q # Import Q object for complex lookups

class IsAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow admin users to access.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and hasattr(request.user, 'profile') and request.user.profile.role == 'admin'

class IsSalesperson(permissions.BasePermission):
    """
    Custom permission to only allow salesperson users to access.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and hasattr(request.user, 'profile') and request.user.profile.role == 'salesperson'

class IsOwnerOfClient(permissions.BasePermission):
    """
    Custom permission to only allow salespersons to view/edit their own clients.
    Admins can view/edit all clients.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any authenticated user (salesperson or admin)
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated

        # Write permissions are only allowed to the owner of the client or an admin
        if request.user and request.user.is_authenticated:
            if hasattr(request.user, 'profile') and request.user.profile.role == 'admin':
                return True # Admin can modify any client
            # Salesperson can edit clients assigned to them, or new clients they requested (before approval)
            # Assuming 'obj' is a Client instance
            return (obj.assigned_salesperson and obj.assigned_salesperson.user == request.user) or \
                   (obj.status == 'pending_approval' and request.user.profile.role == 'salesperson' and obj.assigned_salesperson is None)
        return False

class IsOwnerOfOrder(permissions.BasePermission):
    """
    Custom permission to only allow salespersons to view/edit their own orders.
    Admins can view/edit all orders.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any authenticated user (salesperson or admin)
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated

        # Write permissions (PATCH for payment status) are only allowed to the owner of the order or an admin
        if request.user and request.user.is_authenticated:
            if hasattr(request.user, 'profile') and request.user.profile.role == 'admin':
                return True # Admin can modify any order
            # Salesperson can only modify their own orders
            return obj.salesperson and obj.salesperson.user == request.user
        return False

class IsOwnerOfPayment(permissions.BasePermission):
    """
    Custom permission to only allow salespersons to view/edit their own payments.
    Admins can view/edit all payments.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any authenticated user (salesperson or admin)
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated

        # Write permissions are only allowed to the salesperson who recorded the payment or an admin
        if request.user and request.user.is_authenticated:
            if hasattr(request.user, 'profile') and request.user.profile.role == 'admin':
                return True # Admin can modify any payment
            # Salesperson can only modify payments they recorded
            return obj.recorded_by_salesperson and obj.recorded_by_salesperson.user == request.user
        return False