
"""
URL configuration for config project.
"""

from django.contrib import admin
from django.urls import include, path


urlpatterns = [
    path("admin/", admin.site.urls),

    # Authentication
    path("api/auth/", include("accounts.urls")),

    # Booking
    path("api/", include("booking.urls")),

    # Notifications
    path("api/notifications/", include("notification.urls")),

    # Messaging
    path("api/", include("messaging.urls")),
]
