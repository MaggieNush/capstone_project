from django.contrib import admin
from .models import Flavor

@admin.register(Flavor)
class FlavorAdmin(admin.ModelAdmin):
    """
    Admin interface for managing Flavor model.
    """
    list_display = ('name', 'base_price_per_liter', 'is_active', 'created_at',)
    list_filter = ('is_active',)
    search_fields = ('name',)