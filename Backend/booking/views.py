from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from .models import Booking
from .serializers import BookingSerializer
from .realtime import broadcast_booking_event, broadcast_notification
from notification.models import Notification
from messaging.models import Conversation


class BookingViewSet(viewsets.ModelViewSet):

    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == "CUSTOMER":
            queryset = Booking.objects.filter(customer=user)
        elif user.role == "WORKER":
            queryset = Booking.objects.filter(worker__user=user)
        else:
            queryset = Booking.objects.none()

        booking_status = self.request.query_params.get("status")
        if booking_status:
            queryset = queryset.filter(status=booking_status)

        return queryset.select_related(
            "customer", "worker__user", "service",
        ).order_by("-created_at")

    def perform_create(self, serializer):
        if self.request.user.role != "CUSTOMER":
            raise PermissionDenied("Only customers can create booking requests.")

        booking = serializer.save(
            customer=self.request.user,
            status=Booking.Status.PENDING,
        )

        notif = Notification.objects.create(
            user=booking.worker.user,
            category=Notification.Category.BOOKING,
            title="New booking request",
            body=(
                f"{booking.customer.email} sent you a booking "
                f"request for {booking.service.name}."
            ),
        )

        broadcast_notification(notif)
        broadcast_booking_event(booking, "created")

    def partial_update(self, request, *args, **kwargs):
        booking = self.get_object()

        # =========================
        # WORKER
        # =========================
        if request.user.role == "WORKER":
            new_status = request.data.get("status")

            if new_status not in [Booking.Status.UPCOMING, Booking.Status.CANCELLED]:
                return Response(
                    {"error": "Worker can only accept or reject a pending booking."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if booking.status != Booking.Status.PENDING:
                return Response(
                    {"error": "Only pending bookings can be accepted or rejected."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            booking.status = new_status
            booking.save()

            if new_status == Booking.Status.UPCOMING:
                Conversation.objects.get_or_create(
                    booking=booking,
                    defaults={
                        "customer": booking.customer,
                        "worker": booking.worker.user,
                        "status": Conversation.Status.ACTIVE,
                    },
                )

                notif = Notification.objects.create(
                    user=booking.customer,
                    category=Notification.Category.BOOKING,
                    title="Booking accepted",
                    body=(
                        f"{booking.worker.user.email} accepted your "
                        f"booking for {booking.service.name}."
                    ),
                )

                broadcast_notification(notif)
                broadcast_booking_event(booking, "accepted")

            elif new_status == Booking.Status.CANCELLED:
                notif = Notification.objects.create(
                    user=booking.customer,
                    category=Notification.Category.BOOKING,
                    title="Booking rejected",
                    body=(
                        f"{booking.worker.user.email} rejected your "
                        f"booking for {booking.service.name}."
                    ),
                )

                broadcast_notification(notif)
                broadcast_booking_event(booking, "rejected")

            return Response(self.get_serializer(booking).data)

        # =========================
        # CUSTOMER
        # =========================
        if request.user.role == "CUSTOMER":
            if booking.customer != request.user:
                return Response(
                    {"error": "You can only update your own bookings."},
                    status=status.HTTP_403_FORBIDDEN,
                )

            new_status = request.data.get("status")

            if (
                new_status == Booking.Status.CANCELLED
                and booking.status == Booking.Status.UPCOMING
            ):
                booking.status = Booking.Status.CANCELLED
                booking.save()

                notif = Notification.objects.create(
                    user=booking.worker.user,
                    category=Notification.Category.BOOKING,
                    title="Booking cancelled",
                    body=(
                        f"{booking.customer.email} cancelled the "
                        f"booking for {booking.service.name}."
                    ),
                )

                broadcast_notification(notif)
                broadcast_booking_event(booking, "cancelled")

                return Response(self.get_serializer(booking).data)

            if (
                new_status == Booking.Status.COMPLETED
                and booking.status == Booking.Status.UPCOMING
            ):
                booking.status = Booking.Status.COMPLETED
                booking.save()

                notif = Notification.objects.create(
                    user=booking.worker.user,
                    category=Notification.Category.BOOKING,
                    title="Booking completed",
                    body=(
                        f"{booking.customer.email} marked the "
                        f"booking for {booking.service.name} "
                        f"as completed."
                    ),
                )

                broadcast_notification(notif)
                broadcast_booking_event(booking, "completed")

                return Response(self.get_serializer(booking).data)

            return Response(
                {"error": "Customers can only cancel or complete upcoming bookings."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response({"error": "Invalid user role."}, status=status.HTTP_403_FORBIDDEN)

    def update(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)