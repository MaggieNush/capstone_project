from rest_framework import serializers
from .models import Client
from users.serializers import UserProfileSerializer 
from users.models import UserProfile 


class ClientSerializer(serializers.ModelSerializer):
    """
    Serializer for the Client model.
    Includes nested salesperson data and calculated outstanding balance.
    """
    # Read-only nested serializer for the assigned salesperson's profile
    assigned_salesperson = UserProfileSerializer(read_only=True)
    # Write-only field for assigning salesperson by ID during creation/update (Admin use)
    assigned_salesperson_id = serializers.PrimaryKeyRelatedField(
        queryset=UserProfile.objects.filter(role='salesperson'),
        source='assigned_salesperson',
        write_only=True,
        required=False,
        allow_null=True
    )
    # Read-only nested serializer for the salesperson who requested the client
    # This will be set by the ViewSet's perform_create method for salespersons
    requested_by_salesperson = UserProfileSerializer(read_only=True) 

    # Outstanding balance is read-only and calculated (or placeholder for now)
    outstanding_balance = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Client
        fields = [
            'id', 'name', 'contact_person', 'phone_number', 'email', 'address',
            'client_type', 'is_new_client', 'assigned_salesperson',
            'assigned_salesperson_id', 'status', 'outstanding_balance',
            'requested_by_salesperson', # Include for read output
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'outstanding_balance', 'created_at', 'updated_at',
            'is_new_client', 
            'status', 
            'requested_by_salesperson' # Set by viewset, read-only for incoming serializer data
        ]

    def to_representation(self, instance):
        """
        Add outstanding_balance to the representation.
        This is a simplified calculation; a more robust solution would involve
        aggregating payments and orders.
        """
        representation = super().to_representation(instance)
        # Placeholder for outstanding balance calculation.
        representation['outstanding_balance'] = '0.00'
        return representation

    def create(self, validated_data):
        request = self.context.get('request')
        user_profile = request.user.profile

        # Logic for setting default status and is_new_client based on user role
        if user_profile.role == 'salesperson':
            validated_data['is_new_client'] = True
            validated_data['status'] = 'pending_approval'
            validated_data['assigned_salesperson'] = None # Not assigned until admin approves
            # 'requested_by_salesperson' will be set in the ViewSet's perform_create
        elif user_profile.role == 'admin':
            validated_data['is_new_client'] = False
            validated_data['status'] = 'approved'
            # If admin doesn't provide assigned_salesperson_id, it can be null
            if 'assigned_salesperson' not in validated_data:
                validated_data['assigned_salesperson'] = None
            
        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get('request')
        user_profile = request.user.profile

        # Salespersons cannot change status or assigned_salesperson (handled by permissions)
        if user_profile.role == 'salesperson':
            validated_data.pop('status', None)
            validated_data.pop('assigned_salesperson', None)
            validated_data.pop('assigned_salesperson_id', None)

        return super().update(instance, validated_data)
