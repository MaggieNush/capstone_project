from django.urls import path, include
from .views import RegisterAPI, LoginAPI, LogoutAPI, UserProfileView

urlpatterns = [
    path('register/', RegisterAPI.as_view(), name='register'),
    path('login/', LoginAPI.as_view(), name='login'),
    path('logout/', LogoutAPI.as_view(), name='logout'),
    path('me/', UserProfileView.as_view(), name='user-profile'),
]