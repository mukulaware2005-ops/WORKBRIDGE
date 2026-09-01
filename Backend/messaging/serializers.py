from rest_framework import serializers

from .models import Conversation, Message


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.EmailField(
        source="sender.email",
        read_only=True,
    )

    class Meta:
        model = Message
        fields = [
            "id",
            "conversation",
            "sender",
            "sender_name",
            "text",
            "created_at",
            "is_read",
        ]

        read_only_fields = [
            "id",
            "sender",
            "sender_name",
            "created_at",
            "is_read",
        ]


class ConversationSerializer(serializers.ModelSerializer):
    customer_name = serializers.EmailField(
        source="customer.email",
        read_only=True,
    )

    worker_name = serializers.EmailField(
        source="worker.email",
        read_only=True,
    )

    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            "id",
            "customer",
            "customer_name",
            "worker",
            "worker_name",
            "booking",
            "status",
            "last_message",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "customer",
            "customer_name",
            "worker",
            "worker_name",
            "booking",
            "status",
            "last_message",
            "created_at",
            "updated_at",
        ]

    def get_last_message(self, obj):
        message = (
            obj.messages
            .select_related("sender")
            .order_by("-created_at")
            .first()
        )

        if not message:
            return None

        return {
            "id": message.id,
            "text": message.text,
            "sender": message.sender.id,
            "sender_name": message.sender.email,
            "created_at": message.created_at,
        }