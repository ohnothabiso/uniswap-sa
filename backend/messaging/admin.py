from django.contrib import admin

from .models import Message


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("sender", "receiver", "listing", "date_sent", "is_read")
    list_filter = ("is_read",)
    search_fields = ("message_text", "sender__full_name", "receiver__full_name")
