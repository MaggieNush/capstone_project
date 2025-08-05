from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    """
    Custom user model that extends the default Django user model.
    This allows for additional fields and methods specific to the application.
    """
    # Add any additional fields here if needed
    pass

class UserProfile(models.Model):
    """
    User profile for different user types ie Admin, SalesPerson
    """
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('sales_person', 'Sales Person'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='sales_person')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()}"
    
