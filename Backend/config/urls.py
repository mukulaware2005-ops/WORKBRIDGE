from django.contrib import admin
from django.urls import include, path

from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path(
        "admin/",
        admin.site.urls
    ),

    path(
        "api/auth/",
        include("accounts.urls")
    ),

    path(
        "api/",
        include("booking.urls")
    ),

    path(
        "api/notifications/",
        include("notification.urls")
    ),

    path(
        "api/",
        include("messaging.urls")
    ),

    path(
        "api/admin/",
        include("dashboard.urls")
    ),
]


# =========================================================
# MEDIA FILES
# =========================================================

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT
    )