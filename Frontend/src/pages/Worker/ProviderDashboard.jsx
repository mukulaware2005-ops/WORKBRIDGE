import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  CheckCircle2,
  Star,
  Calendar,
  MapPin,
  Clock,
  LoaderCircle,
  Eye,
  MessageCircle,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useBookingSocket } from '../../hooks/useBookingSocket';

import * as bookingService from '../../services/bookingService';
import * as api from '../../api/api';

import { StatisticsCard } from '../../components/common/StatisticsCard';
import { EmptyState } from '../../components/common/States';
import { formatINR } from '../../utils/format';

export default function ProviderDashboard() {
  useDocumentTitle('Provider Dashboard');

  const { user } = useAuth();
  const { showToast } = useApp();

  const [profile, setProfile] = useState(null);

  const [pending, setPending] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [completed, setCompleted] = useState([]);

  const [loading, setLoading] = useState(true);

  /*
   * Load worker profile and real booking data.
   */
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const [
        profileData,
        pendingData,
        upcomingData,
        completedData,
      ] = await Promise.all([
        api.apiRequest(
          api.API_ENDPOINTS.workerProfile,
          {
            method: 'GET',
            endpointName: 'workerProfile',
          }
        ),

        bookingService.listBookings('pending'),

        bookingService.listBookings('upcoming'),

        bookingService.listBookings('completed'),
      ]);

      setProfile(profileData || null);

      setPending(
        Array.isArray(pendingData)
          ? pendingData
          : []
      );

      setUpcoming(
        Array.isArray(upcomingData)
          ? upcomingData
          : []
      );

      setCompleted(
        Array.isArray(completedData)
          ? completedData
          : []
      );
    } catch (error) {
      console.error(
        'Failed to load provider dashboard:',
        error
      );

      showToast(
        error.message ||
          'Failed to load dashboard data',
        'error'
      );
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  /*
   * Initial dashboard load.
   */
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  /*
   * Real-time booking updates.
   *
   * When a customer creates a booking or a booking
   * changes status, reload the real backend data.
   */
  useBookingSocket({
    onBookingUpdate: () => {
      loadDashboardData();
    },

    onNotification: (notification) => {
      showToast(
        notification.title ||
          'You have a new notification'
      );
    },
  });

  /*
   * Worker profile information.
   */
  const workerName =
    profile?.user?.name ||
    profile?.name ||
    user?.name ||
    'Professional';

  const workerTitle =
    profile?.title ||
    profile?.category ||
    'Professional';

  const rating =
    profile?.rating ??
    profile?.average_rating ??
    0;

  const reviewsCount =
    profile?.reviews_count ??
    profile?.reviewsCount ??
    0;

  /*
   * Booking information helpers.
   */
  const getCustomerName = (booking) => {
    return (
      booking.customer_name ||
      booking.customer_email ||
      'Customer'
    );
  };

  const getServiceName = (booking) => {
    return (
      booking.service_name ||
      'Service'
    );
  };

  /*
   * Booking card.
   */
  const BookingCard = ({ booking }) => {
    const customerName =
      getCustomerName(booking);

    const serviceName =
      getServiceName(booking);

    const initials = customerName
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    return (
      <div className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4">

        {/* AVATAR */}
        <div className="h-11 w-11 rounded-xl bg-navy-100 dark:bg-navy-800 flex items-center justify-center text-sm font-bold text-navy-600 dark:text-navy-200 shrink-0">
          {initials || 'C'}
        </div>

        {/* BOOKING INFORMATION */}
        <div className="min-w-0 flex-1">

          <div className="flex items-center gap-2 flex-wrap">

            <p className="text-sm font-semibold text-navy-900 dark:text-white truncate">
              {serviceName}
            </p>

            <span className="badge text-[11px] bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
              {booking.status}
            </span>

          </div>

          <p className="text-xs text-navy-400 mt-1 truncate">
            {customerName}
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-navy-500 dark:text-navy-400">

            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {booking.date}
            </span>

            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {booking.time}
            </span>

            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {booking.location}
            </span>

          </div>

        </div>

        {/* PRICE */}
        <div className="text-right shrink-0">

          <p className="font-bold text-navy-900 dark:text-white">
            {formatINR(booking.price)}
          </p>

        </div>

        {/* ACTIONS */}
        <div className="flex gap-2 shrink-0">

          {booking.worker && (
            <Link
              to="/bookings"
              className="btn-ghost h-9 w-9 p-0"
              aria-label="View booking"
            >
              <Eye className="h-4 w-4" />
            </Link>
          )}

          <Link
            to="/messages"
            className="btn-ghost h-9 w-9 p-0"
            aria-label="Messages"
          >
            <MessageCircle className="h-4 w-4" />
          </Link>

        </div>

      </div>
    );
  };

  return (
    <div className="space-y-6">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div>

        <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white">
          Welcome back,{' '}
          {workerName?.split(' ')[0] ||
            'Professional'}
        </h1>

        <p className="text-navy-500 dark:text-navy-400 mt-1">
          Here is your current WorkBridge activity.
        </p>

      </div>


      {/* ==================================================
          WORKER PROFILE
      ================================================== */}

      {profile && (
        <div className="card p-5">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

            <div>

              <h2 className="text-lg font-bold text-navy-900 dark:text-white">
                {workerName}
              </h2>

              <p className="text-sm text-navy-500 dark:text-navy-400 mt-1">
                {workerTitle}
              </p>

            </div>

            <div className="flex items-center gap-2">

              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />

              <span className="font-bold text-navy-900 dark:text-white">
                {Number(rating).toFixed(1)}
              </span>

              <span className="text-sm text-navy-400">
                ({reviewsCount} reviews)
              </span>

            </div>

          </div>

        </div>
      )}


      {/* ==================================================
          REAL STATISTICS
      ================================================== */}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">

        <StatisticsCard
          icon={ClipboardList}
          value={
            loading
              ? '...'
              : pending.length
          }
          label="Booking requests"
          accent="accent"
        />

        <StatisticsCard
          icon={Calendar}
          value={
            loading
              ? '...'
              : upcoming.length
          }
          label="Upcoming bookings"
          accent="primary"
        />

        <StatisticsCard
          icon={CheckCircle2}
          value={
            loading
              ? '...'
              : completed.length
          }
          label="Completed jobs"
          accent="secondary"
        />

        <StatisticsCard
          icon={Star}
          value={
            loading
              ? '...'
              : Number(rating).toFixed(1)
          }
          label="Average rating"
          accent="secondary"
        />

      </div>


      {/* ==================================================
          BOOKING REQUESTS
      ================================================== */}

      <div>

        <div className="flex items-center justify-between mb-3">

          <h2 className="font-semibold text-navy-900 dark:text-white">
            Booking requests
          </h2>

          <Link
            to="/bookings"
            className="text-sm font-semibold text-primary-600"
          >
            View all
          </Link>

        </div>

        {loading ? (

          <div className="card p-8 flex items-center justify-center">
            <LoaderCircle className="h-6 w-6 animate-spin text-primary-600" />
          </div>

        ) : pending.length === 0 ? (

          <EmptyState
            title="No booking requests"
            message="New customer booking requests will appear here."
          />

        ) : (

          <div className="space-y-3">

            {pending.slice(0, 3).map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
              />
            ))}

          </div>

        )}

      </div>


      {/* ==================================================
          UPCOMING BOOKINGS
      ================================================== */}

      <div>

        <div className="flex items-center justify-between mb-3">

          <h2 className="font-semibold text-navy-900 dark:text-white">
            Upcoming bookings
          </h2>

          <Link
            to="/bookings"
            className="text-sm font-semibold text-primary-600"
          >
            View all
          </Link>

        </div>

        {loading ? (

          <div className="card p-8 flex items-center justify-center">
            <LoaderCircle className="h-6 w-6 animate-spin text-primary-600" />
          </div>

        ) : upcoming.length === 0 ? (

          <EmptyState
            title="No upcoming bookings"
            message="Accepted bookings will appear here."
          />

        ) : (

          <div className="space-y-3">

            {upcoming.slice(0, 3).map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
              />
            ))}

          </div>

        )}

      </div>


      {/* ==================================================
          COMPLETED JOBS
      ================================================== */}

      {completed.length > 0 && (

        <div>

          <div className="flex items-center justify-between mb-3">

            <h2 className="font-semibold text-navy-900 dark:text-white">
              Recently completed
            </h2>

            <Link
              to="/bookings"
              className="text-sm font-semibold text-primary-600"
            >
              View all
            </Link>

          </div>

          <div className="space-y-3">

            {completed.slice(0, 3).map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
              />
            ))}

          </div>

        </div>

      )}

    </div>
  );
}