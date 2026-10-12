from django.conf import settings
from django.db import models


class Category(models.Model):
    category_id = models.AutoField(primary_key=True)
    category_name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name_plural = "categories"
        ordering = ["category_name"]

    def __str__(self):
        return self.category_name


class Listing(models.Model):
    class ListingType(models.TextChoices):
        FOR_SALE = "FOR_SALE", "For Sale"
        SWAP = "SWAP", "Swap"
        DONATE = "DONATE", "Donate / Free"

    class Condition(models.TextChoices):
        NEW = "NEW", "New"
        LIKE_NEW = "LIKE_NEW", "Like New"
        GOOD = "GOOD", "Good"
        FAIR = "FAIR", "Fair"

    class Status(models.TextChoices):
        PENDING = "PENDING", "Pending Review"
        LIVE = "LIVE", "Live"
        RESERVED = "RESERVED", "Reserved for Meetup"
        COMPLETED = "COMPLETED", "Completed / Swapped"
        FLAGGED = "FLAGGED", "Flagged"
        REMOVED = "REMOVED", "Removed"

    listing_id = models.AutoField(primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="listings"
    )
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL, null=True, related_name="listings"
    )

    title = models.CharField(max_length=150)
    description = models.TextField()
    listing_type = models.CharField(
        max_length=20, choices=ListingType.choices, default=ListingType.SWAP
    )
    # Nullable: swap/donation items have no price. Enforced in serializer validation.
    price = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    condition = models.CharField(max_length=20, choices=Condition.choices, default=Condition.GOOD)
    size = models.CharField(max_length=50, blank=True, default="")
    safe_zone = models.CharField(max_length=150, blank=True, default="Central Library Ground Floor")
    swap_preference = models.CharField(max_length=255, blank=True, default="")
    image_url = models.URLField(max_length=1000, blank=True, default="")

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    date_posted = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date_posted"]
        indexes = [
            models.Index(fields=["listing_type", "status"]),
            models.Index(fields=["price"]),
        ]

    def __str__(self):
        return f"{self.title} ({self.get_listing_type_display()})"

    def clean(self):
        # Pure cash-free circular campus marketplace
        self.price = None


class ListingImage(models.Model):
    # Django auto-names the DB column "listing_id" for a FK field called "listing".
    listing = models.ForeignKey(Listing, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="listing_images/", blank=True, null=True)
    image_url = models.URLField(max_length=1000, blank=True, default="")
    is_cover = models.BooleanField(default=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-is_cover", "uploaded_at"]

    def __str__(self):
        return f"Image for {self.listing.title}"
