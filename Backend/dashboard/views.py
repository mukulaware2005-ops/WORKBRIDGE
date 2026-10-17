from .serializers import (
    AdminUserSerializer,
    AdminWorkerSerializer,
    AdminBookingSerializer,
)

from django.db import models

from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework import status

from accounts.models import User, WorkerProfile

from .serializers import (
    AdminUserSerializer,
    AdminWorkerSerializer,
)


# =========================================================
# ADMIN STATISTICS
# =========================================================

class AdminStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        total_users = User.objects.count()
        workers = User.objects.filter(role=User.Role.WORKER)
        customers = User.objects.filter(role=User.Role.CUSTOMER)

        verified_workers = WorkerProfile.objects.filter(
            user__role=User.Role.WORKER,
            is_identity_verified=True
        ).count()

        from booking.models import Booking

        active_bookings = Booking.objects.filter(
            status__in=["pending", "upcoming"]
        ).count()

        completed_services = Booking.objects.filter(
            status="completed"
        ).count()

        return Response({
            "totalUsers": total_users,
            "workers": workers.count(),
            "customers": customers.count(),
            "verifiedWorkers": verified_workers,
            "activeBookings": active_bookings,
            "completedServices": completed_services,
            "reports": 0,
        })


# =========================================================
# USER MANAGEMENT
# =========================================================

class AdminUserListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        users = User.objects.all().order_by("-date_joined")

        search = request.query_params.get("search", "").strip()
        role = request.query_params.get("role", "").strip()
        active = request.query_params.get("active", "").strip()

        if search:
            users = users.filter(
                email__icontains=search
            )

        if role in [
            User.Role.CUSTOMER,
            User.Role.WORKER,
        ]:
            users = users.filter(role=role)

        if active == "true":
            users = users.filter(is_active=True)

        elif active == "false":
            users = users.filter(is_active=False)

        serializer = AdminUserSerializer(
            users,
            many=True
        )

        return Response({
            "count": users.count(),
            "results": serializer.data
        })


class AdminUserDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get_user(self, user_id):
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None

    def get(self, request, user_id):
        user = self.get_user(user_id)

        if not user:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = AdminUserSerializer(user)

        return Response(serializer.data)

    def patch(self, request, user_id):
        user = self.get_user(user_id)

        if not user:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if user.id == request.user.id:
            return Response(
                {"detail": "You cannot change your own account."},
                status=status.HTTP_400_BAD_REQUEST
            )

        allowed_fields = {
            "is_active",
        }

        invalid_fields = set(request.data.keys()) - allowed_fields

        if invalid_fields:
            return Response(
                {
                    "detail": "These fields cannot be changed.",
                    "fields": list(invalid_fields)
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if "is_active" in request.data:
            user.is_active = request.data["is_active"]
            user.save(update_fields=["is_active"])

        return Response(
            AdminUserSerializer(user).data
        )

    def delete(self, request, user_id):
        user = self.get_user(user_id)

        if not user:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if user.id == request.user.id:
            return Response(
                {"detail": "You cannot delete your own account."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if user.is_staff:
            return Response(
                {"detail": "Admin/staff accounts cannot be deleted."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.delete()

        return Response(
            {"detail": "User deleted successfully."},
            status=status.HTTP_200_OK
        )
# =========================================================
# CUSTOMER MANAGEMENT
# =========================================================

class AdminCustomerListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        customers = (
            User.objects
            .filter(role=User.Role.CUSTOMER)
            .order_by("-date_joined")
        )

        search = request.query_params.get(
            "search",
            ""
        ).strip()

        active = request.query_params.get(
            "active",
            ""
        ).strip()

        # -----------------------------------------
        # SEARCH
        # -----------------------------------------

        if search:
            customers = customers.filter(
                models.Q(email__icontains=search)
            )

        # -----------------------------------------
        # ACTIVE / INACTIVE
        # -----------------------------------------

        if active == "true":
            customers = customers.filter(
                is_active=True
            )

        elif active == "false":
            customers = customers.filter(
                is_active=False
            )

        serializer = AdminUserSerializer(
            customers,
            many=True
        )

        return Response({
            "count": customers.count(),
            "results": serializer.data
        })


class AdminCustomerDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get_customer(self, customer_id):
        try:
            return User.objects.get(
                id=customer_id,
                role=User.Role.CUSTOMER
            )
        except User.DoesNotExist:
            return None

    def get(self, request, customer_id):
        customer = self.get_customer(customer_id)

        if not customer:
            return Response(
                {"detail": "Customer not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = AdminUserSerializer(customer)

        return Response(serializer.data)

    def patch(self, request, customer_id):
        customer = self.get_customer(customer_id)

        if not customer:
            return Response(
                {"detail": "Customer not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if customer.id == request.user.id:
            return Response(
                {
                    "detail":
                    "You cannot change your own account."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        allowed_fields = {
            "is_active",
        }

        invalid_fields = (
            set(request.data.keys())
            - allowed_fields
        )

        if invalid_fields:
            return Response(
                {
                    "detail":
                    "These fields cannot be changed.",
                    "fields": list(invalid_fields)
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if "is_active" in request.data:
            customer.is_active = request.data[
                "is_active"
            ]

            customer.save(
                update_fields=["is_active"]
            )

        return Response(
            AdminUserSerializer(customer).data
        )

    def delete(self, request, customer_id):
        customer = self.get_customer(customer_id)

        if not customer:
            return Response(
                {"detail": "Customer not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if customer.id == request.user.id:
            return Response(
                {
                    "detail":
                    "You cannot delete your own account."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if customer.is_staff:
            return Response(
                {
                    "detail":
                    "Admin/staff accounts cannot be deleted."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        customer.delete()

        return Response(
            {
                "detail":
                "Customer deleted successfully."
            },
            status=status.HTTP_200_OK
        )

# =========================================================
# WORKER MANAGEMENT
# =========================================================

class AdminWorkerListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        workers = (
            User.objects
            .filter(role=User.Role.WORKER)
            .order_by("-date_joined")
        )

        search = request.query_params.get(
            "search",
            ""
        ).strip()

        category = request.query_params.get(
            "category",
            ""
        ).strip()

        city = request.query_params.get(
            "city",
            ""
        ).strip()

        active = request.query_params.get(
            "active",
            ""
        ).strip()

        verification = request.query_params.get(
            "verification",
            ""
        ).strip()

        # -----------------------------------------
        # SEARCH
        # -----------------------------------------

        if search:
            workers = workers.filter(
                models.Q(email__icontains=search)
                | models.Q(
                    worker_profile__title__icontains=search
                )
                | models.Q(
                    worker_profile__category__icontains=search
                )
                | models.Q(
                    worker_profile__city__icontains=search
                )
            )

        # -----------------------------------------
        # CATEGORY
        # -----------------------------------------

        if category:
            workers = workers.filter(
                worker_profile__category__iexact=category
            )

        # -----------------------------------------
        # CITY
        # -----------------------------------------

        if city:
            workers = workers.filter(
                worker_profile__city__iexact=city
            )

        # -----------------------------------------
        # ACTIVE / INACTIVE
        # -----------------------------------------

        if active == "true":
            workers = workers.filter(
                is_active=True
            )

        elif active == "false":
            workers = workers.filter(
                is_active=False
            )

        # -----------------------------------------
        # VERIFICATION
        # -----------------------------------------

        if verification == "identity":
            workers = workers.filter(
                worker_profile__is_identity_verified=True
            )

        elif verification == "police":
            workers = workers.filter(
                worker_profile__is_police_verified=True
            )

        workers = workers.distinct()

        serializer = AdminWorkerSerializer(
            workers,
            many=True
        )

        return Response({
            "count": workers.count(),
            "results": serializer.data
        })


class AdminWorkerDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get_worker(self, worker_id):
        try:
            return User.objects.get(
                id=worker_id,
                role=User.Role.WORKER
            )
        except User.DoesNotExist:
            return None

    def get(self, request, worker_id):
        worker = self.get_worker(worker_id)

        if not worker:
            return Response(
                {"detail": "Worker not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = AdminWorkerSerializer(worker)

        return Response(serializer.data)

    def patch(self, request, worker_id):
        worker = self.get_worker(worker_id)

        if not worker:
            return Response(
                {"detail": "Worker not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        allowed_fields = {
            "is_active",
            "is_identity_verified",
            "is_police_verified",
        }

        invalid_fields = (
            set(request.data.keys()) - allowed_fields
        )

        if invalid_fields:
            return Response(
                {
                    "detail": "These fields cannot be changed.",
                    "fields": list(invalid_fields)
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # -----------------------------------------
        # ACCOUNT STATUS
        # -----------------------------------------

        if "is_active" in request.data:
            worker.is_active = request.data[
                "is_active"
            ]

            worker.save(
                update_fields=["is_active"]
            )

        # -----------------------------------------
        # WORKER PROFILE
        # -----------------------------------------

        try:
            profile = worker.worker_profile

        except WorkerProfile.DoesNotExist:
            profile = None

        # A worker without a profile cannot be
        # identity/police verified yet.
        if (
            "is_identity_verified" in request.data
            or "is_police_verified" in request.data
        ):
            if not profile:
                return Response(
                    {
                        "detail": (
                            "This worker does not have "
                            "a worker profile yet."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST
                )

        if profile:

            if "is_identity_verified" in request.data:
                profile.is_identity_verified = request.data[
                    "is_identity_verified"
                ]

            if "is_police_verified" in request.data:
                profile.is_police_verified = request.data[
                    "is_police_verified"
                ]

            profile.save()

        return Response(
            AdminWorkerSerializer(worker).data
        )

# =========================================================
# BOOKING MANAGEMENT
# =========================================================

class AdminBookingListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):

        from booking.models import Booking

        bookings = (
            Booking.objects
            .select_related(
                "customer",
                "worker__user",
                "service",
            )
            .order_by("-created_at")
        )

        # -----------------------------------------
        # SEARCH
        # -----------------------------------------

        search = request.query_params.get(
            "search",
            ""
        ).strip()

        if search:
            bookings = bookings.filter(
                models.Q(
                    customer__email__icontains=search
                )
                | models.Q(
                    worker__user__email__icontains=search
                )
                | models.Q(
                    service__name__icontains=search
                )
                | models.Q(
                    worker__title__icontains=search
                )
            )

        # -----------------------------------------
        # STATUS
        # -----------------------------------------

        booking_status = request.query_params.get(
            "status",
            ""
        ).strip()

        if booking_status:
            bookings = bookings.filter(
                status=booking_status
            )

        # -----------------------------------------
        # DATE
        # -----------------------------------------

        booking_date = request.query_params.get(
            "date",
            ""
        ).strip()

        if booking_date:
            bookings = bookings.filter(
                date=booking_date
            )

        # -----------------------------------------
        # RESPONSE
        # -----------------------------------------

        serializer = AdminBookingSerializer(
            bookings,
            many=True
        )

        return Response({
            "count": bookings.count(),
            "results": serializer.data
        })


class AdminBookingDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get_booking(self, booking_id):

        from booking.models import Booking

        try:
            return (
                Booking.objects
                .select_related(
                    "customer",
                    "worker__user",
                    "service",
                )
                .get(id=booking_id)
            )

        except Booking.DoesNotExist:
            return None

    def get(self, request, booking_id):

        booking = self.get_booking(booking_id)

        if not booking:
            return Response(
                {"detail": "Booking not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = AdminBookingSerializer(
            booking
        )

        return Response(serializer.data)

    def patch(self, request, booking_id):

        booking = self.get_booking(booking_id)

        if not booking:
            return Response(
                {"detail": "Booking not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        allowed_fields = {
            "status",
        }

        invalid_fields = (
            set(request.data.keys())
            - allowed_fields
        )

        if invalid_fields:
            return Response(
                {
                    "detail": (
                        "Only booking status "
                        "can be changed."
                    ),
                    "fields": list(invalid_fields)
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        new_status = request.data.get("status")

        valid_statuses = [
            Booking.Status.PENDING,
            Booking.Status.UPCOMING,
            Booking.Status.COMPLETED,
            Booking.Status.CANCELLED,
        ]

        if new_status not in valid_statuses:
            return Response(
                {
                    "detail": "Invalid booking status.",
                    "valid_statuses": valid_statuses,
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        booking.status = new_status
        booking.save()

        return Response(
            AdminBookingSerializer(
                booking
            ).data
        )


    # =========================================================
# REPORTS & STATISTICS
# =========================================================

class AdminReportsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        from booking.models import Booking
        from accounts.models import Review, Service

        # -------------------------------------------------
        # USER STATISTICS
        # -------------------------------------------------

        total_users = User.objects.count()

        total_workers = User.objects.filter(
            role=User.Role.WORKER
        ).count()

        total_customers = User.objects.filter(
            role=User.Role.CUSTOMER
        ).count()

        # -------------------------------------------------
        # WORKER VERIFICATION
        # -------------------------------------------------

        verified_identity = WorkerProfile.objects.filter(
            is_identity_verified=True
        ).count()

        verified_police = WorkerProfile.objects.filter(
            is_police_verified=True
        ).count()

        verified_certificate = WorkerProfile.objects.filter(
            is_certificate_verified=True
        ).count()

        # -------------------------------------------------
        # BOOKING STATISTICS
        # -------------------------------------------------

        total_bookings = Booking.objects.count()

        pending_bookings = Booking.objects.filter(
            status=Booking.Status.PENDING
        ).count()

        upcoming_bookings = Booking.objects.filter(
            status=Booking.Status.UPCOMING
        ).count()

        completed_bookings = Booking.objects.filter(
            status=Booking.Status.COMPLETED
        ).count()

        cancelled_bookings = Booking.objects.filter(
            status=Booking.Status.CANCELLED
        ).count()

        # -------------------------------------------------
        # REVIEW STATISTICS
        # -------------------------------------------------

        total_reviews = Review.objects.count()

        average_rating = 0

        if total_reviews > 0:
            rating_data = Review.objects.aggregate(
                average=models.Avg("rating")
            )

            average_rating = round(
                rating_data["average"] or 0,
                1
            )

        # -------------------------------------------------
        # SERVICE STATISTICS
        # -------------------------------------------------

        total_services = Service.objects.count()

        active_services = Service.objects.filter(
            is_active=True
        ).count()

        inactive_services = Service.objects.filter(
            is_active=False
        ).count()

        # -------------------------------------------------
        # BOOKINGS BY SERVICE
        # -------------------------------------------------

        bookings_by_service = []

        service_data = (
            Service.objects
            .annotate(
                booking_count=models.Count("bookings")
            )
            .order_by("-booking_count")
        )

        for service in service_data:
            bookings_by_service.append({
                "service": service.name,
                "bookings": service.booking_count,
            })

        # -------------------------------------------------
        # BOOKINGS BY CATEGORY
        # -------------------------------------------------

        bookings_by_category = []

        category_data = (
            Booking.objects
            .values("worker__category")
            .annotate(
                bookings=models.Count("id")
            )
            .order_by("-bookings")
        )

        for item in category_data:
            bookings_by_category.append({
                "category": item["worker__category"],
                "bookings": item["bookings"],
            })

        # -------------------------------------------------
        # RESPONSE
        # -------------------------------------------------

        return Response({
            "users": {
                "total": total_users,
                "workers": total_workers,
                "customers": total_customers,
            },

            "workerVerification": {
                "identity": verified_identity,
                "police": verified_police,
                "certificate": verified_certificate,
            },

            "bookings": {
                "total": total_bookings,
                "pending": pending_bookings,
                "upcoming": upcoming_bookings,
                "completed": completed_bookings,
                "cancelled": cancelled_bookings,
            },

            "reviews": {
                "total": total_reviews,
                "averageRating": average_rating,
            },

            "services": {
                "total": total_services,
                "active": active_services,
                "inactive": inactive_services,
            },

            "bookingsByService": bookings_by_service,

            "bookingsByCategory": bookings_by_category,
        })

    # =========================================================
# VERIFICATION MANAGEMENT
# =========================================================

class AdminVerificationListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        workers = (
            WorkerProfile.objects
            .select_related("user")
            .filter(user__role=User.Role.WORKER)
            .order_by("-id")
        )

        search = request.query_params.get("search", "").strip()
        verification = request.query_params.get("verification", "").strip()

        if search:
            workers = workers.filter(
                models.Q(user__email__icontains=search) |
                models.Q(user__first_name__icontains=search) |
                models.Q(user__last_name__icontains=search)
            )

        if verification == "pending":
            workers = workers.filter(
                models.Q(is_identity_verified=False) |
                models.Q(is_police_verified=False) |
                models.Q(is_certificate_verified=False)
            )

        elif verification == "verified":
            workers = workers.filter(
                is_identity_verified=True,
                is_police_verified=True,
                is_certificate_verified=True,
            )

        results = []

        for worker in workers:
            results.append({
                "id": worker.id,
                "user_id": worker.user.id,
                "name": worker.user.get_full_name() or worker.user.email,
                "email": worker.user.email,
                "identity_verified": worker.is_identity_verified,
                "police_verified": worker.is_police_verified,
                "certificate_verified": worker.is_certificate_verified,
                "phone_verified": worker.is_phone_verified,
                "fully_verified": (
                    worker.is_identity_verified
                    and worker.is_police_verified
                    and worker.is_certificate_verified
                ),
            })

        return Response({
            "count": len(results),
            "results": results,
        })


class AdminVerificationDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get_worker(self, worker_id):
        try:
            return WorkerProfile.objects.select_related("user").get(
                id=worker_id,
                user__role=User.Role.WORKER
            )
        except WorkerProfile.DoesNotExist:
            return None

    def get(self, request, worker_id):
        worker = self.get_worker(worker_id)

        if not worker:
            return Response(
                {"detail": "Worker not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response({
            "id": worker.id,
            "user_id": worker.user.id,
            "name": worker.user.get_full_name() or worker.user.email,
            "email": worker.user.email,
            "identity_verified": worker.is_identity_verified,
            "police_verified": worker.is_police_verified,
            "certificate_verified": worker.is_certificate_verified,
            "phone_verified": worker.is_phone_verified,
        })

    def patch(self, request, worker_id):
        worker = self.get_worker(worker_id)

        if not worker:
            return Response(
                {"detail": "Worker not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        allowed_fields = {
            "is_identity_verified",
            "is_police_verified",
            "is_certificate_verified",
            "is_phone_verified",
        }

        invalid_fields = set(request.data.keys()) - allowed_fields

        if invalid_fields:
            return Response(
                {
                    "detail": "These fields cannot be changed.",
                    "fields": list(invalid_fields),
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        for field in allowed_fields:
            if field in request.data:
                setattr(worker, field, request.data[field])

        worker.save()

        return Response({
            "detail": "Verification updated successfully.",
            "is_identity_verified": worker.is_identity_verified,
            "is_police_verified": worker.is_police_verified,
            "is_certificate_verified": worker.is_certificate_verified,
            "is_phone_verified": worker.is_phone_verified,
        })


    # =========================================================
# REVIEW MANAGEMENT
# =========================================================

class AdminReviewListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        from accounts.models import Review

        reviews = (
            Review.objects
            .select_related("customer", "worker", "worker__user")
            .order_by("-id")
        )

        search = request.query_params.get("search", "").strip()

        if search:
            reviews = reviews.filter(
                models.Q(customer__email__icontains=search) |
                models.Q(worker__user__email__icontains=search) |
                models.Q(comment__icontains=search)
            )

        results = []

        for review in reviews:
            results.append({
                "id": review.id,
                "customer": review.customer.email,
                "worker": review.worker.user.email,
                "rating": review.rating,
                "comment": review.comment,
            })

        return Response({
            "count": len(results),
            "results": results,
        })


class AdminReviewDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, review_id):
        from accounts.models import Review

        try:
            review = Review.objects.select_related(
                "customer",
                "worker",
                "worker__user"
            ).get(id=review_id)
        except Review.DoesNotExist:
            return Response(
                {"detail": "Review not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response({
            "id": review.id,
            "customer": review.customer.email,
            "worker": review.worker.user.email,
            "rating": review.rating,
            "comment": review.comment,
        })

    def delete(self, request, review_id):
        from accounts.models import Review

        try:
            review = Review.objects.get(id=review_id)
        except Review.DoesNotExist:
            return Response(
                {"detail": "Review not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        review.delete()

        return Response({
            "detail": "Review deleted successfully."
        })
# =========================================================
# COMMUNITY MANAGEMENT
# =========================================================

class AdminCommunityListView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        from messaging.models import Conversation, Message

        conversations = (
            Conversation.objects
            .select_related("customer", "worker", "booking")
            .order_by("-updated_at")
        )

        search = request.query_params.get(
            "search",
            ""
        ).strip()

        status_filter = request.query_params.get(
            "status",
            ""
        ).strip()

        if search:
            conversations = conversations.filter(
                models.Q(customer__email__icontains=search) |
                models.Q(worker__email__icontains=search)
            )

        if status_filter:
            conversations = conversations.filter(
                status=status_filter
            )

        results = []

        for conversation in conversations:
            last_message = (
                Message.objects
                .filter(conversation=conversation)
                .order_by("-created_at")
                .first()
            )

            results.append({
                "id": conversation.id,
                "customer": conversation.customer.email,
                "worker": conversation.worker.email,
                "booking_id": conversation.booking.id,
                "status": conversation.status,
                "message_count": conversation.messages.count(),
                "last_message": (
                    last_message.text
                    if last_message
                    else ""
                ),
                "updated_at": conversation.updated_at,
                "created_at": conversation.created_at,
            })

        return Response({
            "count": len(results),
            "results": results,
        })


class AdminCommunityDetailView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, conversation_id):
        from messaging.models import Conversation

        try:
            conversation = (
                Conversation.objects
                .select_related(
                    "customer",
                    "worker",
                    "booking",
                )
                .get(id=conversation_id)
            )
        except Conversation.DoesNotExist:
            return Response(
                {"detail": "Conversation not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        messages = conversation.messages.select_related(
            "sender"
        ).order_by("created_at")

        return Response({
            "id": conversation.id,
            "customer": conversation.customer.email,
            "worker": conversation.worker.email,
            "booking_id": conversation.booking.id,
            "status": conversation.status,
            "messages": [
                {
                    "id": message.id,
                    "sender": message.sender.email,
                    "text": message.text,
                    "is_read": message.is_read,
                    "created_at": message.created_at,
                }
                for message in messages
            ],
        })

    def patch(self, request, conversation_id):
        from messaging.models import Conversation

        try:
            conversation = Conversation.objects.get(
                id=conversation_id
            )
        except Conversation.DoesNotExist:
            return Response(
                {"detail": "Conversation not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        new_status = request.data.get("status")

        if new_status not in [
            Conversation.Status.ACTIVE,
            Conversation.Status.ENDED,
            Conversation.Status.BLOCKED,
        ]:
            return Response(
                {"detail": "Invalid conversation status."},
                status=status.HTTP_400_BAD_REQUEST
            )

        conversation.status = new_status
        conversation.save()

        return Response({
            "detail": "Conversation status updated successfully.",
            "status": conversation.status,
        })

    # =========================================================
# ANALYTICS
# =========================================================

class AdminAnalyticsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        from django.db.models.functions import TruncMonth
        from booking.models import Booking
        from accounts.models import Review, Service

        # -------------------------------------------------
        # USER GROWTH
        # -------------------------------------------------

        user_growth = (
            User.objects
            .annotate(month=TruncMonth("date_joined"))
            .values("month")
            .annotate(users=models.Count("id"))
            .order_by("month")
        )

        user_growth_data = []

        for item in user_growth:
            if item["month"]:
                user_growth_data.append({
                    "month": item["month"].strftime("%b %Y"),
                    "users": item["users"],
                })

        # -------------------------------------------------
        # BOOKING ACTIVITY
        # -------------------------------------------------

        booking_activity = (
            Booking.objects
            .annotate(month=TruncMonth("created_at"))
            .values("month")
            .annotate(bookings=models.Count("id"))
            .order_by("month")
        )

        booking_activity_data = []

        for item in booking_activity:
            if item["month"]:
                booking_activity_data.append({
                    "month": item["month"].strftime("%b %Y"),
                    "bookings": item["bookings"],
                })

        # -------------------------------------------------
        # BOOKING PERFORMANCE
        # -------------------------------------------------

        completed = Booking.objects.filter(
            status=Booking.Status.COMPLETED
        ).count()

        cancelled = Booking.objects.filter(
            status=Booking.Status.CANCELLED
        ).count()

        pending = Booking.objects.filter(
            status=Booking.Status.PENDING
        ).count()

        upcoming = Booking.objects.filter(
            status=Booking.Status.UPCOMING
        ).count()

        # -------------------------------------------------
        # SERVICE PERFORMANCE
        # -------------------------------------------------

        service_data = (
            Service.objects
            .annotate(
                booking_count=models.Count("bookings")
            )
            .order_by("-booking_count")[:10]
        )

        services = []

        for service in service_data:
            services.append({
                "service": service.name,
                "bookings": service.booking_count,
            })

        # -------------------------------------------------
        # CATEGORY PERFORMANCE
        # -------------------------------------------------

        category_data = (
            Booking.objects
            .values("worker__category")
            .annotate(
                bookings=models.Count("id")
            )
            .order_by("-bookings")
        )

        categories = []

        for item in category_data:
            categories.append({
                "category": item["worker__category"] or "Unknown",
                "bookings": item["bookings"],
            })

        # -------------------------------------------------
        # RATING DISTRIBUTION
        # -------------------------------------------------

        rating_data = (
            Review.objects
            .values("rating")
            .annotate(
                count=models.Count("id")
            )
            .order_by("rating")
        )

        ratings = []

        for item in rating_data:
            ratings.append({
                "rating": item["rating"],
                "count": item["count"],
            })

        # -------------------------------------------------
        # VERIFICATION
        # -------------------------------------------------

        total_workers = User.objects.filter(
            role=User.Role.WORKER
        ).count()

        fully_verified_workers = WorkerProfile.objects.filter(
            is_identity_verified=True,
            is_police_verified=True,
            is_certificate_verified=True,
        ).count()

        pending_verification = max(
            total_workers - fully_verified_workers,
            0
        )

        # -------------------------------------------------
        # SUMMARY
        # -------------------------------------------------

        total_users = User.objects.count()
        total_bookings = Booking.objects.count()
        total_reviews = Review.objects.count()

        average_rating = 0

        if total_reviews > 0:
            rating_average = Review.objects.aggregate(
                average=models.Avg("rating")
            )

            average_rating = round(
                rating_average["average"] or 0,
                1
            )

        completion_rate = 0

        if total_bookings > 0:
            completion_rate = round(
                (completed / total_bookings) * 100,
                1
            )

        cancellation_rate = 0

        if total_bookings > 0:
            cancellation_rate = round(
                (cancelled / total_bookings) * 100,
                1
            )

        # -------------------------------------------------
        # RESPONSE
        # -------------------------------------------------

        return Response({
            "summary": {
                "totalUsers": total_users,
                "totalBookings": total_bookings,
                "totalReviews": total_reviews,
                "averageRating": average_rating,
                "completionRate": completion_rate,
                "cancellationRate": cancellation_rate,
            },

            "userGrowth": user_growth_data,

            "bookingActivity": booking_activity_data,

            "bookingPerformance": {
                "completed": completed,
                "cancelled": cancelled,
                "pending": pending,
                "upcoming": upcoming,
            },

            "services": services,

            "categories": categories,

            "ratings": ratings,

            "verification": {
                "verified": fully_verified_workers,
                "pending": pending_verification,
                "totalWorkers": total_workers,
            },
        })

    # =========================================================
# ADMIN SETTINGS
# =========================================================

class AdminSettingsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response({
            "platformName": "WorkBridge",
            "maintenanceMode": False,
            "allowRegistrations": True,
            "allowBookings": True,
            "allowReviews": True,
        })

    def patch(self, request):
        allowed_fields = {
            "platformName",
            "maintenanceMode",
            "allowRegistrations",
            "allowBookings",
            "allowReviews",
        }

        invalid_fields = set(request.data.keys()) - allowed_fields

        if invalid_fields:
            return Response(
                {
                    "detail": "These settings cannot be changed.",
                    "fields": list(invalid_fields),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response({
            "detail": "Settings updated successfully.",
            **request.data,
        })

    # =========================================================
# PUBLIC LANDING PAGE STATISTICS
# =========================================================

class PublicStatsView(APIView):
    permission_classes = []

    def get(self, request):
        from booking.models import Booking

        total_workers = User.objects.filter(
            role=User.Role.WORKER
        ).count()

        total_customers = User.objects.filter(
            role=User.Role.CUSTOMER
        ).count()

        verified_workers = WorkerProfile.objects.filter(
            user__role=User.Role.WORKER,
            is_identity_verified=True
        ).count()

        completed_services = Booking.objects.filter(
            status=Booking.Status.COMPLETED
        ).count()

        return Response({
            "workers": total_workers,
            "customers": total_customers,
            "completedServices": completed_services,
            "verifiedWorkers": verified_workers,
        })

    # =========================================================
# PUBLIC LANDING PAGE TESTIMONIALS
# =========================================================

class PublicTestimonialsView(APIView):
    permission_classes = []

    def get(self, request):
        from accounts.models import Review

        reviews = (
            Review.objects
            .select_related("customer", "worker", "worker__user")
            .order_by("-created_at")[:3]
        )

        results = []

        for review in reviews:
            customer_name = (
                review.customer.get_full_name()
                or review.customer.email.split("@")[0]
            )

            worker_name = (
                review.worker.user.get_full_name()
                or review.worker.user.email.split("@")[0]
            )

            results.append({
                "id": review.id,
                "name": customer_name,
                "role": f"Customer · {review.worker.city}",
                "text": review.comment,
                "rating": review.rating,
                "worker": worker_name,
                "createdAt": review.created_at,
            })

        return Response(results)