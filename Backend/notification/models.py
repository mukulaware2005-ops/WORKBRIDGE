from django.conf import settings
from django.db import models


class Notification(models.Model):

    class Category(models.TextChoices):
        BOOKING = "Booking", "Booking"
        MESSAGE = "Messages", "Messages"
        REVIEW = "Reviews", "Reviews"
        SYSTEM = "System", "System"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )

    category = models.CharField(
        max_length=50,
        choices=Category.choices,
        default=Category.SYSTEM,
    )

    title = models.CharField(max_length=255)

    body = models.TextField()

    read = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.title}"