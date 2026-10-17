import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  LoaderCircle,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useBookingSocket } from '../../hooks/useBookingSocket';

import * as bookingService from '../../services/bookingService';

import { EmptyState } from '../../components/common/States';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/format';

function greeting() {
  const h = new Date().getHours();

  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';

  return 'Good evening';
}

export default function CustomerDashboard() {
  useDocumentTitle('Customer Dashboard');

  const { user } = useAuth();
  const { showToast } = useApp();

  const [upcoming, setUpcoming] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [cancelled, setCancelled] = useState([]);
  const [pending, setPending] = useState([]);

  const [loading, setLoading] = useState(true);

  /*
   * Load all real booking data belonging
   * to the logged-in customer.
   */
  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      const [
        upcomingData,
        completedData,
        cancelledData,
        pendingData,
      ] = await Promise.all([
        bookingService.listBookings('upcoming'),
        bookingService.listBookings('completed'),
        bookingService.listBookings('cancelled'),
        bookingService.listBookings('pending'),
      ]);

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

      setCancelled(
        Array.isArray(cancelledData)
          ? cancelledData
          : []
      );

      setPending(
        Array.isArray(pendingData)
          ? pendingData
          : []
      );
    } catch (error) {
      console.error(
        'Failed to load customer dashboard:',
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
   * Whenever Django broadcasts a booking event,
   * reload the dashboard data from the backend.
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
   * Get the worker name safely.
   */
  const getWorkerName = (booking) => {
    return (
      booking.worker_name ||
      booking.worker_email ||
      'Professional'
    );
  };

  /*
   * Get the service name safely.
   */
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
    const workerName =
      getWorkerName(booking);

    const serviceName =
      getServiceName(booking);

    const initials = workerName
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

    return (
      <div className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4">

        {/* AVATAR */}
        <div className="h-11 w-11 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-300 shrink-0">
          {initials || 'P'}
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
            {workerName}
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

        {/* VIEW */}
        {booking.worker && (
          <Link
            to={`/workers/${booking.worker}`}
            className="btn-ghost h-9 px-3 text-sm shrink-0"
          >
            View
          </Link>
        )}

      </div>
    );
  };

  return (
    <div className="space-y-8">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div>

        <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white">
          {greeting()},{' '}
          {user?.name?.split(' ')[0] || 'there'}!
        </h1>

        <p className="text-navy-500 dark:text-navy-400 mt-1">
          What service do you need today?
        </p>

        <Link
          to="/search"
          className="btn-primary mt-4 px-5 py-2.5 text-sm w-fit"
        >
          <Search className="h-4 w-4" />
          Find a Professional
        </Link>

      </div>


      {/* ==================================================
          REAL BOOKING SUMMARY
      ================================================== */}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

        {/* UPCOMING */}
        <div className="card p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-navy-500 dark:text-navy-400">
                Upcoming
              </p>

              <p className="text-2xl font-extrabold text-navy-900 dark:text-white mt-1">
                {loading ? (
                  <LoaderCircle className="h-6 w-6 animate-spin" />
                ) : (
                  upcoming.length
                )}
              </p>
            </div>

            <div className="h-10 w-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary-600" />
            </div>

          </div>

        </div>


        {/* PENDING */}
        <div className="card p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-navy-500 dark:text-navy-400">
                Pending
              </p>

              <p className="text-2xl font-extrabold text-navy-900 dark:text-white mt-1">
                {loading ? (
                  <LoaderCircle className="h-6 w-6 animate-spin" />
                ) : (
                  pending.length
                )}
              </p>
            </div>

            <div className="h-10 w-10 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>

          </div>

        </div>


        {/* COMPLETED */}
        <div className="card p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-navy-500 dark:text-navy-400">
                Completed
              </p>

              <p className="text-2xl font-extrabold text-navy-900 dark:text-white mt-1">
                {loading ? (
                  <LoaderCircle className="h-6 w-6 animate-spin" />
                ) : (
                  completed.length
                )}
              </p>
            </div>

            <div className="h-10 w-10 rounded-xl bg-secondary-50 dark:bg-secondary-900/20 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-secondary-600" />
            </div>

          </div>

        </div>


        {/* CANCELLED */}
        <div className="card p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-navy-500 dark:text-navy-400">
                Cancelled
              </p>

              <p className="text-2xl font-extrabold text-navy-900 dark:text-white mt-1">
                {loading ? (
                  <LoaderCircle className="h-6 w-6 animate-spin" />
                ) : (
                  cancelled.length
                )}
              </p>
            </div>

            <div className="h-10 w-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>

          </div>

        </div>

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
            message="Book a professional to see your upcoming services here."
            action={
              <Link
                to="/search"
                className="btn-primary px-4 py-2 text-sm"
              >
                Find a Professional
              </Link>
            }
          />

        ) : (

          <div className="space-y-3">

            {upcoming.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
              />
            ))}

          </div>

        )}

      </div>


      {/* ==================================================
          PENDING BOOKINGS
      ================================================== */}

      {pending.length > 0 && (

        <div>

          <div className="flex items-center justify-between mb-3">

            <h2 className="font-semibold text-navy-900 dark:text-white">
              Pending booking requests
            </h2>

            <Link
              to="/bookings"
              className="text-sm font-semibold text-primary-600"
            >
              View all
            </Link>

          </div>

          <div className="space-y-3">

            {pending.slice(0, 3).map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
              />
            ))}

          </div>

        </div>

      )}


      {/* ==================================================
          RECENT COMPLETED SERVICES
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