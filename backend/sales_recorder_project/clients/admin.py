from django.contrib import admin
from .models import Client

@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    """
    Admin interface for managing Client model.
    """
    list_display = ('name', 'client_type', 'assigned_salesperson', 'status', 'is_new_client', 'created_at',)
    search_fields = ('name', 'contact_person', 'email', 'phone_number')
    list_filter = ('client_type', 'status', 'is_new_client', 'assigned_salesperson__user__username')
    raw_id_fields = ('assigned_salesperson',) # Useful for large number of salespersons