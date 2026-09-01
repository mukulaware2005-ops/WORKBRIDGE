from django.conf import settings
from django.core import signing
from django.core.mail import send_mail
from django.shortcuts import get_object_or_404
from django.db.models import Q, Avg

from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from rest_framework_simplejwt.tokens import RefreshToken, TokenError

from .models import User, WorkerProfile, Service, Review

from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    WorkerProfileSerializer,
    ServiceSerializer,
    ReviewSerializer,
)


# =========================================================
# REGISTER
# =========================================================

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()

        token = signing.dumps(
            user.email,
            salt="workbridge-email-verification"
        )

        verification_url = (
            f"http://127.0.0.1:8000/api/auth/verify-email/{token}/"
        )

        send_mail(
            subject="Verify your WorkBridge email",
            message=(
                f"Hello,\n\n"
                f"Please verify your WorkBridge account by opening this link:\n\n"
                f"{verification_url}\n\n"
                f"This link will expire in 24 hours.\n\n"
                f"WorkBridge Team"
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
        )


# =========================================================
# LOGIN
# =========================================================

class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        user = serializer.validated_data["user"]

        if not user.is_email_verified:
            return Response(
                {
                    "error":
                    "Please verify your email before logging in."
                },
                status=400
            )

        refresh = RefreshToken.for_user(user)

        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        })


# =========================================================
# USER PROFILE
# =========================================================

class ProfileView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        return Response({
            "id": user.id,
            "email": user.email,
            "role": user.role,
        })


# =========================================================
# WORKER PROFILE
# =========================================================

class WorkerProfileView(generics.GenericAPIView):
    serializer_class = WorkerProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_profile(self, request):
        try:
            return WorkerProfile.objects.get(
                user=request.user
            )
        except WorkerProfile.DoesNotExist:
            return None

    def get(self, request):
        if request.user.role != "WORKER":
            return Response(
                {
                    "error":
                    "Only workers can access a worker profile."
                },
                status=403
            )

        profile = self.get_profile(request)

        if profile is None:
            return Response(
                {
                    "error":
                    "Worker profile does not exist."
                },
                status=404
            )

        serializer = self.get_serializer(
            profile
        )

        return Response(
            serializer.data
        )

    def post(self, request):
        if request.user.role != "WORKER":
            return Response(
                {
                    "error":
                    "Only workers can create a worker profile."
                },
                status=403
            )

        if WorkerProfile.objects.filter(
            user=request.user
        ).exists():
            return Response(
                {
                    "error":
                    "Worker profile already exists."
                },
                status=400
            )

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        profile = serializer.save(
            user=request.user
        )

        return Response(
            self.get_serializer(profile).data,
            status=201
        )

    def put(self, request):
        if request.user.role != "WORKER":
            return Response(
                {
                    "error":
                    "Only workers can update a worker profile."
                },
                status=403
            )

        profile = self.get_profile(request)

        if profile is None:
            return Response(
                {
                    "error":
                    "Worker profile does not exist."
                },
                status=404
            )

        serializer = self.get_serializer(
            profile,
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        profile = serializer.save()

        return Response(
            self.get_serializer(profile).data,
            status=200
        )

    def patch(self, request):
        if request.user.role != "WORKER":
            return Response(
                {
                    "error":
                    "Only workers can update a worker profile."
                },
                status=403
            )

        profile = self.get_profile(request)

        if profile is None:
            return Response(
                {
                    "error":
                    "Worker profile does not exist."
                },
                status=404
            )

        serializer = self.get_serializer(
            profile,
            data=request.data,
            partial=True
        )

        serializer.is_valid(
            raise_exception=True
        )

        profile = serializer.save()

        return Response(
            self.get_serializer(profile).data,
            status=200
        )




# =========================================================
# PUBLIC WORKER LIST + SEARCH + FILTERS
# =========================================================

class WorkerListView(generics.GenericAPIView):
    serializer_class = WorkerProfileSerializer
    permission_classes = [AllowAny]

    def get(self, request):
        workers = WorkerProfile.objects.all()

        category = request.query_params.get("category")
        city = request.query_params.get("city")
        skill = request.query_params.get("skill")
        max_price = request.query_params.get("max_price")
        emergency = request.query_params.get("emergency")
        query = request.query_params.get("query")

        if category:
            workers = workers.filter(
                category__iexact=category
            )

        if city:
            workers = workers.filter(
                city__iexact=city
            )

        if skill:
            workers = workers.filter(
                skills__name__icontains=skill
            )

        if max_price:
            workers = workers.filter(
                starting_price__lte=max_price
            )

        if emergency == "true":
            workers = workers.filter(
                emergency_available=True
            )

        if query:
            workers = workers.filter(
                Q(title__icontains=query) |
                Q(category__icontains=query) |
                Q(about__icontains=query) |
                Q(skills__name__icontains=query)
            )

        workers = workers.distinct()

        serializer = self.get_serializer(
            workers,
            many=True
        )

        return Response(serializer.data)





# =========================================================
# PUBLIC SINGLE WORKER PROFILE
# =========================================================

class WorkerDetailView(generics.GenericAPIView):
    serializer_class = WorkerProfileSerializer
    permission_classes = [AllowAny]

    def get(self, request, worker_id):
        try:
            worker = WorkerProfile.objects.get(
                id=worker_id
            )
        except WorkerProfile.DoesNotExist:
            return Response(
                {
                    "error":
                    "Worker profile does not exist."
                },
                status=404
            )

        worker_data = self.get_serializer(
            worker
        ).data

        services = Service.objects.filter(
            worker=worker,
            is_active=True
        )

        service_data = ServiceSerializer(
            services,
            many=True
        ).data


        reviews = Review.objects.filter(
        worker=worker
    )

        review_data = ReviewSerializer(
            reviews,
            many=True
        ).data

        average_rating = reviews.aggregate(
            average=Avg("rating")
        )["average"]

        return Response({
        "worker": worker_data,
        "services": service_data,

        "rating":
            round(average_rating, 1)
            if average_rating is not None
            else 0,

        "reviews_count":
            reviews.count(),

        "reviews":
            review_data,
        })





# =========================================================
# REVIEWS - LIST + CREATE
# =========================================================

class ReviewListCreateView(generics.GenericAPIView):
    serializer_class = ReviewSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated()]

        return [AllowAny()]

    def get_worker(self, worker_id):
        try:
            return WorkerProfile.objects.get(
                id=worker_id
            )
        except WorkerProfile.DoesNotExist:
            return None

    def get(self, request, worker_id):
        worker = self.get_worker(worker_id)

        if worker is None:
            return Response(
                {
                    "error":
                    "Worker profile does not exist."
                },
                status=404
            )

        reviews = Review.objects.filter(
            worker=worker
        )

        serializer = self.get_serializer(
            reviews,
            many=True
        )

        average_rating = reviews.aggregate(
            average=Avg("rating")
        )["average"]

        return Response({
            "average_rating":
                round(average_rating, 1)
                if average_rating is not None
                else 0,

            "reviews_count":
                reviews.count(),

            "reviews":
                serializer.data,
        })

    def post(self, request, worker_id):
        if request.user.role != "CUSTOMER":
            return Response(
                {
                    "error":
                    "Only customers can review workers."
                },
                status=403
            )

        worker = self.get_worker(worker_id)

        if worker is None:
            return Response(
                {
                    "error":
                    "Worker profile does not exist."
                },
                status=404
            )

        if Review.objects.filter(
            worker=worker,
            customer=request.user
        ).exists():
            return Response(
                {
                    "error":
                    "You have already reviewed this worker."
                },
                status=400
            )

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        review = serializer.save(
            worker=worker,
            customer=request.user
        )

        return Response(
            self.get_serializer(review).data,
            status=201
        )




# =========================================================
# SERVICES - LIST + CREATE
# =========================================================

class ServiceListCreateView(generics.GenericAPIView):
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]

    def get_worker_profile(self, request):
        try:
            return WorkerProfile.objects.get(
                user=request.user
            )
        except WorkerProfile.DoesNotExist:
            return None

    def get(self, request):
        if request.user.role != "WORKER":
            return Response(
                {
                    "error":
                    "Only workers can access services."
                },
                status=403
            )

        profile = self.get_worker_profile(
            request
        )

        if profile is None:
            return Response(
                {
                    "error":
                    "Worker profile does not exist."
                },
                status=404
            )

        services = Service.objects.filter(
            worker=profile
        ).order_by("-created_at")

        serializer = self.get_serializer(
            services,
            many=True
        )

        return Response(
            serializer.data
        )

    def post(self, request):
        if request.user.role != "WORKER":
            return Response(
                {
                    "error":
                    "Only workers can create services."
                },
                status=403
            )

        profile = self.get_worker_profile(
            request
        )

        if profile is None:
            return Response(
                {
                    "error":
                    "Worker profile does not exist."
                },
                status=404
            )

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        service = serializer.save(
            worker=profile
        )

        return Response(
            self.get_serializer(service).data,
            status=201
        )


# =========================================================
# SERVICE - UPDATE + DELETE
# =========================================================

class ServiceDetailView(generics.GenericAPIView):
    serializer_class = ServiceSerializer
    permission_classes = [IsAuthenticated]

    def get_service(self, request, service_id):
        try:
            return Service.objects.get(
                id=service_id,
                worker__user=request.user
            )
        except Service.DoesNotExist:
            return None

    def get(self, request, service_id):
        if request.user.role != "WORKER":
            return Response(
                {
                    "error":
                    "Only workers can access services."
                },
                status=403
            )

        service = self.get_service(
            request,
            service_id
        )

        if service is None:
            return Response(
                {
                    "error":
                    "Service does not exist."
                },
                status=404
            )

        return Response(
            self.get_serializer(service).data
        )

    def put(self, request, service_id):
        if request.user.role != "WORKER":
            return Response(
                {
                    "error":
                    "Only workers can update services."
                },
                status=403
            )

        service = self.get_service(
            request,
            service_id
        )

        if service is None:
            return Response(
                {
                    "error":
                    "Service does not exist."
                },
                status=404
            )

        serializer = self.get_serializer(
            service,
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        service = serializer.save()

        return Response(
            self.get_serializer(service).data
        )

    def patch(self, request, service_id):
        if request.user.role != "WORKER":
            return Response(
                {
                    "error":
                    "Only workers can update services."
                },
                status=403
            )

        service = self.get_service(
            request,
            service_id
        )

        if service is None:
            return Response(
                {
                    "error":
                    "Service does not exist."
                },
                status=404
            )

        serializer = self.get_serializer(
            service,
            data=request.data,
            partial=True
        )

        serializer.is_valid(
            raise_exception=True
        )

        service = serializer.save()

        return Response(
            self.get_serializer(service).data
        )

    def delete(self, request, service_id):
        if request.user.role != "WORKER":
            return Response(
                {
                    "error":
                    "Only workers can delete services."
                },
                status=403
            )

        service = self.get_service(
            request,
            service_id
        )

        if service is None:
            return Response(
                {
                    "error":
                    "Service does not exist."
                },
                status=404
            )

        service.delete()

        return Response(
            {
                "message":
                "Service deleted successfully."
            },
            status=200
        )


# =========================================================
# LOGOUT
# =========================================================

class LogoutView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get(
            "refresh"
        )

        if not refresh_token:
            return Response(
                {
                    "error":
                    "Refresh token is required."
                },
                status=400
            )

        try:
            token = RefreshToken(
                refresh_token
            )

            token.blacklist()

            return Response(
                {
                    "message":
                    "Logout successful."
                },
                status=200
            )

        except TokenError:
            return Response(
                {
                    "error":
                    "Invalid or expired refresh token."
                },
                status=400
            )


# =========================================================
# VERIFY EMAIL
# =========================================================

class VerifyEmailView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def get(self, request, token):
        try:
            email = signing.loads(
                token,
                salt="workbridge-email-verification",
                max_age=60 * 60 * 24
            )

            user = get_object_or_404(
                User,
                email=email
            )

            if user.is_email_verified:
                return Response({
                    "message":
                    "Email is already verified."
                })

            user.is_email_verified = True

            user.save(
                update_fields=[
                    "is_email_verified"
                ]
            )

            return Response({
                "message":
                "Email verified successfully."
            })

        except signing.SignatureExpired:
            return Response(
                {
                    "error":
                    "Verification link has expired."
                },
                status=400
            )

        except signing.BadSignature:
            return Response(
                {
                    "error":
                    "Invalid verification link."
                },
                status=400
            )


# =========================================================
# FORGOT PASSWORD
# =========================================================

class ForgotPasswordView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get(
            "email"
        )

        if not email:
            return Response(
                {
                    "error":
                    "Email is required."
                },
                status=400
            )

        try:
            user = User.objects.get(
                email=email
            )

        except User.DoesNotExist:
            return Response(
                {
                    "message":
                    "If this email exists, a password reset link has been sent."
                },
                status=200
            )

        token = signing.dumps(
            user.email,
            salt="workbridge-password-reset"
        )

        reset_url = (
            f"http://127.0.0.1:8000/api/auth/reset-password/{token}/"
        )

        send_mail(
            subject=
            "Reset your WorkBridge password",

            message=(
                f"Hello,\n\n"
                f"You requested to reset your WorkBridge password.\n\n"
                f"Open this link to reset your password:\n\n"
                f"{reset_url}\n\n"
                f"This link will expire in 1 hour.\n\n"
                f"If you did not request this, you can ignore this email.\n\n"
                f"WorkBridge Team"
            ),

            from_email=
            settings.DEFAULT_FROM_EMAIL,

            recipient_list=[
                user.email
            ],
        )

        return Response(
            {
                "message":
                "If this email exists, a password reset link has been sent."
            },
            status=200
        )


# =========================================================
# RESET PASSWORD
# =========================================================

class ResetPasswordView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request, token):
        new_password = request.data.get(
            "password"
        )

        if not new_password:
            return Response(
                {
                    "error":
                    "Password is required."
                },
                status=400
            )

        try:
            email = signing.loads(
                token,
                salt="workbridge-password-reset",
                max_age=60 * 60
            )

            user = get_object_or_404(
                User,
                email=email
            )

            user.set_password(
                new_password
            )

            user.save(
                update_fields=[
                    "password"
                ]
            )

            return Response({
                "message":
                "Password reset successfully."
            })

        except signing.SignatureExpired:
            return Response(
                {
                    "error":
                    "Reset link has expired."
                },
                status=400
            )

        except signing.BadSignature:
            return Response(
                {
                    "error":
                    "Invalid reset link."
                },
                status=400
            )