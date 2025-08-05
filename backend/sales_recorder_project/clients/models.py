from django.db import models
from users.models import UserProfile # Import UserProfile model from users app

class Client(models.Model):
    """"
    Represents different clients of the company.
    """
    CLIENT_TYPE_CHOICES = [
        ('retail', 'Retail'),
        ('wholesale', 'Wholesale'),
    ]

    CLIENT_STATUS_CHOICES = [
        ('approved', 'Approved'),
        ('pending', 'Pending'),
        ('rejected', 'Rejected'),
    ]

    name = models.CharField(max_length=255, blank=True, null=True)
    contact_person = models.CharField(max_length=255, null=True, blank=True)
    phone_number = models.CharField(max_length=15, null=True, blank=True)
    email = models.EmailField(max_length=255, unique=True, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    client_type = models.CharField(max_length=20, choices=CLIENT_TYPE_CHOICES, default='retail')
    is_new_client = models.BooleanField(default=True)
    assigned_salesperson = models.ForeignKey(
        UserProfile,
        on_delete = models.SET_NULL, # If salesperson is deleted the client stays unassigned
        related_name = 'clients',
        limit_choices_to= {'role': 'salesperson'}, # Only allow salespersons to be assigned
        null=True, # can be null if no salesperson is assigned
        blank=True
    )

    status = models.CharField(
        max_length=20, 
        choices=CLIENT_STATUS_CHOICES,
        default='pending' # new clients start with pending status
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name 


