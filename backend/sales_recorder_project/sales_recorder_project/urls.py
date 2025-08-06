from django.contrib import admin
from django.urls import path, include
from rest_framework.authtoken.views import obtain_auth_token # For token-based authentication(DRF token auth)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/clients/', include('clients.urls')), # Include client-related endpoints
    path('api/v1/users/', include('users.urls')), # Include user-related endpoints
    path('api/v1/token-auth/', obtain_auth_token), # Token authentication endpoint
]
