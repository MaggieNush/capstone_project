from django.contrib import admin
from .models import User, UserProfile
from django.contrib.auth.admin import UserAdmin

"""Enables managing data from the admin interface"""
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'is_staff', 'is_active')

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'created_at')
    list_filter = ('role',)
    search_fields = ('user__username', 'user__email')

    