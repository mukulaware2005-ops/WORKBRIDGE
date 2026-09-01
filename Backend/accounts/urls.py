from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView,
    LoginView,
    ProfileView,
    WorkerProfileView,
    WorkerListView,
    WorkerDetailView,
    ServiceListCreateView,
    ServiceDetailView,
    ReviewListCreateView,
    LogoutView,
    VerifyEmailView,
    ForgotPasswordView,
    ResetPasswordView,
)


urlpatterns = [
    # =========================
    # Authentication
    # =========================
    path(
        "register/",
        RegisterView.as_view(),
        name="register",
    ),

    path(
        "login/",
        LoginView.as_view(),
        name="login",
    ),

    path(
        "refresh/",
        TokenRefreshView.as_view(),
        name="token_refresh",
    ),

    path(
        "logout/",
        LogoutView.as_view(),
        name="logout",
    ),


    # =========================
    # User Profile
    # =========================
    path(
        "profile/",
        ProfileView.as_view(),
        name="profile",
    ),


    # =========================
    # Worker Profile
    # =========================
    path(
        "worker/profile/",
        WorkerProfileView.as_view(),
        name="worker_profile",
    ),


    path(
    "workers/",
    WorkerListView.as_view(),
    name="worker_list",
    ),


    path(
    "workers/<int:worker_id>/",
    WorkerDetailView.as_view(),
    name="worker_detail",
    ),


    # =========================
    # Reviews
    # =========================

    path(
        "workers/<int:worker_id>/reviews/",
        ReviewListCreateView.as_view(),
        name="worker_reviews",
    ),


    # =========================
    # Services
    # =========================
    path(
        "services/",
        ServiceListCreateView.as_view(),
        name="service_list_create",
    ),

    path(
        "services/<int:service_id>/",
        ServiceDetailView.as_view(),
        name="service_detail",
    ),


    # =========================
    # Email Verification
    # =========================
    path(
        "verify-email/<str:token>/",
        VerifyEmailView.as_view(),
        name="verify_email",
    ),


    # =========================
    # Password Recovery
    # =========================
    path(
        "forgot-password/",
        ForgotPasswordView.as_view(),
        name="forgot_password",
    ),

    path(
        "reset-password/<str:token>/",
        ResetPasswordView.as_view(),
        name="reset_password",
    ),
]