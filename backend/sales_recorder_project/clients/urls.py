from rest_framework import routers
from .views import ClientViewSet

router = routers.DefaultRouter()
router.register(r'', ClientViewSet, basename='client') # Base name for url reversal

urlpatterns = router.urls

