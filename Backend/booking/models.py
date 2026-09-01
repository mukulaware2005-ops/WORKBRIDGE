from django.conf import settings
from django.db import models


class Booking(models.Model):

    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        UPCOMING = "upcoming", "Upcoming"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="bookings",
    )

    worker = models.ForeignKey(
        "accounts.WorkerProfile",
        on_delete=models.CASCADE,
        related_name="bookings",
    )

    service = models.ForeignKey(
        "accounts.Service",
        on_delete=models.CASCADE,
        related_name="bookings",
    )

    date = models.DateField()

    time = models.TimeField()

    location = models.CharField(
        max_length=255
    )
    message = models.TextField(
    blank=True
    )

    message = models.TextField(
        blank=True,
        default=""
    )

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return (
            f"Booking #{self.id} - "
            f"{self.customer.email} - "
            f"{self.service.name}"
        )