
from django.contrib.auth import authenticate
from rest_framework import serializers
from django.db.models import Avg

from .models import User, WorkerProfile, Skill, Service, Review


# =========================================================
# REGISTER
# =========================================================

class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    class Meta:
        model = User
        fields = [
            "email",
            "password",
            "role",
        ]

    def create(self, validated_data):
        return User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
            role=validated_data["role"],
        )


# =========================================================
# LOGIN
# =========================================================

class LoginSerializer(serializers.Serializer):

    email = serializers.EmailField()

    password = serializers.CharField(
        write_only=True
    )

    def validate(self, attrs):

        email = attrs.get("email")
        password = attrs.get("password")

        user = authenticate(
            username=email,
            password=password
        )

        if not user:
            raise serializers.ValidationError(
                "Invalid email or password."
            )

        if not user.is_active:
            raise serializers.ValidationError(
                "User account is inactive."
            )

        attrs["user"] = user

        return attrs


# =========================================================
# USER / PROFILE
# =========================================================

class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User

        fields = [
            "id",
            "email",
            "role",
            "is_email_verified",
            "is_staff",
            "is_superuser",
            "address",
            "latitude",
            "longitude",
        ]

        read_only_fields = [
            "id",
            "email",
            "role",
            "is_email_verified",
            "is_staff",
            "is_superuser",
        ]


# =========================================================
# SKILL
# =========================================================

class SkillSerializer(serializers.ModelSerializer):

    class Meta:
        model = Skill

        fields = [
            "id",
            "name",
        ]


# =========================================================
# SERVICE
# =========================================================

class ServiceSerializer(serializers.ModelSerializer):

    class Meta:
        model = Service

        fields = [
            "id",
            "worker",
            "name",
            "description",
            "price",
            "duration_minutes",
            "is_emergency_available",
            "is_active",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "worker",
            "created_at",
            "updated_at",
        ]


# =========================================================
# REVIEW
# =========================================================

class ReviewSerializer(serializers.ModelSerializer):

    customer_email = serializers.EmailField(
        source="customer.email",
        read_only=True,
    )

    rating = serializers.IntegerField(
        min_value=1,
        max_value=5,
    )

    class Meta:
        model = Review

        fields = [
            "id",
            "worker",
            "customer",
            "customer_email",
            "rating",
            "comment",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "worker",
            "customer",
            "customer_email",
            "created_at",
            "updated_at",
        ]


# =========================================================
# WORKER PROFILE
# =========================================================

class WorkerProfileSerializer(serializers.ModelSerializer):

    skills = serializers.ListField(
        child=serializers.CharField(
            max_length=100
        ),
        required=False,
        write_only=True,
    )

    email = serializers.EmailField(
        source="user.email",
        read_only=True,
    )

    rating = serializers.SerializerMethodField()

    reviews_count = serializers.SerializerMethodField()

    recommended = serializers.SerializerMethodField()

    class Meta:
        model = WorkerProfile

        fields = [
            "id",
            "user",
            "email",

            # Worker profile image
            "profile_image",

            "title",
            "category",
            "experience_years",
            "about",

            "city",
            "area",

            # Location
            "latitude",
            "longitude",

            "languages",
            "skills",
            "gender",

            "starting_price",
            "hourly_rate",
            "emergency_charge",
            "emergency_available",

            "working_days",
            "working_hours",

            "rating",
            "reviews_count",
            "recommended",

            "is_premium",
            "is_featured",
            "is_identity_verified",
            "is_police_verified",
            "is_certificate_verified",
            "is_phone_verified",

            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "user",

            "is_premium",
            "is_featured",
            "is_identity_verified",
            "is_police_verified",
            "is_certificate_verified",
            "is_phone_verified",

            "created_at",
            "updated_at",
        ]

    # -----------------------------------------------------
    # RATING
    # -----------------------------------------------------

    def get_rating(self, obj):

        average = obj.reviews.aggregate(
            average=Avg("rating")
        )["average"]

        if average is None:
            return 0

        return round(average, 1)

    # -----------------------------------------------------
    # REVIEWS COUNT
    # -----------------------------------------------------

    def get_reviews_count(self, obj):
        return obj.reviews.count()

    # -----------------------------------------------------
    # RECOMMENDED
    # -----------------------------------------------------

    def get_recommended(self, obj):

        recommended_worker_ids = self.context.get(
            "recommended_worker_ids",
            []
        )

        return obj.id in recommended_worker_ids

    # -----------------------------------------------------
    # CREATE
    # -----------------------------------------------------

    def create(self, validated_data):

        skills_data = validated_data.pop(
            "skills",
            []
        )

        profile = WorkerProfile.objects.create(
            **validated_data
        )

        self._set_skills(
            profile,
            skills_data
        )

        return profile

    # -----------------------------------------------------
    # UPDATE
    # -----------------------------------------------------

    def update(self, instance, validated_data):

        skills_data = validated_data.pop(
            "skills",
            None
        )

        for attr, value in validated_data.items():
            setattr(
                instance,
                attr,
                value
            )

        instance.save()

        if skills_data is not None:
            self._set_skills(
                instance,
                skills_data
            )

        return instance

    # -----------------------------------------------------
    # SET SKILLS
    # -----------------------------------------------------

    def _set_skills(
        self,
        profile,
        skills_data
    ):

        skills = []

        for skill_name in skills_data:

            skill_name = skill_name.strip()

            if not skill_name:
                continue

            skill = Skill.objects.filter(
                name__iexact=skill_name
            ).first()

            if skill is None:
                skill = Skill.objects.create(
                    name=skill_name
                )

            skills.append(skill)

        profile.skills.set(skills)

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    def to_representation(self, instance):

        data = super().to_representation(
            instance
        )

        data["skills"] = list(
            instance.skills.values_list(
                "name",
                flat=True,
            )
        )

        return data
