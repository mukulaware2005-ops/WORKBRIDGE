import os

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

from dashboard.middleware import JWTAuthMiddleware
from dashboard.routing import websocket_urlpatterns as dashboard_ws_urlpatterns
from booking.routing import websocket_urlpatterns as booking_ws_urlpatterns

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,

    "websocket": JWTAuthMiddleware(
        URLRouter(dashboard_ws_urlpatterns + booking_ws_urlpatterns)
    ),
})