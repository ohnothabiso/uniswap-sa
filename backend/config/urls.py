"""
Root URL configuration for UniSwap.

/admin/                     Django admin (also usable as the moderation backend)
/api/accounts/               universities list, register, login (JWT), profile
/api/listings/                categories, listing CRUD, feed filters
/api/messaging/               direct messages, threads
/api/favourites/              saved listings
/api/notifications/           in-app notifications
/api/moderation/              reports, moderation logs, approve/flag/remove, stats
"""

from pathlib import Path
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.generic import TemplateView
from django.views.static import serve

FRONTEND_DIST = getattr(settings, "FRONTEND_DIST", settings.BASE_DIR.parent / "frontend" / "dist")
STATIC_ROOT_DIR = FRONTEND_DIST if FRONTEND_DIST.exists() else (settings.BASE_DIR.parent / "frontend")

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/accounts/", include("accounts.urls")),
    path("api/listings/", include("listings.urls")),
    path("api/messaging/", include("messaging.urls")),
    path("api/favourites/", include("favourites.urls")),
    path("api/notifications/", include("notifications.urls")),
    path("api/moderation/", include("moderation.urls")),
]

# Media uploads (listing images, avatars)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Static and built frontend assets
if (STATIC_ROOT_DIR / "assets").exists():
    urlpatterns += [
        re_path(r"^assets/(?P<path>.*)$", serve, {"document_root": STATIC_ROOT_DIR / "assets"}),
    ]

urlpatterns += [
    re_path(
        r"^(?P<path>.*\.(?:js|css|png|jpg|jpeg|gif|svg|ico|webp|woff|woff2|ttf|map))$",
        serve,
        {"document_root": STATIC_ROOT_DIR},
    ),
]

# SPA Catch-all: Route all frontend views (e.g. /, /explore, /login, /listing/1) to React's index.html
urlpatterns += [
    re_path(r"^(?!api/|admin/|media/|assets/|static/).*$", TemplateView.as_view(template_name="index.html"), name="app"),
]
