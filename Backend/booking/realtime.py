
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .serializers import BookingSerializer


def broadcast_booking_event(booking, event_type):
    channel_layer = get_channel_layer()

    payload = {
        "event": event_type,
        "booking": BookingSerializer(booking).data,
    }

    # Send booking update to the customer and worker
    for user_id in {
        booking.customer_id,
        booking.worker.user_id,
    }:
        async_to_sync(channel_layer.group_send)(
            f"user_{user_id}",
            {
                "type": "booking_update",
                "data": payload,
            },
        )

    # Also notify the admin dashboard that booking statistics
    # may have changed.
    async_to_sync(channel_layer.group_send)(
        "admin_dashboard",
        {
            "type": "dashboard_update",
            "data": {
                "event": event_type,
                "booking_id": booking.id,
            },
        },
    )


def broadcast_notification(notification):
    channel_layer = get_channel_layer()

    async_to_sync(channel_layer.group_send)(
        f"user_{notification.user_id}",
        {
            "type": "notification",
            "data": {
                "id": notification.id,
                "category": notification.category,
                "title": notification.title,
                "body": notification.body,
                "read": notification.read,
                "created_at": notification.created_at.isoformat(),
            },
        },
    )
