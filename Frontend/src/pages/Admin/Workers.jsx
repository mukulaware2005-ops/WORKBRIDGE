import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';

import {
  listAdminWorkers,
  getAdminWorker,
  updateAdminWorker,
} from '../../services/adminService';

export default function Workers() {
  const { showToast } = useApp();

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [active, setActive] = useState('');
  const [verification, setVerification] = useState('');

  const [selectedWorker, setSelectedWorker] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // =========================================================
  // LOAD WORKERS
  // =========================================================

  const loadWorkers = async () => {
    try {
      setLoading(true);

      const response = await listAdminWorkers({
        search,
        active,
        verification,
      });

      setWorkers(response.results || []);
    } catch (error) {
      console.error('Failed to load workers:', error);

      showToast?.(
        'Failed to load workers',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkers();
  }, [search, active, verification]);

  // =========================================================
  // OPEN WORKER DETAILS
  // =========================================================

  const openWorker = async (workerId) => {
    try {
      setDetailsLoading(true);

      const worker = await getAdminWorker(workerId);

      setSelectedWorker(worker);
    } catch (error) {
      console.error(
        'Failed to load worker details:',
        error
      );

      showToast?.(
        'Failed to load worker details',
        'error'
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  // =========================================================
  // UPDATE WORKER
  // =========================================================

  const updateWorker = async (workerId, payload) => {
    try {
      const updated = await updateAdminWorker(
        workerId,
        payload
      );

      setWorkers((current) =>
        current.map((worker) =>
          worker.user_id === workerId
            ? updated
            : worker
        )
      );

      if (
        selectedWorker?.user_id === workerId
      ) {
        setSelectedWorker(updated);
      }

      showToast?.(
        'Worker updated successfully',
        'success'
      );
    } catch (error) {
      console.error(
        'Failed to update worker:',
        error
      );

      showToast?.(
        'Failed to update worker',
        'error'
      );
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="p-6 text-gray-900">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex items-center justify-between mb-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Worker Management
          </h1>

          <p className="text-gray-600 mt-1">
            Manage WorkBridge workers and verification.
          </p>
        </div>

        <button
          onClick={loadWorkers}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-50"
        >
          Refresh
        </button>

      </div>

      {/* =====================================================
          FILTERS
      ===================================================== */}

      <div className="bg-white rounded-xl shadow p-4 mb-6">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Search */}

          <input
            type="text"
            placeholder="Search email, title, category or city..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-500 bg-white"
          />

          {/* Active Filter */}

          <select
            value={active}
            onChange={(e) =>
              setActive(e.target.value)
            }
            className="border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white"
          >
            <option value="">
              All workers
            </option>

            <option value="true">
              Active
            </option>

            <option value="false">
              Inactive
            </option>
          </select>

          {/* Verification Filter */}

          <select
            value={verification}
            onChange={(e) =>
              setVerification(e.target.value)
            }
            className="border border-gray-300 rounded-lg px-4 py-2 text-gray-900 bg-white"
          >
            <option value="">
              All verification
            </option>

            <option value="identity">
              Identity verified
            </option>

            <option value="police">
              Police verified
            </option>
          </select>

        </div>

      </div>

      {/* =====================================================
          WORKER TABLE
      ===================================================== */}

      <div className="bg-white rounded-xl shadow overflow-hidden">

        {loading ? (

          <div className="p-8 text-center text-gray-700">
            Loading workers...
          </div>

        ) : workers.length === 0 ? (

          <div className="p-8 text-center text-gray-600">
            No workers found.
          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full text-gray-900">

              <thead className="bg-gray-50">

                <tr>

                  <th className="text-left p-4 text-gray-700 font-semibold">
                    Worker
                  </th>

                  <th className="text-left p-4 text-gray-700 font-semibold">
                    Category
                  </th>

                  <th className="text-left p-4 text-gray-700 font-semibold">
                    Location
                  </th>

                  <th className="text-left p-4 text-gray-700 font-semibold">
                    Identity
                  </th>

                  <th className="text-left p-4 text-gray-700 font-semibold">
                    Police
                  </th>

                  <th className="text-left p-4 text-gray-700 font-semibold">
                    Status
                  </th>

                  <th className="text-left p-4 text-gray-700 font-semibold">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {workers.map((worker) => (

                  <tr
                    key={worker.user_id}
                    className="border-t border-gray-200 text-gray-900"
                  >

                    {/* Worker */}

                    <td className="p-4">

                      <div className="font-medium text-gray-900">
                        {worker.title || 'Worker'}
                      </div>

                      <div className="text-sm text-gray-600">
                        {worker.email}
                      </div>

                    </td>

                    {/* Category */}

                    <td className="p-4 text-gray-800">
                      {worker.category || '-'}
                    </td>

                    {/* Location */}

                    <td className="p-4 text-gray-800">
                      {worker.city || '-'}
                    </td>

                    {/* Identity */}

                    <td className="p-4">

                      {worker.is_identity_verified ? (

                        <span className="text-green-600 font-medium">
                          Verified
                        </span>

                      ) : (

                        <span className="text-red-500 font-medium">
                          Not verified
                        </span>

                      )}

                    </td>

                    {/* Police */}

                    <td className="p-4">

                      {worker.is_police_verified ? (

                        <span className="text-green-600 font-medium">
                          Verified
                        </span>

                      ) : (

                        <span className="text-red-500 font-medium">
                          Not verified
                        </span>

                      )}

                    </td>

                    {/* Status */}

                    <td className="p-4">

                      {worker.is_active ? (

                        <span className="text-green-600 font-medium">
                          Active
                        </span>

                      ) : (

                        <span className="text-red-500 font-medium">
                          Inactive
                        </span>

                      )}

                    </td>

                    {/* Actions */}

                    <td className="p-4">

                      <div className="flex gap-2">

                        <button
                          onClick={() =>
                            openWorker(
                              worker.user_id
                            )
                          }
                          className="px-3 py-1 rounded border border-gray-300 text-gray-800 hover:bg-gray-50"
                        >
                          View
                        </button>

                        <button
                          onClick={() =>
                            updateWorker(
                              worker.user_id,
                              {
                                is_active:
                                  !worker.is_active,
                              }
                            )
                          }
                          className="px-3 py-1 rounded border border-gray-300 text-gray-800 hover:bg-gray-50"
                        >
                          {worker.is_active
                            ? 'Deactivate'
                            : 'Activate'}
                        </button>

                      </div>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* =====================================================
          WORKER DETAILS MODAL
      ===================================================== */}

      {selectedWorker && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto text-gray-900">

            <div className="p-6">

              {/* Modal Header */}

              <div className="flex justify-between items-center mb-6">

                <h2 className="text-xl font-bold text-gray-900">
                  Worker Details
                </h2>

                <button
                  onClick={() =>
                    setSelectedWorker(null)
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

                <div className="space-y-4">

                  {/* Email */}

                  <div>
                    <p className="text-sm text-gray-500">
                      Email
                    </p>

                    <p className="text-gray-900">
                      {selectedWorker.email}
                    </p>
                  </div>

                  {/* Title */}

                  <div>
                    <p className="text-sm text-gray-500">
                      Title
                    </p>

                    <p className="text-gray-900">
                      {selectedWorker.title || '-'}
                    </p>
                  </div>

                  {/* Category */}

                  <div>
                    <p className="text-sm text-gray-500">
                      Category
                    </p>

                    <p className="text-gray-900">
                      {selectedWorker.category || '-'}
                    </p>
                  </div>

                  {/* Experience */}

                  <div>
                    <p className="text-sm text-gray-500">
                      Experience
                    </p>

                    <p className="text-gray-900">
                      {selectedWorker.experience_years ?? '-'} years
                    </p>
                  </div>

                  {/* Location */}

                  <div>
                    <p className="text-sm text-gray-500">
                      Location
                    </p>

                    <p className="text-gray-900">
                      {selectedWorker.city || '-'}

                      {selectedWorker.area
                        ? `, ${selectedWorker.area}`
                        : ''}
                    </p>
                  </div>

                  {/* Rating */}

                  <div>
                    <p className="text-sm text-gray-500">
                      Rating
                    </p>

                    <p className="text-gray-900">
                      {selectedWorker.average_rating}{' '}
                      (
                      {selectedWorker.reviews_count}{' '}
                      reviews)
                    </p>
                  </div>

                  {/* Bookings */}

                  <div>
                    <p className="text-sm text-gray-500">
                      Bookings
                    </p>

                    <p className="text-gray-900">
                      {selectedWorker.bookings_count}
                    </p>
                  </div>

                  {/* =================================================
                      IDENTITY VERIFICATION
                  ================================================= */}

                  <div className="flex items-center justify-between border-t border-gray-200 pt-4">

                    <div>

                      <p className="font-medium text-gray-900">
                        Identity Verification
                      </p>

                      <p className="text-sm text-gray-500">
                        {selectedWorker.is_identity_verified
                          ? 'Verified'
                          : 'Not verified'}
                      </p>

                    </div>

                    <button
                      onClick={() =>
                        updateWorker(
                          selectedWorker.user_id,
                          {
                            is_identity_verified:
                              !selectedWorker.is_identity_verified,
                          }
                        )
                      }
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-50"
                    >
                      {selectedWorker.is_identity_verified
                        ? 'Remove Verification'
                        : 'Verify Identity'}
                    </button>

                  </div>

                  {/* =================================================
                      POLICE VERIFICATION
                  ================================================= */}

                  <div className="flex items-center justify-between border-t border-gray-200 pt-4">

                    <div>

                      <p className="font-medium text-gray-900">
                        Police Verification
                      </p>

                      <p className="text-sm text-gray-500">
                        {selectedWorker.is_police_verified
                          ? 'Verified'
                          : 'Not verified'}
                      </p>

                    </div>

                    <button
                      onClick={() =>
                        updateWorker(
                          selectedWorker.user_id,
                          {
                            is_police_verified:
                              !selectedWorker.is_police_verified,
                          }
                        )
                      }
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-50"
                    >
                      {selectedWorker.is_police_verified
                        ? 'Remove Verification'
                        : 'Verify Police'}
                    </button>

                  </div>

                  {/* =================================================
                      ACCOUNT STATUS
                  ================================================= */}

                  <div className="flex items-center justify-between border-t border-gray-200 pt-4">

                    <div>

                      <p className="font-medium text-gray-900">
                        Account Status
                      </p>

                      <p className="text-sm text-gray-500">
                        {selectedWorker.is_active
                          ? 'Active'
                          : 'Inactive'}
                      </p>

                    </div>

                    <button
                      onClick={() =>
                        updateWorker(
                          selectedWorker.user_id,
                          {
                            is_active:
                              !selectedWorker.is_active,
                          }
                        )
                      }
                      className="px-4 py-2 rounded-lg border border-gray-300 text-gray-800 hover:bg-gray-50"
                    >
                      {selectedWorker.is_active
                        ? 'Deactivate'
                        : 'Activate'}
                    </button>

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