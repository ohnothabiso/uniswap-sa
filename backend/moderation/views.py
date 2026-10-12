from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from listings.models import Listing
from notifications.services import notify

from .models import ModerationLog, Report
from .serializers import ModerationLogSerializer, ReportSerializer


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_staff)


class ReportViewSet(viewsets.ModelViewSet):
    """
    POST /api/moderation/reports/  any student reports a listing
    GET  /api/moderation/reports/  admin: view the "Urgent Attention" queue
    """

    serializer_class = ReportSerializer

    def get_permissions(self):
        if self.action in ["list", "destroy"]:
            return [IsAdminUser()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        return Report.objects.select_related("listing", "user")


class ModerationLogViewSet(viewsets.ReadOnlyModelViewSet):
    """GET /api/moderation/logs/ — admin audit trail."""

    serializer_class = ModerationLogSerializer
    permission_classes = [IsAdminUser]
    queryset = ModerationLog.objects.select_related("listing", "admin")


class ListingModerationViewSet(viewsets.ViewSet):
    """
    Admin actions matching the "Moderator Overview" mock-up's action icons
    (approve / flag / remove) plus stats for the dashboard cards.

    POST /api/moderation/listings/<id>/approve/
    POST /api/moderation/listings/<id>/flag/     body: {"reason": "..."}
    POST /api/moderation/listings/<id>/remove/   body: {"reason": "..."}
    GET  /api/moderation/listings/stats/         dashboard summary numbers
    """

    permission_classes = [IsAdminUser]

    def _log_and_notify(self, listing, admin, action, reason, notif_type, notif_msg):
        ModerationLog.objects.create(listing=listing, admin=admin, action=action, reason=reason)
        notify(listing.user, notif_type, notif_msg, f"/listings/{listing.listing_id}")

    @action(detail=True, methods=["post"])
    def approve(self, request, pk=None):
        listing = Listing.objects.get(pk=pk)
        listing.status = Listing.Status.LIVE
        listing.save(update_fields=["status"])
        self._log_and_notify(
            listing, request.user, ModerationLog.Action.APPROVED, "",
            "LISTING_APPROVED", f'Your listing "{listing.title}" is now live.'
        )
        return Response({"status": "approved"})

    @action(detail=True, methods=["post"])
    def flag(self, request, pk=None):
        listing = Listing.objects.get(pk=pk)
        reason = request.data.get("reason", "")
        listing.status = Listing.Status.FLAGGED
        listing.save(update_fields=["status"])
        self._log_and_notify(
            listing, request.user, ModerationLog.Action.FLAGGED, reason,
            "LISTING_FLAGGED", f'Your listing "{listing.title}" was flagged for review.'
        )
        return Response({"status": "flagged"})

    @action(detail=True, methods=["post"])
    def remove(self, request, pk=None):
        listing = Listing.objects.get(pk=pk)
        reason = request.data.get("reason", "")
        listing.status = Listing.Status.REMOVED
        listing.save(update_fields=["status"])
        self._log_and_notify(
            listing, request.user, ModerationLog.Action.REMOVED, reason,
            "LISTING_REMOVED", f'Your listing "{listing.title}" was removed: {reason}'
        )
        return Response({"status": "removed"})

    @action(detail=False, methods=["get"])
    def stats(self, request):
        return Response({
            "active_listings": Listing.objects.filter(status=Listing.Status.LIVE).count(),
            "pending_review": Listing.objects.filter(status=Listing.Status.PENDING).count(),
            "flagged": Listing.objects.filter(status=Listing.Status.FLAGGED).count(),
            "open_reports": Report.objects.filter(status=Report.Status.OPEN).count(),
        })
