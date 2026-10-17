import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const API_URL = 'http://127.0.0.1:8000/api/admin/analytics/';

const COLORS = [
  '#3B82F6',
  '#22C55E',
  '#A855F7',
  '#F97316',
  '#EF4444',
  '#EAB308',
];

function StatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

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

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem(
        'workbridge_access_token'
      );

      const response = await fetch(API_URL, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to load analytics (${response.status})`
        );
      }

      const data = await response.json();

      setAnalytics(data);
    } catch (err) {
      console.error('Analytics error:', err);
      setError(
        err.message || 'Failed to load analytics'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <p className="text-slate-500">
            Loading analytics...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-red-700">
            Failed to load analytics
          </h2>

          <p className="mt-2 text-red-600">
            {error}
          </p>

          <button
            onClick={fetchAnalytics}
            className="mt-4 px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  const bookingPerformance = [
    {
      name: 'Completed',
      value: analytics.bookingPerformance.completed,
    },
    {
      name: 'Cancelled',
      value: analytics.bookingPerformance.cancelled,
    },
    {
      name: 'Pending',
      value: analytics.bookingPerformance.pending,
    },
    {
      name: 'Upcoming',
      value: analytics.bookingPerformance.upcoming,
    },
  ].filter((item) => item.value > 0);

  const verificationData = [
    {
      name: 'Verified',
      value: analytics.verification.verified,
    },
    {
      name: 'Pending',
      value: analytics.verification.pending,
    },
  ];

  return (
    <div className="p-6 space-y-6">

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Analytics
          </h1>

          <p className="mt-1 text-slate-500">
            Monitor WorkBridge growth, bookings and platform performance.
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
        >
          ↻ Refresh
        </button>

      </div>


      {/* SUMMARY */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

        <StatCard
          title="Total Users"
          value={analytics.summary.totalUsers}
          icon="👥"
          color="bg-blue-100"
        />

        <StatCard
          title="Total Bookings"
          value={analytics.summary.totalBookings}
          icon="📅"
          color="bg-orange-100"
        />

        <StatCard
          title="Total Reviews"
          value={analytics.summary.totalReviews}
          icon="⭐"
          color="bg-yellow-100"
        />

        <StatCard
          title="Average Rating"
          value={analytics.summary.averageRating}
          icon="★"
          color="bg-purple-100"
        />

        <StatCard
          title="Completion Rate"
          value={`${analytics.summary.completionRate}%`}
          icon="✓"
          color="bg-green-100"
        />

        <StatCard
          title="Cancellation Rate"
          value={`${analytics.summary.cancellationRate}%`}
          icon="✕"
          color="bg-red-100"
        />

      </div>


      {/* USER + BOOKING TRENDS */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <ChartCard title="User Growth">

          {analytics.userGrowth.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.userGrowth}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="month" />

                <YAxis allowDecimals={false} />

                <Tooltip />

                <Legend />

                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />

              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">
              No user growth data available
            </div>
          )}

        </ChartCard>


        <ChartCard title="Booking Activity">

          {analytics.bookingActivity.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.bookingActivity}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="month" />

                <YAxis allowDecimals={false} />

                <Tooltip />

                <Legend />

                <Line
                  type="monotone"
                  dataKey="bookings"
                  stroke="#22C55E"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />

              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">
              No booking activity available
            </div>
          )}

        </ChartCard>

      </div>


      {/* PERFORMANCE + VERIFICATION */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <ChartCard title="Booking Performance">

          {bookingPerformance.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>

                <Pie
                  data={bookingPerformance}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {bookingPerformance.map(
                    (entry, index) => (
                      <Cell
                        key={`booking-${index}`}
                        fill={
                          COLORS[
                            index % COLORS.length
                          ]
                        }
                      />
                    )
                  )}
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


        <ChartCard title="Worker Verification">

          <ResponsiveContainer width="100%" height="100%">
            <PieChart>

              <Pie
                data={verificationData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {verificationData.map(
                  (entry, index) => (
                    <Cell
                      key={`verification-${index}`}
                      fill={
                        index === 0
                          ? '#22C55E'
                          : '#F97316'
                      }
                    />
                  )
                )}
              </Pie>

              <Tooltip />

              <Legend />

            </PieChart>
          </ResponsiveContainer>

        </ChartCard>

      </div>


      {/* SERVICES */}

      <ChartCard title="Top Services">

        {analytics.services.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={analytics.services}
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
            No service data available
          </div>
        )}

      </ChartCard>


      {/* CATEGORIES */}

      <ChartCard title="Bookings by Worker Category">

        {analytics.categories.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={analytics.categories}
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
            No category data available
          </div>
        )}

      </ChartCard>


      {/* RATINGS */}

      <ChartCard title="Rating Distribution">

        {analytics.ratings.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.ratings}>

              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="rating"
                label={{
                  value: 'Stars',
                  position: 'insideBottom',
                  offset: -5,
                }}
              />

              <YAxis allowDecimals={false} />

              <Tooltip />

              <Bar
                dataKey="count"
                fill="#EAB308"
                radius={[6, 6, 0, 0]}
              />

            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-400">
            No rating data available
          </div>
        )}

      </ChartCard>

    </div>
  );
}