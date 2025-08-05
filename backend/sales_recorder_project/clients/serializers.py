from rest_framework import serializers
from .models import Client
from users.serializers import UserProfileSerializer # Import UserProfileSerializer for nested representation
from users.models import UserProfile # Import UserProfile model for validation


class ClientSerializer(serializers.ModelSerializer):
    """
    Serializer for the Client model
    Includes nested salesperson data and calculated outstanding balances
    """
    assigned_salesperson = UserProfileSerializer(read_only=True)  # Nested serializer for assigned salesperson
    # Use a write only field for assigning salesperson by id during creation or updates
    assigned_salesperson_id = serializers.PrimaryKeyRelatedField(
        queryset=UserProfile.objects.filter(role='salesperson'),
        source='assigned_salesperson',
        write_only=True,
        required=False, # Optional for salesperson creating pending clients
        allow_null=True # Allow null for pending clients
    )
    outstanding_balance = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Client
        fields = [
            'id', 'name', 'contact_person', 'phone_number', 'email', 
            'address', 'client_type', 'is_new_client', 'assigned_salesperson',
            'assigned_salesperson_id', 'status', 'created_at', 'updated_at',
            'outstanding_balance'
        ]
        read_only_fields = ('is_new_client', 'status', 'outstanding_balance')

    def to_representation(self, instance):
        """
        Add outstanding balance to the represantion of the client
        This is a simplified calculation
        """
        return super().to_representation(instance)
        # Placeholder for outstanding balance calculation.
        # This should ideally be calculated by summing order totals and subtracting payments
        representation['outstanding_balance'] = '0.00'  # Placeholder value
        return representation
    
    def create(self, validated_data):
        request = self.context.get('request')
        user_profile = request.user.profile

        # If a salesperson is creating, it's a new client and it's pending approval
        if user_profile.role == 'salesperson':
            validated_data['is_new_client'] = True
            validated_data['status'] = 'pending'
            validated_data['assigned_salesperson'] = None # Not assigned until approved by admin

        elif user_profile.role == 'admin':
            # Admin can directly create an approved client and assign to a saleperson
            validated_data['is_new_client'] = False # Admin creating implies existing
            validated_data['status'] = 'approved'
            # If admin provides assigned_salesperson_id, use it, else it can be null
            if 'assigned_salesperson' not in validated_data:
                validated_data['assigned_salesperson'] = None

        return super().create(validated_data)

    def update(self, instance, validated_data):
        request = self.context.get('request')
        user_profile = request.user.profile

        # Salesperson can only update their own clients and cannot change status or assigned salesperson
        if user_profile.role == 'salesperson':
            validated_data.pop('status', None)  # Prevent changing status
            validated_data.pop('assigned_salesperson', None)  # Prevent changing assigned salesperson
            validated_data.pop('assigned_salesperson_id', None)  # Prevent changing assigned salesperson by id

        return super().update(instance, validated_data)
