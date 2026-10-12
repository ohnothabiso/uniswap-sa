from rest_framework import serializers

from .models import Message


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.ReadOnlyField(source="sender.full_name")
    sender_email = serializers.ReadOnlyField(source="sender.email")
    sender_avatar = serializers.ReadOnlyField(source="sender.avatar_url")
    receiver_name = serializers.ReadOnlyField(source="receiver.full_name")
    receiver_email = serializers.ReadOnlyField(source="receiver.email")
    receiver_avatar = serializers.ReadOnlyField(source="receiver.avatar_url")
    listing_title = serializers.ReadOnlyField(source="listing.title")
    listing_price = serializers.ReadOnlyField(source="listing.price")
    listing_type = serializers.ReadOnlyField(source="listing.listing_type")
    listing_image = serializers.SerializerMethodField()

    class Meta:
        model = Message
        fields = [
            "message_id", "sender", "sender_name", "sender_email", "sender_avatar",
            "receiver", "receiver_name", "receiver_email", "receiver_avatar",
            "listing", "listing_title", "listing_price", "listing_type", "listing_image",
            "message_text", "is_read", "date_sent",
        ]
        read_only_fields = ["message_id", "sender", "is_read", "date_sent"]

    def get_listing_image(self, obj):
        if not obj.listing:
            return None
        cover = obj.listing.images.filter(is_cover=True).first() or obj.listing.images.first()
        if cover:
            if cover.image:
                request = self.context.get("request")
                return request.build_absolute_uri(cover.image.url) if request else cover.image.url
            if cover.image_url:
                return cover.image_url
        return obj.listing.image_url or None

    def create(self, validated_data):
        validated_data["sender"] = self.context["request"].user
        return super().create(validated_data)
