from django.contrib.auth.models import AbstractUser
from django.conf import settings
from django.db import models

from .managers import UserManager


# =========================================================
# USER
# =========================================================

class User(AbstractUser):

    class Role(models.TextChoices):
        CUSTOMER = "CUSTOMER", "Customer"
        WORKER = "WORKER", "Worker"

    username = None

    email = models.EmailField(unique=True)

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
    )

    is_email_verified = models.BooleanField(default=False)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return self.email


# =========================================================
# SKILL
# =========================================================

class Skill(models.Model):

    name = models.CharField(
        max_length=100,
        unique=True,
    )

    def __str__(self):
        return self.name


# =========================================================
# WORKER PROFILE
# =========================================================

class WorkerProfile(models.Model):

    GENDER_CHOICES = [
        ("Male", "Male"),
        ("Female", "Female"),
        ("Other", "Other"),
    ]

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="worker_profile",
    )

    title = models.CharField(
        max_length=150
    )

    category = models.CharField(
        max_length=100
    )

    experience_years = models.PositiveIntegerField(
        default=0
    )

    about = models.TextField(
        blank=True
    )

    city = models.CharField(
        max_length=100
    )

    area = models.CharField(
        max_length=255
    )

    languages = models.JSONField(
        default=list,
        blank=True
    )

    skills = models.ManyToManyField(
        Skill,
        related_name="workers",
        blank=True,
    )

    gender = models.CharField(
        max_length=20,
        choices=GENDER_CHOICES,
        blank=True,
    )

    starting_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    hourly_rate = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )

    emergency_charge = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )

    emergency_available = models.BooleanField(
        default=False
    )

    working_days = models.JSONField(
    default=list,
    blank=True,
    )

    working_hours = models.CharField(
        max_length=100,
        blank=True,
    )

    is_premium = models.BooleanField(
        default=False
    )

    is_featured = models.BooleanField(
        default=False
    )

    is_identity_verified = models.BooleanField(
        default=False
    )

    is_police_verified = models.BooleanField(
        default=False
    )

    is_certificate_verified = models.BooleanField(
        default=False
    )

    is_phone_verified = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.user.email} - {self.title}"


# =========================================================
# SERVICE
# =========================================================

class Service(models.Model):

    worker = models.ForeignKey(
        WorkerProfile,
        on_delete=models.CASCADE,
        related_name="services",
    )

    name = models.CharField(
        max_length=150
    )

    description = models.TextField(
        blank=True
    )

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    duration_minutes = models.PositiveIntegerField(
        null=True,
        blank=True
    )

    is_emergency_available = models.BooleanField(
        default=False
    )

    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"{self.worker.user.email} - {self.name}"




# =========================================================
# REVIEW
# =========================================================

class Review(models.Model):

    worker = models.ForeignKey(
        WorkerProfile,
        on_delete=models.CASCADE,
        related_name="reviews",
    )

    customer = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="reviews_given",
    )

    rating = models.PositiveSmallIntegerField()

    comment = models.TextField(
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return (
            f"{self.customer.email} -> "
            f"{self.worker.user.email} "
            f"({self.rating}/5)"
        )