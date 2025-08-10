from rest_framework.routers import DefaultRouter
from .views import FlavorViewSet

router = DefaultRouter()
router.register(r'flavors', FlavorViewSet, basename='flavor')

urlpatterns = router.urls