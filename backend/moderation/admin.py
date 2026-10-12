from django.contrib import admin

from .models import ModerationLog, Report


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ("listing", "user", "status", "date_reported")
    list_filter = ("status",)
    actions = ["mark_resolved", "mark_dismissed"]

    @admin.action(description="Mark selected reports as resolved")
    def mark_resolved(self, request, queryset):
        queryset.update(status=Report.Status.RESOLVED)

    @admin.action(description="Mark selected reports as dismissed")
    def mark_dismissed(self, request, queryset):
        queryset.update(status=Report.Status.DISMISSED)


@admin.register(ModerationLog)
class ModerationLogAdmin(admin.ModelAdmin):
    list_display = ("listing", "admin", "action", "created_at")
    list_filter = ("action",)
