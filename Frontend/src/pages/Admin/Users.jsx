import { useEffect, useState } from 'react';
import {
  Search,
  UserCheck,
  UserX,
  Trash2,
  RefreshCw,
  Loader2,
} from 'lucide-react';

import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useApp } from '../../context/AppContext';
import * as adminService from '../../services/adminService';


export default function Users() {
  useDocumentTitle('User Management');

  const { showToast } = useApp();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [active, setActive] = useState('');

  const [actionLoading, setActionLoading] = useState(null);


  // ====================================================
  // LOAD USERS
  // ====================================================

  const loadUsers = async () => {
    setLoading(true);

    try {
      const data =
        await adminService.listAdminUsers({
          search,
          role,
          active,
        });

      setUsers(data.results || []);
    } catch (error) {
      showToast(
        error.message || 'Failed to load users'
      );
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadUsers();
  }, [role, active]);


  // ====================================================
  // SEARCH
  // ====================================================

  const handleSearch = (e) => {
    e.preventDefault();
    loadUsers();
  };


  // ====================================================
  // TOGGLE STATUS
  // ====================================================

  const toggleStatus = async (user) => {
    setActionLoading(user.id);

    try {
      const updated =
        await adminService.updateAdminUser(
          user.id,
          {
            is_active: !user.is_active,
          }
        );

      setUsers((current) =>
        current.map((item) =>
          item.id === updated.id
            ? updated
            : item
        )
      );

      showToast(
        updated.is_active
          ? 'User activated'
          : 'User deactivated'
      );
    } catch (error) {
      showToast(
        error.message ||
          'Failed to update user'
      );
    } finally {
      setActionLoading(null);
    }
  };


  // ====================================================
  // DELETE
  // ====================================================

  const deleteUser = async (user) => {
    const confirmed = window.confirm(
      `Delete ${user.email}? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setActionLoading(user.id);

    try {
      await adminService.deleteAdminUser(
        user.id
      );

      setUsers((current) =>
        current.filter(
          (item) => item.id !== user.id
        )
      );

      showToast(
        'User deleted successfully'
      );
    } catch (error) {
      showToast(
        error.message ||
          'Failed to delete user'
      );
    } finally {
      setActionLoading(null);
    }
  };


  return (
    <div>

      {/* ================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            User Management
          </h1>

          <p className="mt-1 text-slate-500">
            Manage WorkBridge customers and workers.
          </p>
        </div>

        <button
          onClick={loadUsers}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              loading
                ? 'animate-spin'
                : ''
            }`}
          />

          Refresh
        </button>

      </div>


      {/* ================================================
          FILTERS
      ================================================= */}

      <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-4">

        <div className="flex flex-col lg:flex-row gap-3">

          {/* Search */}

          <form
            onSubmit={handleSearch}
            className="flex flex-1 gap-2"
          >

            <div className="relative flex-1">

              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search by email..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
            >
              Search
            </button>

          </form>


          {/* Role */}

          <select
            value={role}
            onChange={(e) =>
              setRole(e.target.value)
            }
            className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white"
          >

            <option value="">
              All Roles
            </option>

            <option value="CUSTOMER">
              Customers
            </option>

            <option value="WORKER">
              Workers
            </option>

          </select>


          {/* Status */}

          <select
            value={active}
            onChange={(e) =>
              setActive(e.target.value)
            }
            className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white"
          >

            <option value="">
              All Status
            </option>

            <option value="true">
              Active
            </option>

            <option value="false">
              Inactive
            </option>

          </select>

        </div>

      </div>


      {/* ================================================
          TABLE
      ================================================= */}

      <div className="mt-6 bg-white border border-slate-200 rounded-2xl overflow-hidden">

        {loading ? (

          <div className="flex items-center justify-center py-20">

            <Loader2 className="h-7 w-7 animate-spin text-blue-600" />

          </div>

        ) : users.length === 0 ? (

          <div className="text-center py-20">

            <p className="text-slate-500">
              No users found.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-slate-50 border-b border-slate-200">

                <tr>

                  <th className="text-left px-6 py-4 text-xs font-bold uppercase text-slate-500">
                    User
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-bold uppercase text-slate-500">
                    Role
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-bold uppercase text-slate-500">
                    Verification
                  </th>

                  <th className="text-left px-6 py-4 text-xs font-bold uppercase text-slate-500">
                    Status
                  </th>

                  <th className="text-right px-6 py-4 text-xs font-bold uppercase text-slate-500">
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-slate-100">

                {users.map((user) => (

                  <tr
                    key={user.id}
                    className="hover:bg-slate-50"
                  >

                    {/* User */}

                    <td className="px-6 py-4">

                      <div className="font-semibold text-slate-900">
                        {user.email}
                      </div>

                      <div className="text-xs text-slate-400 mt-1">
                        ID #{user.id}
                      </div>

                    </td>


                    {/* Role */}

                    <td className="px-6 py-4">

                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                          user.role === 'WORKER'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        {user.role === 'WORKER'
                          ? 'Worker'
                          : 'Customer'}
                      </span>

                    </td>


                    {/* Verification */}

                    <td className="px-6 py-4">

                      {user.is_email_verified ? (

                        <span className="text-green-600 text-sm font-semibold">
                          Verified
                        </span>

                      ) : (

                        <span className="text-amber-600 text-sm font-semibold">
                          Not verified
                        </span>

                      )}

                    </td>


                    {/* Status */}

                    <td className="px-6 py-4">

                      {user.is_active ? (

                        <span className="inline-flex items-center gap-1.5 text-green-600 text-sm font-semibold">
                          <UserCheck className="h-4 w-4" />
                          Active
                        </span>

                      ) : (

                        <span className="inline-flex items-center gap-1.5 text-red-600 text-sm font-semibold">
                          <UserX className="h-4 w-4" />
                          Inactive
                        </span>

                      )}

                    </td>


                    {/* Actions */}

                    <td className="px-6 py-4">

                      <div className="flex justify-end gap-2">

                        <button
                          onClick={() =>
                            toggleStatus(user)
                          }
                          disabled={
                            actionLoading === user.id ||
                            user.is_staff
                          }
                          title={
                            user.is_active
                              ? 'Deactivate'
                              : 'Activate'
                          }
                          className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-40"
                        >

                          {actionLoading === user.id ? (

                            <Loader2 className="h-4 w-4 animate-spin" />

                          ) : user.is_active ? (

                            <UserX className="h-4 w-4 text-red-600" />

                          ) : (

                            <UserCheck className="h-4 w-4 text-green-600" />

                          )}

                        </button>


                        <button
                          onClick={() =>
                            deleteUser(user)
                          }
                          disabled={
                            actionLoading === user.id ||
                            user.is_staff
                          }
                          title="Delete user"
                          className="p-2 rounded-lg hover:bg-red-50 disabled:opacity-40"
                        >

                          <Trash2 className="h-4 w-4 text-red-600" />

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

    </div>
  );
}