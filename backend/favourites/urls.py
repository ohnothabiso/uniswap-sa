from rest_framework.routers import DefaultRouter

from .views import FavouriteViewSet

app_name = "favourites"

router = DefaultRouter()
router.register("", FavouriteViewSet, basename="favourite")

urlpatterns = router.urls
