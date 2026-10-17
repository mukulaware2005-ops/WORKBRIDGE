from django.urls import path

from .views import (
    PublicStatsView,
    PublicTestimonialsView,
    AdminStatsView,
    AdminUserListView,
    AdminUserDetailView,
    AdminCustomerListView,
    AdminCustomerDetailView,
    AdminWorkerListView,
    AdminWorkerDetailView,
    AdminBookingListView,
    AdminBookingDetailView,
    AdminReportsView,
    AdminVerificationListView,
    AdminVerificationDetailView,
    AdminReviewListView,
    AdminReviewDetailView,
    AdminCommunityListView,
    AdminCommunityDetailView,
    AdminAnalyticsView,
    AdminSettingsView,
)


urlpatterns = [

    path(
    "public-testimonials/",
    PublicTestimonialsView.as_view(),
    name="public-testimonials"
    ),

    path(
    "public-stats/",
    PublicStatsView.as_view(),
    name="public-stats"
    ),

    path(
        "stats/",
        AdminStatsView.as_view(),
        name="admin-stats"
    ),

    # User Management
    path(
        "users/",
        AdminUserListView.as_view(),
        name="admin-users"
    ),
    path(
        "users/<int:user_id>/",
        AdminUserDetailView.as_view(),
        name="admin-user-detail"
    ),
    # Customer Management
    path(
        "customers/",
        AdminCustomerListView.as_view(),
        name="admin-customers"
    ),
    path(
        "customers/<int:customer_id>/",
        AdminCustomerDetailView.as_view(),
        name="admin-customer-detail"
    ),
    # Worker Management
    path(
        "workers/",
        AdminWorkerListView.as_view(),
        name="admin-workers"
    ),
    path(
        "workers/<int:worker_id>/",
        AdminWorkerDetailView.as_view(),
        name="admin-worker-detail"
    ),

    # Booking Management
    path(
        "bookings/",
        AdminBookingListView.as_view(),
        name="admin-bookings"
    ),
    path(
        "bookings/<int:booking_id>/",
        AdminBookingDetailView.as_view(),
        name="admin-booking-detail"
    ),

    path(
    "reports/",
    AdminReportsView.as_view(),
    name="admin-reports"
),

# Verification Management
path(
    "verification/",
    AdminVerificationListView.as_view(),
    name="admin-verification",
),
path(
    "verification/<int:worker_id>/",
    AdminVerificationDetailView.as_view(),
    name="admin-verification-detail",
),

# Review Management
path(
    "reviews/",
    AdminReviewListView.as_view(),
    name="admin-reviews",
),
path(
    "reviews/<int:review_id>/",
    AdminReviewDetailView.as_view(),
    name="admin-review-detail",
),
# Community Management
path(
    "community/",
    AdminCommunityListView.as_view(),
    name="admin-community",
),
path(
    "community/<int:conversation_id>/",
    AdminCommunityDetailView.as_view(),
    name="admin-community-detail",
),

path(
    "analytics/",
    AdminAnalyticsView.as_view(),
    name="admin-analytics"
),
path(
    "settings/",
    AdminSettingsView.as_view(),
    name="admin-settings",
),
]