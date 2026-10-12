from rest_framework import serializers

from .models import Category, Listing, ListingImage


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["category_id", "category_name", "description"]


class ListingImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingImage
        fields = ["id", "image", "image_url", "is_cover", "uploaded_at"]


class ListingSerializer(serializers.ModelSerializer):
    images = ListingImageSerializer(many=True, read_only=True)
    seller_name = serializers.ReadOnlyField(source="user.full_name")
    seller_email = serializers.ReadOnlyField(source="user.email")
    seller_avatar = serializers.ReadOnlyField(source="user.avatar_url")
    seller_residence = serializers.ReadOnlyField(source="user.campus_residence")
    seller_trust = serializers.ReadOnlyField(source="user.trust_score")
    category_name = serializers.ReadOnlyField(source="category.category_name")

    class Meta:
        model = Listing
        fields = [
            "listing_id", "user", "seller_name", "seller_email", "seller_avatar",
            "seller_residence", "seller_trust", "category", "category_name",
            "title", "description", "listing_type", "price", "condition",
            "size", "safe_zone", "swap_preference", "image_url",
            "status", "images", "date_posted", "updated_at",
        ]
        read_only_fields = ["listing_id", "user", "status", "date_posted", "updated_at"]

    def validate(self, attrs):
        listing_type = attrs.get("listing_type", getattr(self.instance, "listing_type", None))
        if listing_type not in (Listing.ListingType.SWAP, Listing.ListingType.DONATE):
            attrs["listing_type"] = Listing.ListingType.SWAP
        # 100% Cash-free platform: all prices null
        attrs["price"] = None
        return attrs

    def create(self, validated_data):
        validated_data["user"] = self.context["request"].user
        return super().create(validated_data)


class ListingFeedSerializer(serializers.ModelSerializer):
    """Lighter serializer for the marketplace feed / browse grid."""

    cover_image = serializers.SerializerMethodField()
    seller_name = serializers.ReadOnlyField(source="user.full_name")
    seller_residence = serializers.ReadOnlyField(source="user.campus_residence")
    seller_avatar = serializers.ReadOnlyField(source="user.avatar_url")
    category_name = serializers.ReadOnlyField(source="category.category_name")

    class Meta:
        model = Listing
        fields = [
            "listing_id", "title", "description", "listing_type", "price", "condition",
            "size", "safe_zone", "swap_preference",
            "category", "category_name", "status", "user", "seller_name", "seller_residence",
            "seller_avatar", "cover_image", "date_posted",
        ]

    def get_cover_image(self, obj):
        cover = obj.images.filter(is_cover=True).first() or obj.images.first()
        if cover:
            if cover.image:
                request = self.context.get("request")
                return request.build_absolute_uri(cover.image.url) if request else cover.image.url
            if cover.image_url:
                return cover.image_url
        if obj.image_url:
            return obj.image_url
        return None
