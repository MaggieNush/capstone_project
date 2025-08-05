from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for the UserProfile model.
    """
    class Meta:
        model = UserProfile
        fields = ('id', 'role') # Expose role and id of the user profile

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the User model.
    This serializer is used to convert User instances to JSON format and vice versa.
    """
    profile = UserProfileSerializer(read_only=True) # Nested serializer for UserProfile

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'profile') # Expose username, email and profile of the user
        read_only_fields = ('username', 'email', 'profile') # Make username, email and profile read-only

class RegisterSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration(admin creating salesperson)
    """
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=UserProfile.ROLE_CHOICES, write_only=True) # Role for registration

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'role')

    def create(self, validated_data):
        role = validated_data.pop('role') # Remove role from validated data
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        UserProfile.objects.create(user=user, role=role)
        return user
    
class LoginSerializer(serializers.Serializer):
    """
    User login serializer
    """
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    token = serializers.CharField(read_only=True)
    user_id = serializers.IntegerField(read_only=True)
    role = serializers.CharField(read_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if username and password:
            user = authenticate(request=self.context.get('request'),
                                username=username, password=password)
            if not user:
                msg = 'Unable to log in with provided credentials.'
                raise serializers.ValidationError(msg, code='authorization')
            else:
                msg = 'Must include "username" and "password".'
                raise serializers.ValidationError(msg, code='authorization')
            
            data['user'] = user
            return data
        
        


