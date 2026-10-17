import { NavLink, Outlet } from 'react-router-dom';

const menuItems = [
  { label: 'Dashboard', path: '/admin' },
  { label: 'Users', path: '/admin/users' },
  { label: 'Workers', path: '/admin/workers' },
  { label: 'Customers', path: '/admin/customers' },
  { label: 'Verification', path: '/admin/verification' },
  { label: 'Reports', path: '/admin/reports' },
  { label: 'Categories', path: '/admin/categories' },
  { label: 'Bookings', path: '/admin/bookings' },
  { label: 'Reviews', path: '/admin/reviews' },
  { label: 'Community', path: '/admin/community' },
  { label: 'Analytics', path: '/admin/analytics' },
  { label: 'Settings', path: '/admin/settings' },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-slate-50">

      {/* Top Header */}
      <header className="h-16 bg-[#0f1424] text-white flex items-center justify-between px-6">

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
            ●
          </div>

          <span className="px-3 py-1 rounded-md bg-slate-800 font-semibold">
            Admin
          </span>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-blue-300">
            {localStorage.getItem('workbridge_user')
              ? JSON.parse(localStorage.getItem('workbridge_user')).email
              : 'Admin'}
          </span>

          <button
            onClick={() => {
              localStorage.removeItem('workbridge_access_token');
              localStorage.removeItem('workbridge_refresh_token');
              localStorage.removeItem('workbridge_user');

              window.location.href = '/admin/login';
            }}
            className="text-xl hover:text-blue-400 transition"
            title="Logout"
          >
            ↪
          </button>
        </div>

      </header>

      <div className="flex">

        {/* Sidebar */}
        <aside className="w-72 min-h-[calc(100vh-64px)] bg-[#0f1424] p-4">

          <nav className="space-y-1.5">

            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/admin'}
                className={({ isActive }) =>
                  `
                  block px-5 py-3 rounded-xl font-semibold
                  transition-all duration-200
                  ${
                    isActive
                      ? 'bg-[#111827] text-white'
                      : 'text-slate-200 hover:bg-slate-800 hover:text-white'
                  }
                  `
                }
              >
                {item.label}
              </NavLink>
            ))}

          </nav>

        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-8">
          <Outlet />
        </main>

      </div>

    </div>
  );
}