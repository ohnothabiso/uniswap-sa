from django.conf import settings
from django.db import models

from listings.models import Listing


class Favourite(models.Model):
    """Junction table: many students can save many listings (many-to-many)."""

    favourite_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="favourites")
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="favourited_by")
    date_saved = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "listing")
        ordering = ["-date_saved"]

    def __str__(self):
        return f"{self.user.full_name} saved {self.listing.title}"
