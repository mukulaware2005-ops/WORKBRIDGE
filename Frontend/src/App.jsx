import AdminSettings from './pages/Admin/Settings';
import Settings from './pages/Settings/Settings';
import Analytics from './pages/Admin/Analytics';
import AdminCommunity from './pages/Admin/Community';
import Reviews from './pages/Admin/Reviews';
import Verification from './pages/Admin/Verification';
import Workers from './pages/Admin/Workers';
import Users from './pages/Admin/Users';
import Customers from './pages/Admin/Customers';

import AdminBookings from './pages/Admin/Bookings';
import { Routes, Route } from 'react-router-dom';

import CreateBooking from './pages/Booking/CreateBooking';

import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';

import {
  ProtectedRoute,
  CustomerRoute,
  ProviderRoute,
  AdminRoute,
} from './routes/guards';

import Landing from './pages/Landing';
import RoleSelect from './pages/Auth/RoleSelect';
import Login from './pages/Auth/Login';
import CustomerSignup from './pages/Auth/CustomerSignup';
import ProviderSignup from './pages/Auth/ProviderSignup';
import ForgotPassword from './pages/Auth/ForgotPassword';
import VerifyOtp from './pages/Auth/VerifyOtp';
import AdminLogin from './pages/Auth/AdminLogin';

import CustomerDashboard from './pages/Customer/CustomerDashboard';
import ProviderDashboard from './pages/Worker/ProviderDashboard';

import SearchPage from './pages/Search/SearchPage';
import WorkerProfile from './pages/Worker/WorkerProfile';
import Portfolio from './pages/Portfolio/Portfolio';

import Messages from './pages/Messages/Messages';
import Notifications from './pages/Notifications/Notifications';
import Bookings from './pages/Booking/Bookings';

import Recommendations from './pages/Recommendations/Recommendations';
import Community from './pages/Community/Community';
import Learning from './pages/Learning/Learning';

import AdminDashboard from './pages/Admin/AdminDashboard';
import Reports from './pages/Admin/Reports';
import NotFound from './pages/NotFound';


// --------------------------------------------------
// ADMIN PLACEHOLDER PAGE
// --------------------------------------------------

function AdminPlaceholder({ title }) {
  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">
        {title}
      </h1>

      <p className="mt-2 text-slate-500">
        This admin section is ready to be connected to Django.
      </p>

      <div className="mt-8 bg-white rounded-2xl border border-slate-200 p-8">
        <p className="text-slate-600">
          {title} management will be implemented here.
        </p>
      </div>
    </div>
  );
}


// --------------------------------------------------
// APP
// --------------------------------------------------

export default function App() {
  return (
    <Routes>

      {/* ==================================================
          AUTH FLOWS
      ================================================== */}

      <Route element={<AuthLayout />}>

        <Route
          path="/auth"
          element={<RoleSelect />}
        />

        <Route
          path="/login/:role"
          element={<Login />}
        />

        <Route
          path="/signup/customer"
          element={<CustomerSignup />}
        />

        <Route
          path="/signup/provider"
          element={<ProviderSignup />}
        />

        <Route
          path="/forgot-password/:role"
          element={<ForgotPassword />}
        />

        <Route
          path="/verify-otp"
          element={<VerifyOtp />}
        />

      </Route>


      {/* ==================================================
          ADMIN LOGIN
      ================================================== */}

      <Route
        path="/admin/login"
        element={<AdminLogin />}
      />


      {/* ==================================================
          PROTECTED MAIN APP
      ================================================== */}

      <Route element={<ProtectedRoute />}>

        <Route element={<MainLayout />}>

          <Route
            path="/"
            element={<Landing />}
          />

          <Route
            path="/search"
            element={<SearchPage />}
          />

          <Route
            path="/workers/:id"
            element={<WorkerProfile />}
          />

          <Route
            path="/portfolio/:id"
            element={<Portfolio />}
          />

          <Route
            path="/community"
            element={<Community />}
          />

          <Route
            path="/learning"
            element={<Learning />}
          />

          <Route
            path="/messages"
            element={<Messages />}
          />

          <Route
            path="/notifications"
            element={<Notifications />}
          />

          <Route
            path="/bookings"
            element={<Bookings />}
          />

          <Route
            path="/bookings/create/:workerId"
            element={<CreateBooking />}
          />

          <Route
            path="/recommendations"
            element={<Recommendations />}
          />

          <Route
            path="/settings"
            element={<Settings />}
          />

        </Route>

      </Route>


      {/* ==================================================
          CUSTOMER / PROVIDER DASHBOARDS
      ================================================== */}

      <Route element={<DashboardLayout />}>

        <Route element={<CustomerRoute />}>

          <Route
            path="/dashboard/customer"
            element={<CustomerDashboard />}
          />

        </Route>


        <Route element={<ProviderRoute />}>

          <Route
            path="/dashboard/provider"
            element={<ProviderDashboard />}
          />

        </Route>

      </Route>


      {/* ==================================================
          ADMIN DASHBOARD
      ================================================== */}

      <Route element={<AdminRoute />}>

        <Route element={<AdminLayout />}>

          {/* Main Dashboard */}
          <Route
            path="/admin"
            element={<AdminDashboard />}
          />


          {/* Users */}
          <Route
  path="/admin/users"
  element={<Users />}
/>


          {/* Workers */}
          <Route
  path="/admin/workers"
  element={<Workers />}
/>

          {/* Customers */}
          <Route path="/admin/customers" element={<Customers />} />


          {/* Verification */}
     <Route path="/admin/verification" element={<Verification />} />

          {/* Reports */}
          <Route
  path="/admin/reports"
  element={<Reports />}
/>

          {/* Categories */}
          <Route
            path="/admin/categories"
            element={<AdminPlaceholder title="Categories" />}
          />


          {/* Bookings */}
          <Route
  path="/admin/bookings"
  element={<AdminBookings />}
/>


          {/* Reviews */}
         <Route
  path="/admin/reviews"
  element={<Reviews />}
/>


          {/* Community */}
          <Route
  path="/admin/community"
  element={<Community />}
/>


          {/* Analytics */}
          <Route
  path="/admin/analytics"
  element={<Analytics />}
/>


          {/* Settings */}
<Route
  path="/admin/settings"
  element={<AdminSettings />}
/>


        </Route>

      </Route>


      {/* ==================================================
          404
      ================================================== */}

      <Route
        path="*"
        element={<NotFound />}
      />

    </Routes>
  );
}