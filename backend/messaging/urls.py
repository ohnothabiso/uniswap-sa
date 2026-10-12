from rest_framework.routers import DefaultRouter

from .views import MessageViewSet

app_name = "messaging"

router = DefaultRouter()
router.register("", MessageViewSet, basename="message")

urlpatterns = router.urls
