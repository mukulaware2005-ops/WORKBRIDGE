
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import {
  Calendar,
  MapPin,
  MessageCircle,
  XCircle,
  RotateCw,
  Eye,
  Check,
} from 'lucide-react';

import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import * as bookingService from '../../services/bookingService';
import { getCurrentUser } from '../../api/api';

import { Tabs } from '../../components/common/Controls';
import {
  EmptyState,
  ListSkeleton,
} from '../../components/common/States';

import { ConfirmationDialog } from '../../components/common/Modal';
import { useApp } from '../../context/AppContext';
import { formatINR } from '../../utils/format';

const STATUS_STYLES = {
  upcoming:
    'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',

  completed:
    'bg-secondary-50 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-300',

  cancelled:
    'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400',

  pending:
    'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
};

export default function Bookings() {
  useDocumentTitle('My Bookings');

  const { showToast } = useApp();

  const [tab, setTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState(null);

  const currentUser = getCurrentUser();

  const userRole =
    currentUser?.role ||
    currentUser?.user_type ||
    currentUser?.account_type;

  const isWorker =
    userRole === 'worker' ||
    userRole === 'provider';

  /*
   * Load bookings whenever the selected tab changes.
   */
  useEffect(() => {
    setLoading(true);

    bookingService
      .listBookings(tab)
      .then((data) => {
        setBookings(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error(
          'Failed to load bookings:',
          error
        );

        showToast(
          error.message || 'Failed to load bookings'
        );

        setBookings([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [tab, showToast]);

  /*
   * CUSTOMER:
   * Cancel an upcoming booking.
   */
  const cancel = async () => {
    if (!cancelTarget) return;

    try {
      await bookingService.changeBookingStatus(
        cancelTarget,
        'cancelled'
      );

      setBookings((current) =>
        current.filter(
          (booking) => booking.id !== cancelTarget
        )
      );

      showToast('Booking cancelled');
    } catch (error) {
      console.error(
        'Failed to cancel booking:',
        error
      );

      showToast(
        error.message || 'Failed to cancel booking'
      );
    }

    setCancelTarget(null);
  };

  /*
   * WORKER:
   * Accept pending booking request.
   *
   * pending -> upcoming
   */
  const acceptBooking = async (bookingId) => {
    try {
      await bookingService.changeBookingStatus(
        bookingId,
        'upcoming'
      );

      setBookings((current) =>
        current.filter(
          (booking) => booking.id !== bookingId
        )
      );

      showToast('Booking accepted');
    } catch (error) {
      console.error(
        'Failed to accept booking:',
        error
      );

      showToast(
        error.message || 'Failed to accept booking'
      );
    }
  };

  /*
   * WORKER:
   * Reject pending booking request.
   *
   * pending -> cancelled
   */
  const rejectBooking = async (bookingId) => {
    try {
      await bookingService.changeBookingStatus(
        bookingId,
        'cancelled'
      );

      setBookings((current) =>
        current.filter(
          (booking) => booking.id !== bookingId
        )
      );

      showToast('Booking rejected');
    } catch (error) {
      console.error(
        'Failed to reject booking:',
        error
      );

      showToast(
        error.message || 'Failed to reject booking'
      );
    }
  };

  /*
   * CUSTOMER:
   * Mark an upcoming booking as completed.
   *
   * upcoming -> completed
   */
  const completeBooking = async (bookingId) => {
    try {
      await bookingService.changeBookingStatus(
        bookingId,
        'completed'
      );

      setBookings((current) =>
        current.filter(
          (booking) => booking.id !== bookingId
        )
      );

      showToast('Booking marked as completed');
    } catch (error) {
      console.error(
        'Failed to complete booking:',
        error
      );

      showToast(
        error.message ||
          'Failed to mark booking as completed'
      );
    }
  };

  /*
   * Tabs depend on the user's role.
   *
   * Worker:
   * Requests | Upcoming | Completed | Cancelled
   *
   * Customer:
   * Upcoming | Completed | Cancelled
   */
  const tabs = isWorker
    ? [
        {
          value: 'pending',
          label: 'Requests',
        },
        {
          value: 'upcoming',
          label: 'Upcoming',
        },
        {
          value: 'completed',
          label: 'Completed',
        },
        {
          value: 'cancelled',
          label: 'Cancelled',
        },
      ]
    : [
        {
          value: 'upcoming',
          label: 'Upcoming',
        },
        {
          value: 'completed',
          label: 'Completed',
        },
        {
          value: 'cancelled',
          label: 'Cancelled',
        },
      ];

  return (
    <div className="section py-8">

      {/* PAGE TITLE */}
      <h1 className="text-2xl font-extrabold text-navy-900 dark:text-white mb-6">
        {isWorker ? 'Booking Requests' : 'My Bookings'}
      </h1>

      {/* TABS */}
      <Tabs
        tabs={tabs}
        active={tab}
        onChange={setTab}
      />

      {/* BOOKINGS */}
      <div className="mt-6">

        {loading ? (
          <ListSkeleton count={3} />
        ) : bookings.length === 0 ? (
          <EmptyState
            title={
              isWorker && tab === 'pending'
                ? 'No booking requests'
                : `No ${tab} bookings`
            }
            message={
              isWorker && tab === 'pending'
                ? 'New customer booking requests will appear here.'
                : 'Bookings will appear here once scheduled.'
            }
            action={
              !isWorker && (
                <Link
                  to="/search"
                  className="btn-primary px-4 py-2 text-sm"
                >
                  Find a Professional
                </Link>
              )
            }
          />
        ) : (
          <div className="space-y-3">

            {bookings.map((b) => {

              const workerName =
                b.worker_name ||
                'Unknown Worker';

              const serviceName =
                b.service_name ||
                'Service';

              const initials = workerName
                .split(' ')
                .map((s) => s[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              return (
                <div
                  key={b.id}
                  className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                >

                  {/* AVATAR */}
                  <div className="h-12 w-12 rounded-xl bg-navy-100 dark:bg-navy-800 flex items-center justify-center text-sm font-bold text-navy-600 dark:text-navy-200 shrink-0">
                    {initials}
                  </div>

                  {/* BOOKING INFO */}
                  <div className="flex-1 min-w-0">

                    <div className="flex items-center gap-2 flex-wrap">

                      <p className="text-sm font-semibold text-navy-900 dark:text-white">
                        {serviceName}
                      </p>

                      <span
                        className={`badge text-[11px] ${
                          STATUS_STYLES[b.status] || ''
                        }`}
                      >
                        {b.status}
                      </span>

                    </div>

                    <p className="text-xs text-navy-400 mt-1">
                      {workerName}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-navy-500 dark:text-navy-400">

                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {b.date}, {b.time}
                      </span>

                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {b.location}
                      </span>

                    </div>

                  </div>

                  {/* PRICE */}
                  <div className="text-right shrink-0">

                    <p className="font-bold text-navy-900 dark:text-white">
                      {formatINR(b.price)}
                    </p>

                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex flex-wrap gap-2 shrink-0">

                    {/* VIEW WORKER */}
                    <Link
                      to={`/workers/${b.worker}`}
                      className="btn-ghost h-9 w-9 p-0"
                      aria-label="View worker"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>

                    {/* MESSAGE */}
                    <Link
                      to="/messages"
                      className="btn-ghost h-9 w-9 p-0"
                      aria-label="Message"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Link>

                    {/* ================================= */}
                    {/* WORKER: ACCEPT / REJECT REQUEST */}
                    {/* ================================= */}

                    {isWorker &&
                      b.status === 'pending' && (
                        <>
                          <button
                            onClick={() =>
                              acceptBooking(b.id)
                            }
                            className="btn-primary px-3 py-2 text-sm"
                          >
                            <Check className="h-4 w-4" />
                            Accept
                          </button>

                          <button
                            onClick={() =>
                              rejectBooking(b.id)
                            }
                            className="btn-outline px-3 py-2 text-sm text-red-500 border-red-300"
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </button>
                        </>
                      )}

                    {/* ================================= */}
                    {/* CUSTOMER: MARK AS COMPLETED */}
                    {/* ================================= */}

                    {!isWorker &&
                      b.status === 'upcoming' && (
                        <button
                          onClick={() =>
                            completeBooking(b.id)
                          }
                          className="btn-primary px-3 py-2 text-sm"
                        >
                          <Check className="h-4 w-4" />
                          Mark as Completed
                        </button>
                      )}

                    {/* ================================= */}
                    {/* CUSTOMER: CANCEL UPCOMING */}
                    {/* ================================= */}

                    {!isWorker &&
                      b.status === 'upcoming' && (
                        <button
                          onClick={() =>
                            setCancelTarget(b.id)
                          }
                          className="btn-ghost h-9 w-9 p-0 text-red-500"
                          aria-label="Cancel booking"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}

                    {/* ================================= */}
                    {/* BOOK AGAIN */}
                    {/* ================================= */}

                    {(b.status === 'completed' ||
                      b.status === 'cancelled') && (
                      <Link
                        to={`/workers/${b.worker}`}
                        className="btn-ghost h-9 w-9 p-0"
                        aria-label="Book again"
                      >
                        <RotateCw className="h-4 w-4" />
                      </Link>
                    )}

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>

      {/* CANCEL CONFIRMATION */}
      <ConfirmationDialog
        open={!!cancelTarget}
        onClose={() =>
          setCancelTarget(null)
        }
        onConfirm={cancel}
        title="Cancel this booking?"
        description="This action cannot be undone. The professional will be notified."
        confirmLabel="Cancel Booking"
        danger
      />

    </div>
  );
}

