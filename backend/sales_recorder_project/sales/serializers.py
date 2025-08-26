from rest_framework import serializers
from django.db import transaction
from django.db.models import Sum, F # Import Sum and F objects for calculations
from .models import Order, OrderItem, Payment 
from core.models import Flavor 
from clients.models import Client 
from core.serializers import FlavorSerializer
from clients.serializers import ClientSerializer
from users.serializers import UserProfileSerializer 

class OrderItemSerializer(serializers.ModelSerializer):
    """
    Serializer for OrderItem. Allows nesting within Order.
    """
    flavor = FlavorSerializer(read_only=True) # Display full flavor object
    flavor_id = serializers.PrimaryKeyRelatedField(
        queryset=Flavor.objects.all(),
        source='flavor',
        write_only=True # Only allow writing the ID
    )

    class Meta:
        model = OrderItem
        fields = ['id', 'flavor', 'flavor_id', 'quantity_liters', 'price_per_liter_at_sale', 'item_total']
        read_only_fields = ['item_total', 'price_per_liter_at_sale']

class OrderSerializer(serializers.ModelSerializer):
    """
    Serializer for the Order model.
    Handles nested creation and update of OrderItems.
    """
    order_items = OrderItemSerializer(many=True)
    client = ClientSerializer(read_only=True) # Read-only nested client details
    client_id = serializers.PrimaryKeyRelatedField(
        queryset=Client.objects.all(),
        source='client',
        write_only=True # Allow writing client ID for creation
    )
    salesperson = UserProfileSerializer(read_only=True) # Read-only nested salesperson profile

    class Meta:
        model = Order
        fields = [
            'id', 'client', 'client_id', 'salesperson', 'order_date',
            'total_amount', 'payment_status', 'order_items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['total_amount', 'salesperson', 'created_at', 'updated_at']

    def validate(self, data):
        # Validate that client is assigned to salesperson if a salesperson is making the order
        request = self.context.get('request')
        user_profile = request.user.profile

        if user_profile.role == 'salesperson':
            client = data.get('client')
            if not client or client.assigned_salesperson != user_profile:
                raise serializers.ValidationError("Client not assigned to this salesperson.")
            if client.status != 'approved':
                raise serializers.ValidationError("Cannot create order for unapproved client.")

        return data

    def create(self, validated_data):
        order_items_data = validated_data.pop('order_items')

        request = self.context.get('request')
        user_profile = request.user.profile

        # Set the salesperson automatically based on the logged-in user
        validated_data['salesperson'] = user_profile

        with transaction.atomic():
            order = Order.objects.create(**validated_data)
            total_order_amount = 0

            for item_data in order_items_data:
                flavor = item_data['flavor'] # This is the Flavor instance from PrimaryKeyRelatedField
                quantity = item_data['quantity_liters']

                # Get the current price from the Flavor model
                price_per_liter = flavor.base_price_per_liter
                item_total = quantity * price_per_liter

                OrderItem.objects.create(
                    order=order,
                    flavor=flavor,
                    quantity_liters=quantity,
                    price_per_liter_at_sale=price_per_liter, 
                    item_total=item_total
                )
                total_order_amount += item_total

            order.total_amount = total_order_amount
            order.save()
        return order

    def update(self, instance, validated_data):
        # Allow updating order_items (e.g., adding/removing items)
        # Allows full replacement of order_items.
        # For more complex updates (partial item updates), more logic would be needed.
        order_items_data = validated_data.pop('order_items', [])

        with transaction.atomic():
            # Update main order fields
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()

            # Handle order items update
            # Delete existing items and recreate new ones for simplicity
            instance.order_items.all().delete()
            total_order_amount = 0
            for item_data in order_items_data:
                flavor = item_data['flavor']
                quantity = item_data['quantity_liters']
                price_per_liter = flavor.base_price_per_liter 
                item_total = quantity * price_per_liter

                OrderItem.objects.create(
                    order=instance,
                    flavor=flavor,
                    quantity_liters=quantity,
                    price_per_liter_at_sale=price_per_liter, 
                    item_total=item_total
                )
                total_order_amount += item_total

            instance.total_amount = total_order_amount
            instance.save()
        return instance

class PaymentSerializer(serializers.ModelSerializer):
    """
    Serializer for the Payment model.
    """
    client = ClientSerializer(read_only=True) # Read-only nested client details
    client_id = serializers.PrimaryKeyRelatedField(
        queryset=Client.objects.all(),
        source='client',
        write_only=True
    )
    order = OrderSerializer(read_only=True) # Read-only nested order details
    order_id = serializers.PrimaryKeyRelatedField(
        queryset=Order.objects.all(),
        source='order',
        write_only=True,
        required=False,
        allow_null=True
    )
    recorded_by_salesperson = UserProfileSerializer(read_only=True) # Read-only nested salesperson profile

    class Meta:
        model = Payment
        fields = [
            'id', 'client', 'client_id', 'order', 'order_id', 'amount_paid',
            'payment_date', 'payment_method', 'recorded_by_salesperson',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['recorded_by_salesperson', 'created_at', 'updated_at']

    def create(self, validated_data):
        request = self.context.get('request')
        user_profile = request.user.profile
        validated_data['recorded_by_salesperson'] = user_profile
        return super().create(validated_data)
