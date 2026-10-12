from django.db.models.signals import post_save
from django.dispatch import receiver

from notifications.services import notify

from .models import Report


@receiver(post_save, sender=Report)
def notify_report_received(sender, instance, created, **kwargs):
    if created:
        notify(
            instance.listing.user,
            "REPORT_RECEIVED",
            f'Your listing "{instance.listing.title}" was reported and is under review.',
            f"/listings/{instance.listing_id}",
        )
