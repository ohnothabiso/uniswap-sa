from django.conf import settings
from django.db import models


class Notification(models.Model):
    class NotificationType(models.TextChoices):
        NEW_MESSAGE = "NEW_MESSAGE", "New Message"
        ITEM_SAVED = "ITEM_SAVED", "Your Item Was Saved"
        LISTING_APPROVED = "LISTING_APPROVED", "Listing Approved"
        LISTING_FLAGGED = "LISTING_FLAGGED", "Listing Flagged"
        LISTING_REMOVED = "LISTING_REMOVED", "Listing Removed"
        REPORT_RECEIVED = "REPORT_RECEIVED", "Your Listing Was Reported"
        TRADE_COMPLETED = "TRADE_COMPLETED", "Trade Completed"

    notification_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    notification_type = models.CharField(max_length=30, choices=NotificationType.choices)
    message = models.CharField(max_length=255)
    link = models.CharField(max_length=255, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.notification_type}] {self.message[:40]}"
