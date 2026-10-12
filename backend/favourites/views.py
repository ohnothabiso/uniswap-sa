from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Favourite
from .serializers import FavouriteSerializer


class FavouriteViewSet(viewsets.ModelViewSet):
    """
    GET    /api/favourites/       my saved listings
    POST   /api/favourites/       save one {"listing": <id>}
    POST   /api/favourites/toggle/ toggle favorite for {"listing": <id>}
    DELETE /api/favourites/<id>/  un-save
    """

    serializer_class = FavouriteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Favourite.objects.filter(user=self.request.user).select_related("listing")

    @action(detail=False, methods=["post"])
    def toggle(self, request):
        listing_id = request.data.get("listing")
        if not listing_id:
            return Response({"error": "listing id required"}, status=400)
        fav = Favourite.objects.filter(user=request.user, listing_id=listing_id).first()
        if fav:
            fav.delete()
            return Response({"status": "removed", "favorited": False, "listing_id": int(listing_id)})
        else:
            new_fav = Favourite.objects.create(user=request.user, listing_id=listing_id)
            return Response({"status": "added", "favorited": True, "favourite": FavouriteSerializer(new_fav, context={"request": request}).data}, status=201)
