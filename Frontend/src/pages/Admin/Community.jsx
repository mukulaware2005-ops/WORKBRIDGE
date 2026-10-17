import { useEffect, useState } from 'react';
import {
  Search,
  RefreshCw,
  MessageSquare,
  Eye,
  Loader2,
  CheckCircle,
  Clock,
  Ban,
} from 'lucide-react';

import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useApp } from '../../context/AppContext';
import * as adminService from '../../services/adminService';

export default function Community() {
  useDocumentTitle('Community');

  const { showToast } = useApp();

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadConversations = async () => {
    try {
      setLoading(true);

      const data = await adminService.listAdminCommunity({
        search,
        status: statusFilter,
      });

      setConversations(data.results || []);
    } catch (error) {
      showToast?.(
        error.message || 'Failed to load community',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [search, statusFilter]);

  const viewConversation = async (conversationId) => {
    try {
      setDetailLoading(true);

      const data =
        await adminService.getAdminCommunity(
          conversationId
        );

      setSelected(data);
    } catch (error) {
      showToast?.(
        error.message || 'Failed to load conversation',
        'error'
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const updateStatus = async (status) => {
    if (!selected) return;

    try {
      setActionLoading(true);

      await adminService.updateAdminCommunity(
        selected.id,
        { status }
      );

      showToast?.(
        'Conversation status updated',
        'success'
      );

      setSelected({
        ...selected,
        status,
      });

      await loadConversations();
    } catch (error) {
      showToast?.(
        error.message || 'Failed to update status',
        'error'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const StatusBadge = ({ status }) => {
    if (status === 'active') {
      return (
        <span className="flex w-fit items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
          <CheckCircle size={14} />
          Active
        </span>
      );
    }

    if (status === 'blocked') {
      return (
        <span className="flex w-fit items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
          <Ban size={14} />
          Blocked
        </span>
      );
    }

    return (
      <span className="flex w-fit items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
        <Clock size={14} />
        Ended
      </span>
    );
  };

  return (
    <div className="space-y-6 p-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Community Management
        </h1>

        <p className="text-sm text-gray-600">
          Monitor customer and worker conversations
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 md:flex-row">

        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-3 text-gray-500"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search customer or worker..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 text-gray-900 outline-none placeholder:text-gray-500 focus:ring-2"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
          className="rounded-lg border border-gray-300 px-4 py-2 text-gray-900"
        >
          <option value="">All Conversations</option>
          <option value="active">Active</option>
          <option value="ended">Ended</option>
          <option value="blocked">Blocked</option>
        </select>

        <button
          onClick={loadConversations}
          className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-50"
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
              size={28}
              className="animate-spin text-gray-700"
            />
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-12 text-center text-gray-600">
            No conversations found.
          </div>
        ) : (
          <table className="w-full min-w-[950px]">

            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-gray-800">
                  Customer
                </th>

                <th className="px-4 py-3 text-left text-gray-800">
                  Worker
                </th>

                <th className="px-4 py-3 text-left text-gray-800">
                  Booking
                </th>

                <th className="px-4 py-3 text-left text-gray-800">
                  Messages
                </th>

                <th className="px-4 py-3 text-left text-gray-800">
                  Status
                </th>

                <th className="px-4 py-3 text-center text-gray-800">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">

              {conversations.map((conversation) => (
                <tr
                  key={conversation.id}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-4 font-semibold text-gray-900">
                    {conversation.customer}
                  </td>

                  <td className="px-4 py-4 font-semibold text-gray-900">
                    {conversation.worker}
                  </td>

                  <td className="px-4 py-4 text-gray-700">
                    #{conversation.booking_id}
                  </td>

                  <td className="px-4 py-4">
                    <span className="flex items-center gap-1 text-gray-700">
                      <MessageSquare size={16} />
                      {conversation.message_count}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <StatusBadge
                      status={conversation.status}
                    />
                  </td>

                  <td className="px-4 py-4 text-center">
                    <button
                      onClick={() =>
                        viewConversation(
                          conversation.id
                        )
                      }
                      className="rounded-lg bg-blue-100 p-2 text-blue-600 hover:bg-blue-200"
                      title="View conversation"
                    >
                      <Eye size={17} />
                    </button>
                  </td>
                </tr>
              ))}

            </tbody>
          </table>
        )}
      </div>

      {/* Conversation Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b p-5">

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Conversation #{selected.id}
                </h2>

                <p className="text-sm text-gray-600">
                  {selected.customer} ↔ {selected.worker}
                </p>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            {/* Messages */}
            <div className="max-h-[55vh] space-y-3 overflow-y-auto p-5">

              {detailLoading ? (
                <div className="flex justify-center p-8">
                  <Loader2
                    size={25}
                    className="animate-spin"
                  />
                </div>
              ) : selected.messages?.length === 0 ? (
                <p className="text-center text-gray-500">
                  No messages in this conversation.
                </p>
              ) : (
                selected.messages?.map((message) => (
                  <div
                    key={message.id}
                    className="rounded-lg border bg-gray-50 p-3"
                  >
                    <div className="mb-1 font-semibold text-gray-900">
                      {message.sender}
                    </div>

                    <p className="text-gray-700">
                      {message.text}
                    </p>

                    <div className="mt-1 text-xs text-gray-500">
                      {new Date(
                        message.created_at
                      ).toLocaleString()}
                    </div>
                  </div>
                ))
              )}

            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 border-t p-5">

              <button
                disabled={actionLoading}
                onClick={() =>
                  updateStatus('active')
                }
                className="rounded-lg bg-green-100 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-200 disabled:opacity-50"
              >
                Activate
              </button>

              <button
                disabled={actionLoading}
                onClick={() =>
                  updateStatus('ended')
                }
                className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
              >
                End Conversation
              </button>

              <button
                disabled={actionLoading}
                onClick={() =>
                  updateStatus('blocked')
                }
                className="rounded-lg bg-red-100 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-200 disabled:opacity-50"
              >
                Block
              </button>

            </div>

          </div>
        </div>
      )}
    </div>
  );
}