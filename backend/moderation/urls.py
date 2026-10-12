from rest_framework.routers import DefaultRouter

from .views import ListingModerationViewSet, ModerationLogViewSet, ReportViewSet

app_name = "moderation"

router = DefaultRouter()
router.register("reports", ReportViewSet, basename="report")
router.register("logs", ModerationLogViewSet, basename="moderationlog")
router.register("listings", ListingModerationViewSet, basename="listing-moderation")

urlpatterns = router.urls
