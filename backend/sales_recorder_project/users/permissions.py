from rest_framework import permissions

class IsAdminUser(permissions.BasePermission):
    """"
    Custom permission to only allow admin users to access certain views.
    """
    def has_permission(self, request, view):
        # Check if the user is authenticated and has the admin role
        return request.user and request.user.is_authenticated and hasattr(request.user, 'profile') and request.user.profile.role == 'admin'
    
class IsSalesperson(permissions.BasePermission):
    """"
    Custom permission to only allow salespersons to access certain views.
    """
    def has_permission(self, request, view):
        # Check if the user is authenticated and has the salesperson role
        return request.user and request.user.is_authenticated and hasattr(request.user, 'profile') and request.user.profile.role == 'salesperson'
    
class IsOwnerOfClient(permissions.BasePermission):
    """"
    Custom permission to only allow the owner of a client to access certain views.
    Admin can access all clients, but salespersons can only access clients assigned to them.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request, so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        # Write permissions are only allowed to the owner of the client or admin users.
        if request.user and request.user.is_authenticated:
            if hasattr(request.user, 'profile') and request.user.profile.role == 'admin':
                return True # Admin can modify any client
            return object.assigned_salesperson and obj.assigned_salesperson.user == request.user
        return False
        # Check if the user is the assigned salesperson for the client
        return obj.assigned_salesperson == request.user.profile