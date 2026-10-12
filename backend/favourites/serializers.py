from rest_framework import serializers

from listings.serializers import ListingFeedSerializer

from .models import Favourite


class FavouriteSerializer(serializers.ModelSerializer):
    listing_detail = ListingFeedSerializer(source="listing", read_only=True)

    class Meta:
        model = Favourite
        fields = ["favourite_id", "listing", "listing_detail", "date_saved"]
        read_only_fields = ["favourite_id", "date_saved"]

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)
