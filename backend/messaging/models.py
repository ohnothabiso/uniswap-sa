from django.conf import settings
from django.db import models

from listings.models import Listing


class Message(models.Model):
    """
    Direct message between a buyer and seller about a specific listing,
    matching the ERD's Message entity (sender_ID, receiver_ID, listing_ID).
    """

    message_id = models.AutoField(primary_key=True)
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sent_messages"
    )
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="received_messages"
    )
    listing = models.ForeignKey(
        Listing, on_delete=models.SET_NULL, null=True, blank=True, related_name="messages"
    )
    message_text = models.TextField()
    is_read = models.BooleanField(default=False)
    date_sent = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["date_sent"]
        indexes = [models.Index(fields=["sender", "receiver"])]

    def __str__(self):
        return f"{self.sender_id} -> {self.receiver_id}: {self.message_text[:30]}"
