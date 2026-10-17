import { useEffect, useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

const API_URL = 'http://127.0.0.1:8000/api/admin/reports/';

const COLORS = [
  '#3B82F6',
  '#22C55E',
  '#A855F7',
  '#F97316',
  '#EF4444',
  '#EAB308',
  '#06B6D4',
  '#EC4899',
];

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900">
            {value}
          </h2>
        </div>

        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}
        >
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900 mb-5">
        {title}
      </h2>

      <div className="w-full h-[320px]">
        {children}
      </div>
    </div>
  );
}

export default function Reports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('workbridge_access_token');

      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load reports (${response.status})`);
      }

      const data = await response.json();
      setReport(data);
    } catch (err) {
      console.error('Reports error:', err);
      setError(err.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <p className="text-slate-500">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-red-700">
            Failed to load reports
          </h2>

          <p className="mt-2 text-red-600">
            {error}
          </p>

          <button
            onClick={fetchReports}
            className="mt-4 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  const bookingStatusData = [
    {
      name: 'Pending',
      value: report.bookings.pending,
    },
    {
      name: 'Upcoming',
      value: report.bookings.upcoming,
    },
    {
      name: 'Completed',
      value: report.bookings.completed,
    },
    {
      name: 'Cancelled',
      value: report.bookings.cancelled,
    },
  ].filter((item) => item.value > 0);

  const usersData = [
    {
      name: 'Workers',
      value: report.users.workers,
    },
    {
      name: 'Customers',
      value: report.users.customers,
    },
  ];

  const verificationData = [
    {
      name: 'Identity',
      verified: report.workerVerification.identity,
    },
    {
      name: 'Police',
      verified: report.workerVerification.police,
    },
    {
      name: 'Certificate',
      verified: report.workerVerification.certificate,
    },
  ];

  const serviceData = [
    {
      name: 'Active',
      value: report.services.active,
    },
    {
      name: 'Inactive',
      value: report.services.inactive,
    },
  ];

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Reports
          </h1>

          <p className="mt-1 text-slate-500">
            Overview of WorkBridge platform statistics and activity.
          </p>
        </div>

        <button
          onClick={fetchReports}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
        >
          ↻ Refresh
        </button>
      </div>


      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        <StatCard
          title="Total Users"
          value={report.users.total}
          icon="👥"
          color="bg-blue-100"
        />

        <StatCard
          title="Workers"
          value={report.users.workers}
          icon="🧑‍🔧"
          color="bg-green-100"
        />

        <StatCard
          title="Customers"
          value={report.users.customers}
          icon="👤"
          color="bg-purple-100"
        />

        <StatCard
          title="Total Bookings"
          value={report.bookings.total}
          icon="📅"
          color="bg-orange-100"
        />

        <StatCard
          title="Completed"
          value={report.bookings.completed}
          icon="✓"
          color="bg-emerald-100"
        />

        <StatCard
          title="Cancelled"
          value={report.bookings.cancelled}
          icon="✕"
          color="bg-red-100"
        />

        <StatCard
          title="Total Reviews"
          value={report.reviews.total}
          icon="⭐"
          color="bg-yellow-100"
        />

        <StatCard
          title="Average Rating"
          value={report.reviews.averageRating}
          icon="★"
          color="bg-amber-100"
        />

      </div>


      {/* BOOKING + USERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <ChartCard title="Booking Status">

          {bookingStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={bookingStatusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {bookingStatusData.map((entry, index) => (
                    <Cell
                      key={`booking-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">
              No booking data available
            </div>
          )}

        </ChartCard>


        <ChartCard title="Users Distribution">

          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={usersData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {usersData.map((entry, index) => (
                  <Cell
                    key={`user-${index}`}
                    fill={COLORS[index + 1]}
                  />
                ))}
              </Pie>

              <Tooltip />

              <Legend />
            </PieChart>
          </ResponsiveContainer>

        </ChartCard>

      </div>


      {/* VERIFICATION + SERVICES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <ChartCard title="Worker Verification">

          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={verificationData}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="name" />

              <YAxis allowDecimals={false} />

              <Tooltip />

              <Bar
                dataKey="verified"
                fill="#22C55E"
                radius={[6, 6, 0, 0]}
              />

            </BarChart>
          </ResponsiveContainer>

        </ChartCard>


        <ChartCard title="Service Statistics">

          <ResponsiveContainer width="100%" height="100%">
            <PieChart>

              <Pie
                data={serviceData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {serviceData.map((entry, index) => (
                  <Cell
                    key={`service-${index}`}
                    fill={index === 0 ? '#22C55E' : '#EF4444'}
                  />
                ))}
              </Pie>

              <Tooltip />

              <Legend />

            </PieChart>
          </ResponsiveContainer>

        </ChartCard>

      </div>


      {/* BOOKINGS BY SERVICE */}
      <ChartCard title="Bookings by Service">

        {report.bookingsByService.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={report.bookingsByService}
              margin={{
                top: 10,
                right: 20,
                left: 10,
                bottom: 40,
              }}
            >

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="service"
                angle={-20}
                textAnchor="end"
                interval={0}
              />

              <YAxis allowDecimals={false} />

              <Tooltip />

              <Bar
                dataKey="bookings"
                fill="#3B82F6"
                radius={[6, 6, 0, 0]}
              />

            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">
            No service booking data available
          </div>
        )}

      </ChartCard>


      {/* BOOKINGS BY CATEGORY */}
      <ChartCard title="Bookings by Worker Category">

        {report.bookingsByCategory.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={report.bookingsByCategory}
              margin={{
                top: 10,
                right: 20,
                left: 10,
                bottom: 40,
              }}
            >

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="category"
                angle={-20}
                textAnchor="end"
                interval={0}
              />

              <YAxis allowDecimals={false} />

              <Tooltip />

              <Bar
                dataKey="bookings"
                fill="#A855F7"
                radius={[6, 6, 0, 0]}
              />

            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">
            No category booking data available
          </div>
        )}

      </ChartCard>

    </div>
  );
}