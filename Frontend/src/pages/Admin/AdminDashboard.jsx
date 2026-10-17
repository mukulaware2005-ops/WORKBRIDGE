import { useCallback, useEffect, useState } from 'react';
import {
  Users,
  HardHat,
  UserSquare2,
  ShieldCheck,
  ClipboardList,
  CheckCircle2,
  Flag,
} from 'lucide-react';

import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import * as adminService from '../../services/adminService';
import { ListSkeleton } from '../../components/common/States';
import { useApp } from '../../context/AppContext';

const WS_BASE_URL = 'ws://127.0.0.1:8000/ws/admin/dashboard/';

function AdminStatCard({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  valueColor,
}) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between">

        {/* TEXT */}
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <p
            className={`mt-2 text-3xl font-bold ${valueColor}`}
          >
            {value}
          </p>
        </div>

        {/* ICON */}
        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center ${iconBg}`}
        >
          <Icon
            size={28}
            strokeWidth={2}
            className={iconColor}
          />
        </div>

      </div>
    </div>
  );
}

export default function AdminDashboard() {
  useDocumentTitle('Admin Dashboard');

  const { showToast } = useApp();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    try {
      const data = await adminService.getAdminStats();
      setStats(data);
    } catch (error) {
      console.error(
        'Failed to load admin dashboard:',
        error
      );

      showToast?.(
        error?.message || 'Failed to load admin dashboard',
        'error'
      );
    }
  }, [showToast]);

  // INITIAL LOAD
  useEffect(() => {
    let mounted = true;

    async function loadInitialData() {
      try {
        setLoading(true);

        const data = await adminService.getAdminStats();

        if (!mounted) return;

        setStats(data);
      } catch (error) {
        console.error(
          'Failed to load admin dashboard:',
          error
        );

        if (mounted) {
          showToast?.(
            error?.message || 'Failed to load admin dashboard',
            'error'
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadInitialData();

    return () => {
      mounted = false;
    };
  }, [showToast]);

  // ADMIN WEBSOCKET
  useEffect(() => {
    const token = localStorage.getItem(
      'workbridge_access_token'
    );

    if (!token) {
      return;
    }

    const socket = new WebSocket(
      `${WS_BASE_URL}?token=${token}`
    );

    socket.onopen = () => {
      console.log(
        'Admin dashboard WebSocket connected'
      );
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (
          message.type === 'dashboard_update'
        ) {
          loadDashboard();
        }
      } catch (error) {
        console.error(
          'Invalid admin WebSocket message:',
          error
        );
      }
    };

    socket.onerror = (error) => {
      console.error(
        'Admin dashboard WebSocket error:',
        error
      );
    };

    socket.onclose = () => {
      console.log(
        'Admin dashboard WebSocket disconnected'
      );
    };

    return () => {
      socket.close();
    };
  }, [loadDashboard]);

  // LOADING
  if (loading) {
    return (
      <div className="space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Admin Dashboard
          </h1>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Loading dashboard data...
          </p>
        </div>

        <ListSkeleton />

      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Admin Dashboard
        </h1>

        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Monitor platform users, workers and bookings.
        </p>
      </div>


      {/* STATISTICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

        {/* TOTAL USERS */}
        <AdminStatCard
          title="Total Users"
          value={stats?.totalUsers ?? 0}
          icon={Users}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600 dark:text-blue-400"
          valueColor="text-blue-600 dark:text-blue-400"
        />

        {/* WORKERS */}
        <AdminStatCard
          title="Workers"
          value={stats?.workers ?? 0}
          icon={HardHat}
          iconBg="bg-green-100 dark:bg-green-900/30"
          iconColor="text-green-600 dark:text-green-400"
          valueColor="text-green-600 dark:text-green-400"
        />

        {/* CUSTOMERS */}
        <AdminStatCard
          title="Customers"
          value={stats?.customers ?? 0}
          icon={UserSquare2}
          iconBg="bg-purple-100 dark:bg-purple-900/30"
          iconColor="text-purple-600 dark:text-purple-400"
          valueColor="text-purple-600 dark:text-purple-400"
        />

        {/* VERIFIED WORKERS */}
        <AdminStatCard
          title="Verified Workers"
          value={stats?.verifiedWorkers ?? 0}
          icon={ShieldCheck}
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          iconColor="text-emerald-600 dark:text-emerald-400"
          valueColor="text-emerald-600 dark:text-emerald-400"
        />

        {/* ACTIVE BOOKINGS */}
        <AdminStatCard
          title="Active Bookings"
          value={stats?.activeBookings ?? 0}
          icon={ClipboardList}
          iconBg="bg-orange-100 dark:bg-orange-900/30"
          iconColor="text-orange-600 dark:text-orange-400"
          valueColor="text-orange-600 dark:text-orange-400"
        />

        {/* COMPLETED SERVICES */}
        <AdminStatCard
          title="Completed Services"
          value={stats?.completedServices ?? 0}
          icon={CheckCircle2}
          iconBg="bg-teal-100 dark:bg-teal-900/30"
          iconColor="text-teal-600 dark:text-teal-400"
          valueColor="text-teal-600 dark:text-teal-400"
        />

        {/* REPORTS */}
        <AdminStatCard
          title="Reports"
          value={stats?.reports ?? 0}
          icon={Flag}
          iconBg="bg-red-100 dark:bg-red-900/30"
          iconColor="text-red-600 dark:text-red-400"
          valueColor="text-red-600 dark:text-red-400"
        />

      </div>

    </div>
  );
}