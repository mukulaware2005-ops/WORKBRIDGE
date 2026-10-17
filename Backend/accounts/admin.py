from django.contrib import admin

from .models import User, Skill, WorkerProfile, Service, Review


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = (
        "email",
        "role",
        "address",
        "latitude",
        "longitude",
        "is_email_verified",
        "is_staff",
    )
    search_fields = ("email", "address")
    list_filter = ("role", "is_email_verified", "is_staff")


@admin.register(WorkerProfile)
class WorkerProfileAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "title",
        "category",
        "city",
        "area",
        "latitude",
        "longitude",
        "is_identity_verified",
        "is_phone_verified",
    )
    search_fields = (
        "user__email",
        "title",
        "category",
        "city",
        "area",
    )
    list_filter = (
        "category",
        "city",
        "is_identity_verified",
        "is_phone_verified",
    )


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ("name",)
    search_fields = ("name",)


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = (
        "name",
        "worker",
        "price",
        "is_active",
        "is_emergency_available",
    )
    search_fields = ("name", "worker__user__email")
    list_filter = ("is_active", "is_emergency_available")


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = (
        "worker",
        "customer",
        "rating",
        "created_at",
    )
    search_fields = (
        "worker__user__email",
        "customer__email",
        "comment",
    )
    list_filter = ("rating",)