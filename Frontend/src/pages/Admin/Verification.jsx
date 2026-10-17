import { useEffect, useState } from 'react';
import {
  Search,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useApp } from '../../context/AppContext';
import * as adminService from '../../services/adminService';

export default function Verification() {
  useDocumentTitle('Verification');

  const { showToast } = useApp();

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [verification, setVerification] = useState('');

  const [actionLoading, setActionLoading] = useState(null);

  const loadWorkers = async () => {
    try {
      setLoading(true);

      const data = await adminService.listVerificationRequests({
        search,
        verification,
      });

      setWorkers(data.results || []);
    } catch (error) {
      showToast?.(
        error.message || 'Failed to load verification requests',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkers();
  }, [search, verification]);

  const updateVerificationStatus = async (
    workerId,
    field,
    value
  ) => {
    try {
      setActionLoading(`${workerId}-${field}`);

      await adminService.updateVerification(workerId, {
        [field]: value,
      });

      showToast?.(
        value
          ? 'Verification approved'
          : 'Verification rejected',
        'success'
      );

      loadWorkers();
    } catch (error) {
      showToast?.(
        error.message || 'Failed to update verification',
        'error'
      );
    } finally {
      setActionLoading(null);
    }
  };

  const VerificationStatus = ({
    worker,
    field,
    label,
  }) => {
    const verified = worker[field];

    return (
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-gray-500">
          {label}
        </span>

        <div
          className={`flex items-center gap-1 text-sm font-medium ${
            verified
              ? 'text-green-600'
              : 'text-orange-500'
          }`}
        >
          {verified ? (
            <>
              <CheckCircle size={16} />
              Verified
            </>
          ) : (
            <>
              <Clock size={16} />
              Pending
            </>
          )}
        </div>

        <div className="flex gap-1">
          <button
            disabled={
              actionLoading === `${worker.id}-${field}`
            }
            onClick={() =>
              updateVerificationStatus(
                worker.id,
                field,
                true
              )
            }
            className="rounded-lg bg-green-100 px-2 py-1 text-xs text-green-700 hover:bg-green-200 disabled:opacity-50"
          >
            {actionLoading ===
            `${worker.id}-${field}` ? (
              <Loader2
                size={13}
                className="animate-spin"
              />
            ) : (
              'Approve'
            )}
          </button>

          <button
            disabled={
              actionLoading === `${worker.id}-${field}`
            }
            onClick={() =>
              updateVerificationStatus(
                worker.id,
                field,
                false
              )
            }
            className="rounded-lg bg-red-100 px-2 py-1 text-xs text-red-700 hover:bg-red-200 disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Verification Management
        </h1>
        <p className="text-sm text-gray-500">
          Review and manage worker verification
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 md:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-3 text-gray-400"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search worker..."
            className="w-full rounded-lg border py-2 pl-10 pr-3 outline-none focus:ring-2"
          />
        </div>

        <select
          value={verification}
          onChange={(e) =>
            setVerification(e.target.value)
          }
          className="rounded-lg border px-4 py-2"
        >
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="verified">Fully Verified</option>
        </select>

        <button
          onClick={loadWorkers}
          className="flex items-center justify-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-50"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border bg-white">
        {loading ? (
          <div className="flex justify-center p-12">
            <Loader2
              className="animate-spin"
              size={28}
            />
          </div>
        ) : workers.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            No verification records found.
          </div>
        ) : (
          <table className="w-full min-w-[1000px]">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  Worker
                </th>
                <th className="px-4 py-3 text-left">
                  Identity
                </th>
                <th className="px-4 py-3 text-left">
                  Police
                </th>
                <th className="px-4 py-3 text-left">
                  Certificate
                </th>
                <th className="px-4 py-3 text-left">
                  Overall
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {workers.map((worker) => (
                <tr key={worker.id}>
                  <td className="px-4 py-4">
                    <div className="font-medium">
                      {worker.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {worker.email}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <VerificationStatus
                      worker={worker}
                      field="identity_verified"
                      label="Identity"
                    />
                  </td>

                  <td className="px-4 py-4">
                    <VerificationStatus
                      worker={worker}
                      field="police_verified"
                      label="Police"
                    />
                  </td>

                  <td className="px-4 py-4">
                    <VerificationStatus
                      worker={worker}
                      field="certificate_verified"
                      label="Certificate"
                    />
                  </td>

                  <td className="px-4 py-4">
                    {worker.fully_verified ? (
                      <span className="flex items-center gap-1 font-medium text-green-600">
                        <ShieldCheck size={18} />
                        Verified
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 font-medium text-orange-500">
                        <XCircle size={18} />
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}