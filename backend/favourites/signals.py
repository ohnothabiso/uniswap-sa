from django.db.models.signals import post_save
from django.dispatch import receiver

from notifications.services import notify

from .models import Favourite


@receiver(post_save, sender=Favourite)
def notify_item_saved(sender, instance, created, **kwargs):
    if created and instance.listing.user_id != instance.user_id:
        notify(
            instance.listing.user,
            "ITEM_SAVED",
            f'{instance.user.full_name} saved your listing "{instance.listing.title}"',
            f"/listings/{instance.listing_id}",
        )
