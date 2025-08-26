from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from django.contrib.auth import login
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer
from .models import User, UserProfile
from .permissions import IsAdminUser, IsSalesperson 

class RegisterAPI(generics.GenericAPIView):
    """
    API endpoint for admin to register new salespersons.
    """
    serializer_class = RegisterSerializer
    permission_classes = [IsAdminUser] # Only admin can register users

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            "user": UserSerializer(user, context=self.get_serializer_context()).data,
            "message": "Salesperson registered successfully."
        }, status=status.HTTP_201_CREATED)

class LoginAPI(generics.GenericAPIView):
    """
    API endpoint for user login.
    """
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny] # Allow unauthenticated access

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        login(request, user) # This is for session authentication, not strictly needed for token auth
        token, created = Token.objects.get_or_create(user=user)

        return Response({
            "token": token.key,
            "user_id": user.pk,
            "username": user.username,
            "role": user.profile.role if hasattr(user, 'profile') else None
        })

class LogoutAPI(APIView):
    """
    API endpoint for user logout (deletes the auth token).
    """
    permission_classes = [permissions.IsAuthenticated] # Only authenticated users can logout

    def post(self, request):
        request.user.auth_token.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class UserProfileView(generics.RetrieveAPIView):
    """
    API endpoint to get the profile of the currently authenticated user.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user