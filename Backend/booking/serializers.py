from rest_framework import serializers

from .models import Booking
from accounts.models import WorkerProfile, Service


class BookingSerializer(serializers.ModelSerializer):

    worker_name = serializers.CharField(
        source="worker.user.email",
        read_only=True
    )

    service_name = serializers.CharField(
        source="service.name",
        read_only=True
    )

    class Meta:
        model = Booking

        fields = [
            "id",
            "customer",
            "worker",
            "worker_name",
            "service",
            "service_name",
            "date",
            "time",
            "location",
            "message",
            "price",
            "status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "customer",
            "worker_name",
            "service_name",
            "status",
            "created_at",
            "updated_at",
        ]

    def validate_worker(self, value):
        if not WorkerProfile.objects.filter(
            id=value.id
        ).exists():
            raise serializers.ValidationError(
                "Worker does not exist."
            )

        return value

    def validate_service(self, value):
        if not Service.objects.filter(
            id=value.id,
            is_active=True
        ).exists():
            raise serializers.ValidationError(
                "Service does not exist or is inactive."
            )

        return value

    def validate(self, attrs):
        worker = attrs.get("worker")
        service = attrs.get("service")

        if worker and service:
            if service.worker_id != worker.id:
                raise serializers.ValidationError(
                    "Selected service does not belong to the selected worker."
                )

        return attrs