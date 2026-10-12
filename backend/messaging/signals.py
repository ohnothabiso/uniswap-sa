from django.db.models.signals import post_save
from django.dispatch import receiver

from notifications.services import notify

from .models import Message


@receiver(post_save, sender=Message)
def notify_new_message(sender, instance, created, **kwargs):
    if created:
        notify(
            instance.receiver,
            "NEW_MESSAGE",
            f"New message from {instance.sender.full_name}",
            f"/messages?with={instance.sender_id}",
        )
