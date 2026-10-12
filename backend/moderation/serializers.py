from rest_framework import serializers

from .models import ModerationLog, Report


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ["report_id", "listing", "reason", "status", "date_reported"]
        read_only_fields = ["report_id", "status", "date_reported"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class ModerationLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModerationLog
        fields = ["log_id", "listing", "admin", "action", "reason", "created_at"]
        read_only_fields = fields
