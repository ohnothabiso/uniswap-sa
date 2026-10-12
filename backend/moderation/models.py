from django.conf import settings
from django.db import models

from listings.models import Listing


class Report(models.Model):
    """A student flagging a listing as fake, scam, or inappropriate."""

    class Status(models.TextChoices):
        OPEN = "OPEN", "Open"
        RESOLVED = "RESOLVED", "Resolved"
        DISMISSED = "DISMISSED", "Dismissed"

    report_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="reports")
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="reports")
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    date_reported = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date_reported"]

    def __str__(self):
        return f"Report #{self.report_id} on {self.listing.title} ({self.status})"


class ModerationLog(models.Model):
    """Audit trail: which admin took which action on which listing, and why."""

    class Action(models.TextChoices):
        APPROVED = "APPROVED", "Approved"
        FLAGGED = "FLAGGED", "Flagged"
        REMOVED = "REMOVED", "Removed"
        USER_BANNED = "USER_BANNED", "User Banned"

    log_id = models.AutoField(primary_key=True)
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, null=True, blank=True, related_name="moderation_logs")
    admin = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name="moderation_actions")
    action = models.CharField(max_length=20, choices=Action.choices)
    reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.action} on {self.listing_id} by admin {self.admin_id}"
