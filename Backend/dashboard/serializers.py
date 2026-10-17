from rest_framework import serializers

from accounts.models import User, WorkerProfile, Review
from booking.models import Booking


# =========================================================
# USER MANAGEMENT
# =========================================================

class AdminUserSerializer(serializers.ModelSerializer):

    worker_profile_id = serializers.SerializerMethodField()
    booking_count = serializers.SerializerMethodField()

    class Meta:
        model = User

        fields = [
            "id",
            "email",
            "role",
            "is_active",
            "is_email_verified",
            "is_staff",
            "is_superuser",
            "date_joined",
            "last_login",
            "worker_profile_id",
            "booking_count",
        ]

        read_only_fields = [
            "id",
            "email",
            "role",
            "is_email_verified",
            "is_staff",
            "is_superuser",
            "date_joined",
            "last_login",
            "worker_profile_id",
            "booking_count",
        ]

    def get_worker_profile_id(self, obj):
        try:
            return obj.worker_profile.id
        except WorkerProfile.DoesNotExist:
            return None

    def get_booking_count(self, obj):
        return Booking.objects.filter(
            customer=obj
        ).count()


# =========================================================
# WORKER MANAGEMENT
# =========================================================

class AdminWorkerSerializer(serializers.ModelSerializer):

    user_id = serializers.IntegerField(
        source="id",
        read_only=True
    )

    email = serializers.EmailField(
        read_only=True
    )

    worker_profile_id = serializers.SerializerMethodField()

    title = serializers.SerializerMethodField()
    category = serializers.SerializerMethodField()
    experience_years = serializers.SerializerMethodField()
    about = serializers.SerializerMethodField()
    city = serializers.SerializerMethodField()
    area = serializers.SerializerMethodField()
    languages = serializers.SerializerMethodField()
    skills = serializers.SerializerMethodField()
    gender = serializers.SerializerMethodField()

    starting_price = serializers.SerializerMethodField()
    hourly_rate = serializers.SerializerMethodField()
    emergency_charge = serializers.SerializerMethodField()
    emergency_available = serializers.SerializerMethodField()

    working_days = serializers.SerializerMethodField()
    working_hours = serializers.SerializerMethodField()

    is_identity_verified = serializers.SerializerMethodField()
    is_police_verified = serializers.SerializerMethodField()

    reviews_count = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    bookings_count = serializers.SerializerMethodField()

    class Meta:
        model = User

        fields = [
            "user_id",
            "email",
            "is_active",
            "is_email_verified",

            "worker_profile_id",

            "title",
            "category",
            "experience_years",
            "about",
            "city",
            "area",
            "languages",
            "skills",
            "gender",

            "starting_price",
            "hourly_rate",
            "emergency_charge",
            "emergency_available",

            "working_days",
            "working_hours",

            "is_identity_verified",
            "is_police_verified",

            "reviews_count",
            "average_rating",
            "bookings_count",
        ]

        read_only_fields = [
            "user_id",
            "email",
            "is_email_verified",
            "worker_profile_id",

            "title",
            "category",
            "experience_years",
            "about",
            "city",
            "area",
            "languages",
            "skills",
            "gender",

            "starting_price",
            "hourly_rate",
            "emergency_charge",
            "emergency_available",

            "working_days",
            "working_hours",

            "is_identity_verified",
            "is_police_verified",

            "reviews_count",
            "average_rating",
            "bookings_count",
        ]

    # =====================================================
    # PROFILE
    # =====================================================

    def get_profile(self, obj):
        try:
            return obj.worker_profile
        except WorkerProfile.DoesNotExist:
            return None

    def get_worker_profile_id(self, obj):
        profile = self.get_profile(obj)

        if profile:
            return profile.id

        return None

    # =====================================================
    # BASIC INFORMATION
    # =====================================================

    def get_title(self, obj):
        profile = self.get_profile(obj)

        if profile:
            return profile.title

        return None

    def get_category(self, obj):
        profile = self.get_profile(obj)

        if profile:
            return profile.category

        return None

    def get_experience_years(self, obj):
        profile = self.get_profile(obj)

        if profile:
            return profile.experience_years

        return 0

    def get_about(self, obj):
        profile = self.get_profile(obj)

        if profile:
            return profile.about

        return None

    def get_city(self, obj):
        profile = self.get_profile(obj)

        if profile:
            return profile.city

        return None

    def get_area(self, obj):
        profile = self.get_profile(obj)

        if profile:
            return profile.area

        return None

    def get_languages(self, obj):
        profile = self.get_profile(obj)

        if profile:
            return profile.languages

        return []

    def get_skills(self, obj):
        profile = self.get_profile(obj)

        if not profile:
            return []

        return list(
            profile.skills.values_list(
                "name",
                flat=True
            )
        )

    def get_gender(self, obj):
        profile = self.get_profile(obj)

        if profile:
            return profile.gender

        return None

    # =====================================================
    # PRICING
    # =====================================================

    def get_starting_price(self, obj):
        profile = self.get_profile(obj)

        if profile:
            return profile.starting_price

        return None

    def get_hourly_rate(self, obj):
        profile = self.get_profile(obj)

        if profile:
            return profile.hourly_rate

        return None

    def get_emergency_charge(self, obj):
        profile = self.get_profile(obj)

        if profile:
            return profile.emergency_charge

        return None

    def get_emergency_available(self, obj):
        profile = self.get_profile(obj)

        if profile:
            return profile.emergency_available

        return False

    # =====================================================
    # WORKING SCHEDULE
    # =====================================================

    def get_working_days(self, obj):
        profile = self.get_profile(obj)

        if profile:
            return profile.working_days

        return []

    def get_working_hours(self, obj):
        profile = self.get_profile(obj)

        if profile:
            return profile.working_hours

        return ""

    # =====================================================
    # VERIFICATION
    # =====================================================

    def get_is_identity_verified(self, obj):
        profile = self.get_profile(obj)

        if profile:
            return profile.is_identity_verified

        return False

    def get_is_police_verified(self, obj):
        profile = self.get_profile(obj)

        if profile:
            return profile.is_police_verified

        return False

    # =====================================================
    # REVIEWS
    # =====================================================

    def get_reviews_count(self, obj):
        profile = self.get_profile(obj)

        if not profile:
            return 0

        return Review.objects.filter(
            worker=profile
        ).count()

    def get_average_rating(self, obj):
        profile = self.get_profile(obj)

        if not profile:
            return 0

        reviews = Review.objects.filter(
            worker=profile
        )

        if not reviews.exists():
            return 0

        total = sum(
            review.rating
            for review in reviews
        )

        return round(
            total / reviews.count(),
            1
        )

    # =====================================================
    # BOOKINGS
    # =====================================================

    def get_bookings_count(self, obj):
        profile = self.get_profile(obj)

        if not profile:
            return 0

        return Booking.objects.filter(
            worker=profile
        ).count()

    # =========================================================
# BOOKING MANAGEMENT
# =========================================================

class AdminBookingSerializer(serializers.ModelSerializer):

    customer_email = serializers.EmailField(
        source="customer.email",
        read_only=True
    )

    worker_email = serializers.EmailField(
        source="worker.user.email",
        read_only=True
    )

    worker_name = serializers.CharField(
        source="worker.title",
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
            "customer_email",

            "worker",
            "worker_email",
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
            "customer_email",
            "worker",
            "worker_email",
            "worker_name",
            "service",
            "service_name",
            "date",
            "time",
            "location",
            "message",
            "price",
            "created_at",
            "updated_at",
        ]