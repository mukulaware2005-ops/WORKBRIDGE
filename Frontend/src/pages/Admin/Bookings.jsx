import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';

import {
  listAdminBookings,
  getAdminBooking,
  updateAdminBooking,
} from '../../services/adminService';

export default function Bookings() {

  const { showToast } = useApp();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [updating, setUpdating] = useState(false);


  // =====================================================
  // LOAD BOOKINGS
  // =====================================================

  const loadBookings = async () => {

    try {

      setLoading(true);

      const response = await listAdminBookings({
        search,
        status: statusFilter,
        date: dateFilter,
      });

      setBookings(response.results || []);

    } catch (error) {

      console.error(
        'Failed to load bookings:',
        error
      );

      showToast?.(
        'Failed to load bookings',
        'error'
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    loadBookings();

  }, [
    search,
    statusFilter,
    dateFilter,
  ]);


  // =====================================================
  // OPEN BOOKING
  // =====================================================

  const openBooking = async (bookingId) => {

    try {

      setDetailsLoading(true);

      const booking =
        await getAdminBooking(bookingId);

      setSelectedBooking(booking);

    } catch (error) {

      console.error(
        'Failed to load booking details:',
        error
      );

      showToast?.(
        'Failed to load booking details',
        'error'
      );

    } finally {

      setDetailsLoading(false);

    }
  };


  // =====================================================
  // UPDATE STATUS
  // =====================================================

  const changeStatus = async (
    bookingId,
    newStatus
  ) => {

    try {

      setUpdating(true);

      const updated =
        await updateAdminBooking(
          bookingId,
          {
            status: newStatus,
          }
        );

      setBookings((current) =>
        current.map((booking) =>
          booking.id === bookingId
            ? updated
            : booking
        )
      );

      setSelectedBooking(updated);

      showToast?.(
        'Booking status updated successfully',
        'success'
      );

    } catch (error) {

      console.error(
        'Failed to update booking:',
        error
      );

      showToast?.(
        'Failed to update booking status',
        'error'
      );

    } finally {

      setUpdating(false);

    }
  };


  // =====================================================
  // STATUS BADGE
  // =====================================================

  const getStatusBadge = (status) => {

    switch (status) {

      case 'pending':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
            Pending
          </span>
        );

      case 'upcoming':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
            Upcoming
          </span>
        );

      case 'completed':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            Completed
          </span>
        );

      case 'cancelled':
        return (
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
            Cancelled
          </span>
        );

      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            {status || '-'}
          </span>
        );
    }
  };


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="p-6 text-gray-900">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex items-center justify-between mb-6">

        <div>

          <h1 className="text-2xl font-bold text-gray-900">
            Booking Management
          </h1>

          <p className="text-gray-600 mt-1">
            Manage and monitor all WorkBridge bookings.
          </p>

        </div>

        <button
          onClick={loadBookings}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-800 bg-white hover:bg-gray-50"
        >
          Refresh
        </button>

      </div>


      {/* =================================================
          FILTERS
      ================================================= */}

      <div className="bg-white rounded-xl shadow p-4 mb-6">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Search */}

          <input
            type="text"
            placeholder="Search customer, worker or service..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-500 bg-white"
          />


          {/* Status */}

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white"
          >

            <option value="">
              All statuses
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="upcoming">
              Upcoming
            </option>

            <option value="completed">
              Completed
            </option>

            <option value="cancelled">
              Cancelled
            </option>

          </select>


          {/* Date */}

          <input
            type="date"
            value={dateFilter}
            onChange={(e) =>
              setDateFilter(e.target.value)
            }
            className="border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white"
          />

        </div>

      </div>


      {/* =================================================
          BOOKINGS TABLE
      ================================================= */}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        {loading ? (

          <div className="p-8 text-center text-gray-700">
            Loading bookings...
          </div>

        ) : bookings.length === 0 ? (

          <div className="p-8 text-center text-gray-600">
            No bookings found.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-gray-900">

              <thead className="bg-gray-50">

                <tr>

                  <th className="text-left p-4 text-gray-700 font-semibold">
                    ID
                  </th>

                  <th className="text-left p-4 text-gray-700 font-semibold">
                    Customer
                  </th>

                  <th className="text-left p-4 text-gray-700 font-semibold">
                    Worker
                  </th>

                  <th className="text-left p-4 text-gray-700 font-semibold">
                    Service
                  </th>

                  <th className="text-left p-4 text-gray-700 font-semibold">
                    Date
                  </th>

                  <th className="text-left p-4 text-gray-700 font-semibold">
                    Price
                  </th>

                  <th className="text-left p-4 text-gray-700 font-semibold">
                    Status
                  </th>

                  <th className="text-left p-4 text-gray-700 font-semibold">
                    Action
                  </th>

                </tr>

              </thead>


              <tbody>

                {bookings.map((booking) => (

                  <tr
                    key={booking.id}
                    className="border-t border-gray-200"
                  >

                    {/* ID */}

                    <td className="p-4 font-medium text-gray-900">
                      #{booking.id}
                    </td>


                    {/* Customer */}

                    <td className="p-4">

                      <div className="text-gray-900 font-medium">
                        {booking.customer_email || '-'}
                      </div>

                    </td>


                    {/* Worker */}

                    <td className="p-4">

                      <div className="text-gray-900 font-medium">
                        {booking.worker_name || 'Worker'}
                      </div>

                      <div className="text-sm text-gray-600">
                        {booking.worker_email || '-'}
                      </div>

                    </td>


                    {/* Service */}

                    <td className="p-4 text-gray-800">
                      {booking.service_name || '-'}
                    </td>


                    {/* Date */}

                    <td className="p-4">

                      <div className="text-gray-900">
                        {booking.date || '-'}
                      </div>

                      <div className="text-sm text-gray-600">
                        {booking.time || '-'}
                      </div>

                    </td>


                    {/* Price */}

                    <td className="p-4 text-gray-900">
                      ₹{booking.price}
                    </td>


                    {/* Status */}

                    <td className="p-4">

                      {getStatusBadge(
                        booking.status
                      )}

                    </td>


                    {/* Action */}

                    <td className="p-4">

                      <button
                        onClick={() =>
                          openBooking(
                            booking.id
                          )
                        }
                        className="px-3 py-1 rounded border border-gray-300 text-gray-800 bg-white hover:bg-gray-50"
                      >
                        View
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>


      {/* =================================================
          BOOKING DETAILS MODAL
      ================================================= */}

      {selectedBooking && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto text-gray-900">

            <div className="p-6">


              {/* Header */}

              <div className="flex justify-between items-center mb-6">

                <div>

                  <h2 className="text-xl font-bold text-gray-900">
                    Booking #{selectedBooking.id}
                  </h2>

                  <div className="mt-2">
                    {getStatusBadge(
                      selectedBooking.status
                    )}
                  </div>

                </div>


                <button
                  onClick={() =>
                    setSelectedBooking(null)
                  }
                  className="text-xl text-gray-700 hover:text-gray-900"
                >
                  ×
                </button>

              </div>


              {detailsLoading ? (

                <p className="text-gray-700">
                  Loading...
                </p>

              ) : (

                <div className="space-y-5">


                  {/* Customer */}

                  <div>

                    <p className="text-sm text-gray-500">
                      Customer
                    </p>

                    <p className="text-gray-900 font-medium">
                      {selectedBooking.customer_email || '-'}
                    </p>

                  </div>


                  {/* Worker */}

                  <div>

                    <p className="text-sm text-gray-500">
                      Worker
                    </p>

                    <p className="text-gray-900 font-medium">
                      {selectedBooking.worker_name || 'Worker'}
                    </p>

                    <p className="text-sm text-gray-600">
                      {selectedBooking.worker_email || '-'}
                    </p>

                  </div>


                  {/* Service */}

                  <div>

                    <p className="text-sm text-gray-500">
                      Service
                    </p>

                    <p className="text-gray-900 font-medium">
                      {selectedBooking.service_name || '-'}
                    </p>

                  </div>


                  {/* Date and Time */}

                  <div className="grid grid-cols-2 gap-4">

                    <div>

                      <p className="text-sm text-gray-500">
                        Date
                      </p>

                      <p className="text-gray-900">
                        {selectedBooking.date || '-'}
                      </p>

                    </div>


                    <div>

                      <p className="text-sm text-gray-500">
                        Time
                      </p>

                      <p className="text-gray-900">
                        {selectedBooking.time || '-'}
                      </p>

                    </div>

                  </div>


                  {/* Location */}

                  <div>

                    <p className="text-sm text-gray-500">
                      Location
                    </p>

                    <p className="text-gray-900">
                      {selectedBooking.location || '-'}
                    </p>

                  </div>


                  {/* Price */}

                  <div>

                    <p className="text-sm text-gray-500">
                      Price
                    </p>

                    <p className="text-gray-900 font-medium">
                      ₹{selectedBooking.price}
                    </p>

                  </div>


                  {/* Message */}

                  <div>

                    <p className="text-sm text-gray-500">
                      Customer Message
                    </p>

                    <p className="text-gray-900">
                      {selectedBooking.message || 'No message'}
                    </p>

                  </div>


                  {/* Created */}

                  <div>

                    <p className="text-sm text-gray-500">
                      Created
                    </p>

                    <p className="text-gray-900">
                      {selectedBooking.created_at
                        ? new Date(
                            selectedBooking.created_at
                          ).toLocaleString()
                        : '-'}
                    </p>

                  </div>


                  {/* Status Management */}

                  <div className="border-t border-gray-200 pt-5">

                    <p className="font-medium text-gray-900 mb-3">
                      Change Booking Status
                    </p>


                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">

                      <button
                        disabled={updating}
                        onClick={() =>
                          changeStatus(
                            selectedBooking.id,
                            'pending'
                          )
                        }
                        className="px-3 py-2 rounded-lg border border-yellow-300 text-yellow-700 hover:bg-yellow-50 disabled:opacity-50"
                      >
                        Pending
                      </button>


                      <button
                        disabled={updating}
                        onClick={() =>
                          changeStatus(
                            selectedBooking.id,
                            'upcoming'
                          )
                        }
                        className="px-3 py-2 rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50 disabled:opacity-50"
                      >
                        Upcoming
                      </button>


                      <button
                        disabled={updating}
                        onClick={() =>
                          changeStatus(
                            selectedBooking.id,
                            'completed'
                          )
                        }
                        className="px-3 py-2 rounded-lg border border-green-300 text-green-700 hover:bg-green-50 disabled:opacity-50"
                      >
                        Completed
                      </button>


                      <button
                        disabled={updating}
                        onClick={() =>
                          changeStatus(
                            selectedBooking.id,
                            'cancelled'
                          )
                        }
                        className="px-3 py-2 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        Cancelled
                      </button>

                    </div>

                  </div>

                </div>

              )}

            </div>

          </div>

        </div>

      )}

    </div>

  );
}