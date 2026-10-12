from rest_framework.routers import DefaultRouter

from .views import CategoryViewSet, ListingViewSet

app_name = "listings"

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("", ListingViewSet, basename="listing")

urlpatterns = router.urls
