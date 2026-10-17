import { useEffect, useState } from 'react';
import {
  Search,
  UserCheck,
  UserX,
  Trash2,
  RefreshCw,
  Loader2,
  Users,
  MailCheck,
  UserRound,
} from 'lucide-react';

import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useApp } from '../../context/AppContext';
import * as adminService from '../../services/adminService';

export default function Customers() {
  useDocumentTitle('Customer Management');

  const { showToast } = useApp();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [active, setActive] = useState('');

  const [actionLoading, setActionLoading] = useState(null);

  // ====================================================
  // LOAD CUSTOMERS
  // ====================================================

  const loadCustomers = async () => {
    setLoading(true);

    try {
      const data = await adminService.listAdminCustomers({
        search,
        active,
      });

      setCustomers(data.results || []);
    } catch (error) {
      console.error('Failed to load customers:', error);

      showToast(
        error.message || 'Failed to load customers',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [active]);

  // ====================================================
  // SEARCH
  // ====================================================

  const handleSearch = (e) => {
    e.preventDefault();
    loadCustomers();
  };

  // ====================================================
  // TOGGLE STATUS
  // ====================================================

  const toggleStatus = async (customer) => {
    setActionLoading(customer.id);

    try {
      const updated =
        await adminService.updateAdminCustomer(
          customer.id,
          {
            is_active: !customer.is_active,
          }
        );

      setCustomers((current) =>
        current.map((item) =>
          item.id === updated.id
            ? updated
            : item
        )
      );

      showToast(
        updated.is_active
          ? 'Customer activated'
          : 'Customer deactivated',
        'success'
      );
    } catch (error) {
      console.error(error);

      showToast(
        error.message ||
          'Failed to update customer',
        'error'
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ====================================================
  // DELETE
  // ====================================================

  const deleteCustomer = async (customer) => {
    const confirmed = window.confirm(
      `Delete ${customer.email}? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setActionLoading(customer.id);

    try {
      await adminService.deleteAdminCustomer(
        customer.id
      );

      setCustomers((current) =>
        current.filter(
          (item) => item.id !== customer.id
        )
      );

      showToast(
        'Customer deleted successfully',
        'success'
      );
    } catch (error) {
      console.error(error);

      showToast(
        error.message ||
          'Failed to delete customer',
        'error'
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ====================================================
  // SUMMARY
  // ====================================================

  const totalCustomers = customers.length;

  const activeCustomers = customers.filter(
    (customer) => customer.is_active
  ).length;

  const verifiedCustomers = customers.filter(
    (customer) => customer.is_email_verified
  ).length;

  return (
    <div className="space-y-6">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Customer Management
          </h1>

          <p className="mt-1 text-slate-500">
            Manage WorkBridge customers and their accounts.
          </p>
        </div>

        <button
          onClick={loadCustomers}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition"
        >
          <RefreshCw
            className={`h-4 w-4 ${
              loading ? 'animate-spin' : ''
            }`}
          />

          Refresh
        </button>

      </div>


      {/* ==================================================
          SUMMARY CARDS
      ================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

        {/* TOTAL */}

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Customers
              </p>

              <p className="mt-2 text-3xl font-bold text-purple-600">
                {totalCustomers}
              </p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600" />
            </div>

          </div>
        </div>


        {/* ACTIVE */}

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Active Customers
              </p>

              <p className="mt-2 text-3xl font-bold text-green-600">
                {activeCustomers}
              </p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>

          </div>
        </div>


        {/* VERIFIED */}

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm font-medium text-slate-500">
                Verified Customers
              </p>

              <p className="mt-2 text-3xl font-bold text-blue-600">
                {verifiedCustomers}
              </p>
            </div>

            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <MailCheck className="h-6 w-6 text-blue-600" />
            </div>

          </div>
        </div>

      </div>


      {/* ==================================================
          FILTERS
      ================================================== */}

      <div className="bg-white border border-slate-200 rounded-2xl p-4">

        <div className="flex flex-col lg:flex-row gap-3">

          {/* SEARCH */}

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
                placeholder="Search customer by email..."
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


          {/* STATUS */}

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


      {/* ==================================================
          CUSTOMER TABLE
      ================================================== */}

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">

        {loading ? (

          <div className="flex items-center justify-center py-20">

            <Loader2 className="h-7 w-7 animate-spin text-blue-600" />

          </div>

        ) : customers.length === 0 ? (

          <div className="text-center py-20">

            <div className="mx-auto w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center">
              <UserRound className="h-7 w-7 text-slate-400" />
            </div>

            <p className="mt-4 font-medium text-slate-600">
              No customers found.
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Try changing your search or status filter.
            </p>

          </div>

        ) : (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-slate-50 border-b border-slate-200">

                <tr>

                  <th className="text-left px-6 py-4 text-xs font-bold uppercase text-slate-500">
                    Customer
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

                {customers.map((customer) => (

                  <tr
                    key={customer.id}
                    className="hover:bg-slate-50 transition"
                  >

                    {/* CUSTOMER */}

                    <td className="px-6 py-4">

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <UserRound className="h-5 w-5 text-purple-600" />
                        </div>

                        <div>

                          <div className="font-semibold text-slate-900">
                            {customer.email}
                          </div>

                          <div className="text-xs text-slate-400 mt-1">
                            Customer ID #{customer.id}
                          </div>

                        </div>

                      </div>

                    </td>


                    {/* VERIFICATION */}

                    <td className="px-6 py-4">

                      {customer.is_email_verified ? (

                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                          <MailCheck className="h-3.5 w-3.5" />
                          Verified
                        </span>

                      ) : (

                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold">
                          <MailCheck className="h-3.5 w-3.5" />
                          Not Verified
                        </span>

                      )}

                    </td>


                    {/* STATUS */}

                    <td className="px-6 py-4">

                      {customer.is_active ? (

                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                          <UserCheck className="h-3.5 w-3.5" />
                          Active
                        </span>

                      ) : (

                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                          <UserX className="h-3.5 w-3.5" />
                          Inactive
                        </span>

                      )}

                    </td>


                    {/* ACTIONS */}

                    <td className="px-6 py-4">

                      <div className="flex justify-end gap-2">

                        <button
                          onClick={() =>
                            toggleStatus(customer)
                          }
                          disabled={
                            actionLoading === customer.id
                          }
                          title={
                            customer.is_active
                              ? 'Deactivate customer'
                              : 'Activate customer'
                          }
                          className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-40"
                        >

                          {actionLoading === customer.id ? (

                            <Loader2 className="h-4 w-4 animate-spin" />

                          ) : customer.is_active ? (

                            <UserX className="h-4 w-4 text-red-600" />

                          ) : (

                            <UserCheck className="h-4 w-4 text-green-600" />

                          )}

                        </button>


                        <button
                          onClick={() =>
                            deleteCustomer(customer)
                          }
                          disabled={
                            actionLoading === customer.id
                          }
                          title="Delete customer"
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