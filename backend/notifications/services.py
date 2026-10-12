"""Helper used by other apps (via signals) to create notifications without
importing DRF machinery into their signal handlers."""

from .models import Notification


def notify(user, notification_type, message, link=""):
    return Notification.objects.create(
        user=user, notification_type=notification_type, message=message, link=link
    )
