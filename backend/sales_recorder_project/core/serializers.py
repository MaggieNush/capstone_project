from rest_framework import serializers
from .models import Flavor

class FlavorSerializer(serializers.ModelSerializer):
    """
    Serializer for Flavor model
    This serializer handles the serialization and deserialization of Flavor instances.
    """
    class Meta:
        model = Flavor
        fields = ['id', 'name', 'base_price_per_liter', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']