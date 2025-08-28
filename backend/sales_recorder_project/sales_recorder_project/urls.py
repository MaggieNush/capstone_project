from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken.views import obtain_auth_token # For token-based authentication(DRF token auth)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/clients/', include('clients.urls')), # Include client-related endpoints
    path('api/v1/users/', include('users.urls')), # Include UserProfileViewSet routes
    path('api/v1/auth/', include('users.urls')), # Include user-related endpoints
    path('api/v1/', include('sales.urls')), # Include sales-related endpoints ie orders and payments
    path('api/v1/', include('core.urls')), # Include core-related endpoints
    path('api/v1/token-auth/', obtain_auth_token) # Token authentication endpoint
]
