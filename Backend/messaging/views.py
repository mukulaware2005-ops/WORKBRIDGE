from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied

from .models import Conversation, Message
from .serializers import (
    ConversationSerializer,
    MessageSerializer,
)


class ConversationViewSet(viewsets.ModelViewSet):

    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]

    http_method_names = [
        "get",
        "post",
        "patch",
        "head",
        "options",
    ]

    def get_queryset(self):
        user = self.request.user

        if user.role == "CUSTOMER":
            return Conversation.objects.filter(
                customer=user
            ).select_related(
                "customer",
                "worker",
                "booking",
            ).order_by("-updated_at")

        if user.role == "WORKER":
            return Conversation.objects.filter(
                worker=user
            ).select_related(
                "customer",
                "worker",
                "booking",
            ).order_by("-updated_at")

        return Conversation.objects.none()

    def create(self, request, *args, **kwargs):
        return Response(
            {
                "error": (
                    "Conversations are created automatically "
                    "when a worker accepts a booking."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    def partial_update(
        self,
        request,
        *args,
        **kwargs
    ):
        conversation = self.get_object()

        if request.user not in [
            conversation.customer,
            conversation.worker,
        ]:
            raise PermissionDenied(
                "You are not part of this conversation."
            )

        new_status = request.data.get("status")

        if new_status != Conversation.Status.ENDED:
            return Response(
                {
                    "error": (
                        "The only status change currently "
                        "allowed is ending a conversation."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        conversation.status = Conversation.Status.ENDED
        conversation.save()

        return Response(
            self.get_serializer(conversation).data
        )


class MessageViewSet(viewsets.ModelViewSet):

    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]

    http_method_names = [
        "get",
        "post",
        "head",
        "options",
    ]

    def get_queryset(self):
        user = self.request.user

        if user.role == "CUSTOMER":
            return Message.objects.filter(
                conversation__customer=user
            ).select_related(
                "sender",
                "conversation",
            ).order_by("created_at")

        if user.role == "WORKER":
            return Message.objects.filter(
                conversation__worker=user
            ).select_related(
                "sender",
                "conversation",
            ).order_by("created_at")

        return Message.objects.none()

    def perform_create(self, serializer):

        conversation_id = self.request.data.get(
            "conversation"
        )

        try:
            conversation = Conversation.objects.get(
                id=conversation_id
            )
        except Conversation.DoesNotExist:
            raise PermissionDenied(
                "Conversation does not exist."
            )

        user = self.request.user

        # Only the customer or worker in this
        # conversation can send messages.
        if user not in [
            conversation.customer,
            conversation.worker,
        ]:
            raise PermissionDenied(
                "You are not part of this conversation."
            )

        # Do not allow messages after conversation
        # has been ended.
        if conversation.status != Conversation.Status.ACTIVE:
            raise PermissionDenied(
                "This conversation is no longer active."
            )

        serializer.save(sender=user)