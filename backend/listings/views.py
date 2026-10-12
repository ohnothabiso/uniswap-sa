from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, permissions, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from .models import Category, Listing
from .permissions import IsOwnerOrReadOnly
from .serializers import CategorySerializer, ListingFeedSerializer, ListingImageSerializer, ListingSerializer


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """GET /api/listings/categories/ — populates category filter sidebar."""

    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class ListingViewSet(viewsets.ModelViewSet):
    """
    GET    /api/listings/                 marketplace feed (filter by type/category/price)
    POST   /api/listings/                 create a listing (-> PENDING review)
    GET    /api/listings/<id>/            listing detail
    PATCH  /api/listings/<id>/            edit (owner only)
    DELETE /api/listings/<id>/            delete (owner only)
    POST   /api/listings/<id>/images/     upload a photo
    GET    /api/listings/?mine=true       my own listings, any status
    GET    /api/listings/?listing_type=SWAP&category=1&min_price=&max_price=
    """

    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["listing_type", "category", "condition", "status"]
    search_fields = ["title", "description", "category__category_name"]
    ordering_fields = ["price", "date_posted"]

    def get_queryset(self):
        qs = Listing.objects.select_related("user", "category").prefetch_related("images")
        user = self.request.user
        params = self.request.query_params

        if self.action in ["retrieve", "reserve", "complete_trade"]:
            return qs
        elif params.get("mine") == "true" and user.is_authenticated:
            qs = qs.filter(user=user)
        elif user.is_authenticated and user.is_staff:
            pass  # staff can see everything, including PENDING/FLAGGED
        else:
            qs = qs.filter(status=Listing.Status.LIVE)

        min_price = params.get("min_price")
        max_price = params.get("max_price")
        if min_price:
            qs = qs.filter(price__gte=min_price)
        if max_price:
            qs = qs.filter(price__lte=max_price)
        return qs

    def get_serializer_class(self):
        if self.action == "list":
            return ListingFeedSerializer
        return ListingSerializer

    def perform_create(self, serializer):
        status = self.request.data.get("status", Listing.Status.LIVE)
        serializer.save(user=self.request.user, status=status)

    @action(detail=True, methods=["post"], parser_classes=[MultiPartParser, FormParser])
    def images(self, request, pk=None):
        listing = self.get_object()
        serializer = ListingImageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(listing=listing)
        return Response(serializer.data, status=201)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def reserve(self, request, pk=None):
        listing = self.get_object()
        listing.status = Listing.Status.RESERVED
        listing.save()
        return Response({"status": listing.status, "message": f'Listing "{listing.title}" marked as reserved for meetup.'})

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def complete_trade(self, request, pk=None):
        listing = self.get_object()
        listing.status = Listing.Status.COMPLETED
        listing.save()

        # Update items diverted for seller
        seller = listing.user
        seller.items_diverted = (seller.items_diverted or 0) + 1
        seller.save()

        # If current user is buyer/trader, also increment their impact count
        if request.user.user_id != seller.user_id:
            request.user.items_diverted = (request.user.items_diverted or 0) + 1
            request.user.save()

        # Send notification to seller
        try:
            from notifications.services import notify
            notify(
                seller,
                "TRADE_COMPLETED",
                f'🎉 Trade confirmed for "{listing.title}"! 1.4 kg textile waste diverted from landfill.',
                f"/listings/{listing.listing_id}",
            )
        except Exception:
            pass

        return Response({"status": listing.status, "message": "Exchange confirmed! Campus impact score updated."})
