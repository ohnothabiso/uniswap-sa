from django.contrib import admin

from .models import Category, Listing, ListingImage


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("category_name", "description")
    search_fields = ("category_name",)


class ListingImageInline(admin.TabularInline):
    model = ListingImage
    extra = 1


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ("title", "user", "category", "listing_type", "price", "status", "date_posted")
    list_filter = ("status", "listing_type", "category", "condition")
    search_fields = ("title", "description", "user__full_name", "user__email")
    inlines = [ListingImageInline]
    actions = ["mark_live", "flag_listing", "remove_listing"]

    @admin.action(description="Approve (mark Live)")
    def mark_live(self, request, queryset):
        queryset.update(status=Listing.Status.LIVE)

    @admin.action(description="Flag for review")
    def flag_listing(self, request, queryset):
        queryset.update(status=Listing.Status.FLAGGED)

    @admin.action(description="Remove listing")
    def remove_listing(self, request, queryset):
        queryset.update(status=Listing.Status.REMOVED)
